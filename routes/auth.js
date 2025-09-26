const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const supabase = require('../db');

// --- RUTA DE REGISTRO ---
router.post('/register', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email y contraseña son requeridos.' });
  }

  try {
    // Encriptar la contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Guardar usuario en la base de datos
    const { data, error } = await supabase
      .from('usuarios')
      .insert([{ email, password: hashedPassword }])
      .select();
    if (error) {
      // Manejar error de email duplicado
      if (error.code === '23505' || error.message.includes('duplicate')) {
        return res.status(400).json({ error: 'El email ya está registrado.' });
      }
      throw error;
    }
    res.status(201).json({ id: data[0]?.id, email });
  } catch (err) {
    console.error('Error al registrar usuario:', err);
    res.status(500).json({ error: 'Error en el servidor al registrar el usuario.' });
  }
});

// --- RUTA DE LOGIN ---
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email y contraseña son requeridos.' });
  }

  try {
    // Buscar usuario por email
    const { data: users, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('email', email);
    if (error) throw error;
    if (!users || users.length === 0) {
      return res.status(400).json({ error: 'Credenciales inválidas.' });
    }

    const user = users[0];

    // Comparar contraseñas
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Credenciales inválidas.' });
    }

    // Crear y firmar el token JWT
    const payload = { userId: user.id, email: user.email };
    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET || 'tu_clave_secreta_muy_segura', // <-- ¡IMPORTANTE! Usa variable de entorno
      { expiresIn: '1h' }
    );

    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: 'Error en el servidor al iniciar sesión.' });
  }
});

module.exports = router;