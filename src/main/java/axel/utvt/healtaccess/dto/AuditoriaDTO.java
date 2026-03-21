package axel.utvt.healtaccess.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class AuditoriaDTO {
    private String accion;
    private String usuarioCorreo;
    private String usuarioRol;
    private String detalle;
    private String ip;
    private LocalDateTime fecha;
    private Boolean exitoso;
}
