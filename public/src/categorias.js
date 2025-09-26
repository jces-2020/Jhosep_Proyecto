const API_URL = 'http://localhost:3000';

document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('token');
  const mensajeDiv = document.getElementById('mensaje');
  const listaCategorias = document.getElementById('lista-categorias');

  if (!token) {
    mensajeDiv.textContent = 'Debes iniciar sesión para registrar una categoría.';
    mensajeDiv.className = 'text-red-500';
    setTimeout(() => {
      window.location.href = 'login.html';
    }, 1500);
    return;
  }

  // Mostrar lista de categorías
  async function cargarCategorias() {
    listaCategorias.innerHTML = '<li class="text-gray-500 text-center">Cargando...</li>';
    try {
      const res = await fetch(`${API_URL}/categorias`);
      const categorias = await res.json();
      if (Array.isArray(categorias) && categorias.length > 0) {
        listaCategorias.innerHTML = '';
        categorias.forEach(cat => {
          const li = document.createElement('li');
          li.className = 'flex justify-between items-center bg-gray-100 rounded px-4 py-2';
          li.innerHTML = `
            <span>${cat.nombre}</span>
            <button class="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600" data-id="${cat.id}">Eliminar</button>
          `;
          listaCategorias.appendChild(li);
        });
      } else {
        listaCategorias.innerHTML = '<li class="text-gray-500 text-center">No hay categorías registradas.</li>';
      }
    } catch (err) {
      listaCategorias.innerHTML = '<li class="text-red-500 text-center">Error al cargar categorías.</li>';
    }
  }

  cargarCategorias();

  // Eliminar categoría
  listaCategorias.addEventListener('click', async function(e) {
    if (e.target.tagName === 'BUTTON') {
      const id = e.target.getAttribute('data-id');
      if (confirm('¿Seguro que deseas eliminar esta categoría?')) {
        try {
          const res = await fetch(`${API_URL}/categorias/${id}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          if (res.ok) {
            cargarCategorias();
          } else {
            const error = await res.json();
            mensajeDiv.textContent = error.error || 'Error al eliminar la categoría.';
            mensajeDiv.className = 'text-red-500';
          }
        } catch (err) {
          mensajeDiv.textContent = 'Error de conexión al eliminar.';
          mensajeDiv.className = 'text-red-500';
        }
      }
    }
  });

  document.getElementById('form-categoria').addEventListener('submit', async function(e) {
    e.preventDefault();
    const nombre = document.getElementById('nombre').value.trim();

    if (!nombre) {
      mensajeDiv.textContent = 'El nombre es obligatorio.';
      mensajeDiv.className = 'text-red-500';
      return;
    }

    try {
      const res = await fetch(`${API_URL}/categorias`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ nombre })
      });

      if (res.ok) {
        mensajeDiv.textContent = '¡Categoría registrada exitosamente con Supabase!';
        mensajeDiv.className = 'text-green-600';
        document.getElementById('form-categoria').reset();
        cargarCategorias();
      } else {
        const error = await res.json();
        if (res.status === 401 || res.status === 403) {
          mensajeDiv.textContent = 'Tu sesión ha expirado. Por favor, inicia sesión de nuevo.';
        } else {
          mensajeDiv.textContent = error.error || 'Error al registrar la categoría.';
        }
        mensajeDiv.className = 'text-red-500';
      }
    } catch (err) {
      mensajeDiv.textContent = 'Error de conexión con el servidor.';
      mensajeDiv.className = 'text-red-500';
    }
  });
});