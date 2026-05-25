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
