package com.store.api.model.dto.email;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmailMessageDto {
    private String messageId;
    private String subject;
    private String from;
    private LocalDateTime sentDate;
    private String body;
}
