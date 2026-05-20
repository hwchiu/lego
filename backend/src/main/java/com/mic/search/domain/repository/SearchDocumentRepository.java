package com.mic.search.domain.repository;

import com.mic.search.domain.model.SearchDocument;
import java.util.List;

public interface SearchDocumentRepository {
    void saveAll(List<SearchDocument> documents);
    List<SearchDocument> fuzzySearch(String keyword);
    long count();
}
