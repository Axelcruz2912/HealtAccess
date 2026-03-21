package axel.utvt.healtaccess.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class RecetaDetalleRequest {

    @NotNull(message = "El ID del medicamento es obligatorio")
    private Integer idMedicamento;

    @NotNull(message = "La cantidad es obligatoria")
    @Min(value = 1, message = "La cantidad mínima es 1")
    private Integer cantidad;

    private String indicaciones;
}