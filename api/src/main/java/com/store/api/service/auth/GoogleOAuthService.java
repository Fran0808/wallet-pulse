package com.store.api.service.auth;

import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;
import com.store.api.model.dto.auth.GoogleAuthStatusResponse;
import com.store.api.model.entity.GoogleOAuthToken;
import com.store.api.repository.GoogleOAuthTokenRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClient;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class GoogleOAuthService {

    private static final String GOOGLE_AUTH_ENDPOINT = "https://accounts.google.com/o/oauth2/v2/auth";
    private static final String GOOGLE_TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token";
    private static final String GOOGLE_USERINFO_ENDPOINT = "https://www.googleapis.com/oauth2/v2/userinfo";
    private static final String GMAIL_READONLY_SCOPE = "https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/userinfo.email";

    @Value("${google.oauth.client-id:}")
    private String clientId;

    @Value("${google.oauth.client-secret:}")
    private String clientSecret;

    @Value("${google.oauth.redirect-uri:http://localhost:8080/api/v1/auth/google/callback}")
    private String redirectUri;

    private final GoogleOAuthTokenRepository tokenRepository;
    private final ObjectMapper objectMapper;
    private final RestClient restClient = RestClient.create();

    public String buildAuthorizationUrl() {
        if (clientId == null || clientId.isBlank()) {
            throw new IllegalStateException("GOOGLE_CLIENT_ID is not configured in .env");
        }

        return GOOGLE_AUTH_ENDPOINT + "?"
                + "client_id=" + URLEncoder.encode(clientId, StandardCharsets.UTF_8)
                + "&redirect_uri=" + URLEncoder.encode(redirectUri, StandardCharsets.UTF_8)
                + "&response_type=code"
                + "&scope=" + URLEncoder.encode(GMAIL_READONLY_SCOPE, StandardCharsets.UTF_8)
                + "&access_type=offline"
                + "&prompt=consent";
    }

    @Transactional
    public GoogleOAuthToken exchangeCodeForTokens(String authorizationCode) {
        log.info("Exchanging authorization code with Google OAuth2 server...");

        MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
        body.add("code", authorizationCode);
        body.add("client_id", clientId);
        body.add("client_secret", clientSecret);
        body.add("redirect_uri", redirectUri);
        body.add("grant_type", "authorization_code");

        String rawResponse = restClient.post()
                .uri(GOOGLE_TOKEN_ENDPOINT)
                .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                .body(body)
                .retrieve()
                .body(String.class);

        try {
            JsonNode json = objectMapper.readTree(rawResponse);
            String accessToken = json.path("access_token").asText();
            String refreshToken = json.path("refresh_token").asText(null);
            long expiresIn = json.path("expires_in").asLong(3600);
            String scope = json.path("scope").asText("");

            String email = fetchUserEmail(accessToken);
            LocalDateTime expiresAt = LocalDateTime.now().plusSeconds(expiresIn);

            Optional<GoogleOAuthToken> existingOpt = tokenRepository.findByEmail(email);
            GoogleOAuthToken token;

            if (existingOpt.isPresent()) {
                token = existingOpt.get();
                token.setAccessToken(accessToken);
                if (refreshToken != null && !refreshToken.isBlank()) {
                    token.setRefreshToken(refreshToken);
                }
                token.setExpiresAt(expiresAt);
                token.setScope(scope);
            } else {
                token = GoogleOAuthToken.builder()
                        .email(email)
                        .accessToken(accessToken)
                        .refreshToken(refreshToken)
                        .expiresAt(expiresAt)
                        .scope(scope)
                        .build();
            }

            GoogleOAuthToken saved = tokenRepository.save(token);
            log.info("Successfully saved Google OAuth token for account: [{}]", email);
            return saved;
        } catch (Exception ex) {
            log.error("Failed to parse Google OAuth token response", ex);
            throw new RuntimeException("Error processing Google OAuth credentials: " + ex.getMessage(), ex);
        }
    }

    private String fetchUserEmail(String accessToken) {
        try {
            String userInfoRaw = restClient.get()
                    .uri(GOOGLE_USERINFO_ENDPOINT)
                    .header("Authorization", "Bearer " + accessToken)
                    .retrieve()
                    .body(String.class);

            JsonNode userInfo = objectMapper.readTree(userInfoRaw);
            return userInfo.path("email").asText("unknown@gmail.com");
        } catch (Exception ex) {
            log.warn("Could not fetch user email from Google UserInfo endpoint, defaulting to unknown: {}", ex.getMessage());
            return "unknown@gmail.com";
        }
    }

    @Transactional
    public Optional<String> getValidAccessToken() {
        Optional<GoogleOAuthToken> tokenOpt = tokenRepository.findFirstByOrderByUpdatedAtDesc();
        if (tokenOpt.isEmpty()) {
            return Optional.empty();
        }

        GoogleOAuthToken token = tokenOpt.get();
        if (!token.isExpired()) {
            return Optional.of(token.getAccessToken());
        }

        // Token expired, refresh it using refresh_token
        if (token.getRefreshToken() == null || token.getRefreshToken().isBlank()) {
            log.warn("Google access token expired and no refresh token available. User must re-authenticate.");
            return Optional.empty();
        }

        log.info("Google access token expired. Refreshing token for [{}]...", token.getEmail());
        try {
            MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
            body.add("client_id", clientId);
            body.add("client_secret", clientSecret);
            body.add("refresh_token", token.getRefreshToken());
            body.add("grant_type", "refresh_token");

            String rawResponse = restClient.post()
                    .uri(GOOGLE_TOKEN_ENDPOINT)
                    .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                    .body(body)
                    .retrieve()
                    .body(String.class);

            JsonNode json = objectMapper.readTree(rawResponse);
            String newAccessToken = json.path("access_token").asText();
            long expiresIn = json.path("expires_in").asLong(3600);

            token.setAccessToken(newAccessToken);
            token.setExpiresAt(LocalDateTime.now().plusSeconds(expiresIn));
            tokenRepository.save(token);

            log.info("Successfully refreshed access token for [{}]", token.getEmail());
            return Optional.of(newAccessToken);
        } catch (Exception ex) {
            log.error("Failed to refresh Google OAuth token for [{}]", token.getEmail(), ex);
            return Optional.empty();
        }
    }

    @Transactional(readOnly = true)
    public GoogleAuthStatusResponse getStatus() {
        Optional<GoogleOAuthToken> tokenOpt = tokenRepository.findFirstByOrderByUpdatedAtDesc();
        if (tokenOpt.isPresent()) {
            return GoogleAuthStatusResponse.builder()
                    .connected(true)
                    .email(tokenOpt.get().getEmail())
                    .build();
        }
        return GoogleAuthStatusResponse.builder()
                .connected(false)
                .email(null)
                .build();
    }

    @Transactional(readOnly = true)
    public Optional<Long> getLastSyncedInternalDate() {
        return tokenRepository.findFirstByOrderByUpdatedAtDesc()
                .map(GoogleOAuthToken::getLastSyncedInternalDate);
    }

    @Transactional
    public void updateLastSyncedInternalDate(Long internalDateMs) {
        if (internalDateMs == null || internalDateMs <= 0) {
            return;
        }
        Optional<GoogleOAuthToken> tokenOpt = tokenRepository.findFirstByOrderByUpdatedAtDesc();
        if (tokenOpt.isPresent()) {
            GoogleOAuthToken token = tokenOpt.get();
            Long current = token.getLastSyncedInternalDate();
            if (current == null || internalDateMs > current) {
                token.setLastSyncedInternalDate(internalDateMs);
                tokenRepository.save(token);
                log.info("Updated lastSyncedInternalDate to {} for user [{}]", internalDateMs, token.getEmail());
            }
        }
    }

    @Transactional
    public void disconnect() {
        tokenRepository.deleteAll();
        log.info("Cleared all Google OAuth tokens from database.");
    }
}
