# Search Backend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Java Spring Boot 3.4 DDD backend at `lego/backend/` that inserts semiconductor news mock data into Elasticsearch and exposes a fuzzy search API, then deploy it as a background service on the server.

**Architecture:** 4-layer DDD (domain → application → infrastructure → interfaces) with Spring Data Elasticsearch. The domain layer has zero ES dependency; infrastructure implements the repository interface; the interfaces layer exposes REST endpoints.

**Tech Stack:** Java 21, Spring Boot 3.4, Spring Data Elasticsearch 5.x, Maven, Elasticsearch 8.18.2 (running at localhost:9200, security disabled)

---

## File Map

| File | Action | Responsibility |
|------|--------|---------------|
| `lego/app/data/searchMockData.ts` | Create | 10 mock records for frontend reference |
| `lego/backend/pom.xml` | Create | Maven project descriptor |
| `lego/backend/src/main/resources/application.yml` | Create | ES connection config, server port |
| `lego/backend/src/main/resources/elasticsearch/search-index-settings.json` | Create | Settings JSON for `@Setting` annotation (analysis config only) |
| `lego/backend/src/main/resources/elasticsearch/search-index-mapping.json` | Create | Human-readable full index reference (settings + mappings) |
| `lego/backend/src/main/java/com/mic/search/SearchBackendApplication.java` | Create | Spring Boot entry point |
| `lego/backend/src/main/java/com/mic/search/domain/model/SearchDocument.java` | Create | Core entity with ES annotations |
| `lego/backend/src/main/java/com/mic/search/domain/repository/SearchDocumentRepository.java` | Create | Repository interface (no ES import) |
| `lego/backend/src/main/java/com/mic/search/application/service/SearchIndexService.java` | Create | Use cases: bulkInsert, search |
| `lego/backend/src/main/java/com/mic/search/infrastructure/elasticsearch/config/ElasticsearchConfig.java` | Create | ES client bean config |
| `lego/backend/src/main/java/com/mic/search/infrastructure/elasticsearch/repository/EsSearchDocumentRepository.java` | Create | Spring Data ES interface (extends ElasticsearchRepository) |
| `lego/backend/src/main/java/com/mic/search/infrastructure/elasticsearch/initializer/DataInitializer.java` | Create | Startup seeder (idempotent) |
| `lego/backend/src/main/java/com/mic/search/interfaces/rest/dto/SearchRequest.java` | Create | Query DTO |
| `lego/backend/src/main/java/com/mic/search/interfaces/rest/dto/SearchResponse.java` | Create | Result DTO |
| `lego/backend/src/main/java/com/mic/search/interfaces/rest/SearchController.java` | Create | REST controller |
| `lego/backend/src/test/java/com/mic/search/application/service/SearchIndexServiceTest.java` | Create | Unit tests |

---

## Task 1: Install Java 21 and Maven

**Files:** None (system setup)

- [ ] **Step 1: Install Java 21**

```bash
sudo apt-get update -qq
sudo apt-get install -y openjdk-21-jdk
java -version
```

Expected output: `openjdk version "21.x.x"`

- [ ] **Step 2: Install Maven**

```bash
sudo apt-get install -y maven
mvn -version
```

Expected output: `Apache Maven 3.x.x ... Java version: 21`

---

## Task 2: Create Mock Data File

**Files:**
- Create: `lego/app/data/searchMockData.ts`

- [ ] **Step 1: Create the mock data file**

