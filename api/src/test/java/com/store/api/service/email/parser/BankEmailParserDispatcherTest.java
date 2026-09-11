package com.store.api.service.email.parser;

import com.store.api.model.dto.email.ParsedEmailTransaction;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

class BankEmailParserDispatcherTest {

    private BankEmailParserDispatcher dispatcher;

    @BeforeEach
    void setUp() {
        BcpEmailParser bcpParser = new BcpEmailParser();
        dispatcher = new BankEmailParserDispatcher(List.of(bcpParser));
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
    void shouldIgnoreNonBankEmailsGracefully() {
        String sender = "Newsletter <marketing@tienda.com>";
        String subject = "¡Grandes descuentos de temporada!";
        String body = "Aprovecha nuestras ofertas exclusivas en ropa y calzado.";

        Optional<ParsedEmailTransaction> result = dispatcher.dispatchAndParse(sender, subject, body, LocalDateTime.now());

        assertFalse(result.isPresent());
    }
}
