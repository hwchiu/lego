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
