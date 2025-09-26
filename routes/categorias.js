const express = require('express');
const router = express.Router();
const supabase = require('../db');
const verifyToken = require('../middleware/auth'); // <-- 1. IMPORTAR

// --- RUTA PÚBLICA ---
// GET todas las categorías
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('categorias')
      .select('*');
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- RUTAS PROTEGIDAS ---
// POST crear categoría
router.post('/', verifyToken, async (req, res) => { // <-- 2. PROTEGER
  const { nombre } = req.body;
  try {
    const { data, error } = await supabase
      .from('categorias')
      .insert([{ nombre }])
      .select();
    if (error) {
      if (
        error.message.includes('duplicate') ||
        error.message.includes('violates unique constraint') ||
        error.code === '23505'
      ) {
        return res.status(400).json({ error: 'La categoría ya existe.' });
      }
      throw error;
    }
    res.json({ id: data[0]?.id, nombre });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT actualizar categoría
router.put('/:id', verifyToken, async (req, res) => { // <-- 2. PROTEGER
  const { id } = req.params;
  const { nombre } = req.body;
  try {
    const { error } = await supabase
      .from('categorias')
      .update({ nombre })
      .eq('id', id);
    if (error) throw error;
    res.json({ id, nombre });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE eliminar categoría
router.delete('/:id', verifyToken, async (req, res) => { // <-- 2. PROTEGER
  const { id } = req.params;
  try {
    const { error } = await supabase
      .from('categorias')
      .delete()
      .eq('id', id);
    if (error) throw error;
    res.json({ mensaje: 'Categoría eliminada' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
