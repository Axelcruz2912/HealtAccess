package axel.utvt.healtaccess.services;

import axel.utvt.healtaccess.dto.AuditoriaDTO;
import axel.utvt.healtaccess.entities.Auditoria;
import axel.utvt.healtaccess.repositories.AuditoriaRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@Slf4j
@RequiredArgsConstructor
public class AuditoriaService {

    private final AuditoriaRepository auditoriaRepository;

    public void registrarAccion(AuditoriaDTO auditoriaDTO) {
        Auditoria auditoria = new Auditoria();
        auditoria.setAccion(auditoriaDTO.getAccion());
        auditoria.setUsuarioCorreo(auditoriaDTO.getUsuarioCorreo());
        auditoria.setUsuarioRol(auditoriaDTO.getUsuarioRol());
        auditoria.setDetalle(auditoriaDTO.getDetalle());
        auditoria.setIp(auditoriaDTO.getIp());
        auditoria.setExitoso(auditoriaDTO.getExitoso());
        auditoria.setFecha(auditoriaDTO.getFecha() != null ? auditoriaDTO.getFecha() : LocalDateTime.now());

        auditoriaRepository.save(auditoria);

        log.info("AUDITORIA - Acción: {}, Usuario: {}, Rol: {}, Éxito: {}",
                auditoriaDTO.getAccion(),
                auditoriaDTO.getUsuarioCorreo(),
                auditoriaDTO.getUsuarioRol(),
                auditoriaDTO.getExitoso());
    }

    public void registrarIntentoFallido(String usuarioCorreo, String ip, String motivo) {
        AuditoriaDTO auditoria = new AuditoriaDTO();
        auditoria.setAccion("LOGIN_FALLIDO");
        auditoria.setUsuarioCorreo(usuarioCorreo);
        auditoria.setDetalle(motivo);
        auditoria.setIp(ip);
        auditoria.setExitoso(false);
        registrarAccion(auditoria);
    }

    public void registrarAccionExitosa(String usuarioCorreo, String usuarioRol, String accion, String detalle, String ip) {
        AuditoriaDTO auditoria = new AuditoriaDTO();
        auditoria.setAccion(accion);
        auditoria.setUsuarioCorreo(usuarioCorreo);
        auditoria.setUsuarioRol(usuarioRol);
        auditoria.setDetalle(detalle);
        auditoria.setIp(ip);
        auditoria.setExitoso(true);
        registrarAccion(auditoria);
    }
}