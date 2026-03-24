package axel.utvt.healtaccess.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Entity
@Table(name = "Receta_Detalle")
public class RecetaDetalle {

    @EmbeddedId
    private RecetaDetalleId id;

    @JsonIgnore
    @ManyToOne
    @MapsId("idReceta")
    @JoinColumn(name = "id_receta")
    private Receta receta;

    @ManyToOne
    @MapsId("idMedicamento")
    @JoinColumn(name = "id_medicamento")
    private Medicamento medicamento;

    @Column(nullable = false)
    private Integer cantidad;

    @Column(name = "precio_unitario", nullable = false, precision = 10, scale = 2)
    private BigDecimal precioUnitario;

    @Column(length = 255)
    private String indicaciones;
}