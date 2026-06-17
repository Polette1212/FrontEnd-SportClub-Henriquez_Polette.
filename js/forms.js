const API_BASE_URL = 'http://localhost:3000';

document.addEventListener('DOMContentLoaded', function() {
    setupQuickAccessButtons();
});

// ========================================================
// LOGIN
// ========================================================
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value.trim();
        const emailError = document.getElementById('emailError');
        const passwordError = document.getElementById('passwordError');
        const loginErrorGeneral = document.getElementById("loginErrorGeneral") || passwordError;
        const message = document.getElementById('message') || loginErrorGeneral;
        
        let isValid = true;
        
        if (emailError) emailError.textContent = '';
        if (passwordError) passwordError.textContent = '';
        if (loginErrorGeneral) loginErrorGeneral.textContent = '';
        
        if (!email) {
            if (emailError) emailError.textContent = 'El email es obligatorio';
            isValid = false;
        } else if (!isValidEmail(email)) {
            if (emailError) emailError.textContent = 'Email inválido';
            isValid = false;
        }
        
        if (!password) {
            if (passwordError) passwordError.textContent = 'La contraseña es requerida';
            isValid = false;
        } else if (password.length < 8) {
            if (passwordError) passwordError.textContent = 'Contraseña mínima 8 caracteres';
            isValid = false;
        }
        
        if (isValid) {
            await loginUser(email, password, message, loginErrorGeneral);
        }
    });
}