```typescript
// lego/app/data/searchMockData.ts
export interface SearchResult {
  id: string;
  co_cd: string;
  company_name: string;
  company_short_name: string;
  title: string;
  content: string;
  date: string;
  category: string;
}

export const MOCK_SEARCH_RESULTS: SearchResult[] = [
  {
    id: "1",
    co_cd: "9999",
    company_name: "全球科技股份有限公司",
    company_short_name: "全球科技",
    title: "全球科技 2025 Q1 財報：營收創歷史新高",
    content: "全球科技公布 2025 年第一季財報，合併營收達新台幣 8,392 億元，較去年同期成長 41.6%。先進製程 3nm 及 5nm 合計佔晶圓銷售金額約 69%，顯示 AI 相關需求持續強勁。",
    date: "2025-04-17",
    category: "財報",
  },
  {
    id: "2",
    co_cd: "9999",
    company_name: "全球科技股份有限公司",
    company_short_name: "全球科技",
    title: "全球科技宣布在美國亞利桑那州興建第三座晶圓廠",
    content: "全球科技今日宣布將在美國亞利桑那州鳳凰城建設第三座晶圓廠，預計採用 2nm 製程技術，總投資額超過 650 億美元。此舉有助於分散地緣政治風險並強化與美國客戶的合作關係。",
    date: "2025-03-28",
    category: "供應鏈",
  },
  {
    id: "3",
    co_cd: "9999",
    company_name: "全球科技股份有限公司",
    company_short_name: "全球科技",
    title: "全球科技與 NVIDIA 深化 CoWoS 先進封裝合作",
    content: "全球科技與 NVIDIA 簽署多年期 CoWoS（Chip on Wafer on Substrate）先進封裝合作協議，以支應 H100 及下一代 Blackwell 系列 GPU 的強勁需求，預計 2025 年底前產能倍增。",
    date: "2025-02-10",
    category: "合作",
  },
  {
    id: "4",
    co_cd: "005930",
    company_name: "三星電子株式會社",
    company_short_name: "三星電子",
    title: "三星電子 2025 年 HBM3E 出貨量預計超越預期",
    content: "三星電子半導體部門表示，HBM3E（高頻寬記憶體）已完成主要客戶認證，預計 2025 年出貨量將較原計畫增加 30%。三星同時宣布擴大 1c DRAM 製程的量產規模，以應對 AI 伺服器需求。",
    date: "2025-04-05",
    category: "產品",
  },
  {
    id: "5",
    co_cd: "005930",
    company_name: "三星電子株式會社",
    company_short_name: "三星電子",
    title: "三星電子 3nm GAA 製程良率大幅提升，客戶導入加速",
    content: "據業界消息，三星電子 3nm GAA（Gate-All-Around）製程良率已提升至 60% 以上，吸引多家 AI 晶片設計公司洽談量產合作。三星預計於 2025 年下半年啟動 2nm GAA 試產。",
    date: "2025-01-22",
    category: "製程",
  },
  {
    id: "6",
    co_cd: "2454",
    company_name: "聯發科技股份有限公司",
    company_short_name: "聯發科",
    title: "聯發科 Dimensity 9400 拿下多家旗艦手機訂單",
    content: "聯發科技旗艦行動平台 Dimensity 9400 採用全球科技 3nm 製程，已獲三星、小米、vivo 等品牌採用於 2025 年旗艦機型。聯發科預估 2025 年行動業務營收成長超過 25%。",
    date: "2025-03-15",
    category: "產品",
  },
  {
    id: "7",
    co_cd: "2454",
    company_name: "聯發科技股份有限公司",
    company_short_name: "聯發科",
    title: "聯發科積極布局 AI PC 市場，推出 Kompanio Ultra 平台",
    content: "聯發科技發布 Kompanio Ultra AI PC 平台，內建 60 TOPS NPU，針對 Windows on Arm 生態系優化。聯發科表示已與宏碁、ASUS 等 ODM 廠商完成設計合作，預計 2025 年 H2 量產。",
    date: "2025-02-28",
    category: "產品",
  },
  {
    id: "8",
    co_cd: "2454",
    company_name: "聯發科技股份有限公司",
    company_short_name: "聯發科",
    title: "聯發科 2025 Q1 法說會：車用及 IoT 業務成長強勁",
    content: "聯發科技召開 2025 年第一季法人說明會，車用晶片業務年增 48%，智慧家居 IoT 平台出貨量創新高。管理層上調全年營收展望，預估全年營收成長率由 15% 上調至 20-25%。",
    date: "2025-04-24",
    category: "財報",
  },
  {
    id: "9",
    co_cd: "MU",
    company_name: "Micron Technology, Inc.",
    company_short_name: "美光",
    title: "Micron HBM3E 正式通過 NVIDIA Blackwell 認證",
    content: "Micron Technology 宣布其 HBM3E 記憶體已正式通過 NVIDIA Blackwell GB200 NVL72 平台認證，成為 NVIDIA 重要的 HBM 供應商之一。Micron 預計 2025 年 HBM 相關營收將超過 10 億美元。",
    date: "2025-04-01",
    category: "合作",
  },
  {
    id: "10",
    co_cd: "MU",
    company_name: "Micron Technology, Inc.",
    company_short_name: "美光",
    title: "Micron 宣布在印度興建首座半導體封測廠",
    content: "Micron Technology 宣布在印度古吉拉特邦投資超過 27.5 億美元興建首座半導體封裝測試廠，預計 2025 年底開始量產。此舉獲印度政府補貼支持，是印度半導體製造本土化戰略的重要里程碑。",
    date: "2025-01-30",
    category: "供應鏈",
  },
];
```

