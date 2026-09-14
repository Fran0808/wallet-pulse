package com.store.api.service.email;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import com.store.api.model.dto.email.ParsedEmailTransaction;
import com.store.api.model.enums.FlowType;
import com.store.api.service.email.parser.YapeEmailParser;

class YapeEmailParserTest {

    private YapeEmailParser parser;

    @BeforeEach
    void setUp() {
        parser = new YapeEmailParser();
    }

    @Test
    void shouldParseAuthenticBetanoPaymentEmail() {
        String subject = "¡Tu pago en BUSSINESS fue exitoso!";
        String body = """
                Hola FRANCISCO,
                ¡Tu pago en BUSSINESS fue exitoso!
                Monto total S/ 30.00
                Fecha y hora: 13 septiembre 2026 - 09:11 a. m.
                Titular de la cuenta: FRANCISCO JAVIER ORTEGA QUISPE
                Número de celular: *** *** 501
                Destino: BUSSINESS
                ID de operación: 01M2DHQTT772XGGYWDHX2AP8B0
                """;

        ParsedEmailTransaction tx = parser.parse(subject, body, LocalDateTime.of(2026, 9, 13, 9, 11));

        assertNotNull(tx);
        assertEquals(new BigDecimal("30.00"), tx.getAmount());
        assertEquals("PEN", tx.getCurrency());
        assertEquals(FlowType.EXPENSE, tx.getFlowType());
        assertEquals("BUSSINESS", tx.getMerchantName());
        assertEquals("YAPE", tx.getChannel());
        assertEquals("01M2DHQTT772XGGYWDHX2AP8B0", tx.getOperationNumber());
        assertNotNull(tx.getTransactionHash());
    }

    @Test
    void shouldIgnoreAdministrativeSettingsEmail() {
        String subject = "Cambios en monto de yapeo alto";
        String body = """
                Hola Francisco Javier
                Queremos contarte que actualizaste el monto de tus notificaciones a tu correo.
                Monto mínimo anterior: S/ 100.00
                Monto mínimo nuevo: S/ 10.00
                Fecha y hora: 13/09/2026 09:07:07 am
                """;

        ParsedEmailTransaction tx = parser.parse(subject, body, LocalDateTime.now());

        assertNull(tx, "Settings and limit change emails must be ignored and not treated as transactions");
    }

    @Test
    void shouldParseIncomingYapeSuccessfully() {
        String subject = "¡Te yapearon!";
        String body = """
                ¡Hola Francisco!
                Te yapeó Maria Lopez S/ 45.00
                ID de operación: 998877AABB
                """;

        ParsedEmailTransaction tx = parser.parse(subject, body, LocalDateTime.now());

        assertNotNull(tx);
        assertEquals(new BigDecimal("45.00"), tx.getAmount());
        assertEquals(FlowType.INCOME, tx.getFlowType());
        assertEquals("Maria Lopez", tx.getMerchantName());
        assertEquals("YAPE", tx.getChannel());
        assertEquals("998877AABB", tx.getOperationNumber());
    }
}
