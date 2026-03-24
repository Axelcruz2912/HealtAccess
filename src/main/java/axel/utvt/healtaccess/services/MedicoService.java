package axel.utvt.healtaccess.services;

import axel.utvt.healtaccess.dto.CitaRequest;
import axel.utvt.healtaccess.dto.CitaResponse;
import axel.utvt.healtaccess.dto.RecetaRequest;
import axel.utvt.healtaccess.dto.RecetaResponse;
import axel.utvt.healtaccess.entities.*;
import axel.utvt.healtaccess.entities.enums.EstadoCita;
import axel.utvt.healtaccess.entities.enums.EstadoReceta;
import axel.utvt.healtaccess.repositories.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MedicoService {

    private final RecetaService recetaService;
    private final RecetaRepository recetaRepository;
    private final CitaRepository citaRepository;
    private final DoctorRepository doctorRepository;
    private final ClienteRepository clienteRepository;
    private final InventarioService inventarioService;
    private final AuditoriaService auditoriaService;
    private final FarmaciaRepository farmaciaRepository;

    @Transactional
    public RecetaResponse crearReceta(RecetaRequest request, Integer idUsuario, String ip) {
        // 1. Validar doctor
        Doctor doctor = doctorRepository.findByUsuario_IdUsuario(idUsuario)
                .orElseThrow(() -> new RuntimeException("Doctor no encontrado"));

        // 2. Validar cita
        Cita cita = citaRepository.findById(request.getIdCita())
                .orElseThrow(() -> new RuntimeException("Cita no encontrada"));

        // 3. Verificar que la cita pertenece al doctor
        if (!cita.getDoctor().getIdDoctor().equals(doctor.getIdDoctor())) {
            throw new RuntimeException("No puedes crear recetas para citas de otros médicos");
        }

        // 4. Verificar que la cita no está cancelada
        if (cita.getEstado().name().equals("CANCELADA")) {
            throw new RuntimeException("No se puede crear receta para una cita cancelada");
        }

        // 5. Verificar que la cita no tiene receta ya
        if (recetaRepository.findByCita_IdCita(request.getIdCita()).isPresent()) {
            throw new RuntimeException("Ya existe una receta para esta cita");
        }

        // 6. Verificar que la cita está programada (no atendida)
        if (cita.getEstado().name().equals("ATENDIDA")) {
            throw new RuntimeException("Esta cita ya fue atendida");
        }

        // 7. Obtener farmacia (la única que existe)
        Farmacia farmacia = farmaciaRepository.findAll().stream().findFirst()
                .orElseThrow(() -> new RuntimeException("No hay farmacia registrada en el sistema"));

        request.setIdFarmacia(farmacia.getIdFarmacia());

        // 8. Validar disponibilidad de stock para cada medicamento
        for (var detalle : request.getDetalles()) {
            if (!inventarioService.validarStock(farmacia.getIdFarmacia(),
                    detalle.getIdMedicamento(), detalle.getCantidad())) {
                throw new RuntimeException("Medicamento no disponible en stock: " + detalle.getIdMedicamento());
            }
        }

        // 9. Crear la receta
        RecetaResponse response = recetaService.crearReceta(request, doctor.getIdDoctor());

        // 10. Cambiar estado de la cita a ATENDIDA
        cita.setEstado(EstadoCita.ATENDIDA);
        citaRepository.save(cita);

        // 11. Registrar auditoría
        auditoriaService.registrarAccionExitosa(
                doctor.getUsuario().getCorreo(),
                "MEDICO",
                "CREAR_RECETA",
                "Receta creada ID: " + response.getIdReceta() + " - Cita ID: " + cita.getIdCita() + " marcada como ATENDIDA",
                ip
        );

        return response;
    }

    public List<RecetaResponse> obtenerMisRecetas(Integer idUsuario) {
        Doctor doctor = doctorRepository.findByUsuario_IdUsuario(idUsuario)
                .orElseThrow(() -> new RuntimeException("Doctor no encontrado"));

        return recetaService.obtenerRecetasPorDoctor(doctor.getIdDoctor());
    }

    public RecetaResponse obtenerRecetaPorId(Integer idReceta, Integer idUsuario) {
        Doctor doctor = doctorRepository.findByUsuario_IdUsuario(idUsuario)
                .orElseThrow(() -> new RuntimeException("Doctor no encontrado"));

        Receta receta = recetaRepository.findById(idReceta)
                .orElseThrow(() -> new RuntimeException("Receta no encontrada"));

        if (!receta.getCita().getDoctor().getIdDoctor().equals(doctor.getIdDoctor())) {
            throw new RuntimeException("No tienes acceso a esta receta");
        }

        return recetaService.obtenerRecetaPorId(idReceta);
    }

    @Transactional
    public RecetaResponse editarReceta(Integer idReceta, RecetaRequest request, Integer idUsuario, String ip) {
        Doctor doctor = doctorRepository.findByUsuario_IdUsuario(idUsuario)
                .orElseThrow(() -> new RuntimeException("Doctor no encontrado"));

        Receta receta = recetaRepository.findById(idReceta)
                .orElseThrow(() -> new RuntimeException("Receta no encontrada"));

        if (!receta.getCita().getDoctor().getIdDoctor().equals(doctor.getIdDoctor())) {
            throw new RuntimeException("No puedes editar recetas de otros médicos");
        }

        if (receta.getEstado() != EstadoReceta.PENDIENTE) {
            throw new RuntimeException("No se puede editar una receta que ya fue " + receta.getEstado().name().toLowerCase());
        }

        // Obtener la farmacia automáticamente
        Farmacia farmacia = farmaciaRepository.findAll().stream().findFirst()
                .orElseThrow(() -> new RuntimeException("No hay farmacia registrada en el sistema"));
        request.setIdFarmacia(farmacia.getIdFarmacia());

        // Validar stock para los nuevos medicamentos
        for (var detalle : request.getDetalles()) {
            if (!inventarioService.validarStock(farmacia.getIdFarmacia(),
                    detalle.getIdMedicamento(), detalle.getCantidad())) {
                throw new RuntimeException("Medicamento no disponible en stock");
            }
        }

        RecetaResponse response = recetaService.editarReceta(idReceta, request, doctor.getIdDoctor());

        auditoriaService.registrarAccionExitosa(
                doctor.getUsuario().getCorreo(),
                "MEDICO",
                "EDITAR_RECETA",
                "Receta editada ID: " + idReceta,
                ip
        );

        return response;
    }

    public List<Cita> obtenerMisCitas(Integer idUsuario, LocalDate fecha) {
        Doctor doctor = doctorRepository.findByUsuario_IdUsuario(idUsuario)
                .orElseThrow(() -> new RuntimeException("Doctor no encontrado"));

        if (fecha != null) {
            return citaRepository.findByDoctor_IdDoctorAndFecha(doctor.getIdDoctor(), fecha);
        }
        return citaRepository.findByDoctor_IdDoctor(doctor.getIdDoctor());
    }

    public boolean verificarDisponibilidadMedicamento(Integer idFarmacia, Integer idMedicamento) {
        return inventarioService.validarStock(idFarmacia, idMedicamento, 1);
    }

    // ========== CREAR CITA (CORREGIDO) ==========
    @Transactional
    public CitaResponse crearCita(CitaRequest request, Integer idUsuario, String ip) {
        // 1. Obtener el doctor por el usuario
        Doctor doctor = doctorRepository.findByUsuario_IdUsuario(idUsuario)
                .orElseThrow(() -> new RuntimeException("Doctor no encontrado"));

        // 2. Verificar que el cliente existe
        Cliente cliente = clienteRepository.findById(request.getIdCliente())
                .orElseThrow(() -> new RuntimeException("Cliente no encontrado"));

        // 3. Validar fecha: permitir citas desde hoy en adelante
        LocalDate hoy = LocalDate.now();
        if (request.getFecha().isBefore(hoy)) {
            throw new RuntimeException("No se pueden crear citas en fechas pasadas");
        }

        // 4. Si es hoy, verificar que la hora sea futura
        if (request.getFecha().equals(hoy)) {
            LocalTime ahora = LocalTime.now().withSecond(0).withNano(0);
            if (request.getHora().isBefore(ahora)) {
                throw new RuntimeException("No se pueden crear citas en horarios ya pasados");
            }
        }

        // 5. Verificar que el doctor no tenga otra cita en el mismo horario
        List<Cita> citasExistentes = citaRepository.findByDoctor_IdDoctorAndFecha(doctor.getIdDoctor(), request.getFecha());
        for (Cita c : citasExistentes) {
            if (c.getHora().equals(request.getHora())) {
                throw new RuntimeException("El doctor ya tiene una cita programada en ese horario");
            }
        }

        // 6. Crear la cita
        Cita cita = new Cita();
        cita.setFecha(request.getFecha());
        cita.setHora(request.getHora());
        cita.setMotivo(request.getMotivo());
        cita.setEstado(EstadoCita.PROGRAMADA);
        cita.setCliente(cliente);
        cita.setDoctor(doctor);

        Cita savedCita = citaRepository.save(cita);

        // 7. Crear respuesta DTO
        CitaResponse response = new CitaResponse();
        response.setIdCita(savedCita.getIdCita());
        response.setFecha(savedCita.getFecha());
        response.setHora(savedCita.getHora());
        response.setMotivo(savedCita.getMotivo());
        response.setEstado(savedCita.getEstado().name());
        response.setIdCliente(cliente.getIdCliente());
        response.setClienteNombre(cliente.getNombre());
        response.setClienteApellido(cliente.getApellido());
        response.setIdDoctor(doctor.getIdDoctor());
        response.setDoctorNombre(doctor.getUsuario().getNombre() + " " + doctor.getUsuario().getApellido());

        // 8. Registrar auditoría
        auditoriaService.registrarAccionExitosa(
                doctor.getUsuario().getCorreo(),
                "MEDICO",
                "CREAR_CITA",
                "Cita creada ID: " + savedCita.getIdCita() + " para paciente: " + cliente.getNombre(),
                ip
        );

        return response;
    }

    // ========== LISTAR CLIENTES ==========
    public List<Cliente> listarClientes() {
        return clienteRepository.findAll();
    }

    // ========== CANCELAR CITA ==========
    @Transactional
    public void cancelarCita(Integer idCita, Integer idUsuario, String ip) {
        Doctor doctor = doctorRepository.findByUsuario_IdUsuario(idUsuario)
                .orElseThrow(() -> new RuntimeException("Doctor no encontrado"));

        Cita cita = citaRepository.findById(idCita)
                .orElseThrow(() -> new RuntimeException("Cita no encontrada"));

        if (!cita.getDoctor().getIdDoctor().equals(doctor.getIdDoctor())) {
            throw new RuntimeException("No puedes cancelar citas de otros médicos");
        }

        if (cita.getEstado() != EstadoCita.PROGRAMADA) {
            throw new RuntimeException("No se puede cancelar una cita que ya fue " + cita.getEstado().name().toLowerCase());
        }

        cita.setEstado(EstadoCita.CANCELADA);
        citaRepository.save(cita);

        auditoriaService.registrarAccionExitosa(
                doctor.getUsuario().getCorreo(),
                "MEDICO",
                "CANCELAR_CITA",
                "Cita cancelada ID: " + idCita,
                ip
        );
    }

    // ========== ACTUALIZAR ESTADO DE CITA ==========
    @Transactional
    public void actualizarEstadoCita(Integer idCita, EstadoCita nuevoEstado, Integer idUsuario, String ip) {
        Doctor doctor = doctorRepository.findByUsuario_IdUsuario(idUsuario)
                .orElseThrow(() -> new RuntimeException("Doctor no encontrado"));

        Cita cita = citaRepository.findById(idCita)
                .orElseThrow(() -> new RuntimeException("Cita no encontrada"));

        if (!cita.getDoctor().getIdDoctor().equals(doctor.getIdDoctor())) {
            throw new RuntimeException("No puedes modificar citas de otros médicos");
        }

        cita.setEstado(nuevoEstado);
        citaRepository.save(cita);

        auditoriaService.registrarAccionExitosa(
                doctor.getUsuario().getCorreo(),
                "MEDICO",
                "ACTUALIZAR_ESTADO_CITA",
                "Cita ID: " + idCita + " cambiada a " + nuevoEstado.name(),
                ip
        );
    }
}