package axel.utvt.healtaccess.repositories;

import axel.utvt.healtaccess.entities.Receta;
import axel.utvt.healtaccess.entities.enums.EstadoReceta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface RecetaRepository extends JpaRepository<Receta, Integer> {

    // List<Receta> findByDoctor_IdDoctor(Integer idDoctor);

    List<Receta> findByCita_Doctor_IdDoctor(Integer idDoctor);

    List<Receta> findByFarmacia_IdFarmacia(Integer idFarmacia);

    List<Receta> findByEstado(EstadoReceta estado);

    List<Receta> findByFechaEmision(LocalDate fechaEmision);

    Optional<Receta> findByCita_IdCita(Integer idCita);

    List<Receta> findByEstadoAndFarmacia_IdFarmacia(EstadoReceta estado, Integer idFarmacia);
}