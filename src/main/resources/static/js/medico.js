let medicamentosGlobal = [];
let citasGlobal = [];

// Cargar datos iniciales
async function cargarDatosIniciales() {
    console.log('Cargando datos iniciales...');
    await cargarMedicamentos();
    await cargarRecetas();
    await cargarCitas();
    await cargarClientes();

    // Configurar fecha mínima para el input de fecha
    const fechaInput = document.getElementById('citaFecha');
    if (fechaInput) {
        fechaInput.min = new Date().toISOString().split('T')[0];
    }

    // Configurar el select de citas
    configurarSelectCitas();
}

// ========== CONFIGURAR SELECT DE CITAS ==========
function configurarSelectCitas() {
    const selectCitas = document.getElementById('recetaCitaId');
    if (!selectCitas) return;

    // Convertir input text a select
    const parent = selectCitas.parentElement;
    const newSelect = document.createElement('select');
    newSelect.id = 'recetaCitaId';
    newSelect.className = 'citas-select';
    newSelect.innerHTML = '<option value="">-- Seleccione una cita --</option>';

    // Reemplazar input con select
    parent.replaceChild(newSelect, selectCitas);

    // Cargar citas en el select
    cargarCitasEnSelect();
}

async function cargarCitasEnSelect() {
    try {
        const response = await fetch('/api/medico/citas', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            citasGlobal = await response.json();
            const select = document.getElementById('recetaCitaId');
            if (!select) return;

            // Filtrar solo citas PROGRAMADAS (sin receta aún)
            const citasDisponibles = citasGlobal.filter(cita =>
                cita.estado === 'PROGRAMADA' && !cita.receta
            );

            select.innerHTML = '<option value="">-- Seleccione una cita --</option>';

            citasDisponibles.forEach(cita => {
                const option = document.createElement('option');
                option.value = cita.idCita;
                option.textContent = `Cita #${cita.idCita} - ${cita.fecha} ${cita.hora} - ${cita.cliente?.nombre || 'Paciente'} ${cita.cliente?.apellido || ''}`;
                option.setAttribute('data-cliente', `${cita.cliente?.nombre} ${cita.cliente?.apellido}`);
                option.setAttribute('data-fecha', cita.fecha);
                option.setAttribute('data-hora', cita.hora);
                select.appendChild(option);
            });

            select.onchange = function() {
                const selectedOption = this.options[this.selectedIndex];
                const infoCita = document.getElementById('infoCitaSeleccionada');
                if (infoCita && selectedOption.value) {
                    infoCita.innerHTML = `
                        <div class="cita-info">
                            <strong>Paciente:</strong> ${selectedOption.getAttribute('data-cliente')}<br>
                            <strong>Fecha:</strong> ${selectedOption.getAttribute('data-fecha')}<br>
                            <strong>Hora:</strong> ${selectedOption.getAttribute('data-hora')}
                        </div>
                    `;
                } else if (infoCita) {
                    infoCita.innerHTML = '';
                }
            };
        }
    } catch (error) {
        console.error('Error al cargar citas para select:', error);
    }
}

// ========== CARGAR MEDICAMENTOS ==========
async function cargarMedicamentos() {
    try {
        console.log('Intentando cargar medicamentos...');
        const response = await fetch('/api/public/medicamentos-con-stock');
        console.log('Respuesta status:', response.status);

        if (response.ok) {
            const data = await response.json();
            console.log('Medicamentos recibidos:', data);
            console.log('Cantidad de medicamentos:', data.length);

            if (data && data.length > 0) {
                medicamentosGlobal = data;
                cargarSelectMedicamentos();
            } else {
                console.log('No hay medicamentos en la respuesta');
                mostrarErrorMedicamentos('No hay medicamentos disponibles en la base de datos');
            }
        } else {
            console.error('Error en respuesta:', response.status);
            mostrarErrorMedicamentos(`Error al cargar medicamentos: ${response.status}`);
        }
    } catch (error) {
        console.error('Error de conexión:', error);
        mostrarErrorMedicamentos('Error de conexión al servidor');
    }
}

