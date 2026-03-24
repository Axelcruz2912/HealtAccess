// Cargar datos iniciales
async function cargarDatosIniciales() {
    await cargarUsuarios();
    await cargarDoctores();
    await cargarFarmacias();
    await cargarClientes();
    await cargarMedicamentos();
    await cargarRecetas();
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
    let html = `<table><thead><tr><th>ID</th><th>Nombre</th><th>Especialidad</th><th>Cédula</th><th>Teléfono</th></tr></thead><tbody>`;
    doctores.forEach(d => {
        html += `<tr>
            <td>${d.idDoctor}</td>
            <td>${d.usuario?.nombre || '-'} ${d.usuario?.apellido || '-'}</td>
            <td>${d.especialidad}</td>
            <td>${d.cedulaProfesional}</td>
            <td>${d.telefono || '-'}</td>
        </tr>`;
    });
    html += `</tbody></table>`;
    document.getElementById('doctoresList').innerHTML = html || '<p class="text-muted">No hay doctores</p>';
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

// Mostrar medicamentos
function mostrarMedicamentos(medicamentos) {
    let html = `<table><thead><tr><th>ID</th><th>Nombre</th><th>Descripción</th><th>Precio</th><th>Requiere Receta</th><th>Acción</th></tr></thead><tbody>`;
    medicamentos.forEach(m => {
        html += `<tr>
            <td>${m.idMedicamento}</td>
            <td>${m.nombre}</td>
            <td>${m.descripcion || '-'}</td>
            <td>$${m.precio}</td>
            <td>${m.requiereReceta ? 'Sí' : 'No'}</td>
            <td><button class="btn-danger" onclick="eliminarMedicamento(${m.idMedicamento})">Eliminar</button></td>
        </tr>`;
    });
    html += `</tbody></table>`;
    document.getElementById('medicamentosList').innerHTML = html || '<p class="text-muted">No hay medicamentos</p>';
}

// Mostrar recetas
function mostrarRecetas(recetas) {
    let html = `<table><thead><tr><th>ID</th><th>Fecha</th><th>Diagnóstico</th><th>Estado</th><th>Total</th></tr></thead><tbody>`;
    recetas.forEach(r => {
        const estadoClass = r.estado === 'PENDIENTE' ? 'status-pendiente' : (r.estado === 'SURTIDA' ? 'status-surtida' : 'status-cancelada');
        html += `<tr>
            <td>${r.idReceta}</td>
            <td>${r.fechaEmision}</td>
            <td>${r.diagnostico.substring(0, 50)}${r.diagnostico.length > 50 ? '...' : ''}</td>
            <td><span class="${estadoClass}">${r.estado}</span></td>
            <td>$${r.total}</td>
        </tr>`;
    });
    html += `</tbody></table>`;
    document.getElementById('recetasList').innerHTML = html || '<p class="text-muted">No hay recetas</p>';
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

    const usuarioData = { nombre, apellido, correo, password, rol };

    if (rol === 'MEDICO') {
        usuarioData.especialidad = document.getElementById('newEspecialidad').value;
        usuarioData.cedulaProfesional = document.getElementById('newCedula').value;
        usuarioData.aniosExperiencia = parseInt(document.getElementById('newExperiencia').value);
        usuarioData.telefono = document.getElementById('newTelefono').value;
    }

    if (rol === 'FARMACIA') {
        usuarioData.nombreFarmacia = document.getElementById('newNombreFarmacia').value;
        usuarioData.direccionFarmacia = document.getElementById('newDireccionFarmacia').value;
        usuarioData.telefonoFarmacia = document.getElementById('newTelefonoFarmacia').value;
        usuarioData.horarioFarmacia = document.getElementById('newHorarioFarmacia').value;
    }

    const response = await fetch('/api/admin/usuarios', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(usuarioData)
    });

    if (response.ok) {
        document.getElementById('createUserMessage').innerText = ' Usuario creado exitosamente';
        setTimeout(() => document.getElementById('createUserMessage').innerText = '', 3000);
        await cargarUsuarios();
        limpiarFormularioUsuario();
    } else {
        const error = await response.json();
        document.getElementById('createUserMessage').innerText = ' ' + error.message;
        document.getElementById('createUserMessage').style.color = '#ff4757';
        setTimeout(() => {
            document.getElementById('createUserMessage').innerText = '';
            document.getElementById('createUserMessage').style.color = '#28a745';
        }, 3000);
    }
}

// Crear medicamento
async function crearMedicamento() {
    const nombre = document.getElementById('medNombre').value;
    const descripcion = document.getElementById('medDescripcion').value;
    const precio = parseFloat(document.getElementById('medPrecio').value);
    const requiereReceta = document.getElementById('medRequiereReceta').value === 'true';

    const response = await fetch('/api/admin/medicamentos', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ nombre, descripcion, precio, requiereReceta })
    });

    if (response.ok) {
        document.getElementById('createMedMessage').innerText = ' Medicamento creado exitosamente';
        setTimeout(() => document.getElementById('createMedMessage').innerText = '', 3000);
        await cargarMedicamentos();
        limpiarFormularioMedicamento();
    } else {
        const error = await response.json();
        document.getElementById('createMedMessage').innerText = ' ' + error.message;
        document.getElementById('createMedMessage').style.color = '#ff4757';
        setTimeout(() => {
            document.getElementById('createMedMessage').innerText = '';
            document.getElementById('createMedMessage').style.color = '#28a745';
        }, 3000);
    }
}

// Eliminar medicamento
async function eliminarMedicamento(id) {
    if (confirm('¿Estás seguro de eliminar este medicamento?')) {
        const response = await fetch(`/api/admin/medicamentos/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            await cargarMedicamentos();
        } else {
            alert('Error al eliminar medicamento');
        }
    }
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