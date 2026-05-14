package com.mic.search.infrastructure.elasticsearch.repository;

import com.mic.search.domain.model.SearchDocument;
import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EsSearchDocumentRepository extends ElasticsearchRepository<SearchDocument, String> {
}
