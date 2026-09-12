package com.store.api.service.email;

import com.store.api.model.dto.TransactionResponse;
import com.store.api.model.dto.TransactionSyncRequest;
import com.store.api.model.dto.email.EmailConnectionTestResponse;
import com.store.api.model.dto.email.EmailMessageDto;
import com.store.api.model.dto.email.EmailSyncResponse;
import com.store.api.model.dto.email.ParsedEmailTransaction;
import com.store.api.service.TransactionService;
import com.store.api.service.auth.GoogleOAuthService;
import com.store.api.service.email.client.GmailApiClient;
import com.store.api.service.email.client.ImapEmailClient;
import com.store.api.service.email.parser.BankEmailParserDispatcher;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

/**
 * Domain orchestrator service for email synchronization and transaction persistence.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class EmailIngestionService {

    private final GoogleOAuthService googleOAuthService;
    private final GmailApiClient gmailApiClient;
    private final ImapEmailClient imapEmailClient;
    private final BankEmailParserDispatcher parserDispatcher;
    private final TransactionService transactionService;

    @Value("${mail.sync.batch-size:20}")
    private int batchSize;

    public EmailConnectionTestResponse testConnection() {
        Optional<String> googleToken = googleOAuthService.getValidAccessToken();
        if (googleToken.isPresent()) {
            return EmailConnectionTestResponse.builder()
                    .status("OK")
                    .message("Conexión activa y autorizada con Google Gmail API (OAuth2)")
                    .build();
        }
        return imapEmailClient.testConnection();
    }

    public EmailSyncResponse syncEmails() {
        List<EmailMessageDto> messages;
        Optional<String> googleToken = googleOAuthService.getValidAccessToken();

        if (googleToken.isPresent()) {
            log.info("Synchronizing emails using Google Gmail REST API (OAuth2)...");
            messages = gmailApiClient.fetchFinancialEmails(googleToken.get(), batchSize);
        } else {
            log.info("Synchronizing emails using IMAP fallback client...");
            messages = imapEmailClient.fetchFinancialEmails(batchSize);
        }
        int scannedCount = messages.size();
        int savedCount = 0;
        List<TransactionResponse> savedTransactions = new ArrayList<>();

        for (EmailMessageDto msg : messages) {
            try {
                Optional<ParsedEmailTransaction> parsedOpt = parserDispatcher.dispatchAndParse(
                        msg.getFrom(),
                        msg.getSubject(),
                        msg.getBody(),
                        msg.getSentDate()
                );

                if (parsedOpt.isPresent()) {
                    ParsedEmailTransaction parsed = parsedOpt.get();
                    TransactionSyncRequest req = new TransactionSyncRequest();
                    req.setAmount(parsed.getAmount());
                    req.setFlowType(parsed.getFlowType());
                    req.setContactName(parsed.getMerchantName());
                    req.setChannel(parsed.getChannel());
                    req.setTransactionDate(parsed.getTransactionDate());
                    req.setTransactionHash(parsed.getTransactionHash());
                    req.setRawNotificationText(parsed.getRawBody());

                    TransactionResponse saved = transactionService.processAndSave(req);
                    savedTransactions.add(saved);
                    savedCount++;
                }
            } catch (Exception ex) {
                log.warn("Error processing email message ID [{}]: {}", msg.getMessageId(), ex.getMessage());
            }
        }

        log.info("Email synchronization completed: scanned={}, saved={}", scannedCount, savedCount);

        return EmailSyncResponse.builder()
                .status("SUCCESS")
                .scannedCount(scannedCount)
                .processedInBatch(messages.size())
                .savedCount(savedCount)
                .transactions(savedTransactions)
                .message("Emails synchronized successfully")
                .build();
    }
}
