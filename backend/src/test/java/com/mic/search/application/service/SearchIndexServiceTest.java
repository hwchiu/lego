package com.mic.search.application.service;

import com.mic.search.domain.model.SearchDocument;
import com.mic.search.domain.repository.SearchDocumentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Collections;
import java.util.List;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SearchIndexServiceTest {

    @Mock
    private SearchDocumentRepository repository;

    @InjectMocks
    private SearchIndexService service;

    @Test
    void bulkInsertMockData_insertsAllRecords() {
        int count = service.bulkInsertMockData();

        verify(repository, times(1)).saveAll(anyList());
        assertThat(count).isEqualTo(10);
    }

    @Test
    void search_returnsResults() {
        SearchDocument doc1 = new SearchDocument();
        doc1.setTitle("台積電 2025 Q1 財報");
        SearchDocument doc2 = new SearchDocument();
        doc2.setTitle("台積電宣布擴廠");

        when(repository.fuzzySearch("台積電")).thenReturn(List.of(doc1, doc2));

        List<SearchDocument> results = service.search("台積電");

        assertThat(results).hasSize(2);
        assertThat(results).allSatisfy(item -> assertThat(item).isInstanceOf(SearchDocument.class));
    }

    @Test
    void search_blankKeyword_throwsException() {
        assertThatThrownBy(() -> service.search(""))
                .isInstanceOf(IllegalArgumentException.class);

        assertThatThrownBy(() -> service.search("   "))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void search_noResults_returnsEmptyList() {
        when(repository.fuzzySearch("xyz123")).thenReturn(Collections.emptyList());

        List<SearchDocument> results = service.search("xyz123");

        assertThat(results).isEmpty();
    }
}
