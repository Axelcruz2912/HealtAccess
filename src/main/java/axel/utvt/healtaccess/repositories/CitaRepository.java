package axel.utvt.healtaccess.repositories;

import axel.utvt.healtaccess.entities.Cita;
import axel.utvt.healtaccess.entities.enums.EstadoCita;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface CitaRepository extends JpaRepository<Cita, Integer> {

    List<Cita> findByCliente_IdCliente(Integer idCliente);

    List<Cita> findByDoctor_IdDoctor(Integer idDoctor);

    List<Cita> findByEstado(EstadoCita estado);

    List<Cita> findByFecha(LocalDate fecha);

    List<Cita> findByDoctor_IdDoctorAndFecha(Integer idDoctor, LocalDate fecha);
}