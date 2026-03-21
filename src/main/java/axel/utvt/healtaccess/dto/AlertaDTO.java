package axel.utvt.healtaccess.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class AlertaDTO {
    private String tipo;
    private String mensaje;
    private String usuarioCorreo;
    private String ip;
    private LocalDateTime fecha;
    private Integer intentos;
}