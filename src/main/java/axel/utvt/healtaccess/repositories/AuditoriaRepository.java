package axel.utvt.healtaccess.repositories;

import axel.utvt.healtaccess.entities.Auditoria;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AuditoriaRepository extends JpaRepository<Auditoria, Integer> {

    List<Auditoria> findByUsuarioCorreo(String usuarioCorreo);

    List<Auditoria> findByAccion(String accion);

    List<Auditoria> findAllByOrderByFechaDesc();

    List<Auditoria> findByUsuarioCorreoOrderByFechaDesc(String usuarioCorreo);

    List<Auditoria> findByAccionOrderByFechaDesc(String accion);

    @Query("SELECT a FROM Auditoria a WHERE a.fecha BETWEEN :inicio AND :fin ORDER BY a.fecha DESC")
    List<Auditoria> findByFechaBetweenOrderByFechaDesc(@Param("inicio") LocalDateTime inicio, @Param("fin") LocalDateTime fin);
}