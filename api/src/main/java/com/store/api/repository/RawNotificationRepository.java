package com.store.api.repository;

import com.store.api.model.entity.RawNotificationLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RawNotificationRepository extends JpaRepository<RawNotificationLog, Long> {
}