package axel.utvt.healtaccess.repositories;

import axel.utvt.healtaccess.entities.Pago;
import axel.utvt.healtaccess.entities.enums.MetodoPago;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface PagoRepository extends JpaRepository<Pago, Integer> {

    Optional<Pago> findByReceta_IdReceta(Integer idReceta);

    List<Pago> findByMetodoPago(MetodoPago metodoPago);

    List<Pago> findByFechaPagoBetween(LocalDateTime inicio, LocalDateTime fin);
}