function mostrarErrorMedicamentos(mensaje) {
    const select = document.getElementById('selectMedicamento');
    if (select) {
        select.innerHTML = `<option value="">${mensaje}</option>`;
    }
    const stockInfo = document.getElementById('stockInfo');
    if (stockInfo) {
        stockInfo.innerHTML = `<span class="error">${mensaje}</span>`;
    }
}

// ========== CARGAR SELECT DE MEDICAMENTOS ==========
function cargarSelectMedicamentos() {
    const select = document.getElementById('selectMedicamento');
    if (!select) {
        console.error('Elemento select no encontrado!');
        return;
    }

    console.log('Cargando select con', medicamentosGlobal.length, 'medicamentos');

    select.innerHTML = '<option value="">-- Seleccione un medicamento --</option>';

    if (!medicamentosGlobal || medicamentosGlobal.length === 0) {
        select.innerHTML += '<option disabled>No hay medicamentos disponibles</option>';
        return;
    }

    medicamentosGlobal.forEach(med => {
        const stock = med.stock || 0;
        const option = document.createElement('option');
        option.value = med.idMedicamento;
        option.textContent = `${med.nombre} - Stock: ${stock} unidades - $${med.precio}`;
        option.setAttribute('data-stock', stock);
        option.setAttribute('data-precio', med.precio);
        select.appendChild(option);
    });

    console.log('Select cargado correctamente');

    select.onchange = function() {
        const selectedOption = this.options[this.selectedIndex];
        const stock = parseInt(selectedOption.getAttribute('data-stock') || 0);
        const medicamentoId = this.value;
        const stockInfo = document.getElementById('stockInfo');

        if (stockInfo) {
            if (medicamentoId && stock > 0) {
                stockInfo.innerHTML = `<span class="success-message"> Stock disponible: ${stock} unidades</span>`;
            } else if (medicamentoId && stock <= 0) {
                stockInfo.innerHTML = `<span class="error"> Medicamento sin stock disponible</span>`;
            } else {
                stockInfo.innerHTML = '';
            }
        }
    };
}

// ========== AGREGAR MEDICAMENTO ==========
function agregarMedicamentoDesdeSelect() {
    const select = document.getElementById('selectMedicamento');
    const cantidad = document.getElementById('selectCantidad').value;
    const indicaciones = document.getElementById('selectIndicaciones').value;

    if (!select) {
        alert('Error: No se encuentra el selector de medicamentos');
        return;
    }

    const selectedOption = select.options[select.selectedIndex];
    const medicamentoId = select.value;
    const medicamentoNombre = selectedOption.textContent.split(' -')[0];
    const stockDisponible = parseInt(selectedOption.getAttribute('data-stock') || 0);
    const precio = parseFloat(selectedOption.getAttribute('data-precio') || 0);

    if (!medicamentoId) {
        alert('Seleccione un medicamento');
        return;
    }

    if (!cantidad || cantidad <= 0) {
        alert('Ingrese una cantidad válida');
        return;
    }

    if (parseInt(cantidad) > stockDisponible) {
        alert(`Stock insuficiente. Solo hay ${stockDisponible} unidades disponibles.`);
        return;
    }

    const itemsExistentes = document.querySelectorAll('.med-item');
    for (let item of itemsExistentes) {
        if (item.getAttribute('data-id') === medicamentoId) {
            alert('Este medicamento ya fue agregado');
            return;
        }
    }

    const container = document.getElementById('medicamentosLista');
    if (!container) {
        console.error('Contenedor de medicamentos no encontrado');
        return;
    }

    const newItem = document.createElement('div');
    newItem.className = 'med-item';
    newItem.setAttribute('data-id', medicamentoId);
    newItem.setAttribute('data-precio', precio);
    newItem.innerHTML = `
        <span class="med-nombre">${medicamentoNombre}</span>
        <span class="med-cantidad">Cantidad: ${cantidad}</span>
        <span class="med-indicaciones">${indicaciones || 'Sin indicaciones'}</span>
        <span class="med-subtotal">Subtotal: $${(precio * parseInt(cantidad)).toFixed(2)}</span>
        <button type="button" class="btn-remove" onclick="removeMedicamento(this)">✖</button>
        <input type="hidden" class="medId" value="${medicamentoId}">
        <input type="hidden" class="medCantidad" value="${cantidad}">
        <input type="hidden" class="medIndicaciones" value="${indicaciones}">
        <input type="hidden" class="medPrecio" value="${precio}">
    `;
    container.appendChild(newItem);

    select.value = '';
    document.getElementById('selectCantidad').value = '';
    document.getElementById('selectIndicaciones').value = '';
    const stockInfo = document.getElementById('stockInfo');
    if (stockInfo) stockInfo.innerHTML = '';
}

