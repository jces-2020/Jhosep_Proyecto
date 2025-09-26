const express = require('express');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const categoriasRoutes = require('./routes/categorias');
const productosRoutes = require('./routes/productos');
const imagenesRoutes = require('./routes/imagenes');
const authRoutes = require('./routes/auth'); // <-- AÑADIDO

const app = express();
const PORT = process.env.PORT || 3000;

// Configuración global de Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);
app.set('supabase', supabase);

// Middlewares
app.use(cors());
app.use(bodyParser.json());

// Servir archivos estáticos de la carpeta public
app.use(express.static(path.join(__dirname, 'public')));

// Registrar rutas
app.use('/categorias', categoriasRoutes);
app.use('/productos', productosRoutes);
app.use('/imagenes', imagenesRoutes);
app.use('/api/auth', authRoutes); // <-- AÑADIDO

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});