package br.gov.sifap.health;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.Map;

/**
 * Health check endpoint para validar que a aplicação está funcionando
 */
@RestController
@RequestMapping("/api/v1/health")
@Tag(name = "Health", description = "Status da aplicação")
public class HealthController {

    @GetMapping
    @Operation(summary = "Verificar status da aplicação")
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of(
            "status", "UP",
            "version", "0.0.1",
            "service", "SIFAP 2.0 Backend"
        ));
    }

}
