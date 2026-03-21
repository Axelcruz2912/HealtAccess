package axel.utvt.healtaccess.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class InventarioRequest {

    @NotNull(message = "El ID del medicamento es obligatorio")
    private Integer idMedicamento;

    @NotNull(message = "El stock es obligatorio")
    @Min(value = 0, message = "El stock no puede ser negativo")
    private Integer stock;

    private Integer stockMinimo = 5;
}