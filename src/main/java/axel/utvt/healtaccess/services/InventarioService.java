package axel.utvt.healtaccess.services;

import axel.utvt.healtaccess.entities.Farmacia;
import axel.utvt.healtaccess.entities.Inventario;
import axel.utvt.healtaccess.entities.Usuario;
import axel.utvt.healtaccess.repositories.FarmaciaRepository;
import axel.utvt.healtaccess.repositories.InventarioRepository;
import axel.utvt.healtaccess.repositories.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


import java.util.List;

@Service
@RequiredArgsConstructor
public class InventarioService {

    private final InventarioRepository inventarioRepository;
    private final FarmaciaRepository farmaciaRepository;
    private final UsuarioRepository usuarioRepository;


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
        try {
            System.out.println("=== obtenerInventarioPorUsuario ===");
            System.out.println("idUsuario: " + idUsuario);

            // Obtener el usuario
            Usuario usuario = usuarioRepository.findById(idUsuario)
                    .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

            System.out.println("Rol del usuario: " + usuario.getRol());

            Farmacia farmacia;

            // Si es ADMINISTRADOR, obtener la primera farmacia disponible
            if (usuario.getRol().name().equals("ADMINISTRADOR")) {
                System.out.println("Usuario ADMIN, buscando primera farmacia...");
                farmacia = farmaciaRepository.findAll().stream().findFirst()
                        .orElseThrow(() -> new RuntimeException("No hay farmacias registradas en el sistema"));
                System.out.println("Farmacia encontrada ID: " + farmacia.getIdFarmacia());
            } else {
                // Si es FARMACIA, obtener su farmacia asociada
                farmacia = farmaciaRepository.findByUsuario_IdUsuario(idUsuario)
                        .orElseThrow(() -> new RuntimeException("Farmacia no encontrada para este usuario"));
            }

            List<Inventario> inventario = inventarioRepository.findByFarmacia_IdFarmacia(farmacia.getIdFarmacia());
            System.out.println("Items en inventario: " + inventario.size());

            return inventario;
        } catch (Exception e) {
            System.err.println("Error en obtenerInventarioPorUsuario: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }
    public List<Inventario> obtenerStockBajoPorUsuario(Integer idUsuario) {
        Usuario usuario = usuarioRepository.findById(idUsuario)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        Farmacia farmacia;

        if (usuario.getRol().name().equals("ADMINISTRADOR")) {
            farmacia = farmaciaRepository.findAll().stream().findFirst()
                    .orElseThrow(() -> new RuntimeException("No hay farmacias registradas"));
        } else {
            farmacia = farmaciaRepository.findByUsuario_IdUsuario(idUsuario)
                    .orElseThrow(() -> new RuntimeException("Farmacia no encontrada"));
        }

        List<Inventario> inventario = inventarioRepository.findByFarmacia_IdFarmacia(farmacia.getIdFarmacia());

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