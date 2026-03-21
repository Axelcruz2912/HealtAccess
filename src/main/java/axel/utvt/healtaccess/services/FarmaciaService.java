package axel.utvt.healtaccess.services;
import java.util.List;
import axel.utvt.healtaccess.dto.DispensarRequest;
import axel.utvt.healtaccess.entities.Farmacia;
import axel.utvt.healtaccess.entities.Receta;
import axel.utvt.healtaccess.entities.RecetaDetalle;
import axel.utvt.healtaccess.entities.enums.EstadoReceta;
import axel.utvt.healtaccess.repositories.FarmaciaRepository;
import axel.utvt.healtaccess.repositories.RecetaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class FarmaciaService {

    private final RecetaRepository recetaRepository;
    private final FarmaciaRepository farmaciaRepository;
    private final InventarioService inventarioService;
    private final AuditoriaService auditoriaService;

    @Transactional
    public void dispensarReceta(DispensarRequest request, Integer idUsuario, String ip) {
        Farmacia farmacia = farmaciaRepository.findByUsuario_IdUsuario(idUsuario)
                .orElseThrow(() -> new RuntimeException("Farmacia no encontrada"));

        Receta receta = recetaRepository.findById(request.getIdReceta())
                .orElseThrow(() -> new RuntimeException("Receta no encontrada"));

        // Validar que la receta pertenece a la farmacia
        if (!receta.getFarmacia().getIdFarmacia().equals(farmacia.getIdFarmacia())) {
            throw new RuntimeException("Esta receta no pertenece a tu farmacia");
        }

        // Validar que la receta está pendiente
        if (receta.getEstado() != EstadoReceta.PENDIENTE) {
            throw new RuntimeException("La receta ya fue " + receta.getEstado().name().toLowerCase());
        }

        // Validar stock para cada medicamento
        for (RecetaDetalle detalle : receta.getDetalles()) {
            if (!inventarioService.validarStock(farmacia.getIdFarmacia(),
                    detalle.getMedicamento().getIdMedicamento(), detalle.getCantidad())) {
                throw new RuntimeException("Stock insuficiente para: " + detalle.getMedicamento().getNombre());
            }
        }

        // Descontar stock
        for (RecetaDetalle detalle : receta.getDetalles()) {
            inventarioService.descontarStock(farmacia.getIdFarmacia(),
                    detalle.getMedicamento().getIdMedicamento(), detalle.getCantidad());
        }

        // Cambiar estado de receta
        receta.setEstado(EstadoReceta.SURTIDA);
        recetaRepository.save(receta);

        auditoriaService.registrarAccionExitosa(
                farmacia.getUsuario().getCorreo(),
                "FARMACIA",
                "DISPENSAR_RECETA",
                "Receta dispensada ID: " + request.getIdReceta(),
                ip
        );
    }

    public Receta obtenerRecetaParaDispensar(Integer idReceta, Integer idUsuario) {
        Farmacia farmacia = farmaciaRepository.findByUsuario_IdUsuario(idUsuario)
                .orElseThrow(() -> new RuntimeException("Farmacia no encontrada"));

        Receta receta = recetaRepository.findById(idReceta)
                .orElseThrow(() -> new RuntimeException("Receta no encontrada"));

        if (!receta.getFarmacia().getIdFarmacia().equals(farmacia.getIdFarmacia())) {
            throw new RuntimeException("No tienes acceso a esta receta");
        }

        if (receta.getEstado() != EstadoReceta.PENDIENTE) {
            throw new RuntimeException("La receta ya fue " + receta.getEstado().name().toLowerCase());
        }

        return receta;
    }

    public List<Receta> obtenerRecetasPendientes(Integer idUsuario) {
        Farmacia farmacia = farmaciaRepository.findByUsuario_IdUsuario(idUsuario)
                .orElseThrow(() -> new RuntimeException("Farmacia no encontrada"));

        return recetaRepository.findByEstadoAndFarmacia_IdFarmacia(EstadoReceta.PENDIENTE, farmacia.getIdFarmacia());
    }

}