package axel.utvt.healtaccess.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class RecetaDetalleResponse {
    private Integer idMedicamento;
    private String medicamentoNombre;
    private Integer cantidad;
    private BigDecimal precioUnitario;
    private BigDecimal subtotal;
    private String indicaciones;
}