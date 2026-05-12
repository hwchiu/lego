package com.mic.search.infrastructure.elasticsearch.repository;

import co.elastic.clients.elasticsearch._types.query_dsl.MultiMatchQuery;
import co.elastic.clients.elasticsearch._types.query_dsl.Query;
import com.mic.search.domain.model.SearchDocument;
import com.mic.search.domain.repository.SearchDocumentRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.elasticsearch.client.elc.NativeQuery;
import org.springframework.data.elasticsearch.core.ElasticsearchOperations;
import org.springframework.data.elasticsearch.core.SearchHit;
import org.springframework.data.elasticsearch.core.SearchHits;
import org.springframework.data.elasticsearch.core.mapping.IndexCoordinates;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class SearchDocumentRepositoryImpl implements SearchDocumentRepository {

    private final EsSearchDocumentRepository esRepo;
    private final ElasticsearchOperations elasticsearchOperations;

    public SearchDocumentRepositoryImpl(EsSearchDocumentRepository esRepo,
                                        ElasticsearchOperations elasticsearchOperations) {
        this.esRepo = esRepo;
        this.elasticsearchOperations = elasticsearchOperations;
    }

    @Override
    public void saveAll(List<SearchDocument> documents) {
        esRepo.saveAll(documents);
    }

    @Override
    public List<SearchDocument> fuzzySearch(String keyword) {
        Query multiMatchQuery = MultiMatchQuery.of(m -> m
            .query(keyword)
            .fields("co_cd", "company_name", "company_short_name", "title", "content")
            .fuzziness("AUTO")
        )._toQuery();

        NativeQuery nativeQuery = NativeQuery.builder()
            .withQuery(multiMatchQuery)
            .withPageable(PageRequest.of(0, 100))
            .build();

        SearchHits<SearchDocument> hits = elasticsearchOperations.search(
            nativeQuery, SearchDocument.class, IndexCoordinates.of("search_documents")
        );

        return hits.stream()
            .map(SearchHit::getContent)
            .collect(Collectors.toList());
    }

    @Override
    public long count() {
        return esRepo.count();
    }
}
