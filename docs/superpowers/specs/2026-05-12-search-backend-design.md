# Search Backend Design — Spring Boot 3.4 DDD + Elasticsearch

## Problem Statement

The Lego (MIC) financial dashboard needs a dedicated search backend to index and retrieve semiconductor company news/announcements. The backend must support fuzzy search across key fields using Elasticsearch, follow Domain-Driven Design patterns, and be cleanly separated from the existing Next.js frontend.

## Proposed Approach

Use Spring Boot 3.4 with Spring Data Elasticsearch, structured in a DDD 4-layer architecture. The backend lives at `lego/backend/` and connects to the existing Elasticsearch 8.18.2 instance running at `localhost:9200`. Mock data is seeded on startup via a `DataInitializer`.

---

## Architecture

### Directory Structure

```
lego/
├── app/
│   └── data/
│       └── searchMockData.ts        # 10 mock records (reference data for frontend)
└── backend/
    ├── pom.xml
    └── src/main/
        ├── java/com/mic/search/
        │   ├── domain/
        │   │   ├── model/
        │   │   │   └── SearchDocument.java        # Core entity
        │   │   └── repository/
        │   │       └── SearchDocumentRepository.java  # Repository interface
        │   ├── application/
        │   │   └── service/
        │   │       └── SearchIndexService.java    # Use cases: insert, search
        │   ├── infrastructure/
        │   │   └── elasticsearch/
        │   │       ├── config/
        │   │       │   └── ElasticsearchConfig.java
        │   │       ├── repository/
        │   │       │   └── SearchDocumentRepositoryImpl.java
        │   │       └── initializer/
        │   │           └── DataInitializer.java   # Seeds mock data on startup
        │   └── interfaces/
        │       └── rest/
        │           ├── SearchController.java
        │           └── dto/
        │               ├── SearchRequest.java
        │               └── SearchResponse.java
        └── resources/
            ├── application.yml
            └── elasticsearch/
                └── search-index-mapping.json      # Index settings (visible config)
```

### DDD Layers

| Layer | Package | Responsibility |
|-------|---------|---------------|
| Domain | `domain` | Core entity `SearchDocument`, repository interface (no ES dependency) |
| Application | `application` | Use cases: bulk insert, keyword search |
| Infrastructure | `infrastructure` | Spring Data ES implementation, index config, DataInitializer |
| Interfaces | `interfaces` | REST controllers, DTOs |

---

## Data Model

### SearchDocument (ES Document)

| Field | ES Type | Analyzer | Notes |
|-------|---------|----------|-------|
| `id` | keyword | — | ES document ID |
| `co_cd` | text + keyword | ngram | Company code (e.g., `9999`, `005930`) |
| `company_name` | text | ngram | Full company name (zh/en) |
| `company_short_name` | text | ngram | Short name (e.g., `全球科技`, `TSMC`) |
| `title` | text | ngram | News headline |
| `content` | text | ngram | News body |
| `date` | keyword | — | Publication date (YYYY-MM-DD) |
| `category` | keyword | — | Tag (e.g., `財報`, `供應鏈`) |

### Elasticsearch Index Settings

- **Index name:** `search_documents`
- **Analyzer:** custom `ngram_analyzer` using `ngram` tokenizer (min_gram=2, max_gram=3)
- **Search analyzer:** `standard` for query-time tokenization
- All 5 fuzzy fields (`co_cd`, `company_name`, `company_short_name`, `title`, `content`) use `ngram_analyzer` at index time and `standard` at search time
- Index defined programmatically via `@Setting` + `@Mapping` annotations AND `search-index-mapping.json` for visibility

---

## Mock Data

File: `lego/app/data/searchMockData.ts`

10 records spanning 4 companies:
- **全球科技 (GlobalTech)** — co_cd: `9999` — 3 records
- **三星電子 (Samsung)** — co_cd: `005930` — 2 records
- **聯發科 (MediaTek)** — co_cd: `2454` — 3 records
- **美光科技 (Micron)** — co_cd: `MU` — 2 records

Fields per record: `id`, `co_cd`, `company_name`, `company_short_name`, `title`, `content`, `date`, `category`

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/v1/search/index` | Manually trigger bulk insert of mock data |
| `GET` | `/api/v1/search?q={keyword}` | Fuzzy search across all 5 indexed fields |
| `GET` | `/actuator/health` | Health check |

---

## DataInitializer Behavior

- Runs on application startup (`ApplicationRunner`)
- Checks if `search_documents` index is empty
- If empty: creates index with ngram mapping → bulk inserts 10 mock records
- If data exists: skips (idempotent)
- Logs progress to console

---

## Technology Stack

| Component | Technology |
|-----------|-----------|
| Language | Java 21 |
| Framework | Spring Boot 3.4.x |
| ES Client | Spring Data Elasticsearch 5.x (bundled) |
| Build | Maven |
| ES Version | 8.18.2 (running at localhost:9200, security disabled) |

---

## Error Handling

- `SearchController`: returns 400 for empty query, 500 with message on ES errors
- `DataInitializer`: logs error and continues if ES unavailable at startup
- No authentication required (ES security disabled)

---

## Scope

**In scope:**
- Backend project scaffold at `lego/backend/`
- Mock data file `lego/app/data/searchMockData.ts`
- Insert (bulk) + fuzzy search implementation
- Index mapping applied to ES on startup
- REST API with insert trigger and search endpoint

**Out of scope:**
- Frontend integration (search UI)
- Authentication / JWT
- Pagination (basic implementation only)
- IK Chinese analyzer (using ngram instead)

---

## Deployment

Deploy the backend as a background service on this server (not Docker, to keep it simple alongside the existing Elasticsearch Docker instance).

### Steps

1. **Install Java 21** via apt (if not present)
2. **Build** the JAR: `mvn clean package -DskipTests`
3. **Run as background service** using `nohup` or `systemd`:
   - JAR location: `lego/backend/target/search-backend-*.jar`
   - Run on port `8080`
   - Log output to `lego/backend/logs/app.log`
4. **Verify** deployment:
   - `curl http://localhost:8080/actuator/health` → `{"status":"UP"}`
   - `curl http://localhost:8080/api/v1/search?q=TSMC` → returns search results
5. **Trigger data seed** if needed:
   - `curl -X POST http://localhost:8080/api/v1/search/index`

### Service startup command

```bash
nohup java -jar lego/backend/target/search-backend-*.jar \
  --server.port=8080 \
  > lego/backend/logs/app.log 2>&1 &
```
