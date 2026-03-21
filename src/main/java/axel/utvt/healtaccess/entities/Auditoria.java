package axel.utvt.healtaccess.entities;


import jakarta.persistence.*;
import lombok.Data;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "Auditoria")
@EntityListeners(AuditingEntityListener.class)
public class Auditoria {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_auditoria")
    private Integer idAuditoria;

    @Column(nullable = false, length = 100)
    private String accion;

    @Column(name = "usuario_correo", length = 150)
    private String usuarioCorreo;

    @Column(name = "usuario_rol", length = 50)
    private String usuarioRol;

    @Column(columnDefinition = "TEXT")
    private String detalle;

    @Column(length = 45)
    private String ip;

    private Boolean exitoso = true;

    @CreatedDate
    @Column(name = "fecha", updatable = false)
    private LocalDateTime fecha;
}
