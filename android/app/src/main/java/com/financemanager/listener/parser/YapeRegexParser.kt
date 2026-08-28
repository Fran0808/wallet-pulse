package com.financemanager.listener.parser

import java.math.BigDecimal
import java.security.MessageDigest
import java.time.LocalDateTime
import java.time.format.DateTimeFormatter

object YapeRegexParser {

    private const val YAPE_PACKAGE_NAME = "com.bcp.innovacxion.yapeapp"

    private val INCOME_REGEX = Regex(
        """(?:confirmaci[oó]n de pago!?\s*)?(?:¡?te yape(?:ó|aron|aste)?!?)?\s*([A-Za-zÀ-ÿ0-9\s.*'-]+?)\s+te\s+(?:envi[oó]|yape[oó])(?:\s+un\s+pago)?(?:\s+(?:por|de))?\s+S/\.?\s*([0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]{1,2})?|[0-9]+(?:\.[0-9]{1,2})?)""",
        RegexOption.IGNORE_CASE
    )

    private val EXPENSE_REGEX = Regex(
        """(?:¡?yapeaste!?\s*)?(?:enviaste|pagaste)?\s*S/\.?\s*([0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]{1,2})?|[0-9]+(?:\.[0-9]{1,2})?)\s+a\s+([A-Za-zÀ-ÿ0-9\s.*'-]+)""",
        RegexOption.IGNORE_CASE
    )

    fun isYapeNotification(packageName: String?): Boolean {
        return packageName == YAPE_PACKAGE_NAME || packageName == "com.android.shell"
    }

    fun parse(title: String?, text: String?): ParsedTransaction? {
        val fullContent = "${title.orEmpty()} ${text.orEmpty()}".trim()
        if (fullContent.isBlank()) return null

        INCOME_REGEX.find(fullContent)?.let { match ->
            val contact = match.groupValues[1].trim()
            val amountStr = match.groupValues[2].trim()
            val amount = sanitizeAmount(amountStr) ?: return@let
            val now = LocalDateTime.now()
            val hash = generateHash(FlowType.INCOME, amount, contact, fullContent)

            return ParsedTransaction(
                amount = amount,
                flowType = FlowType.INCOME,
                contactName = contact,
                transactionDate = now,
                transactionHash = hash,
                rawText = fullContent
            )
        }

        EXPENSE_REGEX.find(fullContent)?.let { match ->
            val amountStr = match.groupValues[1].trim()
            val contact = match.groupValues[2].trim()
            val amount = sanitizeAmount(amountStr) ?: return@let
            val now = LocalDateTime.now()
            val hash = generateHash(FlowType.EXPENSE, amount, contact, fullContent)

            return ParsedTransaction(
                amount = amount,
                flowType = FlowType.EXPENSE,
                contactName = contact,
                transactionDate = now,
                transactionHash = hash,
                rawText = fullContent
            )
        }

        return null
    }

    private fun sanitizeAmount(raw: String): BigDecimal? {
        return try {
            val clean = raw.replace(",", "").replace(" ", "")
            BigDecimal(clean)
        } catch (e: Exception) {
            null
        }
    }

    private fun generateHash(flowType: FlowType, amount: BigDecimal, contact: String, rawText: String): String {
        val minuteApprox = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmm"))
        val input = "${flowType.name}_${amount.toPlainString()}_${contact.lowercase().trim()}_${minuteApprox}_$rawText"
        val bytes = MessageDigest.getInstance("SHA-256").digest(input.toByteArray())
        return bytes.joinToString("") { "%02x".format(it) }
    }
}