let recetaSeleccionada = null;

// ========== CARGAR DATOS INICIALES ==========
async function cargarDatosIniciales() {
    console.log('Cargando datos iniciales de farmacia...');
    await cargarRecetasPendientes();
    await cargarInventario();
    await cargarStockBajo();
    await cargarRecetasDispensadas();
}

// ========== RECETAS PENDIENTES ==========
async function cargarRecetasPendientes() {
    console.log('Cargando recetas pendientes...');
    try {
        const response = await fetch('/api/farmacia/recetas/pendientes', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            const recetas = await response.json();
            console.log('Recetas pendientes:', recetas);
            mostrarRecetasPendientes(recetas);
            const totalPendientes = document.getElementById('totalPendientes');
            if (totalPendientes) totalPendientes.innerText = recetas.length;
        } else {
            console.error('Error al cargar recetas pendientes');
            const container = document.getElementById('recetasPendientesList');
            if (container) container.innerHTML = '<p class="error">Error al cargar recetas pendientes</p>';
        }
    } catch (error) {
        console.error('Error de conexión:', error);
        const container = document.getElementById('recetasPendientesList');
        if (container) container.innerHTML = '<p class="error">Error de conexión</p>';
    }
}

// ========== INVENTARIO ==========
async function cargarInventario() {
    console.log('Cargando inventario...');
    try {
        const response = await fetch('/api/farmacia/inventario', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            const inventario = await response.json();
            console.log('Inventario:', inventario);
            mostrarInventario(inventario);
        } else {
            console.error('Error al cargar inventario');
            const container = document.getElementById('inventarioList');
            if (container) container.innerHTML = '<p class="error">Error al cargar inventario</p>';
        }
    } catch (error) {
        console.error('Error de conexión:', error);
        const container = document.getElementById('inventarioList');
        if (container) container.innerHTML = '<p class="error">Error de conexión</p>';
    }
}

// ========== STOCK BAJO ==========
async function cargarStockBajo() {
    console.log('Cargando productos con stock bajo...');
    try {
        const response = await fetch('/api/farmacia/inventario/stock-bajo', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            const stockBajo = await response.json();
            console.log('Stock bajo:', stockBajo);
            mostrarStockBajo(stockBajo);
            const totalStockBajo = document.getElementById('totalStockBajo');
            if (totalStockBajo) totalStockBajo.innerText = stockBajo.length;
        } else {
            console.error('Error al cargar stock bajo');
            const container = document.getElementById('stockBajoList');
            if (container) container.innerHTML = '<p class="error">Error al cargar stock bajo</p>';
        }
    } catch (error) {
        console.error('Error de conexión:', error);
        const container = document.getElementById('stockBajoList');
        if (container) container.innerHTML = '<p class="error">Error de conexión</p>';
    }
}

// ========== RECETAS DISPENSADAS ==========
async function cargarRecetasDispensadas() {
    console.log('Cargando recetas dispensadas...');
    try {
        const response = await fetch('/api/farmacia/recetas?estado=SURTIDA', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            const recetas = await response.json();
            console.log('Recetas dispensadas:', recetas);
            mostrarRecetasDispensadas(recetas);
            const totalDispensadas = document.getElementById('totalDispensadas');
            if (totalDispensadas) totalDispensadas.innerText = recetas.length;
        } else {
            console.error('Error al cargar recetas dispensadas');
            const container = document.getElementById('recetasDispensadasList');
            if (container) container.innerHTML = '<p class="error">Error al cargar historial</p>';
        }
    } catch (error) {
        console.error('Error de conexión:', error);
        const container = document.getElementById('recetasDispensadasList');
        if (container) container.innerHTML = '<p class="error">Error de conexión</p>';
    }
}

// ========== MOSTRAR RECETAS PENDIENTES ==========
function mostrarRecetasPendientes(recetas) {
    const container = document.getElementById('recetasPendientesList');
    if (!container) return;

    if (!recetas || recetas.length === 0) {
        container.innerHTML = '<p class="text-muted">No hay recetas pendientes</p>';
        return;
    }

    let html = `<table class="data-table">
        <thead>
            32<th>ID</th><th>Fecha</th><th>Diagnóstico</th><th>Total</th><th>Acciones</th>
        </thead>
        <tbody>`;

    recetas.forEach(receta => {
        html += `     <tr>
            <td>${receta.idReceta}</td>
            <td>${receta.fechaEmision}</td>
            <td>${receta.diagnostico?.substring(0, 50) || '-'}${receta.diagnostico?.length > 50 ? '...' : ''}</td>
            <td>$${receta.total}</td>
            <td><button class="btn-success" onclick="abrirModalDispensar(${receta.idReceta})">Dispensar</button></td>
        </tr>`;
    });

    html += `</tbody></table>`;
    container.innerHTML = html;
}

