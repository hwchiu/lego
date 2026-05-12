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
