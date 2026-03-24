package axel.utvt.healtaccess.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Entity
@Table(name = "Doctor")
@EntityListeners(AuditingEntityListener.class)
public class Doctor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_doctor")
    private Integer idDoctor;

    @JsonIgnore
    @OneToOne
    @JoinColumn(name = "id_usuario", nullable = false, unique = true)
    private Usuario usuario;

    @Column(nullable = false, length = 100)
    private String especialidad;

    @Column(name = "cedula_profesional", nullable = false, unique = true, length = 50)
    private String cedulaProfesional;

    @Column(name = "anios_experiencia")
    private Integer aniosExperiencia;

    @Column(length = 20)
    private String telefono;

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @JsonIgnore
    @OneToMany(mappedBy = "doctor")
    private List<Cita> citas = new ArrayList<>();

    @JsonIgnore
    @OneToMany(mappedBy = "doctor")
    private List<DoctorFarmacia> doctorFarmacias = new ArrayList<>();
}