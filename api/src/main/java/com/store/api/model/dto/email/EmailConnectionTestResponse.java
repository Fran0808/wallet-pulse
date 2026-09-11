package com.store.api.model.dto.email;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmailConnectionTestResponse {
    private String status;
    private String connectedUser;
    private Integer totalInboxMessages;
    private Integer unreadMessages;
    private Integer matchedBcpEmailsCount;
    private List<EmailSampleDto> recentSampleEmails;
    private String message;
}
