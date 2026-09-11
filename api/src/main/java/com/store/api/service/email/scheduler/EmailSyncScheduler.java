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

    @Scheduled(cron = "${mail.sync.cron:0 */5 * * * *}")
    public void scheduleEmailSync() {
        log.info("Starting scheduled background email synchronization...");
        try {
            EmailSyncResponse response = emailIngestionService.syncEmails();
            log.info("Scheduled email sync completed: scanned={}, saved={}", response.getScannedCount(), response.getSavedCount());
        } catch (Exception e) {
            log.error("Scheduled email sync failed", e);
        }
    }
}
