/* ========================================================
   DASHBOARD ADMIN - LÓGICA CRUD, CONTABILIDAD Y ALERTAS
   ======================================================== */
const API_URL = 'http://localhost:3000/api';

document.addEventListener('DOMContentLoaded', async function() {
    const isAuthorized = await protectRoute('admin');
    if (!isAuthorized) return;
    
    loadUsers(); 
    setupLogout();

    const form = document.getElementById('userForm');
    if (form) {
        form.addEventListener('submit', handleUserSubmit);
    }

    const btnCrear = document.getElementById('crearUsuario');
    if (btnCrear) {
        btnCrear.addEventListener('click', function(e) {
            e.preventDefault();
            const container = document.getElementById('userFormContainer');
            const formElement = document.getElementById('userForm');
            
            formElement.reset();
            document.getElementById('userId').value = ''; 
            document.getElementById('formTitle').textContent = 'Crear Nuevo Usuario';
            container.style.display = 'block';
        });
    }
});

async function protectRoute(requiredRole) {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    if (!token || !user || user.role !== requiredRole) {
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

// --- CRUD: LEER Y CONTABILIZAR ---
async function loadUsers() {
    const token = localStorage.getItem('token');
    const tbody = document.getElementById('usuariosTabla');
    
    try {
        const response = await fetch(`${API_URL}/users`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const usersRaw = await response.json();
        const users = Array.isArray(usersRaw) ? usersRaw : (usersRaw.users || usersRaw.data || []);
        
        if (tbody) {
            tbody.innerHTML = users.map(user => `
                <tr>
                    <td>#${user.id}</td>
                    <td>${user.full_name}</td>
                    <td>${user.email}</td>
                    <td><span class="badge ${getRoleBadge(user.role)}">${user.role}</span></td>
                    <td>${formatDate(user.created_at || user.createdAt)}</td>
                    <td>
                        <button class="btn btn-warning btn-sm" onclick="prepareEdit('${user.id}', '${user.full_name}', '${user.email}', '${user.role}', '${user.edad || ''}', '${user.peso || ''}')">✏️</button>
                        <button class="btn btn-danger btn-sm" onclick="deleteUser('${user.id}')">🗑️</button>
                    </td>
                </tr>
            `).join('');
        }

        // Actualización de contadores
        if(document.getElementById('totalUsuarios')) document.getElementById('totalUsuarios').textContent = users.length;
        if(document.getElementById('totalCoaches')) document.getElementById('totalCoaches').textContent = users.filter(u => u.role === 'coach').length;
        
    } catch (err) {
        console.error("Error de conexión:", err);
    }
}

// --- CRUD: GUARDAR (CREAR O ACTUALIZAR) ---
async function handleUserSubmit(e) {
    e.preventDefault();
    document.querySelectorAll('.error-msg').forEach(el => el.remove());
    
    const userId = document.getElementById('userId').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (password && password !== confirmPassword) {
        mostrarError('confirmPassword', 'Las contraseñas no coinciden');
        return;
    }

    const payload = {
        full_name: document.getElementById('nombre').value,
        email: document.getElementById('email').value,
        role: document.getElementById('role').value,
        password: password,
        edad: document.getElementById('edad').value,
        peso: document.getElementById('peso').value
    };

    try {
        const response = await fetch(userId ? `${API_URL}/users/${userId}` : `${API_URL}/users`, {
            method: userId ? 'PUT' : 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}` 
            },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            document.getElementById('userFormContainer').style.display = 'none';
            document.getElementById('userForm').reset();
            
            // MENSAJE DE ÉXITO
            alert("Usuario guardado exitosamente");
            
            await loadUsers();
        } else {
            const data = await response.json();
            mostrarError('formTitle', data.message || 'Error al guardar');
        }
    } catch (err) {
        mostrarError('formTitle', 'Error de conexión con el servidor');
    }
}

// --- PREPARAR EDICIÓN ---
window.prepareEdit = function(id, name, email, role, edad, peso) {
    document.getElementById('userId').value = id;
    document.getElementById('nombre').value = name;
    document.getElementById('email').value = email;
    document.getElementById('role').value = role;
    document.getElementById('edad').value = (edad === 'undefined') ? '' : edad;
    document.getElementById('peso').value = (peso === 'undefined') ? '' : peso;
    
    // MENSAJE DE EDICIÓN
    document.getElementById('formTitle').textContent = 'Ingrese los nuevos datos';
    document.getElementById('userFormContainer').style.display = 'block';
};

// --- ELIMINAR ---
window.deleteUser = async function(id) {
    if (!confirm('¿Eliminar este usuario?')) return;
    
    try {
        const response = await fetch(`${API_URL}/users/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        
        if (response.ok) {
            alert("Usuario eliminado correctamente");
            await loadUsers(); // Esto actualiza la lista y el contador automáticamente
        } else {
            alert("Error al eliminar el usuario");
        }
    } catch (err) {
        console.error("Error al eliminar:", err);
    }
};

// --- UTILIDADES ---
function mostrarError(elementId, mensaje) {
    const el = document.getElementById(elementId);
    const error = document.createElement('div');
    error.className = 'error-msg';
    error.style.color = 'red';
    error.textContent = mensaje;
    el.parentNode.appendChild(error);
}

function getRoleBadge(role) {
    const badges = { 'admin': 'bg-danger', 'coach': 'bg-primary', 'user': 'bg-success' };
    return badges[role] || 'bg-secondary';
}

function formatDate(dateString) {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('es-CL');
}

function setupLogout() {
    document.querySelector('.btn-logout')?.addEventListener('click', () => {
        localStorage.clear();
        window.location.href = '../index.html';
    });
}