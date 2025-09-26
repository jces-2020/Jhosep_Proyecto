const express = require('express');
const router = express.Router();
const supabase = require('../db');
const verifyToken = require('../middleware/auth'); // <-- 1. IMPORTAR EL MIDDLEWARE

// --- RUTAS PÚBLICAS (Cualquiera puede ver) ---

// GET productos (con filtro por categoría)
router.get('/', async (req, res) => {
  const { categoria } = req.query; // Obtener el id de la categoría de la URL
  try {
    let productosQuery = supabase
      .from('productos')
      .select('id, nombre, precio, categoria_id, categorias(nombre)');
    if (categoria) {
      productosQuery = productosQuery.eq('categoria_id', categoria);
    }
    const { data: productos, error } = await productosQuery;
    if (error) throw error;

    // Obtener imágenes para cada producto
    for (const producto of productos) {
      const { data: imagenes, error: imgError } = await supabase
        .from('imagenes_productos')
        .select('id, url')
        .eq('producto_id', producto.id);
      if (imgError) throw imgError;
      producto.imagenes = imagenes;
      // Ajustar nombre de categoría
      producto.categoria = producto.categorias?.nombre || null;
      delete producto.categorias;
    }
    res.json(productos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET detalle de producto (con imágenes)
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    // Obtener datos del producto
    const { data: productos, error } = await supabase
      .from('productos')
      .select('id, nombre, precio, categoria_id, categorias(nombre)')
      .eq('id', id);
    if (error) throw error;
    if (!productos || productos.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    const producto = productos[0];
    // Obtener imágenes asociadas
    const { data: imagenes, error: imgError } = await supabase
      .from('imagenes_productos')
      .select('id, url')
      .eq('producto_id', id);
    if (imgError) throw imgError;
    producto.imagenes = imagenes;
    producto.categoria = producto.categorias?.nombre || null;
    delete producto.categorias;
    res.json(producto);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- RUTAS PROTEGIDAS (Requieren token) ---

// POST crear producto
router.post('/', verifyToken, async (req, res) => { // <-- 2. APLICAR MIDDLEWARE
  const { nombre, url, precio, categoria_id } = req.body;
  try {
    console.log('Intentando registrar producto:', { nombre, url, precio, categoria_id });
    // Crear producto
    const { data, error } = await supabase
      .from('productos')
      .insert([{ nombre, precio, categoria_id }])
      .select();
    if (error) throw error;
    const productoId = data[0]?.id;
    console.log('Producto creado con ID:', productoId);
    // Guardar imagen principal si se proporcionó URL
    if (url && productoId) {
      console.log('Guardando imagen principal:', { url, producto_id: productoId });
      const { error: imgError } = await supabase
        .from('imagenes_productos')
        .insert([{ url, producto_id: productoId }]);
      if (imgError) throw imgError;
      console.log('Imagen principal guardada correctamente');
    } else {
      console.log('No se proporcionó URL o productoId no existe');
    }
    res.json({ id: productoId, nombre, precio, categoria_id, url });
  } catch (err) {
    console.error('Error al registrar producto:', err);
    res.status(500).json({ error: err.message });
  }
});

// PUT actualizar producto
router.put('/:id', verifyToken, async (req, res) => { // <-- 2. APLICAR MIDDLEWARE
  const { id } = req.params;
  const { nombre, precio, categoria_id } = req.body;
  try {
    const { error } = await supabase
      .from('productos')
      .update({ nombre, precio, categoria_id })
      .eq('id', id);
    if (error) throw error;
    res.json({ id, nombre, precio, categoria_id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE eliminar producto
router.delete('/:id', verifyToken, async (req, res) => { // <-- 2. APLICAR MIDDLEWARE
  const { id } = req.params;
  try {
    const { error } = await supabase
      .from('productos')
      .delete()
      .eq('id', id);
    if (error) throw error;
    res.json({ mensaje: 'Producto eliminado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
