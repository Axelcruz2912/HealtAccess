package axel.utvt.healtaccess.services;

import axel.utvt.healtaccess.entities.Inventario;
import axel.utvt.healtaccess.repositories.InventarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class InventarioService {

    private final InventarioRepository inventarioRepository;

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