- [ ] **Step 2: Verify TypeScript is valid**

```bash
cd /home/ubuntu/lego
npx tsc --noEmit 2>&1 | head -20
```

Expected: no errors (or only pre-existing unrelated errors)

---

## Task 3: Scaffold Maven Project (pom.xml)

**Files:**
- Create: `lego/backend/pom.xml`

- [ ] **Step 1: Create backend directory and pom.xml**

```bash
mkdir -p /home/ubuntu/lego/backend/src/main/java/com/mic/search
mkdir -p /home/ubuntu/lego/backend/src/main/resources/elasticsearch
mkdir -p /home/ubuntu/lego/backend/src/test/java/com/mic/search/application/service
mkdir -p /home/ubuntu/lego/backend/logs
```

- [ ] **Step 2: Create pom.xml**

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.4.1</version>
        <relativePath/>
    </parent>

    <groupId>com.mic</groupId>
    <artifactId>search-backend</artifactId>
    <version>1.0.0</version>
    <name>search-backend</name>
    <description>MIC Search Backend - Spring Boot DDD + Elasticsearch</description>

    <properties>
        <java.version>21</java.version>
    </properties>

    <dependencies>
        <!-- Spring Boot Web -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>

        <!-- Spring Data Elasticsearch -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-elasticsearch</artifactId>
        </dependency>

        <!-- Actuator for health check -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-actuator</artifactId>
        </dependency>

        <!-- Test -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
    </dependencies>

    <build>
        <finalName>search-backend</finalName>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
            </plugin>
        </plugins>
    </build>
</project>
```

- [ ] **Step 3: Verify Maven can resolve dependencies**

```bash
cd /home/ubuntu/lego/backend
mvn dependency:resolve -q 2>&1 | tail -5
```

Expected: `BUILD SUCCESS`

---

## Task 4: application.yml and Index Mapping JSON

**Files:**
- Create: `lego/backend/src/main/resources/application.yml`
- Create: `lego/backend/src/main/resources/elasticsearch/search-index-mapping.json`

- [ ] **Step 1: Create application.yml**

```yaml
spring:
  application:
    name: search-backend
  elasticsearch:
    uris: http://localhost:9200
    connection-timeout: 5s
    socket-timeout: 30s

server:
  port: 8080

management:
  endpoints:
    web:
      exposure:
        include: health,info
  endpoint:
    health:
      show-details: always

logging:
  level:
    com.mic.search: DEBUG
    org.springframework.data.elasticsearch: INFO
```

- [ ] **Step 2: Create search-index-settings.json (used by @Setting annotation — settings only)**

```json
{
  "analysis": {
    "analyzer": {
      "ngram_analyzer": {
        "type": "custom",
        "tokenizer": "ngram_tokenizer",
        "filter": ["lowercase"]
      }
    },
    "tokenizer": {
      "ngram_tokenizer": {
        "type": "ngram",
        "min_gram": 2,
        "max_gram": 3,
        "token_chars": ["letter", "digit"]
      }
    }
  },
  "index": {
    "max_ngram_diff": 2
  }
}
```

- [ ] **Step 3: Create search-index-mapping.json (human-readable full index reference)**

```json
{
  "settings": {
    "analysis": {
      "analyzer": {
        "ngram_analyzer": {
          "type": "custom",
          "tokenizer": "ngram_tokenizer",
          "filter": ["lowercase"]
        }
      },
      "tokenizer": {
        "ngram_tokenizer": {
          "type": "ngram",
          "min_gram": 2,
          "max_gram": 3,
          "token_chars": ["letter", "digit"]
        }
      }
    },
    "index": {
      "max_ngram_diff": 2
    }
  },
  "mappings": {
    "properties": {
      "id":                 { "type": "keyword" },
      "co_cd":              { "type": "text",    "analyzer": "ngram_analyzer", "search_analyzer": "standard",
                              "fields": { "keyword": { "type": "keyword" } } },
      "company_name":       { "type": "text",    "analyzer": "ngram_analyzer", "search_analyzer": "standard" },
      "company_short_name": { "type": "text",    "analyzer": "ngram_analyzer", "search_analyzer": "standard" },
      "title":              { "type": "text",    "analyzer": "ngram_analyzer", "search_analyzer": "standard" },
      "content":            { "type": "text",    "analyzer": "ngram_analyzer", "search_analyzer": "standard" },
      "date":               { "type": "keyword" },
      "category":           { "type": "keyword" }
    }
  }
}
```

---

## Task 5: Domain Layer

**Files:**
- Create: `lego/backend/src/main/java/com/mic/search/domain/model/SearchDocument.java`
- Create: `lego/backend/src/main/java/com/mic/search/domain/repository/SearchDocumentRepository.java`

- [ ] **Step 1: Create SearchDocument entity**

```java
// lego/backend/src/main/java/com/mic/search/domain/model/SearchDocument.java
package com.mic.search.domain.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.elasticsearch.annotations.*;

