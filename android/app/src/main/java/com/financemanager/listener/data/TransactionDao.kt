package com.financemanager.listener.data

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import kotlinx.coroutines.flow.Flow

@Dao
interface TransactionDao {

    @Insert(onConflict = OnConflictStrategy.IGNORE)
    fun insert(transaction: LocalTransactionEntity): Long

    @Query("SELECT * FROM local_transactions WHERE isSynced = 0 ORDER BY createdAt ASC")
    fun getUnsyncedTransactions(): List<LocalTransactionEntity>

    @Query("UPDATE local_transactions SET isSynced = 1 WHERE transactionHash = :hash")
    fun markAsSynced(hash: String)

    @Query("SELECT * FROM local_transactions ORDER BY createdAt DESC LIMIT 50")
    fun getRecentTransactions(): List<LocalTransactionEntity>

    @Query("SELECT * FROM local_transactions ORDER BY createdAt DESC LIMIT 50")
    fun getRecentTransactionsFlow(): Flow<List<LocalTransactionEntity>>
}