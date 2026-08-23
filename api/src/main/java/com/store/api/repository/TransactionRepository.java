package com.store.api.repository;

import com.store.api.model.entity.Transaction;
import com.store.api.model.enums.FlowType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    boolean existsByTransactionHash(String transactionHash);

    Optional<Transaction> findByTransactionHash(String transactionHash);

    @Query("SELECT t FROM Transaction t WHERE " +
            "(:startDate IS NULL OR t.transactionDate >= :startDate) AND " +
            "(:endDate IS NULL OR t.transactionDate <= :endDate) AND " +
            "(:flowType IS NULL OR t.flowType = :flowType) AND " +
            "(:search IS NULL OR LOWER(t.contactName) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Transaction> findWithFilters(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            @Param("flowType") FlowType flowType,
            @Param("search") String search,
            Pageable pageable
    );

    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t WHERE t.flowType = :flowType")
    BigDecimal sumAmountByFlowType(@Param("flowType") FlowType flowType);
}