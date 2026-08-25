package com.financemanager.listener

import com.financemanager.listener.parser.FlowType
import com.financemanager.listener.parser.YapeRegexParser
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertTrue
import org.junit.Test
import java.math.BigDecimal

class YapeRegexParserTest {

    @Test
    fun parse_validIncomeNotification_extractsCorrectData() {
        val title = "¡Te yapearon!"
        val text = "Juan Perez te envió S/ 25.50 a tu Yape"

        val result = YapeRegexParser.parse(title, text)

        assertNotNull(result)
        assertEquals(BigDecimal("25.50"), result?.amount)
        assertEquals(FlowType.INCOME, result?.flowType)
        assertEquals("Juan Perez", result?.contactName)
        assertTrue(result?.transactionHash?.isNotBlank() == true)
    }

    @Test
    fun parse_validExpenseNotification_extractsCorrectData() {
        val title = "Yapeaste"
        val text = "Yapeaste S/ 14.00 a Maria Gomez"

        val result = YapeRegexParser.parse(title, text)

        assertNotNull(result)
        assertEquals(BigDecimal("14.00"), result?.amount)
        assertEquals(FlowType.EXPENSE, result?.flowType)
        assertEquals("Maria Gomez", result?.contactName)
        assertTrue(result?.transactionHash?.isNotBlank() == true)
    }
}