package com.store.api.repository;

import com.store.api.model.entity.Transaction;
import com.store.api.model.enums.FlowType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.Optional;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long>, JpaSpecificationExecutor<Transaction> {

    boolean existsByTransactionHash(String transactionHash);

    Optional<Transaction> findByTransactionHash(String transactionHash);

    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t WHERE t.flowType = :flowType")
    BigDecimal sumAmountByFlowType(@Param("flowType") FlowType flowType);

    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t WHERE t.flowType = :flowType AND t.transactionDate >= :start AND t.transactionDate <= :end")
    BigDecimal sumAmountByFlowTypeAndDateRange(
            @Param("flowType") FlowType flowType,
            @Param("start") java.time.LocalDateTime start,
            @Param("end") java.time.LocalDateTime end
    );

    @Query("SELECT t FROM Transaction t WHERE t.flowType = 'EXPENSE' ORDER BY t.transactionDate DESC LIMIT 1")
    Optional<Transaction> findLatestExpense();

    @Query("SELECT t.channel, t.cardLast4, COALESCE(SUM(t.amount), 0), COUNT(t) FROM Transaction t WHERE t.flowType = 'EXPENSE' AND t.transactionDate >= :start AND t.transactionDate <= :end GROUP BY t.channel, t.cardLast4 ORDER BY SUM(t.amount) DESC")
    java.util.List<Object[]> findExpenseBreakdownByChannel(
            @Param("start") java.time.LocalDateTime start,
            @Param("end") java.time.LocalDateTime end
    );

    @Query("SELECT t.contactName, COALESCE(SUM(t.amount), 0), COUNT(t) FROM Transaction t WHERE t.flowType = 'EXPENSE' AND t.transactionDate >= :start AND t.transactionDate <= :end GROUP BY t.contactName ORDER BY COUNT(t) DESC, SUM(t.amount) DESC LIMIT 5")
    java.util.List<Object[]> findTopMerchants(
            @Param("start") java.time.LocalDateTime start,
            @Param("end") java.time.LocalDateTime end
    );
}