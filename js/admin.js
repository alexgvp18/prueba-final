document.addEventListener("DOMContentLoaded", async () => {
  await verificarAdmin();
  await cargarUsuarios();
  await cargarEventos();
});

async function verificarAdmin() {
  const usuario = obtenerUsuarioActivo();
  if (!usuario || usuario.rol !== "admin") {
    alert("Acceso restringido: solo administradores.");
    window.location.href = "login.html";
  }
}

async function cargarUsuarios() {
  try {
    const usuarios = await apiService.getUsuarios();
    const tbody = document.querySelector("#tablaUsuarios tbody");
    tbody.innerHTML = "";

    const esMobile = window.innerWidth <= 768;

    usuarios.forEach((u) => {
      const tr = document.createElement("tr");

      tr.innerHTML = `
        <td ${esMobile ? 'data-label="Nombre"' : ''}>${u.nombre}</td>
        <td ${esMobile ? 'data-label="DNI"' : ''}>${u.dni}</td>
        <td ${esMobile ? 'data-label="Correo"' : ''}>${u.correo}</td>
        <td ${esMobile ? 'data-label="Rol"' : ''}>${u.rol || "usuario"}</td>
        <td ${esMobile ? 'data-label="Acciones"' : ''}>
          ${u.rol === "admin"
            ? "<em>Protegido</em>"
            : `<button onclick="eliminarUsuario(${u.id})">Eliminar</button>`}
        </td>
      `;

      tbody.appendChild(tr);
    });
  } catch (error) {
    manejarErrorAuth(error);
    console.error("Error al cargar usuarios:", error);
  }
}

async function eliminarUsuario(usuarioId) {
  try {
    if (confirm(`¿Seguro que deseas eliminar este usuario?`)) {
      await apiService.eliminarUsuario(usuarioId);
      await cargarUsuarios();
      alert("Usuario eliminado correctamente.");
    }
  } catch (error) {
    manejarErrorAuth(error);
    console.error("Error al eliminar usuario:", error);
    alert(error.message || "Error al eliminar usuario");
  }
}

async function cargarEventos() {
  try {
    const eventos = await apiService.getEventos();
    const contenedor = document.getElementById("listaEventosAdmin");
    contenedor.innerHTML = "";

    eventos.forEach((ev) => {
      const div = document.createElement("div");
      div.className = "cartilla";

      const titulo = document.createElement("h3");
      titulo.textContent = ev.nombre;

      const img = document.createElement("img");
      img.src = ev.imagen;
      img.alt = ev.nombre;
      img.className = "imagen-evento";

      const detalles = document.createElement("p");
      detalles.textContent = `${ev.nombre} - ${ev.ciudad} (${ev.fecha})${ev.tipo === 'vip' && ev.meetAndGreet ? ' [VIP: Meet & Greet incluido]' : ''}`;

      const btnEditar = document.createElement("button");
      btnEditar.textContent = "Editar";
      btnEditar.onclick = () => abrirModalEditar(ev.id, ev);

      const btnEliminar = document.createElement("button");
      btnEliminar.textContent = "Eliminar";
      btnEliminar.onclick = () => eliminarEvento(ev.id);

      div.appendChild(titulo);
      div.appendChild(img);
      div.appendChild(detalles);
      div.appendChild(btnEditar);
      div.appendChild(btnEliminar);
      contenedor.appendChild(div);
    });
  } catch (error) {
    manejarErrorAuth(error);
    console.error("Error al cargar eventos:", error);
  }
}

async function eliminarEvento(eventoId) {
  try {
    if (confirm("¿Seguro que deseas eliminar este evento?")) {
      await apiService.eliminarEvento(eventoId);
      await cargarEventos();
      alert("Evento eliminado correctamente.");
    }
  } catch (error) {
    manejarErrorAuth(error);
    console.error("Error al eliminar evento:", error);
    alert(error.message || "Error al eliminar evento");
  }
}

function abrirModalEditar(eventoId, evento) {
  document.getElementById("editarNombre").value = evento.nombre;
  document.getElementById("editarFecha").value = convertirFecha(evento.fecha);
  document.getElementById("editarIndex").value = eventoId;
  document.getElementById("modalEditar").style.display = "flex";
}

function convertirFecha(fecha) {
  const partes = fecha.split(".");
  return `20${partes[2]}-${partes[1]}-${partes[0]}`;
}

function convertirFechaAlmacenar(fecha) {
  const [anio, mes, dia] = fecha.split("-");
  return `${dia}.${mes}.${anio.slice(2)}`;
}

async function guardarEdicion() {
  try {
    const eventoId = parseInt(document.getElementById("editarIndex").value);
    const nuevoNombre = document.getElementById("editarNombre").value.trim();
    const nuevaFecha = document.getElementById("editarFecha").value;

    if (!nuevoNombre || !nuevaFecha) {
      alert("Por favor, completa todos los campos.");
      return;
    }

    const eventoData = {
      nombre: nuevoNombre,
      fecha: convertirFechaAlmacenar(nuevaFecha)
    };

    await apiService.actualizarEvento(eventoId, eventoData);
    cerrarModalEditar();
    await cargarEventos();
    alert("Evento editado correctamente.");
  } catch (error) {
    manejarErrorAuth(error);
    console.error("Error al editar evento:", error);
    alert(error.message || "Error al editar evento");
  }
}

function cerrarModalEditar() {
  document.getElementById("modalEditar").style.display = "none";
}

function cerrarSesion() {
  limpiarToken();
  if (!localStorage.getItem("recordarme")) {
    localStorage.removeItem("recordarme");
  }
  window.location.href = "login.html";
}
