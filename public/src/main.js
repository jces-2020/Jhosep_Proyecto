// URL base de la API
const API_URL = 'https://jhosep-proyecto.onrender.com';

// Elementos del DOM
const menuCategorias = document.getElementById('menu-categorias');
const productosLista = document.getElementById('productos-lista');

// --- Elementos de autenticación ---
const btnRegistrarProducto = document.getElementById('btn-registrar-producto');
const btnLogout = document.getElementById('btn-logout');
const btnLogin = document.getElementById('btn-login');
const btnRegister = document.getElementById('btn-register');

// 1. Función para actualizar la UI según el estado de autenticación
function actualizarUI() {
  const token = localStorage.getItem('token');

  if (token) {
    // Usuario autenticado
    btnLogin.classList.add('hidden');
    btnRegister.classList.add('hidden');
    btnRegistrarProducto.classList.remove('hidden');
    btnLogout.classList.remove('hidden');
    // Mostrar botón de agregar categoría
    const btnAgregarCategoria = document.getElementById('btn-agregar-categoria');
    if (btnAgregarCategoria) btnAgregarCategoria.classList.remove('hidden');
  } else {
    // Visitante
    btnLogin.classList.remove('hidden');
    btnRegister.classList.remove('hidden');
    btnRegistrarProducto.classList.add('hidden');
    btnLogout.classList.add('hidden');
    // Ocultar botón de agregar categoría
    const btnAgregarCategoria = document.getElementById('btn-agregar-categoria');
    if (btnAgregarCategoria) btnAgregarCategoria.classList.add('hidden');
  }
  // Recargar productos para ocultar botones de edición/eliminación
  cargarProductos();
}

// 2. Función para cerrar sesión
function cerrarSesion() {
  localStorage.removeItem('token'); // Eliminar el token
  actualizarUI(); // Actualizar la interfaz y recargar productos
}

// NUEVA FUNCIÓN: Eliminar un producto
async function eliminarProducto(id) {
  // Pedir confirmación al usuario
  if (!confirm('¿Estás seguro de que quieres eliminar este producto?')) {
    return;
  }

  const token = localStorage.getItem('token');
  if (!token) {
    alert('Tu sesión ha expirado. Por favor, inicia sesión de nuevo.');
    return;
  }

  try {
    const res = await fetch(`${API_URL}/productos/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (res.ok) {
      alert('Producto eliminado exitosamente.');
      cargarProductos(); // Recargar la lista de productos
    } else {
      const error = await res.json();
      alert(`Error al eliminar el producto: ${error.error || 'Error desconocido'}`);
    }
  } catch (err) {
    alert('Error de conexión al intentar eliminar el producto.');
  }
}

// 3. Función para cargar categorías en el menú (CORREGIDA)
async function cargarCategorias() {
  try {
    const res = await fetch(`${API_URL}/categorias`);
    const categorias = await res.json();
    menuCategorias.innerHTML = ''; // Limpiar menú

    // Botón para ver "Todos" los productos
    const todosBtn = document.createElement('button');
    todosBtn.textContent = 'Todos';
    todosBtn.className = 'text-white hover:underline px-3 py-2 rounded';
    todosBtn.onclick = () => cargarProductos(); // Llama sin ID para mostrar todos
    menuCategorias.appendChild(todosBtn);

    // Botones para cada categoría
    categorias.forEach(cat => {
      const catBtn = document.createElement('button');
      catBtn.textContent = cat.nombre;
      catBtn.className = 'text-white hover:underline px-3 py-2 rounded';
      catBtn.onclick = () => cargarProductos(cat.id); // Llama con el ID de la categoría
      menuCategorias.appendChild(catBtn);
    });
  } catch (err) {
    menuCategorias.innerHTML = '<span class="text-red-500">Error al cargar categorías</span>';
  }
}

// 4. Función para cargar productos (MODIFICADA PARA FILTRAR)
async function cargarProductos(categoriaId = null) {
  let url = `${API_URL}/productos`;
  if (categoriaId) {
    url += `?categoria=${categoriaId}`;
  }

  try {
    const res = await fetch(url);
    let productos = await res.json();

    productosLista.innerHTML = '';

    // Para cada producto, usar las imágenes ya incluidas por la API
    for (let prod of productos) {
      const card = document.createElement('div');
      card.className = 'bg-white rounded shadow p-4 flex flex-col items-center text-center';

      // Primera imagen (la API ya incluye el array 'imagenes')
      const img = document.createElement('img');
      img.src = prod.imagenes && prod.imagenes.length > 0 ? prod.imagenes[0].url : 'https://via.placeholder.com/150';
      img.alt = prod.nombre;
      img.className = 'w-32 h-32 object-cover mb-2 rounded';

      // Nombre
      const nombre = document.createElement('h2');
      nombre.textContent = prod.nombre;
      nombre.className = 'font-semibold mb-2 h-12'; // Altura fija para alinear

      // Contenedor para los botones
      const actionsDiv = document.createElement('div');
      actionsDiv.className = 'mt-4 space-x-2 flex';

      // Botón detalle (siempre visible)
      const detalleBtn = document.createElement('a');
      detalleBtn.href = `producto.html?id=${prod.id}`;
      detalleBtn.textContent = 'Ver';
      detalleBtn.className = 'text-blue-600 hover:underline px-2';
      actionsDiv.appendChild(detalleBtn);

      // Botones de Editar y Eliminar (solo para usuarios autenticados)
      const token = localStorage.getItem('token');
      if (token) {
        // Botón Editar
        const editarBtn = document.createElement('a');
        editarBtn.href = `edit-producto.html?id=${prod.id}`;
        editarBtn.textContent = 'Editar';
        editarBtn.className = 'text-green-600 hover:underline px-2';
        actionsDiv.appendChild(editarBtn);

        // Botón Eliminar
        const eliminarBtn = document.createElement('button');
        eliminarBtn.textContent = 'Eliminar';
        eliminarBtn.className = 'text-red-600 hover:underline px-2';
        eliminarBtn.onclick = () => eliminarProducto(prod.id); // Llama a la función de eliminar
        actionsDiv.appendChild(eliminarBtn);
      }

      card.appendChild(img);
      card.appendChild(nombre);
      card.appendChild(actionsDiv); // Añadir el contenedor de botones
      productosLista.appendChild(card);
    }

    // Si no hay productos
    if (productos.length === 0) {
      productosLista.innerHTML = `<p class="col-span-3 text-center text-gray-500">No hay productos para mostrar.</p>`;
    }

  } catch (err) {
  productosLista.innerHTML = '<span class="text-red-500">Error al cargar productos desde Supabase</span>';
  }
}

// 5. Inicialización
document.addEventListener('DOMContentLoaded', () => {
  actualizarUI(); // <-- Llamar para establecer el estado inicial de los botones
  cargarCategorias();
  cargarProductos();

  // Asignar evento al botón de cerrar sesión
  if (btnLogout) {
    btnLogout.addEventListener('click', cerrarSesion);
  }
});
