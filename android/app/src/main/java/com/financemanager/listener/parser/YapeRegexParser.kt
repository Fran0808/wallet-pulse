package com.financemanager.listener.parser

import java.math.BigDecimal
import java.security.MessageDigest
import java.time.LocalDateTime
import java.time.format.DateTimeFormatter

object YapeRegexParser {

    private const val YAPE_PACKAGE_NAME = "com.bcp.innovacxion.yapeapp"

    private val INCOME_WITH_SENDER_REGEX = Regex(
        """(?:confirmaci[oó]n de pago!?\s*)?(?:¡?te yape(?:ó|aron|aste)?!?)?\s*([A-Za-zÀ-ÿ0-9\s.*'-]+?)\s+te\s+(?:envi[oó]|yape[oó])(?:\s+un\s+pago)?(?:\s+(?:por|de))?\s+S/\.?\s*([0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]{1,2})?|[0-9]+(?:\.[0-9]{1,2})?)""",
        RegexOption.IGNORE_CASE
    )

    private val INCOME_GENERAL_REGEX = Regex(
        """(?:¡?te yape(?:ó|aron|aste)?!?\s*)?(?:te\s+(?:enviaron|yapearon)|recibiste\s+un\s+yape(?:\s+de)?)(?:\s+un\s+pago)?(?:\s+(?:por|de))?\s+S/\.?\s*([0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]{1,2})?|[0-9]+(?:\.[0-9]{1,2})?)""",
        RegexOption.IGNORE_CASE
    )

    private val INCOME_FALLBACK_REGEX = Regex(
        """(?:¡?te yape(?:ó|aron)?!?)\s*(?:a tu yape)?(?:\s+(?:por|de))?\s*S/\.?\s*([0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]{1,2})?|[0-9]+(?:\.[0-9]{1,2})?)""",
        RegexOption.IGNORE_CASE
    )

    private val EXPENSE_REGEX = Regex(
        """(?:¡?yapeaste!?\s*)?(?:enviaste|pagaste)?\s*S/\.?\s*([0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]{1,2})?|[0-9]+(?:\.[0-9]{1,2})?)\s+a\s+([A-Za-zÀ-ÿ0-9\s.*'-]+)""",
        RegexOption.IGNORE_CASE
    )

    fun isYapeNotification(packageName: String?): Boolean {
        return packageName == YAPE_PACKAGE_NAME || packageName == "com.android.shell"
    }

    fun parse(title: String?, text: String?, bigText: String? = null): ParsedTransaction? {
        val candidates = listOfNotNull(bigText, text)
            .filter { it.isNotBlank() }
            .distinct()

        for (body in candidates) {
            val content = "${title.orEmpty()} $body".trim()
            val parsed = parseContent(content)
            if (parsed != null) return parsed
        }

        if (candidates.isEmpty() && !title.isNullOrBlank()) {
            return parseContent(title.trim())
        }

        return null
    }

    private fun parseContent(fullContent: String): ParsedTransaction? {
        // 1. Try explicit sender income
        INCOME_WITH_SENDER_REGEX.find(fullContent)?.let { match ->
            val rawContact = match.groupValues[1].trim()
            val cleanContact = rawContact.replace(Regex("""^¡?te yape(?:aron|aste|ó)?!?\s*""", RegexOption.IGNORE_CASE), "").trim()
            val contact = if (cleanContact.isBlank() || cleanContact.equals("te", ignoreCase = true)) "Yape" else cleanContact
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

        INCOME_GENERAL_REGEX.find(fullContent)?.let { match ->
            val amountStr = match.groupValues[1].trim()
            val amount = sanitizeAmount(amountStr) ?: return@let
            val contact = "Yape"
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

        INCOME_FALLBACK_REGEX.find(fullContent)?.let { match ->
            val amountStr = match.groupValues[1].trim()
            val amount = sanitizeAmount(amountStr) ?: return@let
            val contact = "Yape"
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