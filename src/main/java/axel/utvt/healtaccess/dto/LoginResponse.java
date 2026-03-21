package axel.utvt.healtaccess.dto;

import axel.utvt.healtaccess.entities.enums.Rol;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class LoginResponse {
    private String token;
    private String tipo = "Bearer";
    private Integer idUsuario;
    private String nombre;
    private String apellido;
    private String correo;
    private Rol rol;
}