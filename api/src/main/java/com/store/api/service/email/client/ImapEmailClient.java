package com.store.api.service.email.client;

import com.store.api.model.dto.email.EmailConnectionTestResponse;
import com.store.api.model.dto.email.EmailMessageDto;
import com.store.api.model.dto.email.EmailSampleDto;
import jakarta.mail.*;
import jakarta.mail.internet.MimeMultipart;
import jakarta.mail.search.FromStringTerm;
import jakarta.mail.search.OrTerm;
import jakarta.mail.search.SearchTerm;
import jakarta.mail.search.SubjectTerm;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.*;

/**
 * Low-level infrastructure client for IMAP email connections and message retrieval.
 */
@Component
@Slf4j
public class ImapEmailClient {

    @Value("${mail.imap.host:imap.gmail.com}")
    private String imapHost;

    @Value("${mail.imap.port:993}")
    private int imapPort;

    @Value("${mail.username:}")
    private String username;

    @Value("${mail.password:}")
    private String password;

    public EmailConnectionTestResponse testConnection() {
        String cleanUser = getCleanUsername();
        String cleanPass = getCleanPassword();

        if (cleanUser.isBlank() || cleanPass.isBlank()) {
            return EmailConnectionTestResponse.builder()
                    .status("ERROR")
                    .message("GMAIL_USER or GMAIL_APP_PASSWORD is not configured in .env")
                    .build();
        }

        Store store = null;
        Folder inbox = null;
        try {
            store = connect(cleanUser, cleanPass);
            inbox = store.getFolder("INBOX");
            inbox.open(Folder.READ_ONLY);

            int totalMessages = inbox.getMessageCount();
            int unreadMessages = inbox.getUnreadMessageCount();

            SearchTerm searchTerm = buildFinancialSearchTerm();
            Message[] matchedMessages = inbox.search(searchTerm);

            List<EmailSampleDto> recentSamples = new ArrayList<>();
            int start = Math.max(0, matchedMessages.length - 5);
            for (int i = matchedMessages.length - 1; i >= start; i--) {
                Message msg = matchedMessages[i];
                recentSamples.add(EmailSampleDto.builder()
                        .subject(msg.getSubject())
                        .from(Arrays.toString(msg.getFrom()))
                        .date(msg.getSentDate() != null ? msg.getSentDate().toString() : "N/A")
                        .build());
            }

            return EmailConnectionTestResponse.builder()
                    .status("SUCCESS")
                    .connectedUser(cleanUser)
                    .totalInboxMessages(totalMessages)
                    .unreadMessages(unreadMessages)
                    .matchedBcpEmailsCount(matchedMessages.length)
                    .recentSampleEmails(recentSamples)
                    .build();

        } catch (Exception e) {
            log.error("Failed to test IMAP connection", e);
            return EmailConnectionTestResponse.builder()
                    .status("ERROR")
                    .message(e.getMessage())
                    .build();
        } finally {
            closeQuietly(inbox, store);
        }
    }

    public List<EmailMessageDto> fetchFinancialEmails(int limit) {
        String cleanUser = getCleanUsername();
        String cleanPass = getCleanPassword();

        if (cleanUser.isBlank() || cleanPass.isBlank()) {
            log.warn("Cannot fetch emails: credentials are blank");
            return Collections.emptyList();
        }

        Store store = null;
        Folder inbox = null;
        List<EmailMessageDto> result = new ArrayList<>();

        try {
            store = connect(cleanUser, cleanPass);
            inbox = store.getFolder("INBOX");
            inbox.open(Folder.READ_ONLY);

            SearchTerm searchTerm = buildFinancialSearchTerm();
            Message[] messages = inbox.search(searchTerm);

            int batchLimit = Math.min(messages.length, limit);
            for (int i = messages.length - 1; i >= messages.length - batchLimit && i >= 0; i--) {
                Message msg = messages[i];
                try {
                    String subject = msg.getSubject();
                    String from = msg.getFrom() != null && msg.getFrom().length > 0 ? msg.getFrom()[0].toString() : "";
                    String body = getTextFromMessage(msg);
                    LocalDateTime sentDate = msg.getSentDate() != null ?
                            LocalDateTime.ofInstant(msg.getSentDate().toInstant(), ZoneId.systemDefault()) :
                            LocalDateTime.now();

                    String[] headers = msg.getHeader("Message-ID");
                    String messageId = (headers != null && headers.length > 0) ? headers[0] : UUID.randomUUID().toString();

                    result.add(EmailMessageDto.builder()
                            .messageId(messageId)
                            .subject(subject)
                            .from(from)
                            .sentDate(sentDate)
                            .body(body)
                            .build());
                } catch (Exception ex) {
                    log.warn("Could not read email at index {}: {}", i, ex.getMessage());
                }
            }
        } catch (Exception e) {
            log.error("Failed to fetch messages from IMAP", e);
        } finally {
            closeQuietly(inbox, store);
        }

        return result;
    }

    private Store connect(String user, String pass) throws MessagingException {
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

    private SearchTerm buildFinancialSearchTerm() {
        return new OrTerm(
                new FromStringTerm("bcp"),
                new OrTerm(
                        new SubjectTerm("operacion"),
                        new OrTerm(
                                new SubjectTerm("consumo"),
                                new OrTerm(new SubjectTerm("yape"), new SubjectTerm("constancia"))
                        )
                )
        );
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

    private String getCleanUsername() {
        return username != null ? username.trim() : "";
    }

    private String getCleanPassword() {
        return password != null ? password.replaceAll("\\s+", "").trim() : "";
    }
}
