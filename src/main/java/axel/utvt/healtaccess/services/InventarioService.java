package axel.utvt.healtaccess.services;

import axel.utvt.healtaccess.entities.Farmacia;
import axel.utvt.healtaccess.entities.Inventario;
import axel.utvt.healtaccess.repositories.FarmaciaRepository;
import axel.utvt.healtaccess.repositories.InventarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class InventarioService {

    private final InventarioRepository inventarioRepository;
    private final FarmaciaRepository farmaciaRepository;

    public boolean validarStock(Integer idFarmacia, Integer idMedicamento, Integer cantidad) {
        return inventarioRepository.getStock(idFarmacia, idMedicamento)
                .map(stock -> stock >= cantidad)
                .orElse(false);
    }

    @Transactional
    public void descontarStock(Integer idFarmacia, Integer idMedicamento, Integer cantidad) {
        int updated = inventarioRepository.disminuirStock(idFarmacia, idMedicamento, cantidad);
        if (updated == 0) {
            throw new RuntimeException("No se pudo descontar stock. Stock insuficiente o medicamento no existe en la farmacia");
        }
    }

    public List<Inventario> obtenerInventarioPorUsuario(Integer idUsuario) {
        // Obtener la farmacia asociada al usuario
        Farmacia farmacia = farmaciaRepository.findByUsuario_IdUsuario(idUsuario)
                .orElseThrow(() -> new RuntimeException("Farmacia no encontrada para este usuario"));

        return inventarioRepository.findByFarmacia_IdFarmacia(farmacia.getIdFarmacia());
    }

    public List<Inventario> obtenerStockBajoPorUsuario(Integer idUsuario) {
        // Obtener la farmacia asociada al usuario
        Farmacia farmacia = farmaciaRepository.findByUsuario_IdUsuario(idUsuario)
                .orElseThrow(() -> new RuntimeException("Farmacia no encontrada para este usuario"));

        List<Inventario> inventario = inventarioRepository.findByFarmacia_IdFarmacia(farmacia.getIdFarmacia());

        // Filtrar productos con stock bajo (stock <= stock_minimo)
        return inventario.stream()
                .filter(i -> i.getStock() <= i.getStockMinimo())
                .collect(java.util.stream.Collectors.toList());
    }

    // Método existente
    public List<Inventario> obtenerInventarioPorFarmacia(Integer idFarmacia) {
        return inventarioRepository.findByFarmacia_IdFarmacia(idFarmacia);
    }

    public List<Inventario> obtenerProductosConStockBajo(Integer idFarmacia) {
        List<Inventario> inventario = inventarioRepository.findByFarmacia_IdFarmacia(idFarmacia);
        return inventario.stream()
                .filter(i -> i.getStock() <= i.getStockMinimo())
                .collect(java.util.stream.Collectors.toList());
    }
}