package com.store.api.service.email.scheduler;

import com.store.api.model.dto.email.EmailSyncResponse;
import com.store.api.service.email.EmailIngestionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
@ConditionalOnProperty(name = "mail.sync.enabled", havingValue = "true")
public class EmailSyncScheduler {

    private final EmailIngestionService emailIngestionService;

    @Scheduled(fixedDelayString = "${mail.sync.fixed-delay-ms:60000}", initialDelay = 15000)
    public void scheduleEmailSync() {
        if (!emailIngestionService.hasActiveConnection()) {
            log.debug("Background email synchronization skipped: Google account not yet connected.");
            return;
        }

        log.info("Starting scheduled background email synchronization via Gmail API...");
        try {
            EmailSyncResponse response = emailIngestionService.syncEmails();
            if (response.getSavedCount() > 0) {
                log.info("Scheduled email sync completed successfully: scanned={}, saved={}",
                        response.getScannedCount(), response.getSavedCount());
            } else {
                log.debug("Scheduled email sync: no new transactions found (scanned={})",
                        response.getScannedCount());
            }
        } catch (Exception e) {
            log.error("Scheduled email sync failed", e);
        }
    }
}
