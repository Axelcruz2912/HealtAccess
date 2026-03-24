package axel.utvt.healtaccess.controllers;

import axel.utvt.healtaccess.entities.Farmacia;
import axel.utvt.healtaccess.entities.Inventario;
import axel.utvt.healtaccess.entities.Medicamento;
import axel.utvt.healtaccess.repositories.FarmaciaRepository;
import axel.utvt.healtaccess.repositories.InventarioRepository;
import axel.utvt.healtaccess.repositories.MedicamentoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/public")
@RequiredArgsConstructor
public class PublicController {

    private final MedicamentoRepository medicamentoRepository;
    private final InventarioRepository inventarioRepository;
    private final FarmaciaRepository farmaciaRepository;

    @GetMapping("/medicamentos-con-stock")
    public ResponseEntity<List<Map<String, Object>>> getMedicamentosConStock() {
        try {
            // Obtener la primera farmacia
            List<Farmacia> farmacias = farmaciaRepository.findAll();
            if (farmacias.isEmpty()) {
                return ResponseEntity.ok(List.of());
            }

            Farmacia farmacia = farmacias.get(0);

            // Obtener todos los medicamentos activos
            List<Medicamento> medicamentos = medicamentoRepository.findByActivoTrue();

            // Obtener inventario de la farmacia
            List<Inventario> inventario = inventarioRepository.findByFarmacia_IdFarmacia(farmacia.getIdFarmacia());

            // Crear mapa de stock
            Map<Integer, Integer> stockMap = new HashMap<>();
            for (Inventario inv : inventario) {
                stockMap.put(inv.getMedicamento().getIdMedicamento(), inv.getStock());
            }

            // Construir respuesta
            List<Map<String, Object>> resultado = medicamentos.stream()
                    .map(med -> {
                        Map<String, Object> item = new HashMap<>();
                        item.put("idMedicamento", med.getIdMedicamento());
                        item.put("nombre", med.getNombre());
                        item.put("descripcion", med.getDescripcion());
                        item.put("precio", med.getPrecio());
                        item.put("requiereReceta", med.getRequiereReceta());
                        item.put("stock", stockMap.getOrDefault(med.getIdMedicamento(), 0));
                        return item;
                    })
                    .collect(Collectors.toList());

            return ResponseEntity.ok(resultado);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(List.of());
        }
    }
    @GetMapping("/medicamentos")
    public ResponseEntity<List<Medicamento>> getMedicamentos() {
        return ResponseEntity.ok(medicamentoRepository.findByActivoTrue());
    }
}