package axel.utvt.healtaccess.dto;

import lombok.Data;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class CitaResponse {
    private Integer idCita;
    private LocalDate fecha;
    private LocalTime hora;
    private String motivo;
    private String estado;
    private Integer idCliente;
    private String clienteNombre;
    private String clienteApellido;
    private Integer idDoctor;
    private String doctorNombre;
}