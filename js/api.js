const API_BASE_URL = 'http://localhost:3000/api';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  getToken() {
    return localStorage.getItem('token');
  }

  async request(endpoint, options = {}) {
    const token = this.getToken();
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
      ...options,
      headers
    };

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.mensaje || `Error ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error en petición API:', error);
      
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('No se puede conectar con el servidor. Asegúrate de que el servidor Node.js esté corriendo en http://localhost:3000');
      }
      
      if (error.message.includes('Failed to fetch')) {
        throw new Error('Servidor no disponible. Por favor, inicia el servidor con "npm start" o "npm run dev"');
      }
      
      throw error;
    }
  }

  async registro(usuarioData) {
    return this.request('/registro', {
      method: 'POST',
      body: JSON.stringify(usuarioData)
    });
  }

  async login(credenciales) {
    return this.request('/login', {
      method: 'POST',
      body: JSON.stringify(credenciales)
    });
  }

  async getEventos() {
    return this.request('/eventos');
  }

  async crearEvento(eventoData) {
    return this.request('/eventos', {
      method: 'POST',
      body: JSON.stringify(eventoData)
    });
  }

  async actualizarEvento(id, eventoData) {
    return this.request(`/eventos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(eventoData)
    });
  }

  async eliminarEvento(id) {
    return this.request(`/eventos/${id}`, {
      method: 'DELETE'
    });
  }

  async getCompras() {
    return this.request('/compras');
  }

  async crearCompra(compraData) {
    return this.request('/compras', {
      method: 'POST',
      body: JSON.stringify(compraData)
    });
  }

  async cancelarCompra(id) {
    return this.request(`/compras/${id}`, {
      method: 'DELETE'
    });
  }

  async getUsuarios() {
    return this.request('/usuarios');
  }

  async eliminarUsuario(id) {
    return this.request(`/usuarios/${id}`, {
      method: 'DELETE'
    });
  }
}

const apiService = new ApiService();

function manejarErrorAuth(error) {
  if (error.message.includes('401') || error.message.includes('Token')) {
    localStorage.removeItem('token');
    localStorage.removeItem('usuarioActivo');
    window.location.href = 'login.html';
  }
  throw error;
}

function guardarToken(token, usuario) {
  localStorage.setItem('token', token);
  localStorage.setItem('usuarioActivo', JSON.stringify(usuario));
}

function limpiarToken() {
  localStorage.removeItem('token');
  localStorage.removeItem('usuarioActivo');
}

function obtenerUsuarioActivo() {
  const usuario = localStorage.getItem('usuarioActivo');
  return usuario ? JSON.parse(usuario) : null;
}

window.apiService = apiService;
window.manejarErrorAuth = manejarErrorAuth;
window.guardarToken = guardarToken;
window.limpiarToken = limpiarToken;
window.obtenerUsuarioActivo = obtenerUsuarioActivo;
