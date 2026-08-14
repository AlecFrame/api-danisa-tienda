require('dotenv').config();
require('./models');
const { obtenerIPLocal, obtenerIPLocal2 } = require('./controllers/utils')
const sequelize = require('./config/database');

const express = require('express');
const cors = require('cors');
const os = require('os');

const app = express();

app.use(cors());
app.use(express.json());

const productoRoutes = require('./routes/productos');
const categoriaRoutes = require('./routes/categorias');
const aliasRoutes = require('./routes/alias');
const ventaRoutes = require('./routes/ventas');
const auditoriaRoutes = require('./routes/auditorias');
const gastoRoutes = require('./routes/gastos');

app.use('/uploads', express.static('uploads'));

app.use('/api/productos', productoRoutes);
app.use('/api/categorias', categoriaRoutes);
app.use('/api/alias', aliasRoutes);
app.use('/api/ventas', ventaRoutes);
app.use('/api/auditorias', auditoriaRoutes);
app.use('/api/gastos', gastoRoutes);

app.get('/', (req, res) => {
    res.json({
        mensaje: 'API funcionando'
    });
});

async function startServer() {
  try {
    await sequelize.authenticate();
    console.log('Conexión a MySQL establecida correctamente');

    await sequelize.sync();
    console.log('Modelos sincronizados correctamente');

    app.listen(process.env.PORT, () => {
        const ip = obtenerIPLocal();
        const ip2 = obtenerIPLocal2();
        const enlace = `http://localhost:${process.env.PORT}`;

        console.log("====================================");
        console.log(`Servidor iniciado`);
        console.log(`Local:   http://localhost:${process.env.PORT}`);
        console.log(`Red:     http://${ip}:${process.env.PORT}`);
        console.log(`Red2:     http://${ip2}:${process.env.PORT}`);
        console.log(`Retrofit: http://${ip}:${process.env.PORT}/api/`);
        console.log("====================================");
        console.log(`Acciones del servidor`);
        console.log(`Productos : ${enlace}/api/productos`);
        console.log(`Categorías: ${enlace}/api/categorias`);
        console.log(`Alias: ${enlace}/api/alias`);
        console.log(`Ventas: ${enlace}/api/ventas`);
        console.log(`Auditorias: ${enlace}/api/auditorias`);
        console.log(`Gastos: ${enlace}/api/gastos`);
    });

  } catch (error) {
    console.error('Error al iniciar la aplicación:', error);
  }
}

startServer();