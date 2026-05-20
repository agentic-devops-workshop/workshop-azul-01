package br.gov.sifap;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;
import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.info.Info;

/**
 * SIFAP 2.0 Backend Application
 * 
 * Modernização de sistema de pagamentos de benefícios
 * - Estágio 3 (Implementação): Java 21 + Spring Boot 3
 * - Rastreabilidade: REQ-PAY-001, REQ-DIS-001, REQ-VAL-001, REQ-CORR-001
 * - Banco: PostgreSQL 16 (migrando de Adabas)
 */
@SpringBootApplication
@OpenAPIDefinition(
    info = @Info(
        title = "SIFAP 2.0 API",
        version = "0.0.1",
        description = "Serviços de cálculo de benefício, desconto, validação e correção de valores"
    )
)
public class SifapApplication {

    public static void main(String[] args) {
        SpringApplication.run(SifapApplication.class, args);
    }

}
