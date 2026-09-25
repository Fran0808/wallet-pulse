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
    fun parse_realWorldYapeNotificationWithMaskedName_extractsCorrectData() {
        val title = "Confirmación de Pago"
        val text = "Martha Qui* te envió un pago por S/ 1. El cód. de seguridad es: 468"

        val result = YapeRegexParser.parse(title, text)

        assertNotNull(result)
        assertEquals(BigDecimal("1"), result?.amount)
        assertEquals(FlowType.INCOME, result?.flowType)
        assertEquals("Martha Qui*", result?.contactName)
        assertTrue(result?.transactionHash?.isNotBlank() == true)
    }

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
    fun parse_incomeWithThousandsSeparator_extractsCorrectData() {
        val title = "Confirmación de Pago"
        val text = "Carlos Mendoza te envió un pago por S/ 1,250.50. El cód. de seguridad es: 999"

        val result = YapeRegexParser.parse(title, text)

        assertNotNull(result)
        assertEquals(BigDecimal("1250.50"), result?.amount)
        assertEquals(FlowType.INCOME, result?.flowType)
        assertEquals("Carlos Mendoza", result?.contactName)
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

    @Test
    fun parse_anonymousIncomeNotification_extractsCorrectData() {
        val title = "¡Te yapearon!"
        val text = "Te enviaron S/ 37.50 a tu Yape"

        val result = YapeRegexParser.parse(title, text)

        assertNotNull(result)
        assertEquals(BigDecimal("37.50"), result?.amount)
        assertEquals(FlowType.INCOME, result?.flowType)
        assertEquals("Yape", result?.contactName)
        assertTrue(result?.transactionHash?.isNotBlank() == true)
    }

    @Test
    fun parse_generalIncomePaymentNotification_extractsCorrectData() {
        val title = "Confirmación de Pago"
        val text = "Te enviaron un pago de S/ 15.00 a tu Yape"

        val result = YapeRegexParser.parse(title, text)

        assertNotNull(result)
        assertEquals(BigDecimal("15.00"), result?.amount)
        assertEquals(FlowType.INCOME, result?.flowType)
        assertEquals("Yape", result?.contactName)
    }

    @Test
    fun parse_recibisteYapeNotification_extractsCorrectData() {
        val title = "¡Te yapearon!"
        val text = "Recibiste un yape de S/ 50.00"

        val result = YapeRegexParser.parse(title, text)

        assertNotNull(result)
        assertEquals(BigDecimal("50.00"), result?.amount)
        assertEquals(FlowType.INCOME, result?.flowType)
        assertEquals("Yape", result?.contactName)
    }

    @Test
    fun parse_bigTextNotification_prioritizesBigTextContent() {
        val title = "¡Te yapearon!"
        val shortText = "Te enviaron S/ 100.00"
        val bigText = "Ana Torres te envió S/ 100.00 a tu Yape"

        val result = YapeRegexParser.parse(title, shortText, bigText)

        assertNotNull(result)
        assertEquals(BigDecimal("100.00"), result?.amount)
        assertEquals(FlowType.INCOME, result?.flowType)
        assertEquals("Ana Torres", result?.contactName)
    }

    @Test
    fun parse_fallbackMinimalNotification_extractsCorrectData() {
        val title = "¡Te yapearon!"
        val text = "S/ 80.00"

        val result = YapeRegexParser.parse(title, text)

        assertNotNull(result)
        assertEquals(BigDecimal("80.00"), result?.amount)
        assertEquals(FlowType.INCOME, result?.flowType)
        assertEquals("Yape", result?.contactName)
    }
}