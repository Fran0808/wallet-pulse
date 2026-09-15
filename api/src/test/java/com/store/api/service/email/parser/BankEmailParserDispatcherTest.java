package com.store.api.service.email.parser;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import com.store.api.model.dto.email.ParsedEmailTransaction;

class BankEmailParserDispatcherTest {

    private BankEmailParserDispatcher dispatcher;

    @BeforeEach
    void setUp() {
        YapeEmailParser yapeParser = new YapeEmailParser();
        BcpEmailParser bcpParser = new BcpEmailParser();
        dispatcher = new BankEmailParserDispatcher(List.of(yapeParser, bcpParser));
    }

    @Test
    void shouldDispatchBcpEmailCorrectly() {
        String sender = "BCP Notificaciones <notificaciones@notificacionesbcp.com.pe>";
        String subject = "Realizaste un consumo con tu Tarjeta de Crédito BCP";
        String body = "Monto: S/ 4.90 Establecimiento: PUMACAHUA VES Nro. de operación: 0000311221";

        Optional<ParsedEmailTransaction> result = dispatcher.dispatchAndParse(sender, subject, body, LocalDateTime.now());

        assertTrue(result.isPresent());
        ParsedEmailTransaction tx = result.get();
        assertEquals(new BigDecimal("4.90"), tx.getAmount());
        assertEquals("PUMACAHUA VES", tx.getMerchantName());
        assertEquals("TARJETA_CREDITO_BCP", tx.getChannel());
        assertEquals("0000311221", tx.getOperationNumber());
    }

    @Test
    void shouldDispatchYapeEmailCorrectly() {
        String sender = "YAPE Notificaciones <notificaciones@yape.pe>";
        String subject = "¡Tu pago en BUSSINESS fue exitoso!";
        String body = "Monto total S/ 35.20 Destino: BUSSINESS ID de operación: 01M2DHQTT772XGGYWDHX2AP8B0";

        Optional<ParsedEmailTransaction> result = dispatcher.dispatchAndParse(sender, subject, body, LocalDateTime.now());

        assertTrue(result.isPresent());
        ParsedEmailTransaction tx = result.get();
        assertEquals(new BigDecimal("35.20"), tx.getAmount());
        assertEquals("BUSSINESS", tx.getMerchantName());
        assertEquals("YAPE", tx.getChannel());
        assertEquals("01M2DHQTT772XGGYWDHX2AP8B0", tx.getOperationNumber());
    }

    @Test
    void shouldIgnoreNonBankEmailsGracefully() {
        String sender = "Newsletter <marketing@tienda.com>";
        String subject = "¡Grandes descuentos de temporada!";
        String body = "Aprovecha nuestras ofertas exclusivas en ropa y calzado.";

        Optional<ParsedEmailTransaction> result = dispatcher.dispatchAndParse(sender, subject, body, LocalDateTime.now());

        assertFalse(result.isPresent());
    }
}