@Document(indexName = "search_documents")
@Setting(settingPath = "elasticsearch/search-index-settings.json")
public class SearchDocument {

    @Id
    private String id;

    @Field(type = FieldType.Text, analyzer = "ngram_analyzer", searchAnalyzer = "standard")
    private String coCd;

    @Field(type = FieldType.Text, analyzer = "ngram_analyzer", searchAnalyzer = "standard")
    private String companyName;

    @Field(type = FieldType.Text, analyzer = "ngram_analyzer", searchAnalyzer = "standard")
    private String companyShortName;

    @Field(type = FieldType.Text, analyzer = "ngram_analyzer", searchAnalyzer = "standard")
    private String title;

    @Field(type = FieldType.Text, analyzer = "ngram_analyzer", searchAnalyzer = "standard")
    private String content;

    @Field(type = FieldType.Keyword)
    private String date;

    @Field(type = FieldType.Keyword)
    private String category;

    public SearchDocument() {}

    public SearchDocument(String id, String coCd, String companyName, String companyShortName,
                          String title, String content, String date, String category) {
        this.id = id;
        this.coCd = coCd;
        this.companyName = companyName;
        this.companyShortName = companyShortName;
        this.title = title;
        this.content = content;
        this.date = date;
        this.category = category;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getCoCd() { return coCd; }
    public void setCoCd(String coCd) { this.coCd = coCd; }
    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }
    public String getCompanyShortName() { return companyShortName; }
    public void setCompanyShortName(String companyShortName) { this.companyShortName = companyShortName; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
}
```

- [ ] **Step 2: Create repository interface (no ES import)**

```java
// lego/backend/src/main/java/com/mic/search/domain/repository/SearchDocumentRepository.java
package com.mic.search.domain.repository;

import com.mic.search.domain.model.SearchDocument;
import java.util.List;

public interface SearchDocumentRepository {
    void saveAll(List<SearchDocument> documents);
    List<SearchDocument> fuzzySearch(String keyword);
    long count();
}
```

---

## Task 6: Infrastructure Layer — ES Config and Repository Impl

**Files:**
- Create: `lego/backend/src/main/java/com/mic/search/infrastructure/elasticsearch/config/ElasticsearchConfig.java`
- Create: `lego/backend/src/main/java/com/mic/search/infrastructure/elasticsearch/repository/SearchDocumentRepositoryImpl.java`

- [ ] **Step 1: Create ElasticsearchConfig**

```java
// lego/backend/src/main/java/com/mic/search/infrastructure/elasticsearch/config/ElasticsearchConfig.java
package com.mic.search.infrastructure.elasticsearch.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.elasticsearch.client.ClientConfiguration;
import org.springframework.data.elasticsearch.client.elc.ElasticsearchConfiguration;

@Configuration
public class ElasticsearchConfig extends ElasticsearchConfiguration {

    @Value("${spring.elasticsearch.uris:http://localhost:9200}")
    private String elasticsearchUri;

