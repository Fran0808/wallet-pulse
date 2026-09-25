package com.store.api.service;

import com.store.api.model.dto.PeriodAnalyticsResponse;
import com.store.api.model.enums.FlowType;
import com.store.api.repository.TransactionRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AnalyticsServiceTest {

    @Mock
    private TransactionRepository transactionRepository;

    @InjectMocks
    private AnalyticsService analyticsService;

    @Test
    void currentMonthUsesDailyExpensesAndComparesThroughSameDay() {
        LocalDate today = LocalDate.now();
        YearMonth previousMonth = YearMonth.from(today).minusMonths(1);
        int comparisonDay = Math.min(today.getDayOfMonth(), previousMonth.lengthOfMonth());

        when(transactionRepository.sumAmountByFlowTypeAndDateRange(any(), any(), any(), isNull()))
                .thenAnswer(invocation -> invocation.getArgument(0) == FlowType.EXPENSE
                        && ((LocalDateTime) invocation.getArgument(1)).getMonthValue() == previousMonth.getMonthValue()
                        ? new BigDecimal("7.00") : new BigDecimal("12.00"));
        when(transactionRepository.findExpenseAmountsByDateRange(any(), any(), isNull()))
                .thenReturn(List.of(
                        new Object[] { today.withDayOfMonth(1).atTime(9, 0), new BigDecimal("5.00") },
                        new Object[] { today.atTime(10, 0), new BigDecimal("7.00") }
                ));
        when(transactionRepository.findLatestExpense(isNull())).thenReturn(Optional.empty());
        when(transactionRepository.findExpenseBreakdownByChannel(any(), any(), isNull())).thenReturn(List.of());
        when(transactionRepository.findTopMerchants(any(), any(), isNull())).thenReturn(List.of());

        PeriodAnalyticsResponse result = analyticsService.getPeriodAnalytics(today.getYear(), today.getMonthValue());

        assertEquals(new BigDecimal("7.00"), result.getPreviousPeriodExpense());
        assertEquals(comparisonDay, result.getComparisonThroughDay());
        assertEquals(today.getDayOfMonth(), result.getDailyExpenses().size());
        assertEquals(new BigDecimal("12.00"), result.getDailyExpenses().getLast().getCumulativeAmount());
        verify(transactionRepository).sumAmountByFlowTypeAndDateRange(
                FlowType.EXPENSE,
                previousMonth.atDay(1).atStartOfDay(),
                previousMonth.atDay(comparisonDay).atTime(java.time.LocalTime.MAX),
                null
        );
    }

    @Test
    void futureMonthHasNoVisibleExpenseOrComparison() {
        YearMonth future = YearMonth.now().plusMonths(1);
        when(transactionRepository.sumAmountByFlowTypeAndDateRange(any(), any(), any(), isNull()))
                .thenReturn(BigDecimal.ZERO);
        when(transactionRepository.findLatestExpense(isNull())).thenReturn(Optional.empty());
        when(transactionRepository.findExpenseBreakdownByChannel(any(), any(), isNull())).thenReturn(List.of());
        when(transactionRepository.findTopMerchants(any(), any(), isNull())).thenReturn(List.of());

        PeriodAnalyticsResponse result = analyticsService.getPeriodAnalytics(future.getYear(), future.getMonthValue());

        assertNull(result.getPreviousPeriodExpense());
        assertEquals(List.of(), result.getDailyExpenses());
        assertEquals(BigDecimal.ZERO, result.getMonthlyExpense());
    }
}
