package com.financemanager.listener.parser

import java.math.BigDecimal
import java.security.MessageDigest
import java.time.LocalDateTime
import java.time.format.DateTimeFormatter

object YapeRegexParser {

    private const val YAPE_PACKAGE_NAME = "com.bcp.innovacxion.yapeapp"

    private val INCOME_REGEX = Regex(
        """(?:te yape(?:ó|aron)!?\s*)?([A-Za-zÀ-ÿ\s.]+?)\s+te\s+(?:envi[oó]|yape[oó])\s+S/\s*([0-9]+(?:\.[0-9]{1,2})?)""",
        RegexOption.IGNORE_CASE
    )

    private val EXPENSE_REGEX = Regex(
        """(?:¡?yapeaste!?\s*(?:enviaste\s*)?)?S/\s*([0-9]+(?:\.[0-9]{1,2})?)\s+a\s+([A-Za-zÀ-ÿ\s.0-9]+)""",
        RegexOption.IGNORE_CASE
    )

    fun isYapeNotification(packageName: String?): Boolean {
        return packageName == YAPE_PACKAGE_NAME
    }

    fun parse(title: String?, text: String?): ParsedTransaction? {
        val fullContent = "${title.orEmpty()} ${text.orEmpty()}".trim()
        if (fullContent.isBlank()) return null

        INCOME_REGEX.find(fullContent)?.let { match ->
            val contact = match.groupValues[1].trim()
            val amountStr = match.groupValues[2].trim()
            val amount = BigDecimal(amountStr)
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
            val amount = BigDecimal(amountStr)
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

    private fun generateHash(flowType: FlowType, amount: BigDecimal, contact: String, rawText: String): String {
        val minuteApprox = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmm"))
        val input = "${flowType.name}_${amount.toPlainString()}_${contact.lowercase().trim()}_${minuteApprox}_$rawText"
        val bytes = MessageDigest.getInstance("SHA-256").digest(input.toByteArray())
        return bytes.joinToString("") { "%02x".format(it) }
    }
}