    @Override
    public ClientConfiguration clientConfiguration() {
        String hostAndPort = elasticsearchUri
            .replace("http://", "")
            .replace("https://", "");
        return ClientConfiguration.builder()
            .connectedTo(hostAndPort)
            .build();
    }
}
```

- [ ] **Step 2: Create Spring Data ES repository interface**

```java
// lego/backend/src/main/java/com/mic/search/infrastructure/elasticsearch/repository/EsSearchDocumentRepository.java
package com.mic.search.infrastructure.elasticsearch.repository;

import com.mic.search.domain.model.SearchDocument;
import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EsSearchDocumentRepository extends ElasticsearchRepository<SearchDocument, String> {
}
```

- [ ] **Step 3: Create SearchDocumentRepositoryImpl**

```java
// lego/backend/src/main/java/com/mic/search/infrastructure/elasticsearch/repository/SearchDocumentRepositoryImpl.java
package com.mic.search.infrastructure.elasticsearch.repository;

import com.mic.search.domain.model.SearchDocument;
import com.mic.search.domain.repository.SearchDocumentRepository;
import org.springframework.data.elasticsearch.core.ElasticsearchOperations;
import org.springframework.data.elasticsearch.core.SearchHit;
import org.springframework.data.elasticsearch.core.query.Criteria;
import org.springframework.data.elasticsearch.core.query.CriteriaQuery;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class SearchDocumentRepositoryImpl implements SearchDocumentRepository {

    private final EsSearchDocumentRepository esRepo;
    private final ElasticsearchOperations operations;

    public SearchDocumentRepositoryImpl(EsSearchDocumentRepository esRepo,
                                        ElasticsearchOperations operations) {
        this.esRepo = esRepo;
        this.operations = operations;
    }

    @Override
    public void saveAll(List<SearchDocument> documents) {
        esRepo.saveAll(documents);
    }

    @Override
    public List<SearchDocument> fuzzySearch(String keyword) {
        Criteria criteria = new Criteria("coCd").contains(keyword)
            .or(new Criteria("companyName").contains(keyword))
            .or(new Criteria("companyShortName").contains(keyword))
            .or(new Criteria("title").contains(keyword))
            .or(new Criteria("content").contains(keyword));

        CriteriaQuery query = new CriteriaQuery(criteria);
        return operations.search(query, SearchDocument.class)
            .stream()
            .map(SearchHit::getContent)
            .collect(Collectors.toList());
    }

    @Override
    public long count() {
        return esRepo.count();
    }
}
```

---

## Task 7: Infrastructure Layer — DataInitializer

**Files:**
- Create: `lego/backend/src/main/java/com/mic/search/infrastructure/elasticsearch/initializer/DataInitializer.java`

- [ ] **Step 1: Create DataInitializer**

```java
// lego/backend/src/main/java/com/mic/search/infrastructure/elasticsearch/initializer/DataInitializer.java
package com.mic.search.infrastructure.elasticsearch.initializer;

import com.mic.search.domain.model.SearchDocument;
import com.mic.search.domain.repository.SearchDocumentRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class DataInitializer implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);
    private final SearchDocumentRepository repository;

    public DataInitializer(SearchDocumentRepository repository) {
        this.repository = repository;
    }

    @Override
    public void run(ApplicationArguments args) {
        try {
            long count = repository.count();
            if (count > 0) {
                log.info("DataInitializer: index already has {} documents, skipping seed.", count);
                return;
            }
            log.info("DataInitializer: seeding {} mock documents...", MOCK_DATA.size());
            repository.saveAll(MOCK_DATA);
            log.info("DataInitializer: seed complete. Total documents: {}", repository.count());
        } catch (Exception e) {
            log.error("DataInitializer: failed to seed data — {}", e.getMessage());
        }
    }

    private static final List<SearchDocument> MOCK_DATA = List.of(
        new SearchDocument("1", "9999", "全球科技股份有限公司", "全球科技",
            "全球科技 2025 Q1 財報：營收創歷史新高",
            "全球科技公布 2025 年第一季財報，合併營收達新台幣 8,392 億元，較去年同期成長 41.6%。先進製程 3nm 及 5nm 合計佔晶圓銷售金額約 69%，顯示 AI 相關需求持續強勁。",
            "2025-04-17", "財報"),
        new SearchDocument("2", "9999", "全球科技股份有限公司", "全球科技",
            "全球科技宣布在美國亞利桑那州興建第三座晶圓廠",
            "全球科技今日宣布將在美國亞利桑那州鳳凰城建設第三座晶圓廠，預計採用 2nm 製程技術，總投資額超過 650 億美元。此舉有助於分散地緣政治風險並強化與美國客戶的合作關係。",
            "2025-03-28", "供應鏈"),
        new SearchDocument("3", "9999", "全球科技股份有限公司", "全球科技",
            "全球科技與 NVIDIA 深化 CoWoS 先進封裝合作",
            "全球科技與 NVIDIA 簽署多年期 CoWoS 先進封裝合作協議，以支應 H100 及下一代 Blackwell 系列 GPU 的強勁需求，預計 2025 年底前產能倍增。",
            "2025-02-10", "合作"),
        new SearchDocument("4", "005930", "三星電子株式會社", "三星電子",
            "三星電子 2025 年 HBM3E 出貨量預計超越預期",
            "三星電子半導體部門表示，HBM3E 已完成主要客戶認證，預計 2025 年出貨量將較原計畫增加 30%。三星同時宣布擴大 1c DRAM 製程的量產規模，以應對 AI 伺服器需求。",
            "2025-04-05", "產品"),
        new SearchDocument("5", "005930", "三星電子株式會社", "三星電子",
            "三星電子 3nm GAA 製程良率大幅提升，客戶導入加速",
            "三星電子 3nm GAA 製程良率已提升至 60% 以上，吸引多家 AI 晶片設計公司洽談量產合作。三星預計於 2025 年下半年啟動 2nm GAA 試產。",
            "2025-01-22", "製程"),
        new SearchDocument("6", "2454", "聯發科技股份有限公司", "聯發科",
            "聯發科 Dimensity 9400 拿下多家旗艦手機訂單",
            "聯發科技旗艦行動平台 Dimensity 9400 採用全球科技 3nm 製程，已獲三星、小米、vivo 等品牌採用於 2025 年旗艦機型。聯發科預估 2025 年行動業務營收成長超過 25%。",
            "2025-03-15", "產品"),
        new SearchDocument("7", "2454", "聯發科技股份有限公司", "聯發科",
            "聯發科積極布局 AI PC 市場，推出 Kompanio Ultra 平台",
            "聯發科技發布 Kompanio Ultra AI PC 平台，內建 60 TOPS NPU，針對 Windows on Arm 生態系優化。已與宏碁、ASUS 等 ODM 廠商完成設計合作，預計 2025 年 H2 量產。",
            "2025-02-28", "產品"),
        new SearchDocument("8", "2454", "聯發科技股份有限公司", "聯發科",
            "聯發科 2025 Q1 法說會：車用及 IoT 業務成長強勁",
            "聯發科技召開 2025 年第一季法人說明會，車用晶片業務年增 48%，智慧家居 IoT 平台出貨量創新高。管理層上調全年營收展望，預估全年營收成長率由 15% 上調至 20-25%。",
            "2025-04-24", "財報"),
        new SearchDocument("9", "MU", "Micron Technology, Inc.", "美光",
            "Micron HBM3E 正式通過 NVIDIA Blackwell 認證",
            "Micron Technology 宣布其 HBM3E 記憶體已正式通過 NVIDIA Blackwell GB200 NVL72 平台認證，成為 NVIDIA 重要的 HBM 供應商之一。預計 2025 年 HBM 相關營收將超過 10 億美元。",
            "2025-04-01", "合作"),
        new SearchDocument("10", "MU", "Micron Technology, Inc.", "美光",
            "Micron 宣布在印度興建首座半導體封測廠",
            "Micron Technology 宣布在印度古吉拉特邦投資超過 27.5 億美元興建首座半導體封裝測試廠，預計 2025 年底開始量產。此舉獲印度政府補貼支持，是印度半導體製造本土化戰略的重要里程碑。",
            "2025-01-30", "供應鏈")
    );
}
```

---

## Task 8: Application Layer — SearchIndexService

**Files:**
- Create: `lego/backend/src/main/java/com/mic/search/application/service/SearchIndexService.java`

- [ ] **Step 1: Create SearchIndexService**

```java
// lego/backend/src/main/java/com/mic/search/application/service/SearchIndexService.java
package com.mic.search.application.service;