function removeMedicamento(button) {
    button.parentElement.remove();
}

// ========== RECETAS ==========
async function cargarRecetas() {
    try {
        const response = await fetch('/api/medico/recetas', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            const recetas = await response.json();
            mostrarRecetas(recetas);
            document.getElementById('totalRecetas').innerText = recetas.length;
        } else {
            document.getElementById('recetasList').innerHTML = '<p class="error">Error al cargar recetas</p>';
        }
    } catch (error) {
        document.getElementById('recetasList').innerHTML = '<p class="error">Error de conexión</p>';
    }
}

// ========== CITAS ==========
async function cargarCitas() {
    try {
        const response = await fetch('/api/medico/citas', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            const citas = await response.json();

            // Si los clientes no vienen, hacer una segunda llamada para obtenerlos
            if (citas.length > 0 && !citas[0].cliente) {
                const clientesResponse = await fetch('/api/medico/clientes', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (clientesResponse.ok) {
                    const clientes = await clientesResponse.json();
                    const clientesMap = {};
                    clientes.forEach(c => clientesMap[c.idCliente] = c);

                    citas.forEach(cita => {
                        if (cita.idCliente && clientesMap[cita.idCliente]) {
                            cita.cliente = clientesMap[cita.idCliente];
                        }
                    });
                }
            }

            mostrarCitas(citas);
            document.getElementById('totalCitas').innerText = citas.filter(c => c.estado === 'PROGRAMADA').length;

            const pacientesUnicos = [...new Set(citas.map(c => c.cliente?.idCliente))];
            document.getElementById('totalPacientes').innerText = pacientesUnicos.length;
        } else {
            document.getElementById('citasList').innerHTML = '<p class="error">Error al cargar citas</p>';
        }
    } catch (error) {
        document.getElementById('citasList').innerHTML = '<p class="error">Error de conexión</p>';
    }
}

// ========== CREAR RECETA ==========
async function crearReceta() {
    const idCitaSelect = document.getElementById('recetaCitaId');
    const idCita = idCitaSelect ? idCitaSelect.value : document.getElementById('recetaCitaId').value;
    const diagnostico = document.getElementById('recetaDiagnostico').value;

    if (!idCita || !diagnostico) {
        mostrarMensaje('createRecetaMessage', 'Por favor seleccione una cita y complete el diagnóstico', 'error');
        return;
    }

    const medicamentos = [];
    const items = document.querySelectorAll('.med-item');

    for (let item of items) {
        const idMed = item.querySelector('.medId').value;
        const cantidad = item.querySelector('.medCantidad').value;
        const indicaciones = item.querySelector('.medIndicaciones').value;

        if (idMed && cantidad) {
            medicamentos.push({
                idMedicamento: parseInt(idMed),
                cantidad: parseInt(cantidad),
                indicaciones: indicaciones || ''
            });
        }
    }

    if (medicamentos.length === 0) {
        mostrarMensaje('createRecetaMessage', 'Agregue al menos un medicamento', 'error');
        return;
    }

    const request = {
        idCita: parseInt(idCita),
        diagnostico: diagnostico,
        fechaEmision: new Date().toISOString().split('T')[0],
        detalles: medicamentos
    };

    try {
        const response = await fetch('/api/medico/recetas', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(request)
        });

        if (response.ok) {
            mostrarMensaje('createRecetaMessage', ' Receta creada exitosamente', 'success');

            // Limpiar formulario
            if (idCitaSelect) idCitaSelect.value = '';
            document.getElementById('recetaDiagnostico').value = '';
            document.getElementById('medicamentosLista').innerHTML = '';

            // Recargar datos
            await cargarRecetas();
            await cargarMedicamentos();
            await cargarCitas();

            // Mostrar mensaje adicional
            mostrarMensaje('createRecetaMessage', ' Receta creada. La cita ya no estará disponible para nuevas recetas', 'success');
        } else {
            const error = await response.json();
            mostrarMensaje('createRecetaMessage', ' ' + error.message, 'error');
        }
    } catch (error) {
        mostrarMensaje('createRecetaMessage', ' Error de conexión', 'error');
    }
}

