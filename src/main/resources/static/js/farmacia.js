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

        console.log('Status recetas pendientes:', response.status);

        if (response.ok) {
            const recetas = await response.json();
            console.log('Recetas pendientes:', recetas);
            mostrarRecetasPendientes(recetas);
            document.getElementById('totalPendientes').innerText = recetas.length;
        } else {
            console.error('Error al cargar recetas pendientes');
            document.getElementById('recetasPendientesList').innerHTML = '<p class="error">Error al cargar recetas pendientes</p>';
        }
    } catch (error) {
        console.error('Error de conexión:', error);
        document.getElementById('recetasPendientesList').innerHTML = '<p class="error">Error de conexión</p>';
    }
}

// ========== INVENTARIO ==========
async function cargarInventario() {
    console.log('Cargando inventario...');
    try {
        const response = await fetch('/api/farmacia/inventario', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        console.log('Status inventario:', response.status);

        if (response.ok) {
            const inventario = await response.json();
            console.log('Inventario:', inventario);
            mostrarInventario(inventario);
        } else {
            console.error('Error al cargar inventario');
            document.getElementById('inventarioList').innerHTML = '<p class="error">Error al cargar inventario</p>';
        }
    } catch (error) {
        console.error('Error de conexión:', error);
        document.getElementById('inventarioList').innerHTML = '<p class="error">Error de conexión</p>';
    }
}

// ========== STOCK BAJO ==========
async function cargarStockBajo() {
    console.log('Cargando productos con stock bajo...');
    try {
        const response = await fetch('/api/farmacia/inventario/stock-bajo', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        console.log('Status stock bajo:', response.status);

        if (response.ok) {
            const stockBajo = await response.json();
            console.log('Stock bajo:', stockBajo);
            mostrarStockBajo(stockBajo);
            document.getElementById('totalStockBajo').innerText = stockBajo.length;
        } else {
            console.error('Error al cargar stock bajo');
            document.getElementById('stockBajoList').innerHTML = '<p class="error">Error al cargar stock bajo</p>';
        }
    } catch (error) {
        console.error('Error de conexión:', error);
        document.getElementById('stockBajoList').innerHTML = '<p class="error">Error de conexión</p>';
    }
}

// ========== RECETAS DISPENSADAS ==========
async function cargarRecetasDispensadas() {
    console.log('Cargando recetas dispensadas...');
    try {
        const response = await fetch('/api/farmacia/recetas?estado=SURTIDA', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        console.log('Status recetas dispensadas:', response.status);

        if (response.ok) {
            const recetas = await response.json();
            console.log('Recetas dispensadas:', recetas);
            mostrarRecetasDispensadas(recetas);
            document.getElementById('totalDispensadas').innerText = recetas.length;
        } else {
            console.error('Error al cargar recetas dispensadas');
            const error = await response.json();
            console.error('Error:', error);
            document.getElementById('recetasDispensadasList').innerHTML = '<p class="error">Error al cargar historial: ' + (error.message || '') + '</p>';
        }
    } catch (error) {
        console.error('Error de conexión:', error);
        document.getElementById('recetasDispensadasList').innerHTML = '<p class="error">Error de conexión</p>';
    }


// ========== MOSTRAR RECETAS PENDIENTES ==========
function mostrarRecetasPendientes(recetas) {
    const container = document.getElementById('recetasPendientesList');
    if (!recetas || recetas.length === 0) {
        container.innerHTML = '<p class="text-muted">No hay recetas pendientes</p>';
        return;
    }

    let html = `<table class="data-table">
        <thead>
            <tr><th>ID</th><th>Fecha</th><th>Diagnóstico</th><th>Total</th><th>Acciones</th></thead>
        <tbody>`;

    recetas.forEach(receta => {
        html += `<tr>
            <td>${receta.idReceta}</td>
            <td>${receta.fechaEmision}</td>
            <td>${receta.diagnostico?.substring(0, 50) || '-'}</td>
            <td>$${receta.total}</td>
            <td>
                <button class="btn-success" onclick="abrirModalDispensar(${receta.idReceta})">Dispensar</button>
            </td>
        </tr>`;
    });

    html += `</tbody>  close`;
    container.innerHTML = html;
}

// ========== MOSTRAR INVENTARIO ==========
function mostrarInventario(inventario) {
    const container = document.getElementById('inventarioList');
    if (!inventario || inventario.length === 0) {
        container.innerHTML = '<p class="text-muted">No hay inventario registrado</p>';
        return;
    }

    let html = `<table class="data-table">
        <thead>
            <tr><th>ID</th><th>Medicamento</th><th>Stock</th><th>Stock Mínimo</th><th>Estado</th></thead>
        <tbody>`;

    inventario.forEach(item => {
        const estadoClass = item.stock <= item.stockMinimo ? 'status-pendiente' : 'status-surtida';
        const estadoTexto = item.stock <= item.stockMinimo ? '️ Stock Bajo' : ' Normal';
        const nombreMed = item.medicamento?.nombre || `ID: ${item.id?.idMedicamento}`;

        html += `<tr>
            <td>${item.id?.idMedicamento || item.medicamento?.idMedicamento}</td>
            <td>${nombreMed}</td>
            <td><strong>${item.stock}</strong> unidades</td>
            <td>${item.stockMinimo} unidades</td>
            <td><span class="${estadoClass}">${estadoTexto}</span></td>
        </tr>`;
    });

    html += `</tbody>  close`;
    container.innerHTML = html;
}

// ========== MOSTRAR STOCK BAJO ==========
function mostrarStockBajo(stockBajo) {
    const container = document.getElementById('stockBajoList');
    if (!stockBajo || stockBajo.length === 0) {
        container.innerHTML = '<p class="text-muted">No hay productos con stock bajo</p>';
        return;
    }

    let html = `<table class="data-table">
        <thead>
            <tr><th>ID</th><th>Medicamento</th><th>Stock Actual</th><th>Stock Mínimo</th><th>Faltante</th></thead>
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

    html += `</tbody>  close`;
    container.innerHTML = html;
}

// ========== MOSTRAR RECETAS DISPENSADAS ==========
function mostrarRecetasDispensadas(recetas) {
    const container = document.getElementById('recetasDispensadasList');
    if (!recetas || recetas.length === 0) {
        container.innerHTML = '<p class="text-muted">No hay recetas dispensadas</p>';
        return;
    }

    let html = `<table class="data-table">
        <thead>
            <tr><th>ID</th><th>Fecha</th><th>Diagnóstico</th><th>Total</th></thead>
        <tbody>`;

    recetas.forEach(receta => {
        html += `<tr>
            <td>${receta.idReceta}</td>
            <td>${receta.fechaEmision}</td>
            <td>${receta.diagnostico?.substring(0, 50) || '-'}</td>
            <td>$${receta.total}</td>
        </tr>`;
    });

    html += `</tbody>  close`;
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

            document.getElementById('modalRecetaId').innerText = receta.idReceta;
            document.getElementById('modalTotal').innerText = receta.total;

            let medicamentosHtml = '<strong>Medicamentos:</strong><ul>';
            if (receta.detalles) {
                receta.detalles.forEach(d => {
                    medicamentosHtml += `<li>${d.medicamentoNombre} - ${d.cantidad} unidades - $${d.subtotal}</li>`;
                });
            }
            medicamentosHtml += '</ul>';
            document.getElementById('modalMedicamentos').innerHTML = medicamentosHtml;

            document.getElementById('modalDispensar').style.display = 'flex';
        } else {
            alert('Error al cargar la receta');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error de conexión');
    }
}

function cerrarModal() {
    document.getElementById('modalDispensar').style.display = 'none';
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