import com.mic.search.domain.model.SearchDocument;
import com.mic.search.domain.repository.SearchDocumentRepository;
import com.mic.search.infrastructure.elasticsearch.initializer.DataInitializer;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SearchIndexService {

    private final SearchDocumentRepository repository;

    public SearchIndexService(SearchDocumentRepository repository) {
        this.repository = repository;
    }

    /**
     * Bulk insert all mock documents (used by manual API trigger).
     * Always inserts regardless of existing data.
     */
    public int bulkInsertMockData() {
        List<SearchDocument> docs = DataInitializer.getMockData();
        repository.saveAll(docs);
        return docs.size();
    }

    /**
     * Fuzzy search across co_cd, company_name, company_short_name, title, content.
     */
    public List<SearchDocument> search(String keyword) {
        if (keyword == null || keyword.isBlank()) {
            throw new IllegalArgumentException("Search keyword must not be empty");
        }
        return repository.fuzzySearch(keyword.trim());
    }
}
```

- [ ] **Step 2: Expose getMockData() as a static method from DataInitializer**

Update `DataInitializer.java` — add this public static accessor at the bottom of the class (after the `MOCK_DATA` field):

```java
    public static List<SearchDocument> getMockData() {
        return MOCK_DATA;
    }
```

---

## Task 9: Interfaces Layer — DTOs and Controller

**Files:**
- Create: `lego/backend/src/main/java/com/mic/search/interfaces/rest/dto/SearchRequest.java`
- Create: `lego/backend/src/main/java/com/mic/search/interfaces/rest/dto/SearchResponse.java`
- Create: `lego/backend/src/main/java/com/mic/search/interfaces/rest/SearchController.java`
- Create: `lego/backend/src/main/java/com/mic/search/SearchBackendApplication.java`

- [ ] **Step 1: Create SearchRequest DTO**

```java
// lego/backend/src/main/java/com/mic/search/interfaces/rest/dto/SearchRequest.java
package com.mic.search.interfaces.rest.dto;

