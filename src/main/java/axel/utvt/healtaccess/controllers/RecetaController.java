package axel.utvt.healtaccess.controllers;

import axel.utvt.healtaccess.dto.RecetaResponse;
import axel.utvt.healtaccess.services.RecetaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/recetas")
@RequiredArgsConstructor
public class RecetaController {

    private final RecetaService recetaService;

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('MEDICO', 'FARMACIA', 'ADMINISTRADOR')")
    public ResponseEntity<RecetaResponse> obtenerRecetaPorId(@PathVariable Integer id) {
        return ResponseEntity.ok(recetaService.obtenerRecetaPorId(id));
    }

    @GetMapping("/doctor/{idDoctor}")
    @PreAuthorize("hasAnyAuthority('ADMINISTRADOR')")
    public ResponseEntity<List<RecetaResponse>> obtenerRecetasPorDoctor(@PathVariable Integer idDoctor) {
        return ResponseEntity.ok(recetaService.obtenerRecetasPorDoctor(idDoctor));
    }

    @GetMapping("/farmacia/{idFarmacia}")
    @PreAuthorize("hasAnyAuthority('ADMINISTRADOR')")
    public ResponseEntity<List<RecetaResponse>> obtenerRecetasPorFarmacia(@PathVariable Integer idFarmacia) {
        return ResponseEntity.ok(recetaService.obtenerRecetasPorFarmacia(idFarmacia));
    }
}