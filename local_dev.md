# Local Server 開發與部署工作流程

本文件描述如何將目前 GitHub Pages 靜態網站延伸為具備 MariaDB 後端的完整應用程式，並維持透過 GitHub Copilot Agent（或其他 GitHub Actions）修改程式碼後，能夠自動即時部署到自有 Linux 伺服器的工作流程。

---

## 目錄

1. [架構概覽](#1-架構概覽)
2. [伺服器環境準備](#2-伺服器環境準備)
3. [Docker Compose 服務定義](#3-docker-compose-服務定義)
4. [GitHub Actions 自動部署流程](#4-github-actions-自動部署流程)
5. [伺服器端 Auto-Deploy 腳本](#5-伺服器端-auto-deploy-腳本)
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
│    3. Push image to registry (GHCR)                 │
│    4. SSH trigger deploy on Linux server            │
└──────────────────────────┬──────────────────────────┘
                           │ SSH deploy trigger
                           ▼
┌─────────────────────────────────────────────────────┐
│               Linux Server (自有機器)                 │
│                                                      │
│  ┌─────────────┐   ┌──────────────┐                 │
│  │   Nginx     │   │  Next.js /   │                 │
│  │  (Reverse   │──▶│  Frontend    │                 │
│  │   Proxy)    │   │  Container   │                 │
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
| Registry | Docker Image 儲存 | GitHub Container Registry (GHCR) |

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
    image: ghcr.io/<GITHUB_USERNAME>/lego-frontend:latest
    restart: unless-stopped
    environment:
      - NEXT_PUBLIC_API_URL=http://backend:3001
    depends_on:
      - backend
    networks:
      - lego-net

  # ── Backend API ────────────────────────────────────────
  backend:
    image: ghcr.io/<GITHUB_USERNAME>/lego-backend:latest
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

secrets:
  db_password:
    file: /opt/lego/secrets/db_password.txt
  db_root_password:
    file: /opt/lego/secrets/db_root_password.txt

networks:
  lego-net:
    driver: bridge
```

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
| `DEPLOY_SSH_KEY` | 伺服器 deploy 使用者的 SSH 私鑰（步驟 2.2 產生）|
| `DEPLOY_HOST` | 伺服器 IP 或 domain |
| `DEPLOY_USER` | 部署帳號（`deploy`）|
| `GHCR_TOKEN` | GitHub Personal Access Token（有 `write:packages` 權限）|

### 4.2 新增部署 Workflow

建立 `.github/workflows/deploy-server.yml`：

```yaml
name: Deploy to Linux Server

on:
  push:
    branches: [main]
  workflow_dispatch:

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository_owner }}/lego-frontend

jobs:
  build-and-push:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write

    steps:
      - uses: actions/checkout@v4

      - name: Log in to GitHub Container Registry
        uses: docker/login-action@v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Extract metadata
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}
          tags: |
            type=ref,event=branch
            type=sha,prefix=sha-
            type=raw,value=latest,enable=${{ github.ref == 'refs/heads/main' }}

      - name: Build and push Docker image
        uses: docker/build-push-action@v5
        with:
          context: .
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}

  deploy:
    needs: build-and-push
    runs-on: ubuntu-latest

    steps:
      - name: Deploy to server via SSH
        uses: appleboy/ssh-action@v1
        with:
          host: ${{ secrets.DEPLOY_HOST }}
          username: ${{ secrets.DEPLOY_USER }}
          key: ${{ secrets.DEPLOY_SSH_KEY }}
          script: |
            cd /opt/lego

            # 登入 GHCR
            echo "${{ secrets.GITHUB_TOKEN }}" | docker login ghcr.io -u ${{ github.actor }} --password-stdin

            # 拉取最新 image
            docker pull ghcr.io/${{ github.repository_owner }}/lego-frontend:latest

            # 滾動更新（zero-downtime）
            docker compose up -d --no-deps --pull always frontend

            # 清除舊 image
            docker image prune -f

            echo "✅ Deployment complete at $(date)"
```

---

## 5. 伺服器端 Auto-Deploy 腳本

在伺服器上建立一個手動觸發的部署腳本 `/opt/lego/scripts/deploy.sh`，方便緊急時手動更新：

```bash
#!/usr/bin/env bash
# /opt/lego/scripts/deploy.sh
set -euo pipefail

COMPOSE_FILE="/opt/lego/docker-compose.yml"
LOG_FILE="/opt/lego/logs/deploy.log"

log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" | tee -a "$LOG_FILE"
}

log "Starting deployment..."

# 拉取所有服務最新 image
docker compose -f "$COMPOSE_FILE" pull

# 重啟有更新的服務（zero-downtime for frontend/backend）
docker compose -f "$COMPOSE_FILE" up -d --remove-orphans

# MariaDB volume 資料不會被清除
log "Services running:"
docker compose -f "$COMPOSE_FILE" ps

# 清除懸掛 image
docker image prune -f

log "Deployment complete."
```

```bash
chmod +x /opt/lego/scripts/deploy.sh
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
   b. Push to GHCR
   c. SSH 到伺服器執行 rolling update
6. 伺服器更新完成，前端/後端立即反映新版本
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
| `DEPLOY_SSH_KEY` | 伺服器 SSH 私鑰 |
| `DEPLOY_HOST` | 伺服器 IP/domain |
| `DEPLOY_USER` | 部署帳號 |

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
# 確認 image 是否已更新
docker images ghcr.io/<owner>/lego-frontend

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

### Q: GHCR image pull 失敗（未授權）？

確認 deploy workflow 使用了正確的 token：

```yaml
- uses: docker/login-action@v3
  with:
    registry: ghcr.io
    username: ${{ github.actor }}
    password: ${{ secrets.GITHUB_TOKEN }}
```

若 GHCR package 設為 private，需確認 repository 的 package 已授予 Actions 讀取權限。

---

## 附錄：完整目錄結構

```
/opt/lego/
├── docker-compose.yml          # 主要服務定義
├── data/
│   ├── mariadb/                # MariaDB 資料（persistent volume）
│   └── backups/                # 資料庫備份
├── logs/                       # 部署及備份 log
├── nginx/
│   └── conf.d/
│       └── lego.conf           # Nginx 反向代理設定
├── scripts/
│   ├── deploy.sh               # 手動部署腳本
│   └── init.sql                # MariaDB 初始化 SQL
└── secrets/                    # 機密（chmod 600，不進版控）
    ├── db_password.txt
    └── db_root_password.txt
```
