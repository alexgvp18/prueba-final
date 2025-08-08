async function verificarServidor() {
  try {
    const response = await fetch('http://localhost:3000/api/eventos');
    if (response.ok) {
      console.log('✅ Servidor disponible');
      return true;
    } else {
      console.log('❌ Servidor respondió con error:', response.status);
      return false;
    }
  } catch (error) {
    console.log('❌ Servidor no disponible:', error.message);
    return false;
  }
}

async function mostrarAlertaServidor() {
  const servidorDisponible = await verificarServidor();
  if (!servidorDisponible) {
    const mensaje = `
🚨 Servidor no disponible

Para usar esta aplicación, necesitas:

1. Abrir una terminal en la carpeta del proyecto
2. Ejecutar: npm install
3. Ejecutar: npm start
4. Esperar a que aparezca: "Servidor corriendo en http://localhost:3000"
5. Recargar esta página

¿Necesitas ayuda? Revisa el archivo README.md
    `;
    
    if (confirm(mensaje)) {
      window.open('README.md', '_blank');
    }
  }
}

window.verificarServidor = verificarServidor;
window.mostrarAlertaServidor = mostrarAlertaServidor;