// ========== MOSTRAR CITAS (con botón deshabilitado si ya tiene receta) ==========
function mostrarCitas(citas) {
    const container = document.getElementById('citasList');
    // Filtrar solo citas PROGRAMADAS (no atendidas ni canceladas)
    const citasProgramadas = citas.filter(c => c.estado === 'PROGRAMADA');

    if (!citasProgramadas || citasProgramadas.length === 0) {
        container.innerHTML = '<p class="text-muted">No tienes citas programadas</p>';
        return;
    }

    let html = `<table class="data-table"><thead> <tr> <th>ID</th> <th>Fecha</th> <th>Hora</th> <th>Paciente</th> <th>Motivo</th> <th>Estado</th> <th>Acción</th> </tr> </thead> <tbody>`;

    citasProgramadas.forEach(cita => {
        // Verificar si la cita ya tiene receta
        const tieneReceta = cita.receta !== null;

        html += ` <tr>
            <td>${cita.idCita}</td>
            <td>${cita.fecha}</td>
            <td>${cita.hora}</td>
            <td>${cita.cliente?.nombre || '-'} ${cita.cliente?.apellido || ''}</td>
            <td>${cita.motivo || '-'}</td>
            <td><span class="status-pendiente">${cita.estado}</span></td>
            <td>
                <button class="btn-primary" onclick="crearRecetaDesdeCita(${cita.idCita})" ${tieneReceta ? 'disabled style="opacity:0.5;"' : ''}>
                    ${tieneReceta ? '✓ Receta Creada' : 'Crear Receta'}
                </button>
            </td>
        </tr>`;
    });

    html += `</tbody> </table>`;
    container.innerHTML = html;

    // Actualizar contador de citas programadas
    document.getElementById('totalCitas').innerText = citasProgramadas.length;
}

function verDetalleReceta(id) {
    const row = document.getElementById(`detalle-${id}`);
    if (row) {
        row.style.display = row.style.display === 'none' ? 'table-row' : 'none';
    }
}

function crearRecetaDesdeCita(idCita) {
    const selectCitas = document.getElementById('recetaCitaId');
    if (selectCitas) {
        selectCitas.value = idCita;
        // Disparar evento change para mostrar información
        const event = new Event('change');
        selectCitas.dispatchEvent(event);
    }
    document.getElementById('recetaDiagnostico').focus();
}

function mostrarMensaje(elementId, mensaje, tipo) {
    const element = document.getElementById(elementId);
    element.innerText = mensaje;
    element.style.color = tipo === 'error' ? '#ff4757' : '#28a745';
    setTimeout(() => {
        element.innerText = '';
    }, 3000);
}

// ========== CARGAR CLIENTES PARA CITAS ==========
async function cargarClientes() {
    try {
        const response = await fetch('/api/medico/clientes', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            const clientes = await response.json();
            cargarSelectClientes(clientes);
        } else {
            console.error('Error al cargar clientes');
        }
    } catch (error) {
        console.error('Error de conexión:', error);
    }
}

