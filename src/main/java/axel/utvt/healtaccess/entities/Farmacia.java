package axel.utvt.healtaccess.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Entity
@Table(name = "Farmacia")
@EntityListeners(AuditingEntityListener.class)
public class Farmacia {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_farmacia")
    private Integer idFarmacia;

    // AGREGAR @JsonIgnore AQUÍ
    @JsonIgnore
    @OneToOne
    @JoinColumn(name = "id_usuario", nullable = false, unique = true)
    private Usuario usuario;

    @Column(nullable = false, length = 150)
    private String nombre;

    @Column(nullable = false, length = 255)
    private String direccion;

    @Column(length = 20)
    private String telefono;

    @Column(length = 100)
    private String horario;

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @JsonIgnore
    @OneToMany(mappedBy = "farmacia")
    private List<DoctorFarmacia> doctorFarmacias;

    @JsonIgnore
    @OneToMany(mappedBy = "farmacia")
    private List<Receta> recetas;

    @JsonIgnore
    @OneToMany(mappedBy = "farmacia")
    private List<Inventario> inventarios;
}