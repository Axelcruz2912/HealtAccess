package axel.utvt.healtaccess.repositories;

import axel.utvt.healtaccess.entities.RecetaDetalle;
import axel.utvt.healtaccess.entities.RecetaDetalleId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface RecetaDetalleRepository extends JpaRepository<RecetaDetalle, RecetaDetalleId> {

    List<RecetaDetalle> findByReceta_IdReceta(Integer idReceta);

    List<RecetaDetalle> findByMedicamento_IdMedicamento(Integer idMedicamento);
}