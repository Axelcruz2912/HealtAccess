package axel.utvt.healtaccess.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.Data;
import java.io.Serializable;

@Data
@Embeddable
public class DoctorFarmaciaId implements Serializable {

    @Column(name = "id_doctor")
    private Integer idDoctor;

    @Column(name = "id_farmacia")
    private Integer idFarmacia;
}