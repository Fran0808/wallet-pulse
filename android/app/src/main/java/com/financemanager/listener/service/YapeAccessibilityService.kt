package com.financemanager.listener.service

import android.accessibilityservice.AccessibilityService
import android.util.Log
import android.view.accessibility.AccessibilityEvent
import android.view.accessibility.AccessibilityNodeInfo
import com.financemanager.listener.data.AppDatabase
import com.financemanager.listener.data.LocalTransactionEntity
import com.financemanager.listener.worker.TransactionSyncWorker
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.launch
import java.math.BigDecimal
import java.security.MessageDigest
import java.time.LocalDateTime
import java.time.format.DateTimeFormatter
import java.util.Collections

class YapeAccessibilityService : AccessibilityService() {

    private val serviceScope = CoroutineScope(SupervisorJob() + Dispatchers.IO)
    private val processedHashes = Collections.synchronizedSet(LinkedHashSet<String>())

    override fun onAccessibilityEvent(event: AccessibilityEvent?) {
        if (event == null) return

        val packageName = event.packageName?.toString()
        if (packageName != "com.bcp.innovacxion.yapeapp") {
            return
        }

        val rootNode = rootInActiveWindow ?: return
        try {
            val textList = mutableListOf<String>()
            extractAllText(rootNode, textList)

            if (isConfirmationScreen(textList)) {
                processConfirmationScreen(textList)
            }
        } finally {
            rootNode.recycle()
        }
    }

    override fun onInterrupt() {
        Log.w("YapeAccessibility", "Accessibility service interrupted")
    }

    private fun extractAllText(node: AccessibilityNodeInfo?, result: MutableList<String>) {
        if (node == null) return

        node.text?.toString()?.trim()?.let { text ->
            if (text.isNotBlank()) {
                result.add(text)
            }
        }

        node.contentDescription?.toString()?.trim()?.let { desc ->
            if (desc.isNotBlank() && !result.contains(desc)) {
                result.add(desc)
            }
        }

        for (i in 0 until node.childCount) {
            val child = node.getChild(i)
            extractAllText(child, result)
            child?.recycle()
        }
    }

    private fun isConfirmationScreen(texts: List<String>): Boolean {
        return texts.any { it.contains("yapeaste", ignoreCase = true) }
    }

    private fun processConfirmationScreen(texts: List<String>) {
        var amount: BigDecimal? = null
        var contact: String? = null
        var operationNumber: String? = null

        val amountRegex = Regex("""S/\.?\s*([0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]{1,2})?|[0-9]+(?:\.[0-9]{1,2})?)""")
        val opRegex = Regex("""(?:nro\.?|número)\s*(?:de)?\s*operaci[oó]n:?\s*([0-9]+)""", RegexOption.IGNORE_CASE)
        val contactRegex = Regex("""^a\s+([A-Za-zÀ-ÿ0-9\s.*'-]+)""", RegexOption.IGNORE_CASE)

        for (i in texts.indices) {
            val text = texts[i]

            // 1. Find Amount
            if (amount == null) {
                amountRegex.find(text)?.let { match ->
                    val clean = match.groupValues[1].replace(",", "").trim()
                    try {
                        amount = BigDecimal(clean)
                    } catch (_: Exception) {}
                }
            }

            // 2. Find Contact
            if (contact == null) {
                contactRegex.find(text)?.let { match ->
                    contact = match.groupValues[1].trim()
                }
            }

            // 3. Find Operation Number (useful for deduplication)
            if (operationNumber == null) {
                opRegex.find(text)?.let { match ->
                    operationNumber = match.groupValues[1].trim()
                }
            }
        }

        // Fallback: If contact is not matched with prefix "a ", take text following the amount
        if (contact == null && amount != null) {
            val amountIndex = texts.indexOfFirst { it.contains("S/") }
            if (amountIndex != -1 && amountIndex + 1 < texts.size) {
                val candidate = texts[amountIndex + 1].trim()
                if (!candidate.contains("operaci", ignoreCase = true) && !candidate.contains("destino", ignoreCase = true)) {
                    contact = candidate.removePrefix("a ").removePrefix("A ").trim()
                }
            }
        }

        if (amount != null && !contact.isNullOrBlank()) {
            val fullText = texts.joinToString(" | ")
            val hash = generateHash(amount!!, contact!!, operationNumber, fullText)

            if (processedHashes.contains(hash)) {
                return // Already captured this screen
            }
            processedHashes.add(hash)
            if (processedHashes.size > 100) {
                processedHashes.remove(processedHashes.first())
            }

            Log.i("YapeAccessibility", "Captured outgoing Yape: Amount=$amount, Contact=$contact, Op=$operationNumber")

            serviceScope.launch {
                val database = AppDatabase.getDatabase(applicationContext)
                val entity = LocalTransactionEntity(
                    amount = amount!!.toPlainString(),
                    flowType = "EXPENSE",
                    contactName = contact!!,
                    channel = "YAPE",
                    transactionDate = LocalDateTime.now().toString(),
                    transactionHash = hash,
                    rawText = fullText,
                    isSynced = false
                )

                val insertedId = database.transactionDao().insert(entity)
                if (insertedId != -1L) {
                    TransactionSyncWorker.enqueue(applicationContext)
                }
            }
        }
    }

    private fun generateHash(amount: BigDecimal, contact: String, opNumber: String?, rawText: String): String {
        val minuteApprox = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmm"))
        val opPart = opNumber ?: minuteApprox
        val input = "EXPENSE_${amount.toPlainString()}_${contact.lowercase().trim()}_$opPart"
        val bytes = MessageDigest.getInstance("SHA-256").digest(input.toByteArray())
        return bytes.joinToString("") { "%02x".format(it) }
    }
}
