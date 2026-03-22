package axel.utvt.healtaccess.controllers;

import axel.utvt.healtaccess.dto.CambioEstadoRequest;
import axel.utvt.healtaccess.dto.MedicamentoRequest;
import axel.utvt.healtaccess.dto.UsuarioRequest;
import axel.utvt.healtaccess.entities.*;
import axel.utvt.healtaccess.repositories.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('ADMINISTRADOR')")
public class AdminController {

    private final UsuarioRepository usuarioRepository;
    private final DoctorRepository doctorRepository;
    private final FarmaciaRepository farmaciaRepository;
    private final MedicamentoRepository medicamentoRepository;
    private final RecetaRepository recetaRepository;
    private final ClienteRepository clienteRepository;
    private final PasswordEncoder passwordEncoder;

    // ========== USUARIOS ==========

    @GetMapping("/usuarios")
    public ResponseEntity<List<Usuario>> listarUsuarios() {
        return ResponseEntity.ok(usuarioRepository.findAll());
    }

    @PostMapping("/usuarios")
    public ResponseEntity<Usuario> crearUsuario(@Valid @RequestBody UsuarioRequest request) {
        // Verificar si el correo ya existe
        if (usuarioRepository.existsByCorreo(request.getCorreo())) {
            throw new RuntimeException("El correo ya está registrado");
        }

        // Crear nuevo usuario
        Usuario usuario = new Usuario();
        usuario.setNombre(request.getNombre());
        usuario.setApellido(request.getApellido());
        usuario.setCorreo(request.getCorreo());
        usuario.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        usuario.setRol(request.getRol());
        usuario.setActivo(true);
        usuario.setIntentosFallidos(0);

        Usuario savedUsuario = usuarioRepository.save(usuario);

        // Si el rol es MEDICO, crear registro en Doctor
        if (request.getRol().name().equals("MEDICO") && request.getEspecialidad() != null) {
            Doctor doctor = new Doctor();
            doctor.setUsuario(savedUsuario);
            doctor.setEspecialidad(request.getEspecialidad());
            doctor.setCedulaProfesional(request.getCedulaProfesional());
            doctor.setAniosExperiencia(request.getAniosExperiencia());
            doctor.setTelefono(request.getTelefono());
            doctorRepository.save(doctor);
        }

        // Si el rol es FARMACIA, crear registro en Farmacia
        if (request.getRol().name().equals("FARMACIA") && request.getNombreFarmacia() != null) {
            Farmacia farmacia = new Farmacia();
            farmacia.setUsuario(savedUsuario);
            farmacia.setNombre(request.getNombreFarmacia());
            farmacia.setDireccion(request.getDireccionFarmacia());
            farmacia.setTelefono(request.getTelefonoFarmacia());
            farmacia.setHorario(request.getHorarioFarmacia());
            farmaciaRepository.save(farmacia);
        }

        return ResponseEntity.ok(savedUsuario);
    }

    @PutMapping("/usuarios/{id}/estado")
    public ResponseEntity<String> cambiarEstadoUsuario(
            @PathVariable Integer id,
            @Valid @RequestBody CambioEstadoRequest request) {

        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        usuario.setActivo(request.getActivo());
        usuarioRepository.save(usuario);

        return ResponseEntity.ok("Estado actualizado");
    }

    // ========== DOCTORES ==========
    @GetMapping("/doctores")
    public ResponseEntity<List<Doctor>> listarDoctores() {
        return ResponseEntity.ok(doctorRepository.findAll());
    }

    // ========== FARMACIAS ==========
    @GetMapping("/farmacias")
    public ResponseEntity<List<Farmacia>> listarFarmacias() {
        return ResponseEntity.ok(farmaciaRepository.findAll());
    }

    // ========== CLIENTES ==========
    @GetMapping("/clientes")
    public ResponseEntity<List<Cliente>> listarClientes() {
        return ResponseEntity.ok(clienteRepository.findAll());
    }

    // ========== MEDICAMENTOS ==========
    @GetMapping("/medicamentos")
    public ResponseEntity<List<Medicamento>> listarMedicamentos() {
        return ResponseEntity.ok(medicamentoRepository.findAll());
    }

    @PostMapping("/medicamentos")
    public ResponseEntity<Medicamento> crearMedicamento(@Valid @RequestBody MedicamentoRequest request) {
        Medicamento medicamento = new Medicamento();
        medicamento.setNombre(request.getNombre());
        medicamento.setDescripcion(request.getDescripcion());
        medicamento.setPrecio(request.getPrecio());
        medicamento.setRequiereReceta(request.getRequiereReceta());
        medicamento.setActivo(true);

        return ResponseEntity.ok(medicamentoRepository.save(medicamento));
    }

    @PutMapping("/medicamentos/{id}")
    public ResponseEntity<Medicamento> actualizarMedicamento(
            @PathVariable Integer id,
            @Valid @RequestBody MedicamentoRequest request) {

        Medicamento medicamento = medicamentoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Medicamento no encontrado"));
        medicamento.setNombre(request.getNombre());
        medicamento.setDescripcion(request.getDescripcion());
        medicamento.setPrecio(request.getPrecio());
        medicamento.setRequiereReceta(request.getRequiereReceta());

        return ResponseEntity.ok(medicamentoRepository.save(medicamento));
    }

    @DeleteMapping("/medicamentos/{id}")
    public ResponseEntity<String> eliminarMedicamento(@PathVariable Integer id) {
        Medicamento medicamento = medicamentoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Medicamento no encontrado"));
        medicamento.setActivo(false);
        medicamentoRepository.save(medicamento);

        return ResponseEntity.ok("Medicamento desactivado");
    }

    // ========== RECETAS ==========
    @GetMapping("/recetas")
    public ResponseEntity<List<Receta>> listarTodasRecetas() {
        return ResponseEntity.ok(recetaRepository.findAll());
    }

    // ========== REPORTES ==========
    @GetMapping("/reportes/recetas-por-estado")
    public ResponseEntity<?> reporteRecetasPorEstado() {
        // Implementar reporte
        return ResponseEntity.ok("Reporte generado");
    }
}