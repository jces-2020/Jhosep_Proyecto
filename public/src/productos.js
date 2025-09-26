const API_URL = 'http://localhost:3000';

// Cargar categorías en el select
async function cargarCategorias() {
  const select = document.getElementById('categoria');
  try {
    const res = await fetch(`${API_URL}/categorias`);
    const categorias = await res.json();
    select.innerHTML = '';
    categorias.forEach(cat => {
      const option = document.createElement('option');
      option.value = cat.id;
      option.textContent = cat.nombre;
      select.appendChild(option);
    });
  } catch (err) {
    select.innerHTML = '<option disabled>Error al cargar categorías</option>';
  }
}

// Registrar producto
document.getElementById('form-producto').addEventListener('submit', async function(e) {
  e.preventDefault();
  const nombre = document.getElementById('nombre').value.trim();
  const url = document.getElementById('url').value.trim();
  const precio = document.getElementById('precio').value;
  const categoriaId = document.getElementById('categoria').value;
  const mensajeDiv = document.getElementById('mensaje');

  // 1. Obtener el token del localStorage
  const token = localStorage.getItem('token');

  if (!token) {
    mensajeDiv.textContent = 'Acceso denegado. Debes iniciar sesión.';
    mensajeDiv.className = 'text-red-500';
    // Opcional: redirigir al login
    // window.location.href = 'login.html';
    return;
  }

  if (!nombre || !url || !precio || !categoriaId) {
    mensajeDiv.textContent = 'Todos los campos obligatorios deben estar completos.';
    mensajeDiv.className = 'text-red-500';
    return;
  }

  try {
    const res = await fetch(`${API_URL}/productos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // 2. Añadir el token a la cabecera de autorización
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ nombre, url, precio, categoria_id: categoriaId })
    });

    if (res.ok) {
  mensajeDiv.textContent = '¡Producto registrado exitosamente con Supabase!';
      mensajeDiv.className = 'text-green-600';
      document.getElementById('form-producto').reset();
    } else {
      const error = await res.json();
      // Manejar error de token inválido o expirado
      if (res.status === 401 || res.status === 403) {
        mensajeDiv.textContent = 'Tu sesión ha expirado. Por favor, inicia sesión de nuevo.';
      } else {
        mensajeDiv.textContent = error.error || 'Error al registrar el producto.';
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
    mensajeDiv.textContent = 'Debes iniciar sesión para registrar productos.';
    mensajeDiv.className = 'text-red-500';
    setTimeout(() => {
      window.location.href = 'login.html';
    }, 1500);
    return;
  }
  cargarCategorias();
});