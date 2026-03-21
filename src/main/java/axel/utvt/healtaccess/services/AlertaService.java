package axel.utvt.healtaccess.services;

import axel.utvt.healtaccess.dto.AlertaDTO;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
@Slf4j
public class AlertaService {

    @Value("${alerts.failed-login-threshold:3}")
    private int failedLoginThreshold;

    @Value("${alerts.unusual-hours-start:22}")
    private int unusualHoursStart;

    @Value("${alerts.unusual-hours-end:6}")
    private int unusualHoursEnd;

    private final Map<String, Integer> intentosFallidos = new ConcurrentHashMap<>();

    public void registrarIntentoFallido(String usuarioCorreo, String ip, int intentos) {
        String key = usuarioCorreo + ":" + ip;
        this.intentosFallidos.put(key, intentos);

        if (intentos >= failedLoginThreshold) {
            generarAlerta("MULTIPLES_INTENTOS_FALLIDOS",
                    "Múltiples intentos fallidos de inicio de sesión para usuario: " + usuarioCorreo,
                    usuarioCorreo, ip, intentos);
        }
    }

    public void verificarHorarioAcceso(String ip, String usuarioCorreo) {
        int horaActual = LocalDateTime.now().getHour();

        if (horaActual >= unusualHoursStart || horaActual < unusualHoursEnd) {
            generarAlerta("ACCESO_FUERA_HORARIO",
                    "Acceso fuera del horario habitual detectado para usuario: " + usuarioCorreo,
                    usuarioCorreo, ip, null);
        }
    }

    public void registrarAccesoNoAutorizado(String usuarioCorreo, String ip, String modulo) {
        generarAlerta("ACCESO_NO_AUTORIZADO",
                "Intento de acceso no autorizado al módulo: " + modulo + " por usuario: " + usuarioCorreo,
                usuarioCorreo, ip, null);
    }

    private void generarAlerta(String tipo, String mensaje, String usuarioCorreo, String ip, Integer intentos) {
        AlertaDTO alerta = new AlertaDTO();
        alerta.setTipo(tipo);
        alerta.setMensaje(mensaje);
        alerta.setUsuarioCorreo(usuarioCorreo);
        alerta.setIp(ip);
        alerta.setIntentos(intentos);
        alerta.setFecha(LocalDateTime.now());

        log.warn("ALERTA [{}]: {} - Usuario: {}, IP: {}, Intentos: {}",
                tipo, mensaje, usuarioCorreo, ip, intentos);
    }

    public void resetearIntentos(String usuarioCorreo, String ip) {
        String key = usuarioCorreo + ":" + ip;
        intentosFallidos.remove(key);
    }
}