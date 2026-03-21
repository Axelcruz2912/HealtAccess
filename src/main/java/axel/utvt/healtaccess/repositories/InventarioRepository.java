package axel.utvt.healtaccess.repositories;

import axel.utvt.healtaccess.entities.Inventario;
import axel.utvt.healtaccess.entities.InventarioId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;

@Repository
public interface InventarioRepository extends JpaRepository<Inventario, InventarioId> {

    Optional<Inventario> findByFarmacia_IdFarmaciaAndMedicamento_IdMedicamento(Integer idFarmacia, Integer idMedicamento);

    List<Inventario> findByFarmacia_IdFarmacia(Integer idFarmacia);

    List<Inventario> findByMedicamento_IdMedicamento(Integer idMedicamento);

    List<Inventario> findByStockLessThanEqual(Integer stockMinimo);

    @Modifying
    @Transactional
    @Query("UPDATE Inventario i SET i.stock = i.stock - :cantidad WHERE i.farmacia.idFarmacia = :idFarmacia AND i.medicamento.idMedicamento = :idMedicamento AND i.stock >= :cantidad")
    int disminuirStock(@Param("idFarmacia") Integer idFarmacia,
                       @Param("idMedicamento") Integer idMedicamento,
                       @Param("cantidad") Integer cantidad);

    @Query("SELECT i.stock FROM Inventario i WHERE i.farmacia.idFarmacia = :idFarmacia AND i.medicamento.idMedicamento = :idMedicamento")
    Optional<Integer> getStock(@Param("idFarmacia") Integer idFarmacia,
                               @Param("idMedicamento") Integer idMedicamento);
}