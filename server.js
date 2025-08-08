const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('.'));

let usuarios = [];
let eventos = [
  {
    id: 1,
    nombre: "Kings Theatre",
    fecha: "20.03.25",
    ciudad: "New York",
    imagen: "img/concierto1.jpg",
    tipo: "normal"
  },
  {
    id: 2,
    nombre: "Festival Humano",
    fecha: "29.03.25",
    ciudad: "Hermosillo",
    imagen: "img/concierto2.jpg",
    tipo: "normal"
  },
  {
    id: 3,
    nombre: "Union Chapel",
    fecha: "01.05.25",
    ciudad: "London",
    imagen: "img/concierto3.jpg",
    tipo: "normal"
  },
  {
    id: 4,
    nombre: "Heimathafen Neukölln",
    fecha: "03.05.25",
    ciudad: "Berlin",
    imagen: "img/concierto4.jpg",
    tipo: "normal"
  },
  {
    id: 5,
    nombre: "Teatro Coliseum",
    fecha: "05.05.25",
    ciudad: "Madrid",
    imagen: "img/concierto5.jpg",
    tipo: "normal"
  },
  {
    id: 6,
    nombre: "La Cigale",
    fecha: "06.05.25",
    ciudad: "Paris",
    imagen: "img/concierto6.jpg",
    tipo: "vip",
    meetAndGreet: true
  },
  {
    id: 7,
    nombre: "Auditorio Belgrano",
    fecha: "31.05.25",
    ciudad: "Buenos Aires",
    imagen: "img/concierto7.jpg",
    tipo: "normal"
  },
  {
    id: 8,
    nombre: "Mexico City Showcase",
    fecha: "XX.XX.25",
    ciudad: "CDMX",
    imagen: "img/concierto8.jpg",
    tipo: "vip",
    meetAndGreet: false
  }
];

let compras = [];

const verificarToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ mensaje: 'Token no proporcionado' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'tu_secreto_jwt');
    req.usuario = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ mensaje: 'Token inválido' });
  }
};

app.post('/api/registro', async (req, res) => {
  try {
    const { nombre, dni, correo, contrasena, rol = 'usuario' } = req.body;

    if (usuarios.some(u => u.correo === correo || u.dni === dni)) {
      return res.status(400).json({ mensaje: 'Usuario ya existe' });
    }

    const contrasenaEncriptada = await bcrypt.hash(contrasena, 10);

    const nuevoUsuario = {
      id: usuarios.length + 1,
      nombre,
      dni,
      correo,
      contrasena: contrasenaEncriptada,
      rol
    };

    usuarios.push(nuevoUsuario);

    const token = jwt.sign(
      { id: nuevoUsuario.id, correo: nuevoUsuario.correo, rol: nuevoUsuario.rol },
      process.env.JWT_SECRET || 'tu_secreto_jwt',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      mensaje: 'Usuario registrado exitosamente',
      token,
      usuario: {
        id: nuevoUsuario.id,
        nombre: nuevoUsuario.nombre,
        correo: nuevoUsuario.correo,
        rol: nuevoUsuario.rol
      }
    });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error en el servidor', error: error.message });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { identificador, contrasena } = req.body;

    const usuario = usuarios.find(u => 
      u.correo === identificador || u.dni === identificador
    );

    if (!usuario) {
      return res.status(401).json({ mensaje: 'Credenciales inválidas' });
    }

    const contrasenaValida = await bcrypt.compare(contrasena, usuario.contrasena);
    if (!contrasenaValida) {
      return res.status(401).json({ mensaje: 'Credenciales inválidas' });
    }

    const token = jwt.sign(
      { id: usuario.id, correo: usuario.correo, rol: usuario.rol },
      process.env.JWT_SECRET || 'tu_secreto_jwt',
      { expiresIn: '24h' }
    );

    res.json({
      mensaje: 'Login exitoso',
      token,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        correo: usuario.correo,
        rol: usuario.rol
      }
    });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error en el servidor', error: error.message });
  }
});

app.get('/api/eventos', (req, res) => {
  res.json(eventos);
});

app.post('/api/eventos', verificarToken, (req, res) => {
  try {
    const { nombre, fecha, ciudad, imagen, tipo = 'normal', meetAndGreet = false } = req.body;
    
    const nuevoEvento = {
      id: eventos.length + 1,
      nombre,
      fecha,
      ciudad,
      imagen,
      tipo,
      meetAndGreet
    };

    eventos.push(nuevoEvento);
    res.status(201).json({ mensaje: 'Evento creado exitosamente', evento: nuevoEvento });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error en el servidor', error: error.message });
  }
});

