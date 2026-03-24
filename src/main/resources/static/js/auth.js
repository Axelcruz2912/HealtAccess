let token = null;
let usuario = null;

async function login() {
    const correo = document.getElementById('correo').value;
    const password = document.getElementById('password').value;

    if (!correo || !password) {
        const errorDiv = document.getElementById('loginError');
        if (errorDiv) errorDiv.innerText = 'Por favor ingrese correo y contraseña';
        return;
    }

    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ correo, password })
        });

        if (response.ok) {
            const data = await response.json();
            token = data.token;
            usuario = data;

            localStorage.setItem('token', token);
            localStorage.setItem('usuario', JSON.stringify(usuario));

            console.log('Login exitoso:', usuario);

            // Redirigir según el rol
            if (usuario.rol === 'ADMINISTRADOR') {
                window.location.replace('/admin/index.html');
            } else if (usuario.rol === 'MEDICO') {
                window.location.replace('/medico/index.html');
            } else if (usuario.rol === 'FARMACIA') {
                window.location.replace('/farmacia/index.html');
            } else {
                window.location.replace('/index.html');
            }
        } else {
            const error = await response.json();
            const errorDiv = document.getElementById('loginError');
            if (errorDiv) errorDiv.innerText = error.message || 'Credenciales inválidas';
        }
    } catch (error) {
        console.error('Error:', error);
        const errorDiv = document.getElementById('loginError');
        if (errorDiv) errorDiv.innerText = 'Error de conexión al servidor';
    }
}

function logout() {
    // Limpiar localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    token = null;
    usuario = null;

    // Redirigir al login principal
    window.location.replace('/index.html');
}

// Verificar sesión en páginas internas (admin, medico, farmacia)
function checkSession() {
    const savedToken = localStorage.getItem('token');
    const savedUsuario = localStorage.getItem('usuario');
    const currentPath = window.location.pathname;

    console.log('Checking session:', { savedToken: !!savedToken, currentPath });

    // Si es la página de login (index.html), no hacer nada, mostrar login
    if (currentPath === '/' || currentPath === '/index.html') {
        // Asegurarse de que se vea el login
        const loginForm = document.getElementById('loginForm');
        const dashboard = document.getElementById('dashboard');
        if (loginForm) loginForm.style.display = 'block';
        if (dashboard) dashboard.style.display = 'none';
        return;
    }

    // Para páginas internas, verificar sesión
    if (!savedToken || !savedUsuario) {
        console.log('No hay sesión, redirigiendo a login');
        window.location.replace('/index.html');
        return;
    }

    token = savedToken;
    usuario = JSON.parse(savedUsuario);

    // Verificar que el rol coincide con la página actual
    if (usuario.rol === 'ADMINISTRADOR' && !currentPath.includes('/admin/')) {
        window.location.replace('/admin/index.html');
    } else if (usuario.rol === 'MEDICO' && !currentPath.includes('/medico/')) {
        window.location.replace('/medico/index.html');
    } else if (usuario.rol === 'FARMACIA' && !currentPath.includes('/farmacia/')) {
        window.location.replace('/farmacia/index.html');
    } else {
        // Mostrar información del usuario
        const userNameSpan = document.getElementById('userName');
        const userRoleSpan = document.getElementById('userRole');

        if (userNameSpan) userNameSpan.innerText = `${usuario.nombre} ${usuario.apellido}`;
        if (userRoleSpan) userRoleSpan.innerText = usuario.rol;
    }
}

// Ejecutar al cargar la página
document.addEventListener('DOMContentLoaded', checkSession);