package axel.utvt.healtaccess.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CambioEstadoRequest {

    @NotNull(message = "El ID es obligatorio")
    private Integer id;

    @NotNull(message = "El estado es obligatorio")
    private Boolean activo;
}