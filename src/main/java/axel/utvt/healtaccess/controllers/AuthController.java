package axel.utvt.healtaccess.controllers;

import axel.utvt.healtaccess.dto.LoginRequest;
import axel.utvt.healtaccess.dto.LoginResponse;
import axel.utvt.healtaccess.services.AlertaService;
import axel.utvt.healtaccess.services.AuditoriaService;
import axel.utvt.healtaccess.services.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final AlertaService alertaService;

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request, HttpServletRequest httpRequest) {
        String ip = httpRequest.getRemoteAddr();

        // Verificar horario de acceso
        alertaService.verificarHorarioAcceso(ip, request.getCorreo());

        LoginResponse response = authService.login(request, ip);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/logout")
    public ResponseEntity<String> logout() {
        return ResponseEntity.ok("Sesión cerrada exitosamente");
    }
}