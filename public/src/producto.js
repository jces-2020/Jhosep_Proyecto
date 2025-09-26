const API_URL = 'http://localhost:3000';

// Obtener el ID del producto desde la URL
function getIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get('id');
}

// Mostrar detalle del producto y sus imágenes
async function cargarDetalleProducto() {
  const id = getIdFromUrl();
  if (!id) return;

  try {
    // Obtener datos del producto
    const res = await fetch(`${API_URL}/productos/${id}`);
    const producto = await res.json();

    // Mostrar detalle
    const detalleDiv = document.getElementById('detalle-producto');
    detalleDiv.innerHTML = `
      <h2 class="text-xl font-bold mb-2">${producto.nombre}</h2>
      <p class="mb-2"><strong>Precio:</strong> S/ ${producto.precio}</p>
      <p class="mb-2"><strong>Categoría:</strong> ${producto.categoria}</p>
    `;

    // Mostrar todas las imágenes
    const imagenesDiv = document.getElementById('imagenes-producto');
    imagenesDiv.innerHTML = '';
    if (producto.imagenes && producto.imagenes.length > 0) {
      producto.imagenes.forEach(img => {
        const imgElem = document.createElement('img');
        imgElem.src = img.url;
        imgElem.alt = producto.nombre;
        imgElem.className = 'w-full h-40 object-cover rounded shadow';
        imagenesDiv.appendChild(imgElem);
      });
    } else {
      imagenesDiv.innerHTML = '<span class="text-gray-500">No hay imágenes para este producto.</span>';
    }
  } catch (err) {
    document.getElementById('detalle-producto').innerHTML =
      '<span class="text-red-500">Error al cargar el producto desde Supabase.</span>';
  }
}

// Inicializar
document.addEventListener('DOMContentLoaded', () => {
  cargarDetalleProducto();
  const token = localStorage.getItem('token');
  const agregarImagenSection = document.getElementById('agregar-imagen-section');
  if (token && agregarImagenSection) {
    agregarImagenSection.classList.remove('hidden');
    const formAgregarImagen = document.getElementById('form-agregar-imagen');
    const mensajeImagen = document.getElementById('mensaje-imagen');
    formAgregarImagen.addEventListener('submit', async function(e) {
      e.preventDefault();
      const url = document.getElementById('url-imagen').value.trim();
      const productoId = getIdFromUrl();
      if (!url) {
        mensajeImagen.textContent = 'La URL es obligatoria.';
        mensajeImagen.className = 'text-red-500';
        return;
      }
      try {
        const res = await fetch(`${API_URL}/imagenes`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ url, producto_id: productoId })
        });
        if (res.ok) {
          mensajeImagen.textContent = '¡Imagen agregada exitosamente!';
          mensajeImagen.className = 'text-green-600';
          formAgregarImagen.reset();
          // Recargar imágenes
          cargarDetalleProducto();
        } else {
          const error = await res.json();
          mensajeImagen.textContent = error.error || 'Error al agregar la imagen.';
          mensajeImagen.className = 'text-red-500';
        }
      } catch (err) {
        mensajeImagen.textContent = 'Error de conexión con el servidor.';
        mensajeImagen.className = 'text-red-500';
      }
    });
  }
});
