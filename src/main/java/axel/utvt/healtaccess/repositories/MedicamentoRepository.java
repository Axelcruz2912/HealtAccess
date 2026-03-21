package axel.utvt.healtaccess.repositories;

import axel.utvt.healtaccess.entities.Medicamento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface MedicamentoRepository extends JpaRepository<Medicamento, Integer> {

    List<Medicamento> findByNombreContainingIgnoreCase(String nombre);

    List<Medicamento> findByActivoTrue();

    List<Medicamento> findByRequiereReceta(Boolean requiereReceta);
}
