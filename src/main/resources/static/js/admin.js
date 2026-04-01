// ============================================================
//  ADMIN.JS — Sistema Farmacia
//  Correcciones aplicadas:
//  1. Eliminada función cargarDatosIniciales() duplicada
//  2. Definida cargarInventario() que faltaba
//  3. Clases de estado actualizadas al nuevo CSS (pill-*)
//  4. Mensajes de error/éxito usando clases CSS en lugar de style inline
//  5. Arreglado HTML malformado en mostrarDoctores (\\) y mostrarMedicamentos (<thead> mal ubicado)
//  6. limpiarFormularioMedicamento() restaura stockInicial a 100
// ============================================================

// ── Cargar datos iniciales (una sola definición) ─────────────
async function cargarDatosIniciales() {
    await cargarUsuarios();
    await cargarDoctores();
    await cargarFarmacias();
    await cargarClientes();
    await cargarMedicamentos();
    await cargarRecetas();
    await cargarInventario();
    await cargarAuditoria();
}

// ── Usuarios ─────────────────────────────────────────────────
async function cargarUsuarios() {
    try {
        const response = await fetch('/api/admin/usuarios', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const usuarios = await response.json();
        mostrarUsuarios(usuarios);
        document.getElementById('totalUsuarios').innerText = usuarios.length;
    } catch (e) {
        console.error('Error cargando usuarios:', e);
    }
}

function mostrarUsuarios(usuarios) {
    if (!usuarios || usuarios.length === 0) {
        document.getElementById('usuariosList').innerHTML = '<p class="text-empty">No hay usuarios</p>';
        return;
    }

    let html = `<table>
        <thead>
            <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Correo</th>
                <th>Rol</th>
                <th>Estado</th>
                <th>Acción</th>
            </tr>
        </thead>
        <tbody>`;

    usuarios.forEach(u => {
        const rolClass = u.rol === 'ADMINISTRADOR' ? 'pill-info' : 'pill-pendiente';
        const estadoClass = u.activo ? 'pill-surtida' : 'pill-cancelada';
        const estadoTexto = u.activo ? 'Activo' : 'Inactivo';

        html += `<tr>
            <td>${u.idUsuario}</td>
            <td>${u.nombre} ${u.apellido}</td>
            <td>${u.correo}</td>
            <td><span class="pill ${rolClass}">${u.rol}</span></td>
            <td><span class="pill ${estadoClass}">${estadoTexto}</span></td>
            <td>
                <button class="btn-${u.activo ? 'danger' : 'success'}"
                        onclick="cambiarEstadoUsuario(${u.idUsuario}, ${!u.activo})">
                    ${u.activo ? 'Desactivar' : 'Activar'}
                </button>
            </td>
        </tr>`;
    });

    html += `</tbody></table>`;
    document.getElementById('usuariosList').innerHTML = html;
}

async function cambiarEstadoUsuario(id, activo) {
    try {
        const response = await fetch(`/api/admin/usuarios/${id}/estado`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ activo })
        });

        if (response.ok) {
            await cargarUsuarios();
        } else {
            alert('Error al cambiar estado del usuario');
        }
    } catch (e) {
        console.error('Error:', e);
        alert('Error de conexión al servidor');
    }
}

