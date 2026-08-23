package com.store.api.service;

import com.store.api.model.dto.TransactionResponse;
import com.store.api.model.dto.TransactionSyncRequest;
import com.store.api.model.entity.RawNotificationLog;
import com.store.api.model.entity.Transaction;
import com.store.api.model.enums.FlowType;
import com.store.api.repository.RawNotificationRepository;
import com.store.api.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final RawNotificationRepository rawNotificationRepository;

    @Transactional
    public TransactionResponse processAndSave(TransactionSyncRequest request) {
        // Save raw notification audit log
        if (request.getRawNotificationText() != null && !request.getRawNotificationText().isBlank()) {
            RawNotificationLog rawLog = RawNotificationLog.builder()
                    .rawText(request.getRawNotificationText())
                    .sourcePackage("com.bcp.innovacxion.yapeapp")
                    .isProcessed(true)
                    .build();
            rawNotificationRepository.save(rawLog);
        }

        // Deduplication logic: If transaction hash already exists, skip duplicate safely
        if (transactionRepository.existsByTransactionHash(request.getTransactionHash())) {
            log.warn("Transaction with hash [{}] already exists. Skipping duplicate.", request.getTransactionHash());
            Transaction existing = transactionRepository.findByTransactionHash(request.getTransactionHash()).orElseThrow();
            return mapToResponse(existing);
        }

        Transaction transaction = Transaction.builder()
                .amount(request.getAmount())
                .flowType(request.getFlowType())
                .contactName(request.getContactName().trim())
                .channel(request.getChannel() != null ? request.getChannel() : "YAPE")
                .transactionDate(request.getTransactionDate())
                .transactionHash(request.getTransactionHash())
                .build();

        Transaction saved = transactionRepository.save(transaction);
        log.info("Transaction saved successfully: ID={}, Amount={}, FlowType={}", saved.getId(), saved.getAmount(), saved.getFlowType());
        return mapToResponse(saved);
    }

    @Transactional
    public List<TransactionResponse> processBatch(List<TransactionSyncRequest> requests) {
        List<TransactionResponse> responses = new ArrayList<>();
        for (TransactionSyncRequest req : requests) {
            responses.add(processAndSave(req));
        }
        return responses;
    }

    @Transactional(readOnly = true)
    public Page<TransactionResponse> getTransactions(LocalDateTime startDate, LocalDateTime endDate, FlowType flowType, String search, Pageable pageable) {
        return transactionRepository.findWithFilters(startDate, endDate, flowType, search, pageable)
                .map(this::mapToResponse);
    }

    private TransactionResponse mapToResponse(Transaction t) {
        return TransactionResponse.builder()
                .id(t.getId())
                .amount(t.getAmount())
                .flowType(t.getFlowType())
                .contactName(t.getContactName())
                .channel(t.getChannel())
                .transactionDate(t.getTransactionDate())
                .transactionHash(t.getTransactionHash())
                .createdAt(t.getCreatedAt())
                .build();
    }
}