// ========================================================
// AUTENTICACIÓN Y REDIRECCIÓN DE ROLES 
// ========================================================
async function loginUser(email, password, messageElement, errorElement) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Credenciales incorrectas');
        }
        
        const userData = data.user || (data.data && data.data.user) || data.data || data;
        let finalRole = userData.role || data.role || 'user';
        
        if (finalRole.toLowerCase() === 'usuario') {
            finalRole = 'user';
        }
        
        const sessionUser = {
            id: userData.id,
            email: userData.email || email,
            role: finalRole,
            fullName: userData.full_name || userData.fullName || userData.nombre || 'Usuario',
            favorite_sport: userData.favorite_sport || userData.favoriteSport || userData.deporte || '',
            fecha_nacimiento: userData.fecha_nacimiento || userData.fechaNacimiento || '',
            user: userData
        };
            
        localStorage.setItem('token', data.token || data.accessToken || (data.data && data.data.token));
        localStorage.setItem('user', JSON.stringify(sessionUser));

        if (messageElement) {
            messageElement.innerHTML = '<span class="text-success" style="color: #2ecc71; font-weight: bold;">¡Inicio de sesión exitoso! Redirigiendo...</span>';
        }
        
        setTimeout(() => {
            const role = sessionUser.role.toLowerCase();
            if (role === 'admin') {
                window.location.href = 'dashboard-admin.html';
            } else if (role === 'coach') {
                window.location.href = 'dashboard-coach.html';
            } else {
                window.location.href = 'dashboard-usuario.html';
            }
        }, 1500);
    }
    catch (error) {
        console.error('Error:', error);
        if (errorElement) {
            // MENSAJE MODIFICADO
            errorElement.textContent = 'Error: No se pudo conectar con el servidor. Verifica que el backend esté encendido.';
            errorElement.style.color = 'red';
        }
    }
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// ========================================================
// REGISTRO
// ========================================================
const registroForm = document.getElementById('registroForm');
if (registroForm) {
    registroForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const nombreInput = document.getElementById('nombre');
        const emailInput = document.getElementById('email');
        const passwordInput = document.getElementById('password');
        const confirmPasswordInput = document.getElementById('confirmPassword');
        const deporteInput = document.getElementById('deporte');
        const fechaNacimientoInput = document.getElementById('fechaNacimiento'); 
        
        const nombre = nombreInput ? nombreInput.value.trim() : '';
        const email = emailInput ? emailInput.value.trim() : '';
        const password = passwordInput ? passwordInput.value : '';
        const confirmPassword = confirmPasswordInput ? confirmPasswordInput.value : '';
        const deporte = deporteInput ? deporteInput.value : '';
        const fechaNacimiento = fechaNacimientoInput ? fechaNacimientoInput.value : '';
        
        const nombreError = document.getElementById('nombreError');
        const emailError = document.getElementById('emailError');
        const passwordError = document.getElementById('passwordError');
        const confirmPasswordError = document.getElementById('confirmPasswordError');
        const fechaNacimientoError = document.getElementById('fechaNacimientoError');
        const registerErrorGeneral = document.getElementById('registerErrorGeneral') || confirmPasswordError;
        const successMessage = document.getElementById('successMessage');
        
        let isValid = true;
        
        [nombreInput, emailInput, passwordInput, confirmPasswordInput, fechaNacimientoInput].forEach(input => {
            if (input) input.style.borderColor = '';
        });
        if (nombreError) nombreError.textContent = '';
        if (emailError) emailError.textContent = '';
        if (passwordError) passwordError.textContent = '';
        if (confirmPasswordError) confirmPasswordError.textContent = '';
        if (fechaNacimientoError) fechaNacimientoError.textContent = '';
        if (registerErrorGeneral) registerErrorGeneral.textContent = '';
        if (successMessage) {
            successMessage.textContent = '';
            successMessage.style.display = 'none';
        }
        
        if (!nombre) {
            if (nombreError) nombreError.textContent = 'El nombre es obligatorio';
            if (nombreInput) nombreInput.style.borderColor = 'red';
            isValid = false;
        }
        if (!email) {
            if (emailError) emailError.textContent = 'El email es obligatorio';
            if (emailInput) emailInput.style.borderColor = 'red';
            isValid = false;
        } else if (!isValidEmail(email)) {
            if (emailError) emailError.textContent = 'Email inválido';
            if (emailInput) emailInput.style.borderColor = 'red';
            isValid = false;
        }
        if (fechaNacimientoInput && !fechaNacimiento) {
            if (fechaNacimientoError) fechaNacimientoError.textContent = 'Agregue su fecha de nacimiento';
            if (fechaNacimientoInput) fechaNacimientoInput.style.borderColor = 'red';
            isValid = false;
        }
        if (!password) {
            if (passwordError) passwordError.textContent = 'La contraseña es requerida';
            if (passwordInput) passwordInput.style.borderColor = 'red';
            isValid = false;
        } else if (password.length < 8) {
            if (passwordError) passwordError.textContent = 'Contraseña mínima 8 caracteres';
            if (passwordInput) passwordInput.style.borderColor = 'red';
            isValid = false;
        }
        if (password !== confirmPassword) {
            if (confirmPasswordError) confirmPasswordError.textContent = 'Las contraseñas no coinciden';
            if (confirmPasswordInput) confirmPasswordInput.style.borderColor = 'red';
            isValid = false;
        }
        
        if (isValid) {
            try {
                const payload = { 
                    full_name: nombre,
                    email: email, 
                    password: password, 
                    fecha_nacimiento: fechaNacimiento || "2000-01-01",
                    favorite_sport: deporte, 
                    role: 'user'
                };

                const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                
                const data = await response.json();
                
                if (response.ok || data.ok) {
                    if (successMessage) {
                        successMessage.textContent = '¡Registro completado con éxito! Redirigiendo...';
                        successMessage.style.color = '#2ecc71';
                        successMessage.style.display = 'block';
                    }
                    setTimeout(() => { window.location.href = 'login.html'; }, 2000);
                } else {
                    if (registerErrorGeneral) {
                        registerErrorGeneral.textContent = data.message || 'Error en los datos.';
                        registerErrorGeneral.style.color = 'red';
                    }
                }
            } catch (error) {
                console.error('Error de red:', error);
                if (registerErrorGeneral) {
                    // MENSAJE MODIFICADO
                    registerErrorGeneral.textContent = 'Error: No se pudo conectar con el servidor. Verifica que el backend esté encendido.';
                    registerErrorGeneral.style.color = 'red';
                }
            }
        }
    });
}

function setupQuickAccessButtons() {
    const buttons = document.querySelectorAll('button, a.btn');
    let btnCoach = null;
    let btnAdmin = null;

    buttons.forEach(btn => {
        if (btn.textContent.toLowerCase().includes('coach')) btnCoach = btn;
        if (btn.textContent.toLowerCase().includes('admin')) btnAdmin = btn;
    });

    const loginErrorGeneral = document.getElementById("loginErrorGeneral");
    const message = document.getElementById('message') || loginErrorGeneral;

    if (btnCoach) {
        btnCoach.removeAttribute('onclick');
        btnCoach.setAttribute('href', '#');
        btnCoach.addEventListener('click', async function(e) {
            e.preventDefault();
            await loginUser('coach@correo.com', '12345678', message, loginErrorGeneral);
        });
    }

    if (btnAdmin) {
        btnAdmin.removeAttribute('onclick');
        btnAdmin.setAttribute('href', '#');
        btnAdmin.addEventListener('click', async function(e) {
            e.preventDefault();
            await loginUser('admin@demo.cl', '12345678', message, loginErrorGeneral);
        });
    }
}