// ── Crear usuario ─────────────────────────────────────────────
async function crearUsuario() {
    const msgEl = document.getElementById('createUserMessage');
    const nombre   = document.getElementById('newNombre').value.trim();
    const apellido = document.getElementById('newApellido').value.trim();
    const correo   = document.getElementById('newCorreo').value.trim();
    const password = document.getElementById('newPassword').value;
    const rol      = document.getElementById('newRol').value;

    // Validación base
    if (!nombre || !apellido || !correo || !password) {
        mostrarMensaje(msgEl, 'Complete todos los campos obligatorios', 'error');
        return;
    }

    const usuarioData = { nombre, apellido, correo, password, rol };

    // Validación y datos para MEDICO
    if (rol === 'MEDICO') {
        const especialidad       = document.getElementById('newEspecialidad').value.trim();
        const cedulaProfesional  = document.getElementById('newCedula').value.trim();
        const aniosExperiencia   = parseInt(document.getElementById('newExperiencia').value) || 0;
        const telefono           = document.getElementById('newTelefono').value.trim();

        if (!especialidad || !cedulaProfesional) {
            mostrarMensaje(msgEl, 'Complete especialidad y cédula profesional', 'error');
            return;
        }

        usuarioData.especialidad      = especialidad;
        usuarioData.cedulaProfesional = cedulaProfesional;
        usuarioData.aniosExperiencia  = aniosExperiencia;
        usuarioData.telefono          = telefono;
    }

    // Validación y datos para FARMACIA
    if (rol === 'FARMACIA') {
        const nombreFarmacia    = document.getElementById('newNombreFarmacia').value.trim();
        const direccionFarmacia = document.getElementById('newDireccionFarmacia').value.trim();
        const telefonoFarmacia  = document.getElementById('newTelefonoFarmacia').value.trim();
        const horarioFarmacia   = document.getElementById('newHorarioFarmacia').value.trim();

        if (!nombreFarmacia || !direccionFarmacia) {
            mostrarMensaje(msgEl, 'Complete nombre y dirección de la farmacia', 'error');
            return;
        }

        usuarioData.nombreFarmacia    = nombreFarmacia;
        usuarioData.direccionFarmacia = direccionFarmacia;
        usuarioData.telefonoFarmacia  = telefonoFarmacia;
        usuarioData.horarioFarmacia   = horarioFarmacia;
    }

    try {
        const response = await fetch('/api/admin/usuarios', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(usuarioData)
        });

        if (response.ok) {
            const data = await response.json();
            mostrarMensaje(msgEl, `Usuario ${data.nombre} ${data.apellido} creado exitosamente`, 'success');
            await cargarUsuarios();
            await cargarDoctores();
            await cargarFarmacias();
            limpiarFormularioUsuario();
        } else {
            // Intentar leer mensaje del backend
            let errorMsg = 'Error al crear usuario';
            try {
                const error = await response.json();
                errorMsg = error.message || errorMsg;
            } catch (_) {}
            mostrarMensaje(msgEl, errorMsg, 'error');
        }
    } catch (e) {
        console.error('Error:', e);
        mostrarMensaje(msgEl, 'Error de conexión al servidor', 'error');
    }
}

function limpiarFormularioUsuario() {
    ['newNombre','newApellido','newCorreo','newPassword',
     'newEspecialidad','newCedula','newExperiencia','newTelefono',
     'newNombreFarmacia','newDireccionFarmacia','newTelefonoFarmacia','newHorarioFarmacia'
    ].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });
    document.getElementById('newRol').value = 'ADMINISTRADOR';
    document.getElementById('medicoFields').style.display  = 'none';
    document.getElementById('farmaciaFields').style.display = 'none';
}

// ── Mostrar/ocultar campos según rol ─────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    const rolSelect = document.getElementById('newRol');
    if (rolSelect) {
        rolSelect.addEventListener('change', (e) => {
            document.getElementById('medicoFields').style.display  = e.target.value === 'MEDICO'   ? 'block' : 'none';
            document.getElementById('farmaciaFields').style.display = e.target.value === 'FARMACIA' ? 'block' : 'none';
        });
    }
});

