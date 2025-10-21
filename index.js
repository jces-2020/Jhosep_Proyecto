require('dotenv').config();
const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const categoriasRoutes = require('./routes/categorias');
const productosRoutes = require('./routes/productos');
const imagenesRoutes = require('./routes/imagenes');
const authRoutes = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 10000;

// Configuración global de Supabase (si se usa)
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);
app.set('supabase', supabase);

// Configurar CORS para permitir únicamente la URL indicada (tu Render)
const allowedOrigin = 'https://jhosep-proyecto.onrender.com';
app.use(cors({
  origin: allowedOrigin
}));

app.use(bodyParser.json());

// IPs validas (whitelist)
const allowedIPs = ['45.232.149.130', '45.232.149.146', '45.232.149.145'];

app.use((req, res, next) => {
  let clientIP = req.headers['x-forwarded-for'] || req.ip || (req.connection && req.connection.remoteAddress) || '';
  if (clientIP && clientIP.includes(',')) {
    clientIP = clientIP.split(',')[0].trim();
  }

  if (clientIP && clientIP.startsWith('::ffff:')) {
    clientIP = clientIP.replace('::ffff:', '');
  }

  if (allowedIPs.includes(clientIP)) {
    return next();
  }

  // Permitir si la petición viene del mismo host (útil para testing local cuando se sirve desde el mismo servidor)
  const hostHeader = req.headers.host || '';
  if (hostHeader.startsWith('localhost') || hostHeader.startsWith('127.0.0.1')) {
    return next();
  }

  res.status(403).json({ message: 'Acceso denegado: IP no permitida', ip: clientIP });
});

// === Documentación Swagger ===
try {
  const { swaggerUi, swaggerSpecs } = require('./swagger');
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));
} catch (err) {
  // Si no existe swagger, seguimos sin bloquear la aplicación
  console.warn('Swagger no disponible:', err.message);
}

// Servir archivos estáticos de la carpeta public
app.use(express.static(path.join(__dirname, 'public')));

// Registrar rutas
app.use('/categorias', categoriasRoutes);
app.use('/productos', productosRoutes);
app.use('/imagenes', imagenesRoutes);
app.use('/api/auth', authRoutes);

// Iniciar servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
  console.log(`Documentación disponible en http://localhost:${PORT}/api-docs`);
});