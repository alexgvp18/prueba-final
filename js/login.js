document.addEventListener("DOMContentLoaded", async () => {
  const usuarioActivo = obtenerUsuarioActivo();
  if (usuarioActivo) {
    if (usuarioActivo.rol === "admin") {
      window.location.href = "admin.html";
    } else {
      window.location.href = "conciertos.html";
    }
    return;
  }

  try {
    const adminData = {
      nombre: "Admin",
      dni: "00000000",
      correo: "admin@admin.com",
      contrasena: "admin123",
      rol: "admin"
    };

    await apiService.registro(adminData);
    console.log("✅ Usuario admin creado automáticamente");
  } catch (error) {
    if (!error.message.includes('ya existe')) {
      console.log("Usuario admin ya existe o error:", error.message);
    }
  }
});

document.getElementById("formLogin").addEventListener("submit", async function (e) {
  e.preventDefault();

  const usuarioLogin = document.getElementById("usuarioLogin").value.trim();
  const contrasenaLogin = document.getElementById("contrasenaLogin").value;
  const loginError = document.getElementById("loginError");
  const recordarme = document.getElementById("recordarme")?.checked;

  if (!usuarioLogin || !contrasenaLogin) {
    loginError.textContent = "Por favor, completa todos los campos.";
    return;
  }

  try {
    loginError.textContent = "Iniciando sesión...";
    loginError.style.color = "blue";

    const response = await apiService.login({
      identificador: usuarioLogin,
      contrasena: contrasenaLogin
    });

    guardarToken(response.token, response.usuario);

    if (recordarme) {
      localStorage.setItem("recordarme", "true");
    } else {
      localStorage.removeItem("recordarme");
    }

    if (response.usuario.rol === "admin") {
      window.location.href = "admin.html";
    } else {
      window.location.href = "conciertos.html";
    }

  } catch (error) {
    console.error("Error en login:", error);
    loginError.textContent = error.message || "Credenciales incorrectas. Intenta nuevamente.";
    loginError.style.color = "red";
  }
});
