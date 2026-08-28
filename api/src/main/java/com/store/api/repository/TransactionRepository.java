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
}