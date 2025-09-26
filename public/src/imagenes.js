const API_URL = 'http://localhost:3000';

// Cargar productos en el select
async function cargarProductos() {
  const select = document.getElementById('producto');
  try {
    const res = await fetch(`${API_URL}/productos`);
    const productos = await res.json();
    select.innerHTML = '';
    productos.forEach(prod => {
      const option = document.createElement('option');
      option.value = prod.id;
      option.textContent = prod.nombre;
      select.appendChild(option);
    });
  } catch (err) {
    select.innerHTML = '<option disabled>Error al cargar productos</option>';
  }
}

// Registrar imagen
document.getElementById('form-imagen').addEventListener('submit', async function(e) {
  e.preventDefault();
  const productoId = document.getElementById('producto').value;
  const url = document.getElementById('url').value.trim();
  const mensajeDiv = document.getElementById('mensaje');

  // 1. Obtener el token del localStorage
  const token = localStorage.getItem('token');

  if (!token) {
    mensajeDiv.textContent = 'Acceso denegado. Debes iniciar sesión para registrar una imagen.';
    mensajeDiv.className = 'text-red-500';
    return;
  }

  if (!productoId || !url) {
    mensajeDiv.textContent = 'Todos los campos son obligatorios.';
    mensajeDiv.className = 'text-red-500';
    return;
  }

  try {
    const res = await fetch(`${API_URL}/imagenes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // 2. Añadir el token a la cabecera de autorización
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ producto_id: productoId, url })
    });
    if (res.ok) {
  mensajeDiv.textContent = '¡Imagen registrada exitosamente con Supabase!';
      mensajeDiv.className = 'text-green-600';
      document.getElementById('form-imagen').reset();
    } else {
      const error = await res.json();
      // Manejar error de token inválido o expirado
      if (res.status === 401 || res.status === 403) {
        mensajeDiv.textContent = 'Tu sesión ha expirado. Por favor, inicia sesión de nuevo.';
      } else {
        mensajeDiv.textContent = error.error || 'Error al registrar la imagen.';
      }
      mensajeDiv.className = 'text-red-500';
    }
  } catch (err) {
    mensajeDiv.textContent = 'Error de conexión con el servidor.';
    mensajeDiv.className = 'text-red-500';
  }
});

// Inicializar
document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('token');
  const mensajeDiv = document.getElementById('mensaje');
  if (!token) {
    mensajeDiv.textContent = 'Debes iniciar sesión para registrar imágenes.';
    mensajeDiv.className = 'text-red-500';
    setTimeout(() => {
      window.location.href = 'login.html';
    }, 1500);
    return;
  }
  cargarProductos();
});