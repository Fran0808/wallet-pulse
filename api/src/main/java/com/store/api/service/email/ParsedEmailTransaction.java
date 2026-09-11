package com.store.api.service.email;

import com.store.api.model.enums.FlowType;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Builder
public class ParsedEmailTransaction {
    private BigDecimal amount;
    private String currency;
    private FlowType flowType;
    private String merchantName;
    private String channel;
    private String cardLast4;
    private String operationNumber;
    private LocalDateTime transactionDate;
    private String transactionHash;
    private String rawBody;
}