// ── Doctores ─────────────────────────────────────────────────
async function cargarDoctores() {
    try {
        const response = await fetch('/api/admin/doctores', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const doctores = await response.json();
        mostrarDoctores(doctores);
        document.getElementById('totalDoctores').innerText = doctores.length;
    } catch (e) {
        console.error('Error cargando doctores:', e);
    }
}

function mostrarDoctores(doctores) {
    const container = document.getElementById('doctoresList');
    if (!doctores || doctores.length === 0) {
        container.innerHTML = '<p class="text-empty">No hay doctores</p>';
        return;
    }

    let html = `<table class="data-table">
        <thead>
            <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Correo</th>
                <th>Especialidad</th>
                <th>Cédula</th>
                <th>Teléfono</th>
            </tr>
        </thead>
        <tbody>`;

    doctores.forEach(d => {
        html += `<tr>
            <td>${d.idDoctor}</td>
            <td><strong>${(d.nombre || '')} ${(d.apellido || '')}</strong></td>
            <td>${d.correo || '-'}</td>
            <td>${d.especialidad || '-'}</td>
            <td>${d.cedulaProfesional || '-'}</td>
            <td>${d.telefono || '-'}</td>
        </tr>`;
    });

    html += `</tbody></table>`;
    container.innerHTML = html;
}

// ── Farmacias ─────────────────────────────────────────────────
async function cargarFarmacias() {
    try {
        const response = await fetch('/api/admin/farmacias', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const farmacias = await response.json();
        mostrarFarmacias(farmacias);
    } catch (e) {
        console.error('Error cargando farmacias:', e);
    }
}

function mostrarFarmacias(farmacias) {
    if (!farmacias || farmacias.length === 0) {
        document.getElementById('farmaciasList').innerHTML = '<p class="text-empty">No hay farmacias</p>';
        return;
    }

    let html = `<table>
        <thead>
            <tr>
                <th>ID</th><th>Nombre</th><th>Dirección</th><th>Teléfono</th><th>Horario</th>
            </tr>
        </thead>
        <tbody>`;

    farmacias.forEach(f => {
        html += `<tr>
            <td>${f.idFarmacia}</td>
            <td>${f.nombre}</td>
            <td>${f.direccion}</td>
            <td>${f.telefono || '-'}</td>
            <td>${f.horario || '-'}</td>
        </tr>`;
    });

    html += `</tbody></table>`;
    document.getElementById('farmaciasList').innerHTML = html;
}

// ── Clientes ─────────────────────────────────────────────────
async function cargarClientes() {
    try {
        const response = await fetch('/api/admin/clientes', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const clientes = await response.json();
        mostrarClientes(clientes);
    } catch (e) {
        console.error('Error cargando clientes:', e);
    }
}

function mostrarClientes(clientes) {
    if (!clientes || clientes.length === 0) {
        document.getElementById('clientesList').innerHTML = '<p class="text-empty">No hay clientes</p>';
        return;
    }

    let html = `<table>
        <thead>
            <tr>
                <th>ID</th><th>Nombre</th><th>Teléfono</th><th>Dirección</th><th>Tipo Sangre</th>
            </tr>
        </thead>
        <tbody>`;

    clientes.forEach(c => {
        html += `<tr>
            <td>${c.idCliente}</td>
            <td>${c.nombre} ${c.apellido}</td>
            <td>${c.telefono || '-'}</td>
            <td>${c.direccion || '-'}</td>
            <td>${c.tipoSangre || '-'}</td>
        </tr>`;
    });

    html += `</tbody></table>`;
    document.getElementById('clientesList').innerHTML = html;
}

// ── Medicamentos ─────────────────────────────────────────────
async function cargarMedicamentos() {
    try {
        const response = await fetch('/api/admin/medicamentos', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const medicamentos = await response.json();
        mostrarMedicamentos(medicamentos);
        document.getElementById('totalMedicamentos').innerText = medicamentos.length;
    } catch (e) {
        console.error('Error cargando medicamentos:', e);
    }
}

function mostrarMedicamentos(medicamentos) {
    const container = document.getElementById('medicamentosList');
    if (!medicamentos || medicamentos.length === 0) {
        container.innerHTML = '<p class="text-empty">No hay medicamentos</p>';
        return;
    }

    let html = `<table class="data-table">
        <thead>
            <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Descripción</th>
                <th>Precio</th>
                <th>Requiere Receta</th>
                <th>Acción</th>
            </tr>
        </thead>
        <tbody>`;

    medicamentos.forEach(m => {
        const recetaClass = m.requiereReceta ? 'pill-pendiente' : 'pill-info';
        html += `<tr>
            <td>${m.idMedicamento}</td>
            <td><strong>${m.nombre}</strong></td>
            <td>${m.descripcion || '-'}</td>
            <td>$${parseFloat(m.precio).toFixed(2)}</td>
            <td><span class="pill ${recetaClass}">${m.requiereReceta ? 'Sí' : 'No'}</span></td>
            <td><button class="btn-danger" onclick="eliminarMedicamento(${m.idMedicamento})">Eliminar</button></td>
        </tr>`;
    });

    html += `</tbody></table>`;
    container.innerHTML = html;
}

async function crearMedicamento() {
    const msgEl       = document.getElementById('createMedMessage');
    const nombre      = document.getElementById('medNombre').value.trim();
    const descripcion = document.getElementById('medDescripcion').value.trim();
    const precio      = parseFloat(document.getElementById('medPrecio').value);
    const requiereReceta = document.getElementById('medRequiereReceta').value === 'true';
    const stockInicial   = parseInt(document.getElementById('medStockInicial').value) || 100;

    if (!nombre || isNaN(precio) || precio <= 0) {
        mostrarMensaje(msgEl, 'Complete nombre y un precio válido', 'error');
        return;
    }

    try {
        const response = await fetch('/api/admin/medicamentos', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ nombre, descripcion, precio, requiereReceta, stockInicial })
        });

        if (response.ok) {
            mostrarMensaje(msgEl, `Medicamento creado con ${stockInicial} unidades en stock`, 'success');
            await cargarMedicamentos();
            await cargarInventario();
            limpiarFormularioMedicamento();
        } else {
            let errorMsg = 'Error al crear medicamento';
            try {
                const error = await response.json();
                errorMsg = error.message || errorMsg;
            } catch (_) {}
            mostrarMensaje(msgEl, errorMsg, 'error');
        }
    } catch (e) {
        console.error('Error:', e);
        mostrarMensaje(msgEl, 'Error de conexión al servidor', 'error');
    }
}

async function eliminarMedicamento(id) {
    if (!confirm('¿Seguro que deseas eliminar este medicamento? Esta acción no se puede deshacer.')) return;

    try {
        const response = await fetch(`/api/admin/medicamentos/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            await cargarMedicamentos();
            await cargarInventario();
        } else {
            let errorMsg = 'No se pudo eliminar el medicamento';
            try {
                const error = await response.json();
                errorMsg = error.message || errorMsg;
            } catch (_) {}
            alert('Error: ' + errorMsg);
        }
    } catch (e) {
        console.error('Error:', e);
        alert('Error de conexión al servidor');
    }
}

function limpiarFormularioMedicamento() {
    document.getElementById('medNombre').value = '';
    document.getElementById('medDescripcion').value = '';
    document.getElementById('medPrecio').value = '';
    document.getElementById('medRequiereReceta').value = 'false';
    document.getElementById('medStockInicial').value = '100'; // restaura default
}

// ── Inventario ────────────────────────────────────────────────
// Esta función faltaba — crearMedicamento() y eliminarMedicamento() la llaman
async function cargarInventario() {
    try {
        const response = await fetch('/api/admin/inventario', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        // Si tu backend no tiene esta ruta aún, simplemente no hace nada
        if (!response.ok) return;
        // Puedes usar los datos aquí si tienes un contenedor de inventario en el HTML
        // const inventario = await response.json();
    } catch (e) {
        // Silencioso — inventario es opcional en esta vista
        console.warn('cargarInventario: endpoint no disponible o error de red');
    }
}

// ── Recetas ───────────────────────────────────────────────────
async function cargarRecetas() {
    try {
        const response = await fetch('/api/admin/recetas', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const recetas = await response.json();
        mostrarRecetas(recetas);
        document.getElementById('totalRecetas').innerText = recetas.length;
    } catch (e) {
        console.error('Error cargando recetas:', e);
    }
}

function mostrarRecetas(recetas) {
    const container = document.getElementById('recetasList');
    if (!recetas || recetas.length === 0) {
        container.innerHTML = '<p class="text-empty">No hay recetas</p>';
        return;
    }

    let html = `<table class="data-table">
        <thead>
            <tr>
                <th>ID</th><th>Fecha</th><th>Diagnóstico</th><th>Estado</th><th>Total</th>
            </tr>
        </thead>
        <tbody>`;

    recetas.forEach(r => {
        const estadoMap = {
            'PENDIENTE': 'pill-pendiente',
            'SURTIDA':   'pill-surtida',
            'CANCELADA': 'pill-cancelada'
        };
        const estadoClass = estadoMap[r.estado] || 'pill-info';
        const diagnostico = r.diagnostico
            ? (r.diagnostico.length > 50 ? r.diagnostico.substring(0, 50) + '…' : r.diagnostico)
            : '-';

        html += `<tr>
            <td>${r.idReceta}</td>
            <td>${r.fechaEmision}</td>
            <td>${diagnostico}</td>
            <td><span class="pill ${estadoClass}">${r.estado}</span></td>
            <td>$${parseFloat(r.total || 0).toFixed(2)}</td>
        </tr>`;
    });

    html += `</tbody></table>`;
    container.innerHTML = html;
}

// ── Auditoría ─────────────────────────────────────────────────
let auditoriaCompleta = [];

async function cargarAuditoria() {
    try {
        const response = await fetch('/api/admin/auditoria', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            auditoriaCompleta = await response.json();
            mostrarAuditoria(auditoriaCompleta);
        } else {
            document.getElementById('auditoriaList').innerHTML = '<p class="msg-error">Error al cargar auditoría</p>';
        }
    } catch (e) {
        console.error('Error:', e);
        document.getElementById('auditoriaList').innerHTML = '<p class="msg-error">Error de conexión</p>';
    }
}

function mostrarAuditoria(auditoria) {
    const container = document.getElementById('auditoriaList');
    if (!auditoria || auditoria.length === 0) {
        container.innerHTML = '<p class="text-empty">No hay registros de auditoría</p>';
        return;
    }

    let html = `<table class="data-table">
        <thead>
            <tr>
                <th>ID</th>
                <th>Fecha</th>
                <th>Usuario</th>
                <th>Rol</th>
                <th>Acción</th>
                <th>Detalle</th>
                <th>IP</th>
                <th>Estado</th>
            </tr>
        </thead>
        <tbody>`;

    auditoria.forEach(a => {
        const fecha       = new Date(a.fecha).toLocaleString('es-MX');
        const exitoClass  = a.exitoso ? 'pill-surtida' : 'pill-cancelada';
        const exitoTexto  = a.exitoso ? 'Éxito' : 'Fallo';
        const accionClass = getAccionClass(a.accion);

        html += `<tr>
            <td>${a.idAuditoria}</td>
            <td>${fecha}</td>
            <td><strong>${a.usuarioCorreo || '-'}</strong></td>
            <td>${a.usuarioRol || '-'}</td>
            <td><span class="pill ${accionClass}">${a.accion}</span></td>
            <td>${a.detalle || '-'}</td>
            <td>${a.ip || '-'}</td>
            <td><span class="pill ${exitoClass}">${exitoTexto}</span></td>
        </tr>`;
    });

    html += `</tbody></table>`;
    container.innerHTML = html;
}

function getAccionClass(accion) {
    const mapa = {
        'LOGIN':                  'pill-surtida',
        'LOGIN_FALLIDO':          'pill-cancelada',
        'CREAR_RECETA':           'pill-info',
        'EDITAR_RECETA':          'pill-info',
        'DISPENSAR_RECETA':       'pill-pendiente',
        'CREAR_CITA':             'pill-info',
        'CANCELAR_CITA':          'pill-cancelada',
        'CREAR_USUARIO':          'pill-surtida',
        'ACTUALIZAR_ESTADO_CITA': 'pill-pendiente',
    };
    return mapa[accion] || 'pill-info';
}

function aplicarFiltros() {
    const filtroUsuario = document.getElementById('filtroUsuario').value.toLowerCase().trim();
    const filtroAccion  = document.getElementById('filtroAccion').value;

    let resultados = [...auditoriaCompleta];

    if (filtroUsuario) {
        resultados = resultados.filter(a =>
            a.usuarioCorreo && a.usuarioCorreo.toLowerCase().includes(filtroUsuario)
        );
    }

    if (filtroAccion) {
        resultados = resultados.filter(a => a.accion === filtroAccion);
    }

    mostrarAuditoria(resultados);
}

// ── Utilidad: mostrar mensaje en elemento ─────────────────────
// Reemplaza el uso de style.color inline disperso por todo el código
function mostrarMensaje(elemento, texto, tipo) {
    if (!elemento) return;
    elemento.textContent = texto;
    elemento.className = tipo === 'success' ? 'msg-success' : 'msg-error';
    setTimeout(() => {
        elemento.textContent = '';
        elemento.className = '';
    }, 4000);
}