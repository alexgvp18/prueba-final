let usuarioActivo = null;
let eventos = [];
let compras = [];
let indexCompraActual = null;
let entradaActual = null;

function mostrarPerfil() {
  const perfil = document.getElementById("perfilUsuario");
  perfil.innerHTML = `<strong>${usuarioActivo.nombre}</strong>${usuarioActivo.correo}`;
}

async function cargarEventos() {
  try {
    eventos = await apiService.getEventos();
    mostrarConciertos();
  } catch (error) {
    manejarErrorAuth(error);
    console.error("Error al cargar eventos:", error);
  }
}

async function cargarCompras() {
  try {
    compras = await apiService.getCompras();
  } catch (error) {
    manejarErrorAuth(error);
    console.error("Error al cargar compras:", error);
  }
}

function mostrarConciertos() {
  const contenedor = document.getElementById("listaConciertos");
  contenedor.innerHTML = "";
  eventos.forEach((ev, index) => {
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

    const btnCompra = document.createElement("button");
    btnCompra.textContent = "Comprar entradas";
    btnCompra.onclick = () => comprarEntrada(ev.id);

    const btnHorario = document.createElement("button");
    btnHorario.textContent = "Ver horarios";
    btnHorario.onclick = () =>
      abrirModal("Horario del evento", `El evento en ${ev.ciudad} inicia a las 8:00 p.m.`);

    const btnZonas = document.createElement("button");
    btnZonas.textContent = "Ver zonas";
    btnZonas.onclick = () =>
      abrirModal("Zonas disponibles", "Zonas: General, Preferencial, VIP.");

    div.appendChild(titulo);
    div.appendChild(img);
    div.appendChild(detalles);
    div.appendChild(btnCompra);
    div.appendChild(btnHorario);
    div.appendChild(btnZonas);
    contenedor.appendChild(div);
  });
}

async function comprarEntrada(eventoId) {
  const evento = eventos.find(e => e.id === eventoId);
  if (!evento) return;

  const yaComprado = compras.some(c => c.eventoId === eventoId);
  if (yaComprado) {
    abrirModal("Ya compraste", "Ya tienes entrada para este evento.");
    return;
  }

  indexCompraActual = eventoId;
  document.getElementById("zonaSeleccionada").value = "General";
  document.getElementById("modalZona").style.display = "flex";
}

async function confirmarCompra() {
  try {
    const zona = document.getElementById("zonaSeleccionada").value;
    const evento = eventos.find(e => e.id === indexCompraActual);
    
    if (!evento) {
      cerrarModalZona();
      return;
    }

    const compraData = {
      eventoId: indexCompraActual,
      nombreEvento: evento.nombre,
      ciudad: evento.ciudad,
      fecha: evento.fecha,
      zona: zona,
      precio: evento.precio || 50
    };

    const response = await apiService.crearCompra(compraData);
    console.log("Compra exitosa:", response);

    await cargarCompras();

    cerrarModalZona();
    abrirModal("Compra exitosa", `¡Entrada comprada para ${evento.nombre} en zona ${zona}!`);
    
    entradaActual = {
      nombre: evento.nombre,
      ciudad: evento.ciudad,
      fecha: evento.fecha,
      zona: zona
    };

  } catch (error) {
    manejarErrorAuth(error);
    console.error("Error al comprar entrada:", error);
    alert("Error al comprar entrada: " + error.message);
  }
}

function cerrarModalZona() {
  document.getElementById("modalZona").style.display = "none";
}

function verEntrada() {
  if (!entradaActual) return;
  cerrarModal();
  const modal = document.getElementById("modalEntrada");
  document.getElementById("textoEntrada").textContent =
    `${entradaActual.evento.nombre}\n${entradaActual.evento.ciudad} - ${entradaActual.evento.fecha}\nZona: ${entradaActual.zona}`;
  modal.style.display = "flex";
}

function cerrarModalEntrada() {
  document.getElementById("modalEntrada").style.display = "none";
}

