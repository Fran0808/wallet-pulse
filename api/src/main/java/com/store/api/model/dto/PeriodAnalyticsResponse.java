package com.store.api.model.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class PeriodAnalyticsResponse {
    private String periodName;
    private BigDecimal monthlyExpense;
    private BigDecimal monthlyIncome;
    private BigDecimal internalTransfersAmount;
    private long totalMovements;


    private String lastExpenseMerchant;
    private BigDecimal lastExpenseAmount;
    private LocalDateTime lastExpenseDate;


    private String topChannel;
    private BigDecimal topChannelAmount;
    private double topChannelPercentage;

    private List<ChannelBreakdownDto> channelBreakdown;

    @Data
    @Builder
    public static class ChannelBreakdownDto {
        private String channel;
        private BigDecimal amount;
        private double percentage;
        private long count;
    }
}
