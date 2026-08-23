package com.store.api.service;

import com.store.api.model.dto.FinancialSummaryResponse;
import com.store.api.model.enums.FlowType;
import com.store.api.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final TransactionRepository transactionRepository;

    @Transactional(readOnly = true)
    public FinancialSummaryResponse getSummary() {
        BigDecimal totalIncome = transactionRepository.sumAmountByFlowType(FlowType.INCOME);
        BigDecimal totalExpense = transactionRepository.sumAmountByFlowType(FlowType.EXPENSE);
        BigDecimal netBalance = totalIncome.subtract(totalExpense);
        long totalTransactions = transactionRepository.count();

        return FinancialSummaryResponse.builder()
                .totalIncome(totalIncome)
                .totalExpense(totalExpense)
                .netBalance(netBalance)
                .totalTransactions(totalTransactions)
                .build();
    }
}