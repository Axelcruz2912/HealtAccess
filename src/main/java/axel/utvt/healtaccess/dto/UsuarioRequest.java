package axel.utvt.healtaccess.dto;

import axel.utvt.healtaccess.entities.enums.Rol;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UsuarioRequest {

    @NotBlank(message = "El nombre es obligatorio")
    private String nombre;

    @NotBlank(message = "El apellido es obligatorio")
    private String apellido;

    @NotBlank(message = "El correo es obligatorio")
    @Email(message = "Formato de correo inválido")
    private String correo;

    @NotBlank(message = "La contraseña es obligatoria")
    private String password;

    @NotNull(message = "El rol es obligatorio")
    private Rol rol;

    // Campos para MEDICO
    private String especialidad;
    private String cedulaProfesional;
    private Integer aniosExperiencia;
    private String telefono;

    // Campos para FARMACIA
    private String nombreFarmacia;
    private String direccionFarmacia;
    private String telefonoFarmacia;
    private String horarioFarmacia;
}