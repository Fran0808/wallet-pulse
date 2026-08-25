package com.financemanager.listener.worker

import android.content.Context
import android.util.Log
import androidx.work.*
import com.financemanager.listener.data.AppDatabase
import com.financemanager.listener.network.ApiClient
import com.financemanager.listener.network.TransactionSyncDto
import java.math.BigDecimal
import java.util.concurrent.TimeUnit

class TransactionSyncWorker(
    appContext: Context,
    workerParams: WorkerParameters
) : CoroutineWorker(appContext, workerParams) {

    override suspend fun doWork(): Result {
        val database = AppDatabase.getDatabase(applicationContext)
        val dao = database.transactionDao()
        val unsyncedList = dao.getUnsyncedTransactions()

        if (unsyncedList.isEmpty()) {
            return Result.success()
        }

        val dtoList = unsyncedList.map { entity ->
            TransactionSyncDto(
                amount = BigDecimal(entity.amount),
                flowType = entity.flowType,
                contactName = entity.contactName,
                channel = entity.channel,
                transactionDate = entity.transactionDate,
                transactionHash = entity.transactionHash,
                rawNotificationText = entity.rawText
            )
        }

        return try {
            val response = ApiClient.service.syncBatch(dtoList)
            if (response.isSuccessful) {
                unsyncedList.forEach { dao.markAsSynced(it.transactionHash) }
                Log.i("SyncWorker", "Successfully synced ${unsyncedList.size} transactions to backend")
                Result.success()
            } else {
                Log.w("SyncWorker", "Server returned error: ${response.code()}")
                Result.retry()
            }
        } catch (e: Exception) {
            Log.e("SyncWorker", "Network sync failed, will retry later: ${e.message}")
            Result.retry()
        }
    }

    companion object {
        fun enqueue(context: Context) {
            val constraints = Constraints.Builder()
                .setRequiredNetworkType(NetworkType.CONNECTED)
                .build()

            val syncRequest = OneTimeWorkRequestBuilder<TransactionSyncWorker>()
                .setConstraints(constraints)
                .setBackoffCriteria(BackoffPolicy.EXPONENTIAL, 10, TimeUnit.SECONDS)
                .build()

            WorkManager.getInstance(context).enqueueUniqueWork(
                "TransactionSyncWork",
                ExistingWorkPolicy.REPLACE,
                syncRequest
            )
        }
    }
}