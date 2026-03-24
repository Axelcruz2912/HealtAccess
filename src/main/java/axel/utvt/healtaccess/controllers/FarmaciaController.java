package axel.utvt.healtaccess.controllers;

import axel.utvt.healtaccess.config.CustomUserDetails;  // <-- AGREGAR ESTE IMPORT
import axel.utvt.healtaccess.dto.DispensarRequest;
import axel.utvt.healtaccess.dto.RecetaResponse;
import axel.utvt.healtaccess.entities.Inventario;
import axel.utvt.healtaccess.entities.Receta;
import axel.utvt.healtaccess.services.FarmaciaService;
import axel.utvt.healtaccess.services.InventarioService;
import axel.utvt.healtaccess.services.RecetaService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/farmacia")
@RequiredArgsConstructor
public class FarmaciaController {

    private final FarmaciaService farmaciaService;
    private final RecetaService recetaService;
    private final InventarioService inventarioService;

    @GetMapping("/recetas/pendientes")
    public ResponseEntity<List<RecetaResponse>> obtenerRecetasPendientes(
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        List<Receta> recetas = farmaciaService.obtenerRecetasPendientes(userDetails.getIdUsuario());
        List<RecetaResponse> responses = recetas.stream()
                .map(receta -> recetaService.obtenerRecetaPorId(receta.getIdReceta()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/recetas/{id}")
    public ResponseEntity<RecetaResponse> obtenerRecetaParaDispensar(
            @PathVariable Integer id,
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        Receta receta = farmaciaService.obtenerRecetaParaDispensar(id, userDetails.getIdUsuario());
        return ResponseEntity.ok(recetaService.obtenerRecetaPorId(receta.getIdReceta()));
    }

    @PostMapping("/dispensar")
    public ResponseEntity<String> dispensarReceta(
            @Valid @RequestBody DispensarRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails,
            HttpServletRequest httpRequest) {

        farmaciaService.dispensarReceta(request, userDetails.getIdUsuario(), httpRequest.getRemoteAddr());
        return ResponseEntity.ok("Receta dispensada exitosamente");
    }

    @GetMapping("/inventario")
    public ResponseEntity<List<Inventario>> obtenerInventario(
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        List<Inventario> inventario = inventarioService.obtenerInventarioPorUsuario(userDetails.getIdUsuario());
        return ResponseEntity.ok(inventario);
    }

    @GetMapping("/inventario/stock-bajo")
    public ResponseEntity<List<Inventario>> obtenerStockBajo(
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        List<Inventario> stockBajo = inventarioService.obtenerStockBajoPorUsuario(userDetails.getIdUsuario());
        return ResponseEntity.ok(stockBajo);
    }
}