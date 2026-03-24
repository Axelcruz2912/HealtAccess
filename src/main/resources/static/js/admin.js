// Cargar datos iniciales
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

// Cargar usuarios
async function cargarUsuarios() {
    const response = await fetch('/api/admin/usuarios', {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const usuarios = await response.json();
    mostrarUsuarios(usuarios);
    document.getElementById('totalUsuarios').innerText = usuarios.length;
}

// Cargar doctores
async function cargarDoctores() {
    const response = await fetch('/api/admin/doctores', {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const doctores = await response.json();
    mostrarDoctores(doctores);
    document.getElementById('totalDoctores').innerText = doctores.length;
}

// Cargar farmacias
async function cargarFarmacias() {
    const response = await fetch('/api/admin/farmacias', {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const farmacias = await response.json();
    mostrarFarmacias(farmacias);
}

// Cargar clientes
async function cargarClientes() {
    const response = await fetch('/api/admin/clientes', {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const clientes = await response.json();
    mostrarClientes(clientes);
}



// Cargar medicamentos
async function cargarMedicamentos() {
    const response = await fetch('/api/admin/medicamentos', {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const medicamentos = await response.json();
    mostrarMedicamentos(medicamentos);
    document.getElementById('totalMedicamentos').innerText = medicamentos.length;
}

// Cargar recetas
async function cargarRecetas() {
    const response = await fetch('/api/admin/recetas', {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const recetas = await response.json();
    mostrarRecetas(recetas);
    document.getElementById('totalRecetas').innerText = recetas.length;
}

// Mostrar usuarios en tabla
function mostrarUsuarios(usuarios) {
    let html = ` <table>
        <thead>
            <tr><th>ID</th><th>Nombre</th><th>Correo</th><th>Rol</th><th>Estado</th><th>Acción</th></tr>
        </thead>
        <tbody>`;
    usuarios.forEach(u => {
        html += `<tr>
            <td>${u.idUsuario}</td>
            <td>${u.nombre} ${u.apellido}</td>
            <td>${u.correo}</td>
            <td><span class="status-${u.rol === 'ADMINISTRADOR' ? 'surtida' : 'pendiente'}">${u.rol}</span></td>
            <td>${u.activo ? ' Activo' : ' Inactivo'}</td>
            <td><button class="btn-danger" onclick="cambiarEstadoUsuario(${u.idUsuario}, ${!u.activo})">${u.activo ? 'Desactivar' : 'Activar'}</button></td>
        </tr>`;
    });
    html += `</tbody></table>`;
    document.getElementById('usuariosList').innerHTML = html || '<p class="text-muted">No hay usuarios</p>';
}

// Mostrar doctores
function mostrarDoctores(doctores) {
    const container = document.getElementById('doctoresList');
    if (!doctores || doctores.length === 0) {
        container.innerHTML = '<p class="text-muted">No hay doctores</p>';
        return;
    }

    let html = `<table class="data-table">
        <thead>
            <tr>
                <th>ID</th>
                <th>Nombre Completo</th>
                <th>Correo</th>
                <th>Especialidad</th>
                <th>Cédula</th>
                <th>Teléfono</th>
            \\
        </thead>
        <tbody>`;

    doctores.forEach(d => {
        // Ahora el correo está directamente en Doctor
        const nombreCompleto = `${d.nombre || ''} ${d.apellido || ''}`.trim() || 'Sin nombre';
        const correo = d.correo || 'Sin correo';
        const especialidad = d.especialidad || '-';
        const cedula = d.cedulaProfesional || '-';
        const telefono = d.telefono || '-';

        html += `     <tr>
            <td>${d.idDoctor}</td>
            <td><strong>${nombreCompleto}</strong></td>
            <td>${correo}</td>
            <td>${especialidad}</td>
            <td>${cedula}</td>
            <td>${telefono}</td>
        </tr>`;
    });

    html += `</tbody></table>`;
    container.innerHTML = html;
}
// Mostrar farmacias
function mostrarFarmacias(farmacias) {
    let html = `<table><thead><tr><th>ID</th><th>Nombre</th><th>Dirección</th><th>Teléfono</th><th>Horario</th></tr></thead><tbody>`;
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
    document.getElementById('farmaciasList').innerHTML = html || '<p class="text-muted">No hay farmacias</p>';
}

// Mostrar clientes
function mostrarClientes(clientes) {
    let html = `<table><thead><tr><th>ID</th><th>Nombre</th><th>Teléfono</th><th>Dirección</th><th>Tipo Sangre</th></tr></thead><tbody>`;
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
    document.getElementById('clientesList').innerHTML = html || '<p class="text-muted">No hay clientes</p>';
}

// Mostrar medicamentos (sin stock)
function mostrarMedicamentos(medicamentos) {
    const container = document.getElementById('medicamentosList');
    if (!medicamentos || medicamentos.length === 0) {
        container.innerHTML = '<p class="text-muted">No hay medicamentos</p>';
        return;
    }

    let html = `<table class="data-table">
        <thead>

                <th>ID</th>
                <th>Nombre</th>
                <th>Descripción</th>
                <th>Precio</th>
                <th>Requiere Receta</th>
                <th>Acción</th>
            </thead>
        <tbody>`;

    medicamentos.forEach(m => {
        html += `         <tr>
             <td>${m.idMedicamento}</td>
             <td><strong>${m.nombre}</strong></td>
             <td>${m.descripcion || '-'}</td>
             <td>$${m.precio}</td>
             <td>${m.requiereReceta ? 'Sí' : 'No'}</td>
             <td><button class="btn-danger" onclick="eliminarMedicamento(${m.idMedicamento})">Eliminar</button></td>
         </tr>`;
    });

    html += `</tbody>
     </table>`;
    container.innerHTML = html;
}

// Cambiar estado de usuario
async function cambiarEstadoUsuario(id, activo) {
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
        alert('Error al cambiar estado');
    }
}

// Crear usuario
async function crearUsuario() {
    const nombre = document.getElementById('newNombre').value;
    const apellido = document.getElementById('newApellido').value;
    const correo = document.getElementById('newCorreo').value;
    const password = document.getElementById('newPassword').value;
    const rol = document.getElementById('newRol').value;

    // Validaciones
    if (!nombre || !apellido || !correo || !password) {
        document.getElementById('createUserMessage').innerText = ' Complete todos los campos obligatorios';
        document.getElementById('createUserMessage').style.color = '#ff4757';
        setTimeout(() => document.getElementById('createUserMessage').innerText = '', 3000);
        return;
    }

    const usuarioData = {
        nombre,
        apellido,
        correo,
        password,
        rol
    };

    // Datos específicos para MÉDICO
    if (rol === 'MEDICO') {
        const especialidad = document.getElementById('newEspecialidad').value;
        const cedulaProfesional = document.getElementById('newCedula').value;
        const aniosExperiencia = parseInt(document.getElementById('newExperiencia').value);
        const telefono = document.getElementById('newTelefono').value;

        if (!especialidad || !cedulaProfesional) {
            document.getElementById('createUserMessage').innerText = ' Complete especialidad y cédula profesional';
            document.getElementById('createUserMessage').style.color = '#ff4757';
            setTimeout(() => document.getElementById('createUserMessage').innerText = '', 3000);
            return;
        }

        usuarioData.especialidad = especialidad;
        usuarioData.cedulaProfesional = cedulaProfesional;
        usuarioData.aniosExperiencia = aniosExperiencia || 0;
        usuarioData.telefono = telefono || '';
    }

    // Datos específicos para FARMACIA
    if (rol === 'FARMACIA') {
        const nombreFarmacia = document.getElementById('newNombreFarmacia').value;
        const direccionFarmacia = document.getElementById('newDireccionFarmacia').value;
        const telefonoFarmacia = document.getElementById('newTelefonoFarmacia').value;
        const horarioFarmacia = document.getElementById('newHorarioFarmacia').value;

        if (!nombreFarmacia || !direccionFarmacia) {
            document.getElementById('createUserMessage').innerText = ' Complete nombre y dirección de la farmacia';
            document.getElementById('createUserMessage').style.color = '#ff4757';
            setTimeout(() => document.getElementById('createUserMessage').innerText = '', 3000);
            return;
        }

        usuarioData.nombreFarmacia = nombreFarmacia;
        usuarioData.direccionFarmacia = direccionFarmacia;
        usuarioData.telefonoFarmacia = telefonoFarmacia || '';
        usuarioData.horarioFarmacia = horarioFarmacia || '';
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
            document.getElementById('createUserMessage').innerText = ` Usuario ${data.nombre} ${data.apellido} creado exitosamente`;
            document.getElementById('createUserMessage').style.color = '#28a745';
            setTimeout(() => {
                document.getElementById('createUserMessage').innerText = '';
            }, 3000);

            // Recargar listas
            await cargarUsuarios();
            await cargarDoctores();
            await cargarFarmacias();
            limpiarFormularioUsuario();
        } else {
            const error = await response.json();
            document.getElementById('createUserMessage').innerText = ' ' + (error.message || 'Error al crear usuario');
            document.getElementById('createUserMessage').style.color = '#ff4757';
            setTimeout(() => {
                document.getElementById('createUserMessage').innerText = '';
            }, 3000);
        }
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('createUserMessage').innerText = ' Error de conexión al servidor';
        document.getElementById('createUserMessage').style.color = '#ff4757';
        setTimeout(() => {
            document.getElementById('createUserMessage').innerText = '';
        }, 3000);
    }
}

async function crearMedicamento() {
    const nombre = document.getElementById('medNombre').value;
    const descripcion = document.getElementById('medDescripcion').value;
    const precio = parseFloat(document.getElementById('medPrecio').value);
    const requiereReceta = document.getElementById('medRequiereReceta').value === 'true';
    const stockInicial = parseInt(document.getElementById('medStockInicial').value) || 100;

    if (!nombre || !precio) {
        document.getElementById('createMedMessage').innerText = ' Complete nombre y precio';
        document.getElementById('createMedMessage').style.color = '#ff4757';
        setTimeout(() => document.getElementById('createMedMessage').innerText = '', 3000);
        return;
    }

    try {
        const response = await fetch('/api/admin/medicamentos', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                nombre,
                descripcion,
                precio,
                requiereReceta,
                stockInicial
            })
        });

        if (response.ok) {
            document.getElementById('createMedMessage').innerText = ` Medicamento creado con ${stockInicial} unidades`;
            document.getElementById('createMedMessage').style.color = '#28a745';
            setTimeout(() => document.getElementById('createMedMessage').innerText = '', 3000);
            await cargarMedicamentos();
            await cargarInventario(); // <-- Recargar inventario
            limpiarFormularioMedicamento();
        } else {
            const error = await response.json();
            document.getElementById('createMedMessage').innerText = ' ' + error.message;
            document.getElementById('createMedMessage').style.color = '#ff4757';
            setTimeout(() => document.getElementById('createMedMessage').innerText = '', 3000);
        }
    } catch (error) {
        document.getElementById('createMedMessage').innerText = ' Error de conexión';
        document.getElementById('createMedMessage').style.color = '#ff4757';
        setTimeout(() => document.getElementById('createMedMessage').innerText = '', 3000);
    }
}
// Eliminar medicamento
async function eliminarMedicamento(id) {
    if (confirm('¿Estás seguro de eliminar este medicamento? Esta acción no se puede deshacer.')) {
        try {
            const response = await fetch(`/api/admin/medicamentos/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                alert(' Medicamento eliminado correctamente');
                // Recargar listas
                await cargarMedicamentos();
                await cargarInventario();
            } else {
                const error = await response.json();
                alert(' Error: ' + (error.message || 'No se pudo eliminar el medicamento'));
            }
        } catch (error) {
            console.error('Error:', error);
            alert(' Error de conexión al servidor');
        }
    }
}
// ========== MOSTRAR RECETAS ==========
function mostrarRecetas(recetas) {
    const container = document.getElementById('recetasList');
    if (!recetas || recetas.length === 0) {
        container.innerHTML = '<p class="text-muted">No hay recetas</p>';
        return;
    }

    let html = `<table class="data-table">
        <thead><tr><th>ID</th><th>Fecha</th><th>Diagnóstico</th><th>Estado</th><th>Total</th></tr></thead>
        <tbody>`;
    recetas.forEach(r => {
        const estadoClass = r.estado === 'PENDIENTE' ? 'status-pendiente' : (r.estado === 'SURTIDA' ? 'status-surtida' : 'status-cancelada');
        html += `<tr>
            <td>${r.idReceta}</td>
            <td>${r.fechaEmision}</td>
            <td>${r.diagnostico?.substring(0, 50) || '-'}${r.diagnostico?.length > 50 ? '...' : ''}</td>
            <td><span class="${estadoClass}">${r.estado}</span></td>
            <td>$${r.total}</td>
        </tr>`;
    });
    html += `</tbody></table>`;
    container.innerHTML = html;
}
// Mostrar/ocultar campos según rol
document.addEventListener('DOMContentLoaded', () => {
    const rolSelect = document.getElementById('newRol');
    if (rolSelect) {
        rolSelect.addEventListener('change', (e) => {
            const medicoFields = document.getElementById('medicoFields');
            const farmaciaFields = document.getElementById('farmaciaFields');

            if (e.target.value === 'MEDICO') {
                medicoFields.style.display = 'block';
                farmaciaFields.style.display = 'none';
            } else if (e.target.value === 'FARMACIA') {
                medicoFields.style.display = 'none';
                farmaciaFields.style.display = 'block';
            } else {
                medicoFields.style.display = 'none';
                farmaciaFields.style.display = 'none';
            }
        });
    }
});
// ========== CARGAR AUDITORÍA ==========
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
            document.getElementById('auditoriaList').innerHTML = '<p class="error">Error al cargar auditoría</p>';
        }
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('auditoriaList').innerHTML = '<p class="error">Error de conexión</p>';
    }
}

// ========== MOSTRAR AUDITORÍA ==========
function mostrarAuditoria(auditoria) {
    const container = document.getElementById('auditoriaList');
    if (!auditoria || auditoria.length === 0) {
        container.innerHTML = '<p class="text-muted">No hay registros de auditoría</p>';
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
            </thead>
        <tbody>`;

    auditoria.forEach(a => {
        const fecha = new Date(a.fecha).toLocaleString('es-MX');
        const accionClass = getAccionClass(a.accion);
        const estadoClass = a.exitoso ? 'status-surtida' : 'status-cancelada';
        const estadoTexto = a.exitoso ? 'Éxito' : ' Fallo';

        html += `         <tr>
            <td>${a.idAuditoria}</td>
            <td>${fecha}</td>
            <td><strong>${a.usuarioCorreo || '-'}</strong></td>
            <td>${a.usuarioRol || '-'}</td>
            <td><span class="${accionClass}">${a.accion}</span></td>
            <td>${a.detalle || '-'}</td>
            <td>${a.ip || '-'}</td>
            <td><span class="${estadoClass}">${estadoTexto}</span></td>
        </tr>`;
    });

    html += `</tbody>
    </table>`;
    container.innerHTML = html;
}

// ========== OBTENER CLASE SEGÚN ACCIÓN ==========
function getAccionClass(accion) {
    switch(accion) {
        case 'LOGIN':
            return 'accion-login';
        case 'LOGIN_FALLIDO':
            return 'accion-login-fallido';
        case 'CREAR_RECETA':
            return 'accion-crear-receta';
        case 'DISPENSAR_RECETA':
            return 'accion-dispensar-receta';
        case 'CREAR_CITA':
            return 'accion-crear-cita';
        default:
            return 'accion-other';
    }
}

// ========== APLICAR FILTROS ==========
function aplicarFiltros() {
    const filtroUsuario = document.getElementById('filtroUsuario').value.toLowerCase();
    const filtroAccion = document.getElementById('filtroAccion').value;

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

// ========== ACTUALIZAR cargarDatosIniciales ==========
async function cargarDatosIniciales() {
    await cargarUsuarios();
    await cargarDoctores();
    await cargarFarmacias();
    await cargarClientes();
    await cargarMedicamentos();
    await cargarRecetas();
    await cargarAuditoria();  // <-- Agregar auditoría
}

function limpiarFormularioUsuario() {
    document.getElementById('newNombre').value = '';
    document.getElementById('newApellido').value = '';
    document.getElementById('newCorreo').value = '';
    document.getElementById('newPassword').value = '';
    document.getElementById('newEspecialidad').value = '';
    document.getElementById('newCedula').value = '';
    document.getElementById('newExperiencia').value = '';
    document.getElementById('newTelefono').value = '';
    document.getElementById('newNombreFarmacia').value = '';
    document.getElementById('newDireccionFarmacia').value = '';
    document.getElementById('newTelefonoFarmacia').value = '';
    document.getElementById('newHorarioFarmacia').value = '';
}

function limpiarFormularioMedicamento() {
    document.getElementById('medNombre').value = '';
    document.getElementById('medDescripcion').value = '';
    document.getElementById('medPrecio').value = '';
    document.getElementById('medRequiereReceta').value = 'false';
}