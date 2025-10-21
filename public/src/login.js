const RENDER_URL = 'https://jhosep-proyecto.onrender.com';
const isRendered = window.location.hostname.includes('onrender.com') || window.location.hostname === 'jhosep-proyecto.onrender.com';
const API_URL = isRendered ? `${RENDER_URL}/api/auth` : '/api/auth';

document.getElementById('form-login').addEventListener('submit', async function(e) {
  e.preventDefault();

  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();
  const mensajeDiv = document.getElementById('mensaje');

  if (!email || !password) {
    mensajeDiv.textContent = 'Por favor, completa todos los campos.';
    mensajeDiv.className = 'text-red-500';
    return;
  }

  try {
    const res = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (res.ok) {
      // Guardar el token en el almacenamiento local
      localStorage.setItem('token', data.token);

  mensajeDiv.textContent = '¡Inicio de sesión exitoso con Supabase! Redirigiendo...';
      mensajeDiv.className = 'text-green-600';

      // Redirigir al catálogo principal después de 1 segundo
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 1000);

    } else {
      mensajeDiv.textContent = data.error || 'Error al iniciar sesión.';
      mensajeDiv.className = 'text-red-500';
    }
  } catch (err) {
    mensajeDiv.textContent = 'Error de conexión con el servidor.';
    mensajeDiv.className = 'text-red-500';
  }
});