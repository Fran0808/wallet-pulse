package com.store.api.service.email;

import com.store.api.model.dto.email.ParsedEmailTransaction;
import com.store.api.model.enums.FlowType;
import com.store.api.service.email.parser.YapeEmailParser;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;

class YapeEmailParserTest {

    private YapeEmailParser parser;

    @BeforeEach
    void setUp() {
        parser = new YapeEmailParser();
    }

    @Test
    void shouldParseMerchantPaymentEmail() {
        String subject = "¡Tu pago en COMERCIO EJEMPLO fue exitoso!";
        String body = """
                Hola JUAN,
                ¡Tu pago en COMERCIO EJEMPLO fue exitoso!
                Monto total S/ 25.00
                Fecha y hora: 10 septiembre 2026 - 10:00 a. m.
                Titular de la cuenta: JUAN PEREZ
                Número de celular: *** *** 000
                Destino: COMERCIO EJEMPLO
                ID de operación: 01ABCDEF998877665544332211
                """;

        ParsedEmailTransaction tx = parser.parse(subject, body, LocalDateTime.of(2026, 9, 10, 10, 0));

        assertNotNull(tx);
        assertEquals(new BigDecimal("25.00"), tx.getAmount());
        assertEquals("PEN", tx.getCurrency());
        assertEquals(FlowType.EXPENSE, tx.getFlowType());
        assertEquals("COMERCIO EJEMPLO", tx.getMerchantName());
        assertEquals("YAPE", tx.getChannel());
        assertEquals("01ABCDEF998877665544332211", tx.getOperationNumber());
        assertNotNull(tx.getTransactionHash());
    }

    @Test
    void shouldIgnoreAdministrativeSettingsEmail() {
        String subject = "Cambios en monto de yapeo alto";
        String body = """
                Hola Usuario
                Queremos contarte que actualizaste el monto de tus notificaciones a tu correo.
                Monto mínimo anterior: S/ 100.00
                Monto mínimo nuevo: S/ 10.00
                Fecha y hora: 10/09/2026 09:00:00 am
                """;

        ParsedEmailTransaction tx = parser.parse(subject, body, LocalDateTime.now());

        assertNull(tx, "Settings and limit change emails must be ignored and not treated as transactions");
    }

    @Test
    void shouldParseIncomingYapeSuccessfully() {
        String subject = "¡Te yapearon!";
        String body = """
                ¡Hola Juan!
                Te yapeó Maria Perez S/ 45.00
                ID de operación: 998877AABB
                """;

        ParsedEmailTransaction tx = parser.parse(subject, body, LocalDateTime.now());

        assertNotNull(tx);
        assertEquals(new BigDecimal("45.00"), tx.getAmount());
        assertEquals(FlowType.INCOME, tx.getFlowType());
        assertEquals("Maria Perez", tx.getMerchantName());
        assertEquals("YAPE", tx.getChannel());
        assertEquals("998877AABB", tx.getOperationNumber());
    }
}
