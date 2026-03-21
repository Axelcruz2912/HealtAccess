package axel.utvt.healtaccess.entities;

import axel.utvt.healtaccess.entities.enums.EstadoReceta;
import jakarta.persistence.*;
import lombok.Data;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Entity
@Table(name = "Receta")
@EntityListeners(AuditingEntityListener.class)
public class Receta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_receta")
    private Integer idReceta;

    @Column(name = "fecha_emision", nullable = false)
    private LocalDate fechaEmision;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String diagnostico;

    @Enumerated(EnumType.STRING)
    private EstadoReceta estado = EstadoReceta.PENDIENTE;

    @Column(precision = 10, scale = 2)
    private BigDecimal total = BigDecimal.ZERO;

    @ManyToOne
    @JoinColumn(name = "id_cita", nullable = false)
    private Cita cita;

    @ManyToOne
    @JoinColumn(name = "id_farmacia", nullable = false)
    private Farmacia farmacia;

    // NO agregar doctor aquí, se obtiene a través de cita.getDoctor()

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "receta", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<RecetaDetalle> detalles;

    @OneToOne(mappedBy = "receta")
    private Pago pago;
}