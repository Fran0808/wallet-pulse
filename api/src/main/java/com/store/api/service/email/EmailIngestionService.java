package com.store.api.service.email;

import com.store.api.model.dto.TransactionResponse;
import com.store.api.model.dto.TransactionSyncRequest;
import com.store.api.model.dto.email.EmailConnectionTestResponse;
import com.store.api.model.dto.email.EmailMessageDto;
import com.store.api.model.dto.email.EmailSyncResponse;
import com.store.api.model.dto.email.ParsedEmailTransaction;
import com.store.api.config.security.UserContext;
import com.store.api.model.entity.User;
import com.store.api.model.entity.ProcessedEmailMessage;
import com.store.api.repository.ProcessedEmailMessageRepository;
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
    private final ProcessedEmailMessageRepository processedEmailRepository;

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

    public boolean hasActiveConnection() {
        return googleOAuthService.getValidAccessToken().isPresent();
    }

    public EmailSyncResponse syncEmails() {
        User previousUser = UserContext.getCurrentUser();
        boolean contextSetBySync = false;
        if (previousUser == null) {
            Optional<User> connectedUser = googleOAuthService.getConnectedUser();
            if (connectedUser.isPresent()) {
                UserContext.setCurrentUser(connectedUser.get());
                contextSetBySync = true;
                log.info("Assigned User [{}] to UserContext for background email synchronization", connectedUser.get().getEmail());
            }
        }

        try {
            List<EmailMessageDto> messages;
            Optional<String> googleToken = googleOAuthService.getValidAccessToken();

        if (googleToken.isPresent()) {
            log.info("Synchronizing emails using Google Gmail REST API (OAuth2)...");
            Long lastSyncedInternalDate = googleOAuthService.getLastSyncedInternalDate().orElse(null);
            messages = gmailApiClient.fetchFinancialEmails(
                    googleToken.get(),
                    batchSize,
                    lastSyncedInternalDate,
                    processedEmailRepository::existsById
            );
        } else {
            log.info("Synchronizing emails using IMAP fallback client...");
            messages = imapEmailClient.fetchFinancialEmails(batchSize);
        }
        int scannedCount = messages.size();
        int savedCount = 0;
        List<TransactionResponse> savedTransactions = new ArrayList<>();

        long maxInternalDateMs = 0L;

        for (EmailMessageDto msg : messages) {
            if (msg.getInternalDateMs() != null && msg.getInternalDateMs() > maxInternalDateMs) {
                maxInternalDateMs = msg.getInternalDateMs();
            }

            if (msg.getMessageId() != null && !processedEmailRepository.existsById(msg.getMessageId())) {
                processedEmailRepository.save(ProcessedEmailMessage.builder()
                        .messageId(msg.getMessageId())
                        .internalDateMs(msg.getInternalDateMs())
                        .subject(msg.getSubject())
                        .build());
            }

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
                    req.setCardLast4(parsed.getCardLast4());
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

        if (maxInternalDateMs > 0) {
            googleOAuthService.updateLastSyncedInternalDate(maxInternalDateMs);
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
        } finally {
            if (contextSetBySync) {
                UserContext.clear();
            }
        }
    }
}
