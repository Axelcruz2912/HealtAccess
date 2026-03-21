package axel.utvt.healtaccess.repositories;

import axel.utvt.healtaccess.entities.HistorialMedico;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface HistorialMedicoRepository extends JpaRepository<HistorialMedico, Integer> {

    List<HistorialMedico> findByCliente_IdCliente(Integer idCliente);
}