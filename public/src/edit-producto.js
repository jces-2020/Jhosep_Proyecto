const API_URL = 'http://localhost:3000';

// Elementos del DOM
const form = document.getElementById('form-edit-producto');
const nombreInput = document.getElementById('nombre');
const precioInput = document.getElementById('precio');
const categoriaSelect = document.getElementById('categoria');
const mensajeDiv = document.getElementById('mensaje');

// Obtener el ID del producto de la URL
const urlParams = new URLSearchParams(window.location.search);
const productoId = urlParams.get('id');

// Función para cargar los datos del producto y las categorías en el formulario
async function cargarDatosFormulario() {
  if (!productoId) {
    mensajeDiv.textContent = 'No se especificó un producto para editar.';
    mensajeDiv.className = 'text-red-500';
    return;
  }

  try {
    // Cargar producto y categorías en paralelo para más eficiencia
    const [resProducto, resCategorias] = await Promise.all([
      fetch(`${API_URL}/productos/${productoId}`),
      fetch(`${API_URL}/categorias`)
    ]);

    if (!resProducto.ok) {
      throw new Error('Producto no encontrado.');
    }

    const producto = await resProducto.json();
    const categorias = await resCategorias.json();

    // Rellenar el formulario con los datos del producto
    nombreInput.value = producto.nombre;
    precioInput.value = producto.precio;

    // Rellenar el select de categorías y seleccionar la actual
    categorias.forEach(cat => {
      const option = document.createElement('option');
      option.value = cat.id;
      option.textContent = cat.nombre;
      if (cat.id === producto.categoria_id) {
        option.selected = true;
      }
      categoriaSelect.appendChild(option);
    });

    // Mostrar las URLs de las imágenes asociadas con botón eliminar
    const imagenesDiv = document.createElement('div');
    imagenesDiv.className = 'mt-6';
    imagenesDiv.innerHTML = '<h3 class="font-bold mb-2">Imágenes asociadas:</h3>';
    if (producto.imagenes && producto.imagenes.length > 0) {
      producto.imagenes.forEach(img => {
        const urlElem = document.createElement('div');
        urlElem.className = 'mb-2 flex items-center';
        urlElem.innerHTML = `
          <span class="text-sm mr-2">${img.url}</span>
          <button class="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600" data-id="${img.id}">Eliminar</button>
        `;
        imagenesDiv.appendChild(urlElem);
      });
    } else {
      imagenesDiv.innerHTML += '<span class="text-gray-500">No hay imágenes para este producto.</span>';
    }
    form.parentNode.insertBefore(imagenesDiv, form.nextSibling);

    // Eliminar imagen
    imagenesDiv.addEventListener('click', async function(e) {
      if (e.target.tagName === 'BUTTON') {
        const id = e.target.getAttribute('data-id');
        if (confirm('¿Seguro que deseas eliminar esta imagen?')) {
          try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/imagenes/${id}`, {
              method: 'DELETE',
              headers: {
                'Authorization': `Bearer ${token}`
              }
            });
            if (res.ok) {
              imagenesDiv.innerHTML = '';
              cargarDatosFormulario();
            } else {
              const error = await res.json();
              mensajeDiv.textContent = error.error || 'Error al eliminar la imagen.';
              mensajeDiv.className = 'text-red-500';
            }
          } catch (err) {
            mensajeDiv.textContent = 'Error de conexión al eliminar.';
            mensajeDiv.className = 'text-red-500';
          }
        }
      }
    });

  } catch (err) {
    mensajeDiv.textContent = `Error al cargar los datos: ${err.message}`;
    mensajeDiv.className = 'text-red-500';
  }
}

// Event listener para enviar el formulario actualizado
form.addEventListener('submit', async function(e) {
  e.preventDefault();

  const nombre = nombreInput.value.trim();
  const precio = precioInput.value;
  const categoriaId = categoriaSelect.value;
  const token = localStorage.getItem('token');

  if (!token) {
    mensajeDiv.textContent = 'Tu sesión ha expirado. Inicia sesión de nuevo.';
    mensajeDiv.className = 'text-red-500';
    return;
  }

  if (!nombre || !precio || !categoriaId) {
    mensajeDiv.textContent = 'Todos los campos son obligatorios.';
    mensajeDiv.className = 'text-red-500';
    return;
  }

  try {
    const res = await fetch(`${API_URL}/productos/${productoId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ nombre, precio, categoria_id: categoriaId })
    });

    if (res.ok) {
  mensajeDiv.textContent = '¡Producto actualizado exitosamente con Supabase!';
      mensajeDiv.className = 'text-green-600';
      // Redirigir al catálogo después de 2 segundos
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 2000);
    } else {
      const error = await res.json();
      mensajeDiv.textContent = `Error al actualizar: ${error.error || 'Error desconocido'}`;
      mensajeDiv.className = 'text-red-500';
    }
  } catch (err) {
    mensajeDiv.textContent = 'Error de conexión con el servidor.';
    mensajeDiv.className = 'text-red-500';
  }
});

// Cargar los datos cuando la página esté lista
document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('token');
  if (!token) {
    mensajeDiv.textContent = 'Debes iniciar sesión para editar productos.';
    mensajeDiv.className = 'text-red-500';
    setTimeout(() => {
      window.location.href = 'login.html';
    }, 1500);
    return;
  }
  cargarDatosFormulario();
});