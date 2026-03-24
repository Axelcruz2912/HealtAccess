package axel.utvt.healtaccess.controllers;

import axel.utvt.healtaccess.config.CustomUserDetails;
import axel.utvt.healtaccess.dto.CitaRequest;
import axel.utvt.healtaccess.dto.RecetaRequest;
import axel.utvt.healtaccess.dto.RecetaResponse;
import axel.utvt.healtaccess.entities.Cita;
import axel.utvt.healtaccess.entities.Cliente;
import axel.utvt.healtaccess.entities.Farmacia;
import axel.utvt.healtaccess.repositories.FarmaciaRepository;
import axel.utvt.healtaccess.services.MedicoService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/medico")
@RequiredArgsConstructor
public class MedicoController {

    private final MedicoService medicoService;
    private final FarmaciaRepository farmaciaRepository;


    @PostMapping("/recetas")
    public ResponseEntity<RecetaResponse> crearReceta(
            @Valid @RequestBody RecetaRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails,
            HttpServletRequest httpRequest) {

        RecetaResponse response = medicoService.crearReceta(request, userDetails.getIdUsuario(), httpRequest.getRemoteAddr());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/recetas")
    public ResponseEntity<List<RecetaResponse>> obtenerMisRecetas(
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        return ResponseEntity.ok(medicoService.obtenerMisRecetas(userDetails.getIdUsuario()));
    }

    @GetMapping("/recetas/{id}")
    public ResponseEntity<RecetaResponse> obtenerReceta(
            @PathVariable Integer id,
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        return ResponseEntity.ok(medicoService.obtenerRecetaPorId(id, userDetails.getIdUsuario()));
    }

    @PutMapping("/recetas/{id}")
    public ResponseEntity<RecetaResponse> editarReceta(
            @PathVariable Integer id,
            @Valid @RequestBody RecetaRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails,
            HttpServletRequest httpRequest) {

        RecetaResponse response = medicoService.editarReceta(id, request, userDetails.getIdUsuario(), httpRequest.getRemoteAddr());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/citas")
    public ResponseEntity<List<Cita>> obtenerMisCitas(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fecha,
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        return ResponseEntity.ok(medicoService.obtenerMisCitas(userDetails.getIdUsuario(), fecha));
    }

    @GetMapping("/disponibilidad")
    public ResponseEntity<Boolean> verificarDisponibilidad(
            @RequestParam Integer idMedicamento) {

        // Obtener la única farmacia
        Farmacia farmacia = farmaciaRepository.findAll().stream().findFirst()
                .orElseThrow(() -> new RuntimeException("No hay farmacia registrada"));

        return ResponseEntity.ok(medicoService.verificarDisponibilidadMedicamento(farmacia.getIdFarmacia(), idMedicamento));
    }

    @PostMapping("/citas")
    public ResponseEntity<Cita> crearCita(
            @Valid @RequestBody CitaRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails,
            HttpServletRequest httpRequest) {

        Cita cita = medicoService.crearCita(request, userDetails.getIdUsuario(), httpRequest.getRemoteAddr());
        return ResponseEntity.ok(cita);
    }

    @GetMapping("/clientes")
    public ResponseEntity<List<Cliente>> listarClientes() {
        return ResponseEntity.ok(medicoService.listarClientes());
    }

}