public class SearchRequest {
    private String q;
    public String getQ() { return q; }
    public void setQ(String q) { this.q = q; }
}
```

- [ ] **Step 2: Create SearchResponse DTO**

```java
// lego/backend/src/main/java/com/mic/search/interfaces/rest/dto/SearchResponse.java
package com.mic.search.interfaces.rest.dto;

import com.mic.search.domain.model.SearchDocument;
import java.util.List;

public class SearchResponse {
    private int total;
    private List<SearchDocument> results;

    public SearchResponse(List<SearchDocument> results) {
        this.results = results;
        this.total = results.size();
    }

    public int getTotal() { return total; }
    public List<SearchDocument> getResults() { return results; }
}
```

- [ ] **Step 3: Create SearchController**

```java
// lego/backend/src/main/java/com/mic/search/interfaces/rest/SearchController.java
package com.mic.search.interfaces.rest;

import com.mic.search.application.service.SearchIndexService;
import com.mic.search.interfaces.rest.dto.SearchResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/search")
@CrossOrigin(origins = "*")
public class SearchController {

    private final SearchIndexService searchIndexService;

    public SearchController(SearchIndexService searchIndexService) {
        this.searchIndexService = searchIndexService;
    }

    @PostMapping("/index")
    public ResponseEntity<Map<String, Object>> indexMockData() {
        try {
            int count = searchIndexService.bulkInsertMockData();
            return ResponseEntity.ok(Map.of("status", "success", "inserted", count));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                .body(Map.of("status", "error", "message", e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<?> search(@RequestParam("q") String q) {
        if (q == null || q.isBlank()) {
            return ResponseEntity.badRequest()
                .body(Map.of("status", "error", "message", "Query parameter 'q' is required"));
        }
        try {
            var results = searchIndexService.search(q);
            return ResponseEntity.ok(new SearchResponse(results));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                .body(Map.of("status", "error", "message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                .body(Map.of("status", "error", "message", e.getMessage()));
        }
    }
}
```

- [ ] **Step 4: Create Spring Boot entry point**

```java
// lego/backend/src/main/java/com/mic/search/SearchBackendApplication.java
package com.mic.search;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class SearchBackendApplication {
    public static void main(String[] args) {
        SpringApplication.run(SearchBackendApplication.class, args);
    }
}
```

---

## Task 10: Unit Tests

**Files:**
- Create: `lego/backend/src/test/java/com/mic/search/application/service/SearchIndexServiceTest.java`

- [ ] **Step 1: Write unit tests**

```java
// lego/backend/src/test/java/com/mic/search/application/service/SearchIndexServiceTest.java
package com.mic.search.application.service;

import com.mic.search.domain.model.SearchDocument;
import com.mic.search.domain.repository.SearchDocumentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;

class SearchIndexServiceTest {

    @Mock
    private SearchDocumentRepository repository;

    @InjectMocks
    private SearchIndexService service;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void bulkInsertMockData_savesAllDocuments() {
        int count = service.bulkInsertMockData();
        verify(repository, times(1)).saveAll(anyList());
        assertThat(count).isEqualTo(10);
    }

    @Test
    void search_withValidKeyword_callsRepository() {
        SearchDocument doc = new SearchDocument("1", "9999", "全球科技", "全球科技", "標題", "內文", "2025-01-01", "財報");
        when(repository.fuzzySearch("全球科技")).thenReturn(List.of(doc));

        List<SearchDocument> results = service.search("全球科技");

        assertThat(results).hasSize(1);
        assertThat(results.get(0).getCoCd()).isEqualTo("9999");
        verify(repository).fuzzySearch("全球科技");
    }

    @Test
    void search_withEmptyKeyword_throwsException() {
        assertThatThrownBy(() -> service.search(""))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessage("Search keyword must not be empty");
    }

    @Test
    void search_withBlankKeyword_throwsException() {
        assertThatThrownBy(() -> service.search("   "))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessage("Search keyword must not be empty");
    }
}
```

- [ ] **Step 2: Run tests**

```bash
cd /home/ubuntu/lego/backend
mvn test 2>&1 | tail -20
```

Expected: `Tests run: 4, Failures: 0, Errors: 0, Skipped: 0` and `BUILD SUCCESS`

- [ ] **Step 3: Commit**

```bash
cd /home/ubuntu/lego
git add backend/ app/data/searchMockData.ts
git commit -m "feat: add Spring Boot 3.4 DDD search backend with Elasticsearch integration

- DDD 4-layer architecture: domain, application, infrastructure, interfaces
- ngram analyzer (min=2, max=3) for fuzzy search on co_cd, company_name,
  company_short_name, title, content
- 10 mock semiconductor news records (TSMC, Samsung, MediaTek, Micron)
- DataInitializer seeds data on startup (idempotent)
- REST API: POST /api/v1/search/index, GET /api/v1/search?q={keyword}
- Unit tests for SearchIndexService

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

---

## Task 11: Build and Deploy

**Files:** None (deployment operations)

- [ ] **Step 1: Build the JAR**

```bash
cd /home/ubuntu/lego/backend
mvn clean package -DskipTests 2>&1 | tail -10
```

Expected: `BUILD SUCCESS` and `lego/backend/target/search-backend.jar` exists

- [ ] **Step 2: Create logs directory**

```bash
mkdir -p /home/ubuntu/lego/backend/logs
```

- [ ] **Step 3: Stop any existing instance on port 8080**

```bash
PID=$(lsof -ti:8080) && [ -n "$PID" ] && kill "$PID" && echo "Stopped PID $PID" || echo "No process on port 8080"
```

- [ ] **Step 4: Start the service in background**

```bash
nohup java -jar /home/ubuntu/lego/backend/target/search-backend.jar \
  --server.port=8080 \
  --spring.elasticsearch.uris=http://localhost:9200 \
  > /home/ubuntu/lego/backend/logs/app.log 2>&1 &
echo "Started PID: $!"
```

- [ ] **Step 5: Wait for startup and verify health**

```bash
sleep 20
curl -s http://localhost:8080/actuator/health | python3 -m json.tool
```

Expected:
```json
{
  "status": "UP",
  "components": {
    "elasticsearch": { "status": "UP" },
    "diskSpace": { "status": "UP" }
  }
}
```

- [ ] **Step 6: Verify mock data was seeded (check logs)**

```bash
grep -i "DataInitializer" /home/ubuntu/lego/backend/logs/app.log
```

Expected: `DataInitializer: seed complete. Total documents: 10`

- [ ] **Step 7: Test fuzzy search API**

```bash
# Search by company short name
curl -s "http://localhost:8080/api/v1/search?q=全球科技" | python3 -m json.tool | head -20

# Search by English name
curl -s "http://localhost:8080/api/v1/search?q=TSMC" | python3 -m json.tool | head -20

# Search by company code
curl -s "http://localhost:8080/api/v1/search?q=9999" | python3 -m json.tool | head -10

# Search by keyword in content
curl -s "http://localhost:8080/api/v1/search?q=HBM" | python3 -m json.tool | head -10
```

Expected: each returns `{"total": N, "results": [...]}`

- [ ] **Step 8: Test manual index trigger**

```bash
curl -s -X POST http://localhost:8080/api/v1/search/index | python3 -m json.tool
```

Expected: `{"inserted": 10, "status": "success"}`

- [ ] **Step 9: Final commit with deployment note**

```bash
cd /home/ubuntu/lego
git add -A
git commit -m "chore: backend deployed on port 8080

Service running as background process.
Logs: lego/backend/logs/app.log
Health: http://localhost:8080/actuator/health

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

---

## Quick Reference — After Deployment

| Endpoint | Purpose |
|----------|---------|
| `GET http://localhost:8080/actuator/health` | Health check |
| `GET http://localhost:8080/api/v1/search?q=全球科技` | Fuzzy search |
| `POST http://localhost:8080/api/v1/search/index` | Re-seed mock data |

**Restart service:**
```bash
PID=$(lsof -ti:8080) && [ -n "$PID" ] && kill "$PID"
nohup java -jar /home/ubuntu/lego/backend/target/search-backend.jar \
  --server.port=8080 > /home/ubuntu/lego/backend/logs/app.log 2>&1 &
```

**View logs:**
```bash
tail -f /home/ubuntu/lego/backend/logs/app.log
```
