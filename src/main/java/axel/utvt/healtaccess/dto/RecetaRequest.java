package axel.utvt.healtaccess.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDate;
import java.util.List;

@Data
public class RecetaRequest {

    @NotNull(message = "El ID de la cita es obligatorio")
    private Integer idCita;

    private Integer idFarmacia;

    @NotBlank(message = "El diagnóstico es obligatorio")
    private String diagnostico;

    @NotNull(message = "La fecha de emisión es obligatoria")
    private LocalDate fechaEmision;

    @NotNull(message = "Los detalles de la receta son obligatorios")
    private List<RecetaDetalleRequest> detalles;
}