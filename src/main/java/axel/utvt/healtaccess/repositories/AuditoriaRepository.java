package axel.utvt.healtaccess.repositories;

import axel.utvt.healtaccess.entities.Auditoria;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AuditoriaRepository extends JpaRepository<Auditoria, Integer> {

    List<Auditoria> findByUsuarioCorreo(String usuarioCorreo);

    List<Auditoria> findByFechaBetween(LocalDateTime inicio, LocalDateTime fin);

    List<Auditoria> findByAccion(String accion);

    List<Auditoria> findByExitoso(Boolean exitoso);
}