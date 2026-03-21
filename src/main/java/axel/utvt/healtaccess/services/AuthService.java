package axel.utvt.healtaccess.services;

import axel.utvt.healtaccess.config.JwtService;
import axel.utvt.healtaccess.dto.LoginRequest;
import axel.utvt.healtaccess.dto.LoginResponse;
import axel.utvt.healtaccess.entities.Usuario;
import axel.utvt.healtaccess.repositories.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuditoriaService auditoriaService;
    private final AlertaService alertaService;

    public LoginResponse login(LoginRequest request, String ip) {
        Usuario usuario = usuarioRepository.findByCorreo(request.getCorreo())
                .orElseThrow(() -> new RuntimeException("Credenciales inválidas"));

        // Verificar si usuario está bloqueado
        if (usuario.getBloqueadoHasta() != null && usuario.getBloqueadoHasta().isAfter(LocalDateTime.now())) {
            throw new RuntimeException("Usuario bloqueado. Intente más tarde");
        }

        // Verificar contraseña
        if (!passwordEncoder.matches(request.getPassword(), usuario.getPasswordHash())) {
            // Incrementar intentos fallidos
            usuario.setIntentosFallidos(usuario.getIntentosFallidos() + 1);

            // Bloquear después de 5 intentos fallidos
            if (usuario.getIntentosFallidos() >= 5) {
                usuario.setBloqueadoHasta(LocalDateTime.now().plusMinutes(15));
                alertaService.registrarIntentoFallido(usuario.getCorreo(), ip, usuario.getIntentosFallidos());
            }

            usuarioRepository.save(usuario);
            auditoriaService.registrarIntentoFallido(usuario.getCorreo(), ip, "Contraseña incorrecta");
            throw new RuntimeException("Credenciales inválidas");
        }

        // Verificar si usuario está activo
        if (!usuario.getActivo()) {
            throw new RuntimeException("Usuario inactivo");
        }

        // Resetear intentos fallidos
        usuario.setIntentosFallidos(0);
        usuario.setBloqueadoHasta(null);
        usuario.setUltimoAcceso(LocalDateTime.now());
        usuarioRepository.save(usuario);

        // Generar token
        String token = jwtService.generateToken(usuario.getCorreo(), usuario.getRol().name(), usuario.getIdUsuario());

        // Registrar auditoría
        auditoriaService.registrarAccionExitosa(
                usuario.getCorreo(),
                usuario.getRol().name(),
                "LOGIN",
                "Inicio de sesión exitoso",
                ip
        );

        alertaService.resetearIntentos(usuario.getCorreo(), ip);

        return new LoginResponse(
                token,
                "Bearer",
                usuario.getIdUsuario(),
                usuario.getNombre(),
                usuario.getApellido(),
                usuario.getCorreo(),
                usuario.getRol()
        );
    }
}