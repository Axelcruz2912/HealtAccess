package axel.utvt.healtaccess.config;

import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.User;

import java.util.Collection;

@Getter
public class CustomUserDetails extends User {

    private final Integer idUsuario;
    private final String rol;
    private final String nombre;
    private final String apellido;

    public CustomUserDetails(
            String username,
            String password,
            Collection<? extends GrantedAuthority> authorities,
            Integer idUsuario,
            String rol,
            String nombre,
            String apellido) {
        super(username, password, authorities);
        this.idUsuario = idUsuario;
        this.rol = rol;
        this.nombre = nombre;
        this.apellido = apellido;
    }
}