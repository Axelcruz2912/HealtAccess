package axel.utvt.healtaccess.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.Data;
import java.io.Serializable;

@Data
@Embeddable
public class RecetaDetalleId implements Serializable {

    @Column(name = "id_receta")
    private Integer idReceta;

    @Column(name = "id_medicamento")
    private Integer idMedicamento;
}
