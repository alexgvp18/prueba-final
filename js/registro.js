document.addEventListener("DOMContentLoaded", async () => {
  try {
    const adminData = {
      nombre: "Admin",
      dni: "00000000",
      correo: "admin@admin.com",
      contrasena: "admin123",
      rol: "admin"
    };

    await apiService.registro(adminData);
    console.log("✅ Admin creado automáticamente desde registro.js");
  } catch (error) {
    if (!error.message.includes('ya existe')) {
      console.log("Usuario admin ya existe o error:", error.message);
    }
  }

  document.getElementById("formRegistro").addEventListener("submit", async function (e) {
    e.preventDefault();

    const nombre = document.getElementById("nombre").value.trim();
    const dni = document.getElementById("dni").value.trim();
    const correo = document.getElementById("correo").value.trim();
    const contrasena = document.getElementById("contrasena").value;
    const confirmar = document.getElementById("confirmar").value;
    const error = document.getElementById("registroError");

    if (!nombre || !dni || !correo || !contrasena || !confirmar) {
      error.textContent = "Todos los campos son obligatorios.";
      error.style.color = "red";
      return;
    }

    if (dni.length !== 8 || isNaN(dni)) {
      error.textContent = "DNI inválido.";
      error.style.color = "red";
      return;
    }

    if (contrasena !== confirmar) {
      error.textContent = "Las contraseñas no coinciden.";
      error.style.color = "red";
      return;
    }

    try {
      error.textContent = "Registrando usuario...";
      error.style.color = "blue";

      const usuarioData = {
        nombre,
        dni,
        correo,
        contrasena,
        rol: "usuario"
      };

      const response = await apiService.registro(usuarioData);
      console.log("Registro exitoso:", response);

      error.textContent = "¡Registro exitoso! Redirigiendo...";
      error.style.color = "green";
      
      setTimeout(() => {
        window.location.href = "login.html";
      }, 1500);

    } catch (error) {
      console.error("Error en registro:", error);
      
      if (error.message.includes('Servidor no disponible') || error.message.includes('No se puede conectar')) {
        error.textContent = "🚨 Error: Servidor no disponible. Por favor: 1) Abre una terminal en la carpeta del proyecto 2) Ejecuta 'npm install' 3) Ejecuta 'npm start' 4) Recarga esta página";
      } else if (error.message.includes('ya existe')) {
        error.textContent = "Este usuario ya está registrado. Intenta con otro correo o DNI.";
      } else {
        error.textContent = error.message || "Error al registrar usuario. Intenta nuevamente.";
      }
      error.style.color = "red";
    }
  });
});
