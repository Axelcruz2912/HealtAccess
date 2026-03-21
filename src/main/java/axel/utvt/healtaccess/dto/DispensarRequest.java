package axel.utvt.healtaccess.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class DispensarRequest {

    @NotNull(message = "El ID de la receta es obligatorio")
    private Integer idReceta;
}