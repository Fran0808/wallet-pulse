package com.store.api.repository;

import com.store.api.model.entity.GoogleOAuthToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface GoogleOAuthTokenRepository extends JpaRepository<GoogleOAuthToken, Long> {
    Optional<GoogleOAuthToken> findFirstByOrderByUpdatedAtDesc();
    Optional<GoogleOAuthToken> findByEmail(String email);
}