app.put('/api/eventos/:id', verificarToken, (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, fecha, ciudad, imagen, tipo, meetAndGreet } = req.body;

    const eventoIndex = eventos.findIndex(e => e.id === parseInt(id));
    if (eventoIndex === -1) {
      return res.status(404).json({ mensaje: 'Evento no encontrado' });
    }

    eventos[eventoIndex] = {
      ...eventos[eventoIndex],
      nombre: nombre || eventos[eventoIndex].nombre,
      fecha: fecha || eventos[eventoIndex].fecha,
      ciudad: ciudad || eventos[eventoIndex].ciudad,
      imagen: imagen || eventos[eventoIndex].imagen,
      tipo: tipo || eventos[eventoIndex].tipo,
      meetAndGreet: meetAndGreet !== undefined ? meetAndGreet : eventos[eventoIndex].meetAndGreet
    };

    res.json({ mensaje: 'Evento actualizado exitosamente', evento: eventos[eventoIndex] });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error en el servidor', error: error.message });
  }
});

app.delete('/api/eventos/:id', verificarToken, (req, res) => {
  try {
    const { id } = req.params;
    const eventoIndex = eventos.findIndex(e => e.id === parseInt(id));
    
    if (eventoIndex === -1) {
      return res.status(404).json({ mensaje: 'Evento no encontrado' });
    }

    const eventoEliminado = eventos.splice(eventoIndex, 1)[0];
    res.json({ mensaje: 'Evento eliminado exitosamente', evento: eventoEliminado });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error en el servidor', error: error.message });
  }
});

app.get('/api/compras', verificarToken, (req, res) => {
  const comprasUsuario = compras.filter(c => c.usuarioId === req.usuario.id);
  res.json(comprasUsuario);
});

app.post('/api/compras', verificarToken, (req, res) => {
  try {
    const { eventoId, zona = 'General' } = req.body;
    
    const evento = eventos.find(e => e.id === eventoId);
    if (!evento) {
      return res.status(404).json({ mensaje: 'Evento no encontrado' });
    }

    const yaComprado = compras.some(c => 
      c.usuarioId === req.usuario.id && c.eventoId === eventoId
    );

    if (yaComprado) {
      return res.status(400).json({ mensaje: 'Ya tienes entrada para este evento' });
    }

    const nuevaCompra = {
      id: compras.length + 1,
      usuarioId: req.usuario.id,
      eventoId,
      zona,
      fechaCompra: new Date().toISOString(),
      evento: {
        nombre: evento.nombre,
        ciudad: evento.ciudad,
        fecha: evento.fecha
      }
    };

    compras.push(nuevaCompra);
    res.status(201).json({ mensaje: 'Compra realizada exitosamente', compra: nuevaCompra });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error en el servidor', error: error.message });
  }
});

app.delete('/api/compras/:id', verificarToken, (req, res) => {
  try {
    const { id } = req.params;
    const compraIndex = compras.findIndex(c => 
      c.id === parseInt(id) && c.usuarioId === req.usuario.id
    );

    if (compraIndex === -1) {
      return res.status(404).json({ mensaje: 'Compra no encontrada' });
    }

    const compraEliminada = compras.splice(compraIndex, 1)[0];
    res.json({ mensaje: 'Compra cancelada exitosamente', compra: compraEliminada });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error en el servidor', error: error.message });
  }
});

app.get('/api/usuarios', verificarToken, (req, res) => {
  if (req.usuario.rol !== 'admin') {
    return res.status(403).json({ mensaje: 'Acceso denegado' });
  }
  
  const usuariosSinContrasena = usuarios.map(u => ({
    id: u.id,
    nombre: u.nombre,
    dni: u.dni,
    correo: u.correo,
    rol: u.rol
  }));
  
  res.json(usuariosSinContrasena);
});

app.delete('/api/usuarios/:id', verificarToken, (req, res) => {
  try {
    if (req.usuario.rol !== 'admin') {
      return res.status(403).json({ mensaje: 'Acceso denegado' });
    }

    const { id } = req.params;
    const usuarioIndex = usuarios.findIndex(u => u.id === parseInt(id));
    
    if (usuarioIndex === -1) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }

    const usuarioEliminado = usuarios.splice(usuarioIndex, 1)[0];
    res.json({ mensaje: 'Usuario eliminado exitosamente', usuario: usuarioEliminado });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error en el servidor', error: error.message });
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ mensaje: 'Error interno del servidor' });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
