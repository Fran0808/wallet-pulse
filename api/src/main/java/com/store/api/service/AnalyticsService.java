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

    @Transactional(readOnly = true)
    public com.store.api.model.dto.PeriodAnalyticsResponse getPeriodAnalytics() {
        java.time.LocalDate now = java.time.LocalDate.now();
        java.time.LocalDateTime startOfMonth = now.withDayOfMonth(1).atStartOfDay();
        java.time.LocalDateTime endOfMonth = now.withDayOfMonth(now.lengthOfMonth()).atTime(23, 59, 59);

        java.math.BigDecimal monthlyExpense = transactionRepository.sumAmountByFlowTypeAndDateRange(FlowType.EXPENSE, startOfMonth, endOfMonth);
        java.math.BigDecimal monthlyIncome = transactionRepository.sumAmountByFlowTypeAndDateRange(FlowType.INCOME, startOfMonth, endOfMonth);
        java.math.BigDecimal internalTransfers = transactionRepository.sumAmountByFlowTypeAndDateRange(FlowType.INTERNAL_TRANSFER, startOfMonth, endOfMonth);

        long totalMovements = transactionRepository.count();

        java.util.Optional<com.store.api.model.entity.Transaction> latestOpt = transactionRepository.findLatestExpense();
        String lastMerchant = latestOpt.map(com.store.api.model.entity.Transaction::getContactName).orElse("Sin gastos");
        java.math.BigDecimal lastAmount = latestOpt.map(com.store.api.model.entity.Transaction::getAmount).orElse(java.math.BigDecimal.ZERO);
        java.time.LocalDateTime lastDate = latestOpt.map(com.store.api.model.entity.Transaction::getTransactionDate).orElse(null);

        java.util.List<Object[]> rawBreakdown = transactionRepository.findExpenseBreakdownByChannel(startOfMonth, endOfMonth);
        java.util.List<com.store.api.model.dto.PeriodAnalyticsResponse.ChannelBreakdownDto> breakdownList = new java.util.ArrayList<>();

        String topChannel = "N/A";
        java.math.BigDecimal topChannelAmount = java.math.BigDecimal.ZERO;
        double topChannelPercentage = 0.0;

        for (Object[] row : rawBreakdown) {
            String channel = (String) row[0];
            java.math.BigDecimal amount = (java.math.BigDecimal) row[1];
            long count = ((Number) row[2]).longValue();

            double percentage = monthlyExpense.compareTo(java.math.BigDecimal.ZERO) > 0
                    ? amount.divide(monthlyExpense, 4, java.math.RoundingMode.HALF_UP).doubleValue() * 100
                    : 0.0;

            breakdownList.add(com.store.api.model.dto.PeriodAnalyticsResponse.ChannelBreakdownDto.builder()
                    .channel(channel)
                    .amount(amount)
                    .percentage(Math.round(percentage * 10.0) / 10.0)
                    .count(count)
                    .build());
        }

        if (!breakdownList.isEmpty()) {
            com.store.api.model.dto.PeriodAnalyticsResponse.ChannelBreakdownDto first = breakdownList.getFirst();
            topChannel = first.getChannel();
            topChannelAmount = first.getAmount();
            topChannelPercentage = first.getPercentage();
        }

        return com.store.api.model.dto.PeriodAnalyticsResponse.builder()
                .periodName(now.getMonth().name())
                .monthlyExpense(monthlyExpense)
                .monthlyIncome(monthlyIncome)
                .internalTransfersAmount(internalTransfers)
                .totalMovements(totalMovements)
                .lastExpenseMerchant(lastMerchant)
                .lastExpenseAmount(lastAmount)
                .lastExpenseDate(lastDate)
                .topChannel(topChannel)
                .topChannelAmount(topChannelAmount)
                .topChannelPercentage(topChannelPercentage)
                .channelBreakdown(breakdownList)
                .build();
    }
}