function cargarSelectClientes(clientes) {
    const select = document.getElementById('citaClienteId');
    if (!select) return;

    select.innerHTML = '<option value="">-- Seleccione un paciente --</option>';

    clientes.forEach(cliente => {
        const option = document.createElement('option');
        option.value = cliente.idCliente;
        option.textContent = `${cliente.nombre} ${cliente.apellido} - ${cliente.telefono || 'Sin teléfono'}`;
        select.appendChild(option);
    });
}

// ========== CREAR CITA ==========
async function crearCita() {
    const idCliente = document.getElementById('citaClienteId').value;
    const fecha = document.getElementById('citaFecha').value;
    const hora = document.getElementById('citaHora').value;
    const motivo = document.getElementById('citaMotivo').value;

    if (!idCliente || !fecha || !hora) {
        mostrarMensaje('createCitaMessage', 'Por favor complete todos los campos obligatorios', 'error');
        return;
    }

    const request = {
        idCliente: parseInt(idCliente),
        fecha: fecha,
        hora: hora,
        motivo: motivo || ''
    };

    try {
        const response = await fetch('/api/medico/citas', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(request)
        });

        if (response.ok) {
            const cita = await response.json();
            mostrarMensaje('createCitaMessage', ` Cita creada exitosamente para el ${cita.fecha} a las ${cita.hora}`, 'success');

            // Limpiar formulario
            document.getElementById('citaClienteId').value = '';
            document.getElementById('citaFecha').value = '';
            document.getElementById('citaHora').value = '';
            document.getElementById('citaMotivo').value = '';

            // Recargar citas
            await cargarCitas();
        } else {
            const error = await response.json();
            mostrarMensaje('createCitaMessage', ' ' + error.message, 'error');
        }
    } catch (error) {
        mostrarMensaje('createCitaMessage', ' Error de conexión', 'error');
    }
}

// ========== FUNCIONES DE RENDERIZADO ==========
function mostrarRecetas(recetas) {
    const container = document.getElementById('recetasList');
    if (!recetas || recetas.length === 0) {
        container.innerHTML = '<p class="text-muted">No tienes recetas registradas</p>';
        return;
    }

    let html = `<table class="data-table"><thead><tr><th>ID</th><th>Fecha</th><th>Diagnóstico</th><th>Estado</th><th>Total</th><th>Acciones</th></tr></thead><tbody>`;

    recetas.forEach(receta => {
        const estadoClass = receta.estado === 'PENDIENTE' ? 'status-pendiente' :
                           (receta.estado === 'SURTIDA' ? 'status-surtida' : 'status-cancelada');

        html += `<tr>
            <td>${receta.idReceta}</td>
            <td>${receta.fechaEmision}</td>
            <td>${receta.diagnostico?.substring(0, 50) || '-'}${receta.diagnostico?.length > 50 ? '...' : ''}</td>
            <td><span class="${estadoClass}">${receta.estado}</span></td>
            <td>$${receta.total}</td>
            <td><button class="btn-secondary" onclick="verDetalleReceta(${receta.idReceta})">Ver Detalle</button></td>
        </tr>`;

        if (receta.detalles && receta.detalles.length > 0) {
            html += `<tr id="detalle-${receta.idReceta}" style="display: none;">
                <td colspan="6"><div class="detalle-receta"><strong>Medicamentos:</strong><table style="margin-top: 10px;"><thead><tr><th>Medicamento</th><th>Cantidad</th><th>Indicaciones</th><th>Subtotal</th></tr></thead><tbody>`;
            receta.detalles.forEach(d => {
                html += `<tr><td>${d.medicamentoNombre}</td><td>${d.cantidad}</td><td>${d.indicaciones || '-'}</td><td>$${d.subtotal}</td></tr>`;
            });
            html += `</tbody></table></div></td></tr>`;
        }
    });

    html += `</tbody></table>`;
    container.innerHTML = html;
}

// Inicializar
document.addEventListener('DOMContentLoaded', () => {
    cargarDatosIniciales();
});