package com.store.api.service.email;

import com.store.api.model.enums.FlowType;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;

class BcpEmailParserTest {

    private BcpEmailParser parser;

    @BeforeEach
    void setUp() {
        parser = new BcpEmailParser();
    }

    @Test
    void shouldParseCreditCardExpenseSuccessfully() {
        String subject = "Aviso de operación: Consumo con Tarjeta de Crédito";
        String htmlBody = """
                <html>
                <body>
                    <p>Estimado cliente,</p>
                    <p>Le informamos que se ha realizado un consumo con su tarjeta terminada en 4589.</p>
                    <table>
                        <tr><td>Importe:</td><td>S/ 25.50</td></tr>
                        <tr><td>Establecimiento:</td><td>TAMBO SAN ISIDRO</td></tr>
                        <tr><td>Nro. de operación:</td><td>98765432</td></tr>
                    </table>
                </body>
                </html>
                """;

        ParsedEmailTransaction tx = parser.parse(subject, htmlBody, LocalDateTime.now());

        assertNotNull(tx);
        assertEquals(new BigDecimal("25.50"), tx.getAmount());
        assertEquals("PEN", tx.getCurrency());
        assertEquals(FlowType.EXPENSE, tx.getFlowType());
        assertEquals("TAMBO SAN ISIDRO", tx.getMerchantName());
        assertEquals("TARJETA_CREDITO_BCP", tx.getChannel());
        assertEquals("4589", tx.getCardLast4());
        assertEquals("98765432", tx.getOperationNumber());
        assertNotNull(tx.getTransactionHash());
    }

    @Test
    void shouldParseDebitCardUsdExpenseSuccessfully() {
        String subject = "Aviso de operación: Consumo con Tarjeta de Débito";
        String htmlBody = """
                <div>
                    <h3>Detalle de operación</h3>
                    <p>Tarjeta débito **** 1122</p>
                    <p>Monto: US$ 14.99</p>
                    <p>Comercio: SPOTIFY</p>
                    <p>Número de operación: 12345678</p>
                </div>
                """;

        ParsedEmailTransaction tx = parser.parse(subject, htmlBody, LocalDateTime.now());

        assertNotNull(tx);
        assertEquals(new BigDecimal("14.99"), tx.getAmount());
        assertEquals("USD", tx.getCurrency());
        assertEquals(FlowType.EXPENSE, tx.getFlowType());
        assertEquals("SPOTIFY", tx.getMerchantName());
        assertEquals("TARJETA_DEBITO_BCP", tx.getChannel());
        assertEquals("1122", tx.getCardLast4());
        assertEquals("12345678", tx.getOperationNumber());
    }

    @Test
    void shouldParseYapeTransferEmailSuccessfully() {
        String subject = "Constancia de transferencia Yape";
        String textBody = "Se realizó un envío exitoso por S/ 15.00 a favor de Carlos Mendoza. Número de operación: 55443322";

        ParsedEmailTransaction tx = parser.parse(subject, textBody, LocalDateTime.now());

        assertNotNull(tx);
        assertEquals(new BigDecimal("15.00"), tx.getAmount());
        assertEquals(FlowType.EXPENSE, tx.getFlowType());
        assertEquals("Carlos Mendoza", tx.getMerchantName());
        assertEquals("YAPE", tx.getChannel());
        assertEquals("55443322", tx.getOperationNumber());
    }
}
