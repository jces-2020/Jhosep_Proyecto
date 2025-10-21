// Selección del endpoint: usa la URL pública en Render o la ruta relativa en local
const RENDER_URL = 'https://jhosep-proyecto.onrender.com';
const isRendered = window.location.hostname.includes('onrender.com') || window.location.hostname === 'jhosep-proyecto.onrender.com';
const API_URL = isRendered ? `${RENDER_URL}/api/auth` : '/api/auth';

document.getElementById('form-register').addEventListener('submit', async function(e) {
  e.preventDefault();

  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();
  const confirmPassword = document.getElementById('confirm-password').value.trim();
  const mensajeDiv = document.getElementById('mensaje');

  // Validaciones del lado del cliente
  if (!email || !password || !confirmPassword) {
    mensajeDiv.textContent = 'Por favor, completa todos los campos.';
    mensajeDiv.className = 'text-red-500';
    return;
  }

  if (password !== confirmPassword) {
    mensajeDiv.textContent = 'Las contraseñas no coinciden.';
    mensajeDiv.className = 'text-red-500';
    return;
  }

  try {
    const res = await fetch(`${API_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (res.ok) {
  mensajeDiv.textContent = '¡Registro exitoso con Supabase! Ahora puedes iniciar sesión.';
      mensajeDiv.className = 'text-green-600';
      document.getElementById('form-register').reset();

      // Opcional: redirigir al login después de unos segundos
      setTimeout(() => {
        window.location.href = 'login.html';
      }, 2000);

    } else {
      mensajeDiv.textContent = data.error || 'Error al registrar la cuenta.';
      mensajeDiv.className = 'text-red-500';
    }
  } catch (err) {
    console.error('Error al registrar:', err);
    mensajeDiv.textContent = 'Error de conexión con el servidor.';
    mensajeDiv.className = 'text-red-500';
  }
});