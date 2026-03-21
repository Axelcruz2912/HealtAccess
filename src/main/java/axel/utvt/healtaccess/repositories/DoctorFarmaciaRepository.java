package axel.utvt.healtaccess.repositories;

import axel.utvt.healtaccess.entities.DoctorFarmacia;
import axel.utvt.healtaccess.entities.DoctorFarmaciaId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface DoctorFarmaciaRepository extends JpaRepository<DoctorFarmacia, DoctorFarmaciaId> {

    List<DoctorFarmacia> findByDoctor_IdDoctor(Integer idDoctor);

    List<DoctorFarmacia> findByFarmacia_IdFarmacia(Integer idFarmacia);
}