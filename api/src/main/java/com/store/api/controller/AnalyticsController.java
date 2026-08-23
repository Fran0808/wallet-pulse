package com.store.api.controller;

import com.store.api.model.dto.FinancialSummaryResponse;
import com.store.api.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/analytics")
@RequiredArgsConstructor
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping("/summary")
    public ResponseEntity<FinancialSummaryResponse> getSummary() {
        return ResponseEntity.ok(analyticsService.getSummary());
    }
}