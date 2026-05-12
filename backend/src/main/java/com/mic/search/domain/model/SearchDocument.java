package com.mic.search.domain.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.elasticsearch.annotations.*;

@Document(indexName = "search_documents")
@Setting(settingPath = "elasticsearch/search-index-settings.json")
public class SearchDocument {

    @Id
    private String id;

    @Field(name = "co_cd", type = FieldType.Text, analyzer = "ngram_analyzer", searchAnalyzer = "ngram_analyzer")
    private String coCd;

    @Field(name = "company_name", type = FieldType.Text, analyzer = "ngram_analyzer", searchAnalyzer = "ngram_analyzer")
    private String companyName;

    @Field(name = "company_short_name", type = FieldType.Text, analyzer = "ngram_analyzer", searchAnalyzer = "ngram_analyzer")
    private String companyShortName;

    @Field(type = FieldType.Text, analyzer = "ngram_analyzer", searchAnalyzer = "ngram_analyzer")
    private String title;

    @Field(type = FieldType.Text, analyzer = "ngram_analyzer", searchAnalyzer = "ngram_analyzer")
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
