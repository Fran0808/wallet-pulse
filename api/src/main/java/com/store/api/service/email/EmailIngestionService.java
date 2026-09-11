package com.store.api.service.email;

import com.store.api.model.dto.TransactionResponse;
import com.store.api.model.dto.TransactionSyncRequest;
import com.store.api.service.TransactionService;
import jakarta.mail.*;
import jakarta.mail.internet.MimeMultipart;
import jakarta.mail.search.FromStringTerm;
import jakarta.mail.search.OrTerm;
import jakarta.mail.search.SearchTerm;
import jakarta.mail.search.SubjectTerm;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailIngestionService {

    private final BcpEmailParser bcpEmailParser;
    private final TransactionService transactionService;

    @Value("${mail.imap.host:imap.gmail.com}")
    private String imapHost;

    @Value("${mail.imap.port:993}")
    private int imapPort;

    @Value("${mail.username:}")
    private String username;

    @Value("${mail.password:}")
    private String password;

    @Value("${mail.sync.batch-size:20}")
    private int batchSize;

    public Map<String, Object> testConnection() {
        Map<String, Object> result = new HashMap<>();
        String cleanUser = username != null ? username.trim() : "";
        String cleanPass = password != null ? password.replaceAll("\\s+", "").trim() : "";

        if (cleanUser.isBlank() || cleanPass.isBlank()) {
            result.put("status", "ERROR");
            result.put("message", "GMAIL_USER or GMAIL_APP_PASSWORD is not configured in .env");
            return result;
        }

        Store store = null;
        Folder inbox = null;
        try {
            store = connectToStore(cleanUser, cleanPass);
            inbox = store.getFolder("INBOX");
            inbox.open(Folder.READ_ONLY);

            int totalMessages = inbox.getMessageCount();
            int unreadMessages = inbox.getUnreadMessageCount();

            SearchTerm searchTerm = new OrTerm(
                    new FromStringTerm("bcp"),
                    new OrTerm(
                            new SubjectTerm("operacion"),
                            new OrTerm(
                                    new SubjectTerm("consumo"),
                                    new OrTerm(new SubjectTerm("yape"), new SubjectTerm("constancia"))
                            )
                    )
            );
            Message[] matchedMessages = inbox.search(searchTerm);

            List<Map<String, String>> recentEmails = new ArrayList<>();
            int start = Math.max(0, matchedMessages.length - 5);
            for (int i = matchedMessages.length - 1; i >= start; i--) {
                Message msg = matchedMessages[i];
                Map<String, String> emailInfo = new HashMap<>();
                emailInfo.put("subject", msg.getSubject());
                emailInfo.put("from", Arrays.toString(msg.getFrom()));
                emailInfo.put("date", msg.getSentDate() != null ? msg.getSentDate().toString() : "N/A");
                recentEmails.add(emailInfo);
            }

            result.put("status", "SUCCESS");
            result.put("connectedUser", cleanUser);
            result.put("totalInboxMessages", totalMessages);
            result.put("unreadMessages", unreadMessages);
            result.put("matchedBcpEmailsCount", matchedMessages.length);
            result.put("recentSampleEmails", recentEmails);

        } catch (Exception e) {
            log.error("Failed to test IMAP connection", e);
            result.put("status", "ERROR");
            result.put("message", e.getMessage());
        } finally {
            closeQuietly(inbox, store);
        }

        return result;
    }

    public Map<String, Object> syncEmails() {
        Map<String, Object> result = new HashMap<>();
        String cleanUser = username != null ? username.trim() : "";
        String cleanPass = password != null ? password.replaceAll("\\s+", "").trim() : "";

        if (cleanUser.isBlank() || cleanPass.isBlank()) {
            result.put("status", "ERROR");
            result.put("message", "Credentials not configured in .env");
            return result;
        }

        Store store = null;
        Folder inbox = null;
        int scannedCount = 0;
        int savedCount = 0;
        List<TransactionResponse> savedTransactions = new ArrayList<>();

        try {
            store = connectToStore(cleanUser, cleanPass);
            inbox = store.getFolder("INBOX");
            inbox.open(Folder.READ_ONLY);

            SearchTerm searchTerm = new OrTerm(
                    new FromStringTerm("bcp"),
                    new OrTerm(
                            new SubjectTerm("operacion"),
                            new OrTerm(
                                    new SubjectTerm("consumo"),
                                    new OrTerm(new SubjectTerm("yape"), new SubjectTerm("constancia"))
                            )
                    )
            );
            Message[] messages = inbox.search(searchTerm);
            scannedCount = messages.length;

            int limit = Math.min(messages.length, batchSize);
            for (int i = messages.length - 1; i >= messages.length - limit && i >= 0; i--) {
                Message msg = messages[i];
                try {
                    String subject = msg.getSubject();
                    String body = getTextFromMessage(msg);
                    LocalDateTime sentDate = msg.getSentDate() != null ?
                            LocalDateTime.ofInstant(msg.getSentDate().toInstant(), ZoneId.systemDefault()) :
                            LocalDateTime.now();

                    ParsedEmailTransaction parsed = bcpEmailParser.parse(subject, body, sentDate);
                    if (parsed != null) {
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
                    log.warn("Could not process email index {}: {}", i, ex.getMessage());
                }
            }

            result.put("status", "SUCCESS");
            result.put("scannedCount", scannedCount);
            result.put("processedInBatch", limit);
            result.put("savedCount", savedCount);
            result.put("transactions", savedTransactions);

        } catch (Exception e) {
            log.error("Failed to sync emails", e);
            result.put("status", "ERROR");
            result.put("message", e.getMessage());
        } finally {
            closeQuietly(inbox, store);
        }

        return result;
    }

    private Store connectToStore(String user, String pass) throws MessagingException {
        Properties props = new Properties();
        props.put("mail.store.protocol", "imaps");
        props.put("mail.imaps.host", imapHost);
        props.put("mail.imaps.port", String.valueOf(imapPort));
        props.put("mail.imaps.ssl.enable", "true");
        props.put("mail.imaps.timeout", "10000");
        props.put("mail.imaps.connectiontimeout", "10000");

        Session session = Session.getInstance(props);
        Store store = session.getStore("imaps");
        store.connect(imapHost, user, pass);
        return store;
    }

    private String getTextFromMessage(Message message) throws MessagingException, IOException {
        if (message.isMimeType("text/plain")) {
            return message.getContent().toString();
        } else if (message.isMimeType("text/html")) {
            return message.getContent().toString();
        } else if (message.isMimeType("multipart/*")) {
            return getTextFromMimeMultipart((MimeMultipart) message.getContent());
        }
        return "";
    }

    private String getTextFromMimeMultipart(MimeMultipart mimeMultipart) throws MessagingException, IOException {
        StringBuilder result = new StringBuilder();
        for (int i = 0; i < mimeMultipart.getCount(); i++) {
            BodyPart bodyPart = mimeMultipart.getBodyPart(i);
            if (bodyPart.isMimeType("text/plain")) {
                result.append(bodyPart.getContent());
            } else if (bodyPart.isMimeType("text/html")) {
                result.append(bodyPart.getContent());
            } else if (bodyPart.getContent() instanceof MimeMultipart) {
                result.append(getTextFromMimeMultipart((MimeMultipart) bodyPart.getContent()));
            }
        }
        return result.toString();
    }

    private void closeQuietly(Folder folder, Store store) {
        if (folder != null && folder.isOpen()) {
            try { folder.close(false); } catch (Exception ignored) {}
        }
        if (store != null && store.isConnected()) {
            try { store.close(); } catch (Exception ignored) {}
        }
    }
}
