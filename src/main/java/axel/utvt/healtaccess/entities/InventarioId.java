package axel.utvt.healtaccess.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.Data;
import java.io.Serializable;

@Data
@Embeddable
public class InventarioId implements Serializable {

    @Column(name = "id_farmacia")
    private Integer idFarmacia;

    @Column(name = "id_medicamento")
    private Integer idMedicamento;
}