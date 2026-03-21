package axel.utvt.healtaccess.repositories;

import axel.utvt.healtaccess.entities.Farmacia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface FarmaciaRepository extends JpaRepository<Farmacia, Integer> {

    Optional<Farmacia> findByUsuario_IdUsuario(Integer idUsuario);
}