function descargarEntradaDesdeModal(nombre = "", ciudad = "", fecha = "", zona = "") {
  let texto = nombre
    ? `${nombre}\n${ciudad} - ${fecha}\nZona: ${zona}`
    : document.getElementById("textoEntrada").textContent;

  const nombreArchivo = texto.split("\n")[0].replace(/\s+/g, "_") + "_entrada.txt";
  const blob = new Blob([texto], { type: "text/plain" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = nombreArchivo;
  link.click();
  URL.revokeObjectURL(url);
}

function mostrarCompras() {
  const lista = document.getElementById("listaComprasPopup");
  lista.innerHTML = compras.length === 0
    ? "<li>No has comprado entradas todavía.</li>"
    : "";

  compras.forEach((c) => {
    const li = document.createElement("li");
    li.className = "compra-item";
    li.innerHTML = `
      <div>
        <strong>${c.evento.nombre}</strong><br>
        <small>${c.evento.ciudad} - ${c.evento.fecha}</small><br>
        <small>Zona: ${c.zona || 'General'}</small><br>
        <button class="btn-descargar" onclick="descargarEntradaDesdeModal('${c.evento.nombre}', '${c.evento.ciudad}', '${c.evento.fecha}', '${c.zona}')">Descargar entrada</button>
      </div>
      <button class="btn-cancelar" onclick="cancelarEntrada(${c.id})">Cancelar entrada</button>
    `;
    lista.appendChild(li);
  });
}

function toggleCompras() {
  const popup = document.getElementById("popupCompras");
  const visible = popup.style.display === "block";
  popup.style.display = visible ? "none" : "block";
  if (!visible) mostrarCompras();
}

async function cancelarEntrada(compraId) {
  try {
    const eliminado = await apiService.cancelarCompra(compraId);
    await cargarCompras();
    mostrarCompras();
    abrirModal("Cancelado", `Cancelaste la entrada para: ${eliminado.compra.evento.nombre}`);
  } catch (error) {
    manejarErrorAuth(error);
    console.error("Error al cancelar entrada:", error);
    abrirModal("Error", error.message || "Error al cancelar la entrada");
  }
}

function abrirModal(titulo, mensaje) {
  document.getElementById("modalTitulo").textContent = titulo;
  document.getElementById("modalTexto").textContent = mensaje;
  document.getElementById("modal").style.display = "flex";
  document.getElementById("btnEntrada").style.display = titulo.includes("Compra") ? "inline-block" : "none";
}

function cerrarModal() {
  document.getElementById("modal").style.display = "none";
}

function cerrarSesion() {
  limpiarToken();
  if (!localStorage.getItem("recordarme")) {
    localStorage.removeItem("recordarme");
  }
  window.location.href = "login.html";
}

function cerrarSesionPorInactividad() {
  limpiarToken();
  abrirModal("Sesión finalizada", "Se cerró la sesión por inactividad.");
  setTimeout(() => {
    window.location.href = "login.html";
  }, 3000);
}

function reiniciarTemporizadorInactividad() {
  clearTimeout(temporizadorInactividad);
  temporizadorInactividad = setTimeout(cerrarSesionPorInactividad, TIEMPO_LIMITE_INACTIVIDAD);
}

function iniciarDeteccionInactividad() {
  ["click", "mousemove", "keydown", "scroll", "touchstart"].forEach(evento =>
    document.addEventListener(evento, reiniciarTemporizadorInactividad)
  );
  reiniciarTemporizadorInactividad();
}

window.addEventListener("DOMContentLoaded", async () => {
  usuarioActivo = obtenerUsuarioActivo();
  if (!usuarioActivo) {
    window.location.href = "login.html";
    return;
  }

  await cargarEventos();
  await cargarCompras();
  
  mostrarPerfil();
  iniciarDeteccionInactividad();
});

document.addEventListener("click", function (e) {
  const popup = document.getElementById("popupCompras");
  const perfil = document.getElementById("perfilUsuario");
  if (!popup.contains(e.target) && !perfil.contains(e.target)) {
    popup.style.display = "none";
  }
});

document.addEventListener("keydown", function (e) {
  if (e.key === "Escape") {
    document.getElementById("popupCompras").style.display = "none";
    cerrarModal();
    cerrarModalEntrada();
    cerrarModalZona();
  }
});

function filtrarConciertos() {
  const texto = document.getElementById("inputBuscar").value.toLowerCase();
  const eventosFiltrados = eventos.filter(ev =>
    ev.nombre.toLowerCase().includes(texto) || ev.ciudad.toLowerCase().includes(texto)
  );

  mostrarConciertosFiltrados(eventosFiltrados);
}

function mostrarConciertosFiltrados(eventosFiltrados) {
  const contenedor = document.getElementById("listaConciertos");
  contenedor.innerHTML = "";
  eventosFiltrados.forEach((ev) => {
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

    const btnCompra = document.createElement("button");
    btnCompra.textContent = "Comprar entradas";
    btnCompra.onclick = () => comprarEntrada(ev.id);

    const btnHorario = document.createElement("button");
    btnHorario.textContent = "Ver horarios";
    btnHorario.onclick = () =>
      abrirModal("Horario del evento", `El evento en ${ev.ciudad} inicia a las 8:00 p.m.`);

    const btnZonas = document.createElement("button");
    btnZonas.textContent = "Ver zonas";
    btnZonas.onclick = () =>
      abrirModal("Zonas disponibles", "Zonas: General, Preferencial, VIP.");

    div.appendChild(titulo);
    div.appendChild(img);
    div.appendChild(detalles);
    div.appendChild(btnCompra);
    div.appendChild(btnHorario);
    div.appendChild(btnZonas);
    contenedor.appendChild(div);
  });
}

const TIEMPO_LIMITE_INACTIVIDAD = 2 * 60 * 1000;
let temporizadorInactividad;
