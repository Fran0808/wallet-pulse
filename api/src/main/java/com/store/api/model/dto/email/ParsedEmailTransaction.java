package com.store.api.model.dto.email;

import com.store.api.model.enums.FlowType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
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
