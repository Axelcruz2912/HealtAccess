package axel.utvt.healtaccess.entities;


import axel.utvt.healtaccess.entities.enums.EstadoDoctorFarmacia;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;

@Data
@Entity
@Table(name = "Doctor_Farmacia")
public class DoctorFarmacia {

    @EmbeddedId
    private DoctorFarmaciaId id;

    @ManyToOne
    @MapsId("idDoctor")
    @JoinColumn(name = "id_doctor")
    private Doctor doctor;

    @ManyToOne
    @MapsId("idFarmacia")
    @JoinColumn(name = "id_farmacia")
    private Farmacia farmacia;

    @Column(name = "fecha_ingreso")
    private LocalDate fechaIngreso;

    @Enumerated(EnumType.STRING)
    private EstadoDoctorFarmacia estado = EstadoDoctorFarmacia.ACTIVO;
}