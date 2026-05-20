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
            log.info("DataInitializer: seeding {} mock documents...", getMockData().size());
            repository.saveAll(getMockData());
            log.info("DataInitializer: seed complete. Total documents: {}", repository.count());
        } catch (Exception e) {
            log.error("DataInitializer: failed to seed data — {}", e.getMessage());
        }
    }

    public static List<SearchDocument> getMockData() {
        return MOCK_DATA;
    }

    private static final List<SearchDocument> MOCK_DATA = List.of(
        new SearchDocument("1", "2330", "台灣積體電路製造股份有限公司", "台積電",
            "台積電 2025 Q1 財報：營收創歷史新高",
            "台積電公布 2025 年第一季財報，合併營收達新台幣 8,392 億元，較去年同期成長 41.6%。先進製程 3nm 及 5nm 合計佔晶圓銷售金額約 69%，顯示 AI 相關需求持續強勁。",
            "2025-04-17", "財報"),
        new SearchDocument("2", "2330", "台灣積體電路製造股份有限公司", "台積電",
            "台積電宣布在美國亞利桑那州興建第三座晶圓廠",
            "台積電今日宣布將在美國亞利桑那州鳳凰城建設第三座晶圓廠，預計採用 2nm 製程技術，總投資額超過 650 億美元。此舉有助於分散地緣政治風險並強化與美國客戶的合作關係。",
            "2025-03-28", "供應鏈"),
        new SearchDocument("3", "2330", "台灣積體電路製造股份有限公司", "台積電",
            "台積電與 NVIDIA 深化 CoWoS 先進封裝合作",
            "台積電與 NVIDIA 簽署多年期 CoWoS 先進封裝合作協議，以支應 H100 及下一代 Blackwell 系列 GPU 的強勁需求，預計 2025 年底前產能倍增。",
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
            "聯發科技旗艦行動平台 Dimensity 9400 採用台積電 3nm 製程，已獲三星、小米、vivo 等品牌採用於 2025 年旗艦機型。聯發科預估 2025 年行動業務營收成長超過 25%。",
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
