package axel.utvt.healtaccess.entities;

import jakarta.persistence.*;
import lombok.Data;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "Inventario")
@EntityListeners(AuditingEntityListener.class)
public class Inventario {

    @EmbeddedId
    private InventarioId id;

    @ManyToOne
    @MapsId("idFarmacia")
    @JoinColumn(name = "id_farmacia")
    private Farmacia farmacia;

    @ManyToOne
    @MapsId("idMedicamento")
    @JoinColumn(name = "id_medicamento")
    private Medicamento medicamento;

    @Column(nullable = false)
    private Integer stock = 0;

    @Column(name = "stock_minimo")
    private Integer stockMinimo = 5;

    @LastModifiedDate
    @Column(name = "fecha_actualizacion")
    private LocalDateTime fechaActualizacion;
}