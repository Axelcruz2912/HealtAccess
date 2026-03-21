package axel.utvt.healtaccess.dto;

import axel.utvt.healtaccess.entities.enums.EstadoReceta;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
public class RecetaResponse {
    private Integer idReceta;
    private LocalDate fechaEmision;
    private String diagnostico;
    private EstadoReceta estado;
    private BigDecimal total;
    private Integer idCita;
    private Integer idDoctor;
    private String doctorNombre;
    private String doctorApellido;
    private Integer idFarmacia;
    private String farmaciaNombre;
    private List<RecetaDetalleResponse> detalles;
}