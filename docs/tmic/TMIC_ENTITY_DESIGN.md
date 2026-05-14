# TMIC Entity Management — Database Design Spec

**Date:** 2026-05-14  
**Project:** Marketing Intelligence Center (TMIC)  
**Database:** MariaDB 10.6 — `tmic`  
**Design Pattern:** Param Registry + EAV (方案 C)

---

## 1. Problem Statement

公司內部有一套 Company Master（`company_master`），以 `co_cd` 作為唯一識別碼。
TMIC 專案需要從多個外部 Data Provider（Bloomberg、FactSet、D&B、Contify、Refinitiv、S&P Global 等）蒐集每家公司的資料。

挑戰：
- 每個 Data Provider 對同一家公司的識別碼不同（BBG_ID、DUNS、FACTSET_ID 等）
- 每種資料類別（Financial、Price、Credit、News）需要的 configuration 完全不同
- Data Provider 會持續增加，Schema 不能每次都改

---

## 2. Design Goals

| Goal | Approach |
|------|----------|
| 公司身份統一管理 | `company_master` 為內部黃金記錄，`entity_identifier` 負責外部 ID mapping |
| 支援任意 Provider 識別碼 | `entity_identifier` EAV 設計，`id_type` 欄位記錄識別碼類型 |
| Config 可擴展（Scalable） | Param Registry + EAV：新增 Provider/Subject 只需 INSERT，無需 DDL |
| Provider 與 Subject 兩層 Config | Provider-level 管技術性 params；Subject-level 管業務性 params |

---

## 3. Entity Relationship Diagram

```
company_master (co_cd PK)
    │
    ├──< entity_identifier >── data_provider (provider_cd PK)
    │                               │
    │                               ├──< data_subject (subject_cd PK)
    │                               │       │
    │                               │       └──< subject_config_def
    │                               │
    │                               └──< provider_config_def
    │
    ├──< entity_provider_config >── data_provider
    │       │
    │       └──< entity_provider_config_param >── provider_config_def
    │
    └──< entity_subject_config >── data_subject
            │
            └──< entity_subject_config_param >── subject_config_def
```

---

## 4. Table Descriptions

### Layer 1 — Core Identity

#### `company_master`
公司內部主檔。`co_cd` 為公司在系統內的唯一識別碼，由公司自行定義，與外部 ID 無關。

| Column | Type | Note |
|--------|------|------|
| co_cd | VARCHAR(20) PK | Internal company code (e.g. AAPL, TSMC) |
| co_name | VARCHAR(200) | Full legal name |
| co_type | ENUM | customer / supplier / both / other |
| country_cd | CHAR(2) | ISO 3166-1 alpha-2 |
| industry_cd | VARCHAR(20) | Internal industry classification |
| status | ENUM | active / inactive |

#### `entity_identifier`
每個 Data Provider 對公司的外部識別碼對照表。一家公司可以有多個 provider 的多種 ID。

| Column | Type | Note |
|--------|------|------|
| co_cd | FK → company_master | Internal company |
| provider_cd | FK → data_provider | Which provider issued this ID |
| external_id | VARCHAR(100) | The actual external ID value |
| id_type | VARCHAR(30) | TICKER, BBG_ID, ISIN, DUNS, FACTSET_ID, LEI… |
| is_primary | TINYINT(1) | Primary identifier for this provider |
| valid_from / valid_to | DATE | Validity window; NULL valid_to = still active |

---

### Layer 2 — Provider & Subject Catalog

#### `data_provider`
外部資料來源主檔。新增 Provider 只需 INSERT 此表一筆。

| Column | Note |
|--------|------|
| provider_cd PK | BBG, FACTSET, DNB, CONTIFY, REFINITIV, SP_GLOBAL |
| provider_type | financial, credit, news, esg, macro |
| auth_type | API_KEY, OAUTH2, BASIC, CERT |

#### `data_subject`
每個 Provider 下的資料類別，綁定 `provider_cd`。BBG_FINANCIALS 與 FACTSET_FINS 是獨立的 subject。

---

### Layer 3 — Param Definition Registry

#### `provider_config_def`
定義某 Provider 的**技術性** config params（如 api_timeout_sec、rate_limit_per_min）。新增 Provider 時在此 INSERT param 定義，無需改 Schema。

#### `subject_config_def`
定義某 Data Subject 的**業務性** config params（如 fiscal_year_offset、earnings_release_lag_days、report_currency）。每種資料類別專屬定義。

---

### Layer 4 — Entity Config (Header + EAV)

#### `entity_provider_config` + `entity_provider_config_param`
- Header：記錄「哪些公司啟用了哪些 Provider」+ 排程 cron
- Params：EAV 值表，FK → `provider_config_def`，儲存該公司對該 Provider 的技術設定

#### `entity_subject_config` + `entity_subject_config_param`
- Header：記錄「哪些公司啟用了哪些 Data Subject」
- Params：EAV 值表，FK → `subject_config_def`，儲存業務設定（例：Apple fiscal_year_offset = -3，因 FY 結束於 9 月）

---

## 5. Sample Data Summary

| Table | Rows |
|-------|------|
| company_master | 20（US/TW/KR/JP/EU/IN） |
| data_provider | 6（BBG, FACTSET, DNB, CONTIFY, REFINITIV, SP_GLOBAL） |
| data_subject | 10（Financial, Price, ESG, Credit, News, Ownership, Estimates） |
| entity_identifier | 83（各公司對各 Provider 的外部 ID） |
| provider_config_def | 19 param definitions |
| subject_config_def | 31 param definitions |
| entity_provider_config | 35（公司 × Provider 啟用設定） |
| entity_provider_config_param | 15（技術性 param 值） |
| entity_subject_config | 48（公司 × Subject 啟用設定） |
| entity_subject_config_param | 40（業務性 param 值） |

---

## 6. Scalability: How to Add a New Provider

1. `INSERT INTO data_provider` — 新增 Provider 主檔
2. `INSERT INTO data_subject` — 新增該 Provider 的 data subjects
3. `INSERT INTO provider_config_def` — 定義 provider-level params
4. `INSERT INTO subject_config_def` — 定義各 subject 需要的 params
5. `INSERT INTO entity_identifier` — 為需要的公司填入外部 ID
6. `INSERT INTO entity_provider_config` + `entity_subject_config` — 啟用設定
7. `INSERT INTO entity_*_config_param` — 填入實際 param 值

**零 DDL 變更。**

---

## 7. Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| Data Subject 綁定 Provider | BBG_FINANCIALS 和 FACTSET_FINS 的 params 完全不同，分開管理避免混淆 |
| 兩層 Config（Provider + Subject） | Provider 層管技術 params（共用）；Subject 層管業務 params（專屬） |
| EAV 搭配 Registry | Registry 確保只能 INSERT 合法 params；EAV 讓值的擴展無需 DDL |
| valid_from/valid_to on entity_identifier | 支援公司代碼歷史追蹤（如 ticker 變更） |
| schedule_cron on subject_config | Subject 層可覆蓋 Provider 層排程，提供細粒度控制 |

---

## 8. Database Access

- **Admin UI (Adminer):** `http://localhost:8088`
  - Server: `localhost` | Username: `tmic_admin` | Password: `Tmic@2026!` | Database: `tmic`
- **MariaDB direct:** `mysql -u tmic_admin -p'Tmic@2026!' tmic`