// ========== MOSTRAR INVENTARIO ==========
function mostrarInventario(inventario) {
    const container = document.getElementById('inventarioList');
    if (!container) return;

    if (!inventario || inventario.length === 0) {
        container.innerHTML = '<p class="text-muted">No hay inventario registrado</p>';
        return;
    }

    let html = `<table class="data-table">
        <thead>
            <tr><th>ID</th><th>Medicamento</th><th>Stock</th><th>Stock Mínimo</th><th>Estado</th></tr>
        </thead>
        <tbody>`;

    inventario.forEach(item => {
        const estadoClass = item.stock <= item.stockMinimo ? 'status-pendiente' : 'status-surtida';
        const estadoTexto = item.stock <= item.stockMinimo ? ' Stock Bajo' : ' Normal';
        const nombreMed = item.medicamento?.nombre || `ID: ${item.id?.idMedicamento}`;

        html += `<tr>
            <td>${item.id?.idMedicamento || item.medicamento?.idMedicamento}</td>
            <td>${nombreMed}</td>
            <td><strong>${item.stock}</strong> unidades</td>
            <td>${item.stockMinimo} unidades</td>
            <td><span class="${estadoClass}">${estadoTexto}</span></td>
        </tr>`;
    });

    html += `</tbody></table>`;
    container.innerHTML = html;
}

// ========== MOSTRAR STOCK BAJO ==========
function mostrarStockBajo(stockBajo) {
    const container = document.getElementById('stockBajoList');
    if (!container) return;

    if (!stockBajo || stockBajo.length === 0) {
        container.innerHTML = '<p class="text-muted">No hay productos con stock bajo</p>';
        return;
    }

    let html = `<table class="data-table">
        <thead>
            <tr><th>ID</th><th>Medicamento</th><th>Stock Actual</th><th>Stock Mínimo</th><th>Faltante</th></tr>
        </thead>
        <tbody>`;

    stockBajo.forEach(item => {
        const faltante = item.stockMinimo - item.stock;
        const nombreMed = item.medicamento?.nombre || `ID: ${item.id?.idMedicamento}`;

        html += `<tr>
            <td>${item.id?.idMedicamento || item.medicamento?.idMedicamento}</td>
            <td>${nombreMed}</td>
            <td><strong style="color: #ff4757;">${item.stock}</strong></td>
            <td>${item.stockMinimo}</td>
            <td style="color: #ff4757;">Faltan ${faltante}</td>
        </tr>`;
    });

    html += `</tbody></table>`;
    container.innerHTML = html;
}

// ========== MOSTRAR RECETAS DISPENSADAS ==========
function mostrarRecetasDispensadas(recetas) {
    const container = document.getElementById('recetasDispensadasList');
    if (!container) return;

    if (!recetas || recetas.length === 0) {
        container.innerHTML = '<p class="text-muted">No hay recetas dispensadas</p>';
        return;
    }

    let html = `<table class="data-table">
        <thead>
            <tr><th>ID</th><th>Fecha</th><th>Diagnóstico</th><th>Total</th></tr>
        </thead>
        <tbody>`;

    recetas.forEach(receta => {
        html += `<tr>
            <td>${receta.idReceta}</td>
            <td>${receta.fechaEmision}</td>
            <td>${receta.diagnostico?.substring(0, 50) || '-'}${receta.diagnostico?.length > 50 ? '...' : ''}</td>
            <td>$${receta.total}</td>
        </tr>`;
    });

    html += `</tbody></table>`;
    container.innerHTML = html;
}

// ========== MODAL DISPENSAR ==========
async function abrirModalDispensar(idReceta) {
    try {
        const response = await fetch(`/api/farmacia/recetas/${idReceta}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            const receta = await response.json();
            recetaSeleccionada = receta;

            const modalRecetaId = document.getElementById('modalRecetaId');
            const modalTotal = document.getElementById('modalTotal');
            const modalMedicamentos = document.getElementById('modalMedicamentos');

            if (modalRecetaId) modalRecetaId.innerText = receta.idReceta;
            if (modalTotal) modalTotal.innerText = receta.total;

            let medicamentosHtml = '<strong>Medicamentos:</strong><ul>';
            if (receta.detalles) {
                receta.detalles.forEach(d => {
                    medicamentosHtml += `<li>${d.medicamentoNombre} - ${d.cantidad} unidades - $${d.subtotal}</li>`;
                });
            }
            medicamentosHtml += '</ul>';
            if (modalMedicamentos) modalMedicamentos.innerHTML = medicamentosHtml;

            const modal = document.getElementById('modalDispensar');
            if (modal) modal.style.display = 'flex';
        } else {
            alert('Error al cargar la receta');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error de conexión');
    }
}

function cerrarModal() {
    const modal = document.getElementById('modalDispensar');
    if (modal) modal.style.display = 'none';
    recetaSeleccionada = null;
}

async function confirmarDispensar() {
    if (!recetaSeleccionada) return;

    try {
        const response = await fetch('/api/farmacia/dispensar', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ idReceta: recetaSeleccionada.idReceta })
        });

        if (response.ok) {
            alert(' Receta dispensada exitosamente');
            cerrarModal();
            await cargarDatosIniciales();
        } else {
            const error = await response.json();
            alert(' Error: ' + error.message);
        }
    } catch (error) {
        alert(' Error de conexión');
    }
}

// Cargar datos al iniciar
document.addEventListener('DOMContentLoaded', () => {
    cargarDatosIniciales();
});