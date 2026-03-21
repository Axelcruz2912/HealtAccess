package axel.utvt.healtaccess.config;

import axel.utvt.healtaccess.entities.Usuario;
import axel.utvt.healtaccess.repositories.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collections;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UsuarioRepository usuarioRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        Usuario usuario = usuarioRepository.findByCorreo(username)
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado: " + username));

        if (!usuario.getActivo()) {
            throw new UsernameNotFoundException("Usuario inactivo: " + username);
        }

        return new CustomUserDetails(
                usuario.getCorreo(),
                usuario.getPasswordHash(),
                Collections.singletonList(new SimpleGrantedAuthority(usuario.getRol().name())),
                usuario.getIdUsuario(),
                usuario.getRol().name(),
                usuario.getNombre(),
                usuario.getApellido()
        );
    }
}