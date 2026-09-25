package com.financemanager.listener.service

import android.service.notification.NotificationListenerService
import android.service.notification.StatusBarNotification
import android.util.Log
import com.financemanager.listener.data.AppDatabase
import com.financemanager.listener.data.LocalTransactionEntity
import com.financemanager.listener.parser.YapeRegexParser
import com.financemanager.listener.worker.TransactionSyncWorker
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.launch

class YapeNotificationListenerService : NotificationListenerService() {

    private val serviceScope = CoroutineScope(SupervisorJob() + Dispatchers.IO)

    override fun onListenerConnected() {
        super.onListenerConnected()
        Log.i("YapeListener", "Notification Listener Service Connected. Triggering pending sync.")
        TransactionSyncWorker.enqueue(applicationContext)
    }

    override fun onNotificationPosted(sbn: StatusBarNotification?) {
        super.onNotificationPosted(sbn)
        if (sbn == null) return

        val packageName = sbn.packageName

        if (!YapeRegexParser.isYapeNotification(packageName)) {
            return
        }

        val extras = sbn.notification.extras
        val title = extras.getCharSequence("android.title")?.toString()
        val text = extras.getCharSequence("android.text")?.toString()
        val bigText = extras.getCharSequence("android.bigText")?.toString()

        Log.d("YapeListener", "Intercepted Yape notification: Title=[$title], Text=[$text], BigText=[$bigText]")

        val parsed = YapeRegexParser.parse(title, text, bigText) ?: return

        Log.i("YapeListener", "Parsed successfully: Amount=${parsed.amount}, Flow=${parsed.flowType}, Contact=${parsed.contactName}")

        serviceScope.launch {
            val database = AppDatabase.getDatabase(applicationContext)
            val entity = LocalTransactionEntity(
                amount = parsed.amount.toPlainString(),
                flowType = parsed.flowType.name,
                contactName = parsed.contactName,
                channel = parsed.channel,
                transactionDate = parsed.transactionDate.toString(),
                transactionHash = parsed.transactionHash,
                rawText = parsed.rawText,
                isSynced = false
            )

            val insertedId = database.transactionDao().insert(entity)
            if (insertedId != -1L) {

                TransactionSyncWorker.enqueue(applicationContext)
            }
        }
    }
}