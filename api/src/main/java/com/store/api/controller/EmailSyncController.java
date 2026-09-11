package com.store.api.controller;

import com.store.api.service.email.EmailIngestionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/emails")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class EmailSyncController {

    private final EmailIngestionService emailIngestionService;

    @GetMapping("/test-connection")
    public ResponseEntity<Map<String, Object>> testConnection() {
        Map<String, Object> result = emailIngestionService.testConnection();
        return ResponseEntity.ok(result);
    }

    @PostMapping("/sync")
    public ResponseEntity<Map<String, Object>> syncEmails() {
        Map<String, Object> result = emailIngestionService.syncEmails();
        return ResponseEntity.ok(result);
    }
}
