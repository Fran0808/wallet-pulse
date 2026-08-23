package com.store.api.controller;

import com.store.api.model.dto.TransactionResponse;
import com.store.api.model.dto.TransactionSyncRequest;
import com.store.api.model.enums.FlowType;
import com.store.api.service.TransactionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/v1/transactions")
@RequiredArgsConstructor
public class TransactionController {

    private final TransactionService transactionService;

    // Single transaction ingestion from mobile device
    @PostMapping("/sync")
    public ResponseEntity<TransactionResponse> syncTransaction(@Valid @RequestBody TransactionSyncRequest request) {
        TransactionResponse response = transactionService.processAndSave(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    // Batch transaction ingestion (when recovering connection after offline mode)
    @PostMapping("/sync/batch")
    public ResponseEntity<List<TransactionResponse>> syncBatchTransactions(@RequestBody List<@Valid TransactionSyncRequest> requests) {
        List<TransactionResponse> responses = transactionService.processBatch(requests);
        return new ResponseEntity<>(responses, HttpStatus.CREATED);
    }

    // Paginated list with dynamic filters for the Dashboard
    @GetMapping
    public ResponseEntity<Page<TransactionResponse>> getTransactions(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            @RequestParam(required = false) FlowType flowType,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "transactionDate"));
        Page<TransactionResponse> result = transactionService.getTransactions(startDate, endDate, flowType, search, pageable);
        return ResponseEntity.ok(result);
    }
}