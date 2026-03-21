package axel.utvt.healtaccess.services;

import axel.utvt.healtaccess.dto.RecetaRequest;
import axel.utvt.healtaccess.dto.RecetaResponse;
import axel.utvt.healtaccess.entities.*;
import axel.utvt.healtaccess.entities.enums.EstadoReceta;
import axel.utvt.healtaccess.repositories.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MedicoService {

    private final RecetaService recetaService;
    private final RecetaRepository recetaRepository;
    private final CitaRepository citaRepository;
    private final DoctorRepository doctorRepository;
    private final InventarioService inventarioService;
    private final AuditoriaService auditoriaService;

    @Transactional
    public RecetaResponse crearReceta(RecetaRequest request, Integer idUsuario, String ip) {
        Doctor doctor = doctorRepository.findByUsuario_IdUsuario(idUsuario)
                .orElseThrow(() -> new RuntimeException("Doctor no encontrado"));

        Cita cita = citaRepository.findById(request.getIdCita())
                .orElseThrow(() -> new RuntimeException("Cita no encontrada"));

        if (!cita.getDoctor().getIdDoctor().equals(doctor.getIdDoctor())) {
            throw new RuntimeException("No puedes crear recetas para citas de otros médicos");
        }

        if (cita.getEstado().name().equals("CANCELADA")) {
            throw new RuntimeException("No se puede crear receta para una cita cancelada");
        }

        if (recetaRepository.findByCita_IdCita(request.getIdCita()).isPresent()) {
            throw new RuntimeException("Ya existe una receta para esta cita");
        }

        for (var detalle : request.getDetalles()) {
            if (!inventarioService.validarStock(request.getIdFarmacia(),
                    detalle.getIdMedicamento(), detalle.getCantidad())) {
                throw new RuntimeException("Medicamento no disponible en stock: " + detalle.getIdMedicamento());
            }
        }

        RecetaResponse response = recetaService.crearReceta(request, doctor.getIdDoctor());

        auditoriaService.registrarAccionExitosa(
                doctor.getUsuario().getCorreo(),
                "MEDICO",
                "CREAR_RECETA",
                "Receta creada ID: " + response.getIdReceta(),
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

        for (var detalle : request.getDetalles()) {
            if (!inventarioService.validarStock(request.getIdFarmacia(),
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
}