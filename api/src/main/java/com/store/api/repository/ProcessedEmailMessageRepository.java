package com.store.api.repository;

import com.store.api.model.entity.ProcessedEmailMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.Set;

@Repository
public interface ProcessedEmailMessageRepository extends JpaRepository<ProcessedEmailMessage, String> {

    @Query("SELECT p.messageId FROM ProcessedEmailMessage p WHERE p.messageId IN :messageIds")
    Set<String> findExistingMessageIds(@Param("messageIds") Collection<String> messageIds);
}
