# Local Server 開發與部署工作流程

本文件描述如何將目前 GitHub Pages 靜態網站延伸為具備 MariaDB 後端的完整應用程式，並維持透過 GitHub Copilot Agent（或其他 GitHub Actions）修改程式碼後，能夠自動即時部署到自有 Linux 伺服器的工作流程。

---

## 目錄

1. [架構概覽](#1-架構概覽)
2. [伺服器環境準備](#2-伺服器環境準備)
3. [Docker Compose 服務定義](#3-docker-compose-服務定義)
4. [GitHub Actions 自動部署流程](#4-github-actions-自動部署流程)
5. [Watchtower 自動更新機制](#5-watchtower-自動更新機制)
6. [MariaDB 整合說明](#6-mariadb-整合說明)
7. [日常開發流程](#7-日常開發流程)
8. [環境變數與機密管理](#8-環境變數與機密管理)
9. [常見問題排查](#9-常見問題排查)

---

## 1. 架構概覽

```
┌─────────────────────────────────────────────────────┐
│                   GitHub Repository                  │
│                                                      │
│  Developer / GitHub Copilot Agent                   │
│       │  Push / PR merge to main                    │
│       ▼                                              │
│  GitHub Actions (CI/CD Pipeline)                    │
│    1. Build Next.js static output                   │
│    2. Build Docker image                            │
│    3. Push image to Docker Hub                      │
│       (docker.io/hwchiu/lego:latest)                │
└──────────────────────────┬──────────────────────────┘
                           │ image push
                           ▼
                   ┌───────────────┐
                   │  Docker Hub   │
                   │ hwchiu/lego   │
                   └───────┬───────┘
                           │ Watchtower polls every 5 min
                           ▼
┌─────────────────────────────────────────────────────┐
│               Linux Server (自有機器)                 │
│                                                      │
│  ┌─────────────┐   ┌──────────────┐                 │
│  │   Nginx     │   │  Next.js /   │                 │
│  │  (Reverse   │──▶│  Frontend    │◀── Watchtower   │
│  │   Proxy)    │   │  Container   │    auto-update  │
│  └─────────────┘   └──────┬───────┘                 │
│                           │ API calls               │
│                    ┌──────▼───────┐                 │
│                    │  Backend API │                 │
│                    │  Container   │                 │
│                    └──────┬───────┘                 │
│                           │                         │
│                    ┌──────▼───────┐                 │
│                    │   MariaDB    │                 │
│                    │  Container   │                 │
│                    └─────────────┘                  │
└─────────────────────────────────────────────────────┘
```

### 元件說明

| 元件 | 角色 | 技術 |
|------|------|------|
| Frontend | Next.js 靜態輸出，由 Nginx 服務 | Docker + Nginx |
| Backend API | 提供動態資料 API（連接 MariaDB） | Node.js / Express（或其他） |
| Database | 持久化儲存 | MariaDB (Docker) |
| Reverse Proxy | 統一入口、SSL 終止 | Nginx |
| Registry | Docker Image 儲存 | Docker Hub (`docker.io/hwchiu/lego`) |
| Watchtower | 自動偵測並更新容器 image | containrrr/watchtower |

---

## 2. 伺服器環境準備

### 2.1 安裝必要軟體

```bash
# 更新套件
sudo apt update && sudo apt upgrade -y

# 安裝 Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
newgrp docker

# 安裝 Docker Compose v2
sudo apt install docker-compose-plugin -y

# 驗證
docker --version
docker compose version
```

### 2.2 建立部署使用者

```bash
# 建立專用部署帳號（不使用 root）
sudo useradd -m -s /bin/bash deploy
sudo usermod -aG docker deploy

# 切換到 deploy 使用者
sudo su - deploy

# 產生 SSH 金鑰（供 GitHub Actions 使用）
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/github_deploy
cat ~/.ssh/github_deploy.pub >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys

# 顯示私鑰（複製後存入 GitHub Secrets）
cat ~/.ssh/github_deploy
```

### 2.3 建立專案目錄

```bash
sudo mkdir -p /opt/lego
sudo chown deploy:deploy /opt/lego
cd /opt/lego

# 建立子目錄結構
mkdir -p {data/mariadb,logs,nginx/conf.d,secrets}
```

---

## 3. Docker Compose 服務定義

在伺服器 `/opt/lego/docker-compose.yml` 建立以下內容：

```yaml
# /opt/lego/docker-compose.yml
version: '3.8'

services:
  # ── Frontend (Next.js static + Nginx) ──────────────────
  frontend:
    image: docker.io/hwchiu/lego:latest
    restart: unless-stopped
    depends_on:
      - backend
    networks:
      - lego-net

  # ── Backend API ────────────────────────────────────────
  backend:
    image: docker.io/hwchiu/lego-backend:latest
    restart: unless-stopped
    environment:
      - DB_HOST=mariadb
      - DB_PORT=3306
      - DB_NAME=lego
      - DB_USER=lego_user
      - DB_PASSWORD_FILE=/run/secrets/db_password
    secrets:
      - db_password
    depends_on:
      mariadb:
        condition: service_healthy
    networks:
      - lego-net

  # ── MariaDB ────────────────────────────────────────────
  mariadb:
    image: mariadb:11
    restart: unless-stopped
    environment:
      MARIADB_ROOT_PASSWORD_FILE: /run/secrets/db_root_password
      MARIADB_DATABASE: lego
      MARIADB_USER: lego_user
      MARIADB_PASSWORD_FILE: /run/secrets/db_password
    secrets:
      - db_root_password
      - db_password
    volumes:
      - /opt/lego/data/mariadb:/var/lib/mysql
      - /opt/lego/scripts/init.sql:/docker-entrypoint-initdb.d/init.sql:ro
    healthcheck:
      test: ["CMD", "healthcheck.sh", "--connect", "--innodb_initialized"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - lego-net

  # ── Nginx Reverse Proxy ────────────────────────────────
  nginx:
    image: nginx:alpine
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - /opt/lego/nginx/conf.d:/etc/nginx/conf.d:ro
      - /opt/lego/nginx/ssl:/etc/nginx/ssl:ro
    depends_on:
      - frontend
      - backend
    networks:
      - lego-net

  # ── Watchtower（自動更新容器 image）───────────────────
  watchtower:
    image: containrrr/watchtower:latest
    restart: unless-stopped
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
      - /opt/lego/secrets/docker-config.json:/config.json:ro
    environment:
      # 每 300 秒（5 分鐘）輪詢一次 Docker Hub
      - WATCHTOWER_POLL_INTERVAL=300
      # 只監控有 com.centurylinklabs.watchtower.enable=true label 的容器
      - WATCHTOWER_LABEL_ENABLE=true
      # 更新後清除舊 image
      - WATCHTOWER_CLEANUP=true
      # 傳送通知（選用，可設為 slack/email）
      - WATCHTOWER_NOTIFICATIONS=shoutrrr
      - WATCHTOWER_NOTIFICATION_URL=${WATCHTOWER_NOTIFICATION_URL:-}
    networks:
      - lego-net

secrets:
  db_password:
    file: /opt/lego/secrets/db_password.txt
  db_root_password:
    file: /opt/lego/secrets/db_root_password.txt

networks:
  lego-net:
    driver: bridge
```

> **說明**：Watchtower 會定期輪詢 Docker Hub，一旦偵測到 `docker.io/hwchiu/lego:latest` 有新版本，便自動 `docker pull` 並重啟對應容器，無需人工介入。

### 3.1 Nginx 反向代理設定

建立 `/opt/lego/nginx/conf.d/lego.conf`：

```nginx
server {
    listen 80;
    server_name your-domain.com;  # 替換為你的 domain 或 IP

    # 前端靜態頁面
    location /lego/ {
        proxy_pass http://frontend:80/lego/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location = /lego {
        return 301 /lego/;
    }

    location = / {
        return 301 /lego/;
    }

    # 後端 API
    location /api/ {
        proxy_pass http://backend:3001/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

### 3.2 初始化 DB 機密

```bash
# 在伺服器上設定密碼（請替換為強密碼）
echo "your_strong_db_password" > /opt/lego/secrets/db_password.txt
echo "your_strong_root_password" > /opt/lego/secrets/db_root_password.txt
chmod 600 /opt/lego/secrets/*.txt
```

---

## 4. GitHub Actions 自動部署流程

### 4.1 設定 GitHub Secrets

到 GitHub Repository → Settings → Secrets and variables → Actions，新增以下 Secrets：

| Secret 名稱 | 說明 |
|-------------|------|
| `DOCKERHUB_USERNAME` | Docker Hub 帳號（`hwchiu`）|
| `DOCKERHUB_TOKEN` | Docker Hub Access Token（建議用 token 不用密碼）|

> Docker Hub Access Token 建立方式：Docker Hub → Account Settings → Security → New Access Token

### 4.2 Workflow 檔案

實際的 workflow 位於 `.github/workflows/deploy-server.yml`，流程為：

1. `main` branch 有新 commit 時觸發
2. Build Docker image（使用 repo 根目錄的 `Dockerfile`）
3. Push 到 `docker.io/hwchiu/lego:latest`
4. Watchtower 在伺服器端自動偵測新 image 並重啟容器（**無需 SSH**）

---

## 5. Watchtower 自動更新機制

Watchtower 是一個在伺服器上執行的 Docker 容器，它會定期輪詢 Docker Hub，若偵測到 image 有新版本，便自動 `pull` 並重啟對應的容器，**整個過程完全不需要人為介入或 SSH 連線**。

### 5.1 運作流程

```
GitHub Actions push image
       │
       ▼
Docker Hub (hwchiu/lego:latest 有新 digest)
       │
       ▼  Watchtower 每 5 分鐘檢查一次
Watchtower 偵測到新版本
       │
       ▼
docker pull hwchiu/lego:latest
       │
       ▼
重啟 frontend 容器（graceful restart）
       │
       ▼
舊 image 自動清除
```

### 5.2 Docker Hub 認證設定（讓 Watchtower 可 pull private image）

若 Docker Hub repository 為 **public**，可跳過此步驟。
若為 **private**，需在伺服器上提供認證設定：

```bash
# 在伺服器上以 deploy 使用者登入 Docker Hub
docker login docker.io -u hwchiu

# 將認證資訊複製到 Watchtower 掛載路徑
cp ~/.docker/config.json /opt/lego/secrets/docker-config.json
chmod 600 /opt/lego/secrets/docker-config.json
```

### 5.3 標記哪些容器要被 Watchtower 管理

在 `docker-compose.yml` 的 `frontend`（及 `backend`）服務加上 label：

```yaml
frontend:
  image: docker.io/hwchiu/lego:latest
  labels:
    - "com.centurylinklabs.watchtower.enable=true"
```

未加 label 的容器（如 `mariadb`、`nginx`）不會被 Watchtower 自動更新，確保資料庫穩定性。

### 5.4 調整輪詢頻率

| 情境 | 建議間隔 | 設定值 |
|------|----------|--------|
| 開發測試（快速反映） | 1 分鐘 | `WATCHTOWER_POLL_INTERVAL=60` |
| 正式環境（預設） | 5 分鐘 | `WATCHTOWER_POLL_INTERVAL=300` |
| 低頻更新 | 1 小時 | `WATCHTOWER_POLL_INTERVAL=3600` |

### 5.5 手動觸發 Watchtower（立即檢查）

```bash
# 在伺服器上執行一次性檢查
docker run --rm \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v /opt/lego/secrets/docker-config.json:/config.json:ro \
  containrrr/watchtower --run-once

# 或直接重啟 watchtower 容器
docker compose -f /opt/lego/docker-compose.yml restart watchtower
```

---

## 6. MariaDB 整合說明

### 6.1 資料庫初始化 SQL

建立 `/opt/lego/scripts/init.sql`，定義初始 Schema：

```sql
-- /opt/lego/scripts/init.sql
-- 此檔案只在 MariaDB 容器首次啟動（無資料時）執行

CREATE DATABASE IF NOT EXISTS lego CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE lego;

-- 範例：股票市場資料表
CREATE TABLE IF NOT EXISTS market_indices (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  symbol     VARCHAR(20)    NOT NULL,
  name       VARCHAR(100)   NOT NULL,
  price      DECIMAL(12, 4),
  change_pct DECIMAL(8, 4),
  volume     BIGINT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY idx_symbol (symbol)
) ENGINE=InnoDB;

-- 範例：新聞資料表
CREATE TABLE IF NOT EXISTS news_articles (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  title       VARCHAR(500)  NOT NULL,
  source      VARCHAR(100),
  url         TEXT,
  published_at DATETIME,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 授權
GRANT ALL PRIVILEGES ON lego.* TO 'lego_user'@'%';
FLUSH PRIVILEGES;
```

### 6.2 資料庫備份排程

在伺服器上建立 cron job 定期備份：

```bash
# 以 deploy 使用者執行
crontab -e
```

加入：
```
# 每天凌晨 2 點備份 MariaDB
0 2 * * * docker exec $(docker compose -f /opt/lego/docker-compose.yml ps -q mariadb) \
  mariadb-dump -u root -p"$(cat /opt/lego/secrets/db_root_password.txt)" \
  --all-databases | gzip > /opt/lego/data/backups/backup-$(date +\%Y\%m\%d).sql.gz 2>> /opt/lego/logs/backup.log

# 保留 30 天備份
0 3 * * * find /opt/lego/data/backups -name "*.sql.gz" -mtime +30 -delete
```

---

## 7. 日常開發流程

### 7.1 透過 GitHub Copilot Agent 修改程式碼

```
1. 在 GitHub Issues 描述需求
2. GitHub Copilot Agent 自動建立 feature branch 並修改程式碼
3. Agent 提交 Pull Request
4. 人工 Review PR → Merge to main
5. GitHub Actions 自動觸發：
   a. Build Docker image
   b. Push 到 docker.io/hwchiu/lego:latest
6. Watchtower（伺服器端）偵測到新 image（約 5 分鐘內）
7. Watchtower 自動 pull + 重啟 frontend 容器
8. 伺服器立即反映新版本（全程無需人工介入）
```

### 7.2 分支策略

```
main          ──→ 自動部署到 Server（Production）
feature/*     ──→ Copilot Agent 工作分支
hotfix/*      ──→ 緊急修復，merge 後立即部署
```

### 7.3 快速驗證部署狀態

```bash
# 在伺服器上確認服務狀態
docker compose -f /opt/lego/docker-compose.yml ps

# 查看各服務 log
docker compose -f /opt/lego/docker-compose.yml logs -f --tail=50 frontend
docker compose -f /opt/lego/docker-compose.yml logs -f --tail=50 backend
docker compose -f /opt/lego/docker-compose.yml logs -f --tail=50 mariadb

# 確認 MariaDB 連線
docker exec -it $(docker compose -f /opt/lego/docker-compose.yml ps -q mariadb) \
  mariadb -u lego_user -p lego
```

---

## 8. 環境變數與機密管理

### 伺服器端（Docker Secrets，不放進 image）

| 機密 | 路徑 | 說明 |
|------|------|------|
| DB 密碼 | `/opt/lego/secrets/db_password.txt` | MariaDB lego_user 密碼 |
| DB root 密碼 | `/opt/lego/secrets/db_root_password.txt` | MariaDB root 密碼 |

### GitHub Secrets（CI/CD 用）

| Secret | 說明 |
|--------|------|
| `DOCKERHUB_USERNAME` | Docker Hub 帳號（`hwchiu`）|
| `DOCKERHUB_TOKEN` | Docker Hub Access Token |

### 前端環境變數（Build-time）

Next.js 靜態輸出的環境變數須在 build 時注入（`NEXT_PUBLIC_*`）：

```bash
# 在 GitHub Actions 的 build 步驟加入
- name: Build Docker image
  env:
    NEXT_PUBLIC_API_URL: https://your-domain.com/api
```

> ⚠️ **重要**：`NEXT_PUBLIC_*` 變數會內嵌進靜態 HTML/JS，不可放入機密資訊。

---

## 9. 常見問題排查

### Q: 部署後前端沒有更新？

```bash
# 確認 Watchtower 是否正在執行
docker compose -f /opt/lego/docker-compose.yml ps watchtower

# 查看 Watchtower log，確認是否有偵測到新 image
docker compose -f /opt/lego/docker-compose.yml logs --tail=50 watchtower

# 確認 Docker Hub 上的 image digest 已更新
docker pull docker.io/hwchiu/lego:latest
docker inspect docker.io/hwchiu/lego:latest | grep -i digest

# 手動觸發立即更新
docker run --rm \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v /opt/lego/secrets/docker-config.json:/config.json:ro \
  containrrr/watchtower --run-once

# 強制重建容器
docker compose -f /opt/lego/docker-compose.yml up -d --force-recreate frontend

# 清除瀏覽器快取，或使用無痕模式測試
```

### Q: MariaDB 無法連線？

```bash
# 確認容器健康狀態
docker compose -f /opt/lego/docker-compose.yml ps

# 查看 mariadb log
docker compose -f /opt/lego/docker-compose.yml logs mariadb

# 測試從 backend 容器內連線
docker exec -it <backend_container_id> sh
mysql -h mariadb -u lego_user -p
```

### Q: GitHub Actions SSH 連線失敗？

1. 確認 `DEPLOY_HOST`、`DEPLOY_USER`、`DEPLOY_SSH_KEY` 三個 Secret 已正確設定
2. 確認伺服器 SSH port（預設 22）已開放防火牆
3. 在伺服器測試：`ssh -i ~/.ssh/github_deploy deploy@<host>`

### Q: GitHub Actions push image 失敗？

確認 `DOCKERHUB_USERNAME` 與 `DOCKERHUB_TOKEN` Secrets 已正確設定：

```yaml
- uses: docker/login-action@v3
  with:
    registry: docker.io
    username: ${{ secrets.DOCKERHUB_USERNAME }}
    password: ${{ secrets.DOCKERHUB_TOKEN }}
```

若 token 過期，到 Docker Hub → Account Settings → Security 重新產生。

---

## 附錄：完整目錄結構

```
/opt/lego/
├── docker-compose.yml          # 主要服務定義（含 Watchtower）
├── data/
│   ├── mariadb/                # MariaDB 資料（persistent volume）
│   └── backups/                # 資料庫備份
├── logs/                       # 部署及備份 log
├── nginx/
│   └── conf.d/
│       └── lego.conf           # Nginx 反向代理設定
├── scripts/
│   └── init.sql                # MariaDB 初始化 SQL
└── secrets/                    # 機密（chmod 600，不進版控）
    ├── db_password.txt
    ├── db_root_password.txt
    └── docker-config.json      # Docker Hub 認證（private image 時使用）
```
