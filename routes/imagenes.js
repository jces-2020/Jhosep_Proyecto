const express = require('express');
const router = express.Router();
const supabase = require('../db');
const verifyToken = require('../middleware/auth'); // <-- 1. IMPORTAR

// GET imágenes de un producto (PÚBLICA)
router.get('/:producto_id', async (req, res) => {
  const { producto_id } = req.params;
  try {
    const { data, error } = await supabase
      .from('imagenes_productos')
      .select('*')
      .eq('producto_id', producto_id);
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST agregar imagen (PROTEGIDA)
router.post('/', verifyToken, async (req, res) => { // <-- 2. PROTEGER
  const { url, producto_id } = req.body;
  try {
    const { data, error } = await supabase
      .from('imagenes_productos')
      .insert([{ url, producto_id }])
      .select();
    if (error) {
      if (
        error.message.includes('duplicate') ||
        error.message.includes('violates unique constraint') ||
        error.code === '23505'
      ) {
        return res.status(400).json({ error: 'La imagen ya existe para este producto.' });
      }
      throw error;
    }
    res.json({ id: data[0]?.id, url, producto_id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE eliminar imagen (PROTEGIDA)
router.delete('/:id', verifyToken, async (req, res) => { // <-- 2. PROTEGER
  const { id } = req.params;
  try {
    const { error } = await supabase
      .from('imagenes_productos')
      .delete()
      .eq('id', id);
    if (error) throw error;
    res.json({ mensaje: 'Imagen eliminada' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
