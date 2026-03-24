package axel.utvt.healtaccess.services;

import axel.utvt.healtaccess.dto.RecetaDetalleRequest;
import axel.utvt.healtaccess.dto.RecetaDetalleResponse;
import axel.utvt.healtaccess.dto.RecetaRequest;
import axel.utvt.healtaccess.dto.RecetaResponse;
import axel.utvt.healtaccess.entities.*;
import axel.utvt.healtaccess.entities.enums.EstadoReceta;
import axel.utvt.healtaccess.repositories.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.ArrayList;
import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RecetaService {

    private final RecetaRepository recetaRepository;
    private final RecetaDetalleRepository recetaDetalleRepository;
    private final CitaRepository citaRepository;
    private final DoctorRepository doctorRepository;
    private final FarmaciaRepository farmaciaRepository;
    private final MedicamentoRepository medicamentoRepository;

    @Transactional
    public RecetaResponse crearReceta(RecetaRequest request, Integer idDoctor) {
        Cita cita = citaRepository.findById(request.getIdCita())
                .orElseThrow(() -> new RuntimeException("Cita no encontrada"));

        Doctor doctor = doctorRepository.findById(idDoctor)
                .orElseThrow(() -> new RuntimeException("Doctor no encontrado"));

        Farmacia farmacia = farmaciaRepository.findById(request.getIdFarmacia())
                .orElseThrow(() -> new RuntimeException("Farmacia no encontrada"));

        // Crear receta
        Receta receta = new Receta();
        receta.setCita(cita);
        receta.setFarmacia(farmacia);
        receta.setDiagnostico(request.getDiagnostico());
        receta.setFechaEmision(request.getFechaEmision());
        receta.setEstado(EstadoReceta.PENDIENTE);
        receta.setTotal(BigDecimal.ZERO);

        Receta savedReceta = recetaRepository.save(receta);

        BigDecimal total = BigDecimal.ZERO;

        // Crear y guardar cada detalle
        for (RecetaDetalleRequest detalleRequest : request.getDetalles()) {
            Medicamento medicamento = medicamentoRepository.findById(detalleRequest.getIdMedicamento())
                    .orElseThrow(() -> new RuntimeException("Medicamento no encontrado"));

            BigDecimal subtotal = medicamento.getPrecio().multiply(BigDecimal.valueOf(detalleRequest.getCantidad()));
            total = total.add(subtotal);

            RecetaDetalle detalle = new RecetaDetalle();
            RecetaDetalleId detalleId = new RecetaDetalleId();
            detalleId.setIdReceta(savedReceta.getIdReceta());
            detalleId.setIdMedicamento(medicamento.getIdMedicamento());
            detalle.setId(detalleId);
            detalle.setReceta(savedReceta);
            detalle.setMedicamento(medicamento);
            detalle.setCantidad(detalleRequest.getCantidad());
            detalle.setPrecioUnitario(medicamento.getPrecio());
            detalle.setIndicaciones(detalleRequest.getIndicaciones());

            recetaDetalleRepository.save(detalle);

            // Agregar el detalle a la lista de la receta
            savedReceta.getDetalles().add(detalle);
        }

        savedReceta.setTotal(total);
        recetaRepository.save(savedReceta);

        return mapToResponse(savedReceta);
    }

    @Transactional
    public RecetaResponse editarReceta(Integer idReceta, RecetaRequest request, Integer idDoctor) {
        Receta receta = recetaRepository.findById(idReceta)
                .orElseThrow(() -> new RuntimeException("Receta no encontrada"));

        // Eliminar detalles antiguos
        recetaDetalleRepository.deleteAll(receta.getDetalles());
        receta.getDetalles().clear();

        // Actualizar datos
        receta.setDiagnostico(request.getDiagnostico());
        receta.setFechaEmision(request.getFechaEmision());
        receta.setTotal(BigDecimal.ZERO);

        recetaRepository.save(receta);

        BigDecimal total = BigDecimal.ZERO;

        for (RecetaDetalleRequest detalleRequest : request.getDetalles()) {
            Medicamento medicamento = medicamentoRepository.findById(detalleRequest.getIdMedicamento())
                    .orElseThrow(() -> new RuntimeException("Medicamento no encontrado"));

            BigDecimal subtotal = medicamento.getPrecio().multiply(BigDecimal.valueOf(detalleRequest.getCantidad()));
            total = total.add(subtotal);

            RecetaDetalle detalle = new RecetaDetalle();
            RecetaDetalleId detalleId = new RecetaDetalleId();
            detalleId.setIdReceta(receta.getIdReceta());
            detalleId.setIdMedicamento(medicamento.getIdMedicamento());
            detalle.setId(detalleId);
            detalle.setReceta(receta);
            detalle.setMedicamento(medicamento);
            detalle.setCantidad(detalleRequest.getCantidad());
            detalle.setPrecioUnitario(medicamento.getPrecio());
            detalle.setIndicaciones(detalleRequest.getIndicaciones());

            recetaDetalleRepository.save(detalle);
        }

        receta.setTotal(total);
        recetaRepository.save(receta);

        return mapToResponse(receta);
    }

    public List<RecetaResponse> obtenerRecetasPorDoctor(Integer idDoctor) {
        return recetaRepository.findByCita_Doctor_IdDoctor(idDoctor)  // Cambiado aquí
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<RecetaResponse> obtenerRecetasPorFarmacia(Integer idFarmacia) {
        return recetaRepository.findByFarmacia_IdFarmacia(idFarmacia)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public RecetaResponse obtenerRecetaPorId(Integer id) {
        Receta receta = recetaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Receta no encontrada"));
        return mapToResponse(receta);
    }

    private RecetaResponse mapToResponse(Receta receta) {
        RecetaResponse response = new RecetaResponse();
        response.setIdReceta(receta.getIdReceta());
        response.setFechaEmision(receta.getFechaEmision());
        response.setDiagnostico(receta.getDiagnostico());
        response.setEstado(receta.getEstado());
        response.setTotal(receta.getTotal());
        response.setIdCita(receta.getCita().getIdCita());
        response.setIdDoctor(receta.getCita().getDoctor().getIdDoctor());
        response.setDoctorNombre(receta.getCita().getDoctor().getUsuario().getNombre());
        response.setDoctorApellido(receta.getCita().getDoctor().getUsuario().getApellido());
        response.setIdFarmacia(receta.getFarmacia().getIdFarmacia());
        response.setFarmaciaNombre(receta.getFarmacia().getNombre());

        // Verificar que detalles no sea null
        List<RecetaDetalleResponse> detalles = new ArrayList<>();
        if (receta.getDetalles() != null) {
            detalles = receta.getDetalles().stream()
                    .map(detalle -> {
                        RecetaDetalleResponse detalleResponse = new RecetaDetalleResponse();
                        detalleResponse.setIdMedicamento(detalle.getMedicamento().getIdMedicamento());
                        detalleResponse.setMedicamentoNombre(detalle.getMedicamento().getNombre());
                        detalleResponse.setCantidad(detalle.getCantidad());
                        detalleResponse.setPrecioUnitario(detalle.getPrecioUnitario());
                        detalleResponse.setSubtotal(detalle.getPrecioUnitario().multiply(BigDecimal.valueOf(detalle.getCantidad())));
                        detalleResponse.setIndicaciones(detalle.getIndicaciones());
                        return detalleResponse;
                    })
                    .collect(Collectors.toList());
        }

        response.setDetalles(detalles);
        return response;
    }
}