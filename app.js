// Configuración de Supabase
const SUPABASE_URL = 'https://xxbkbttwzkmbiiuqrdlo.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_YsH66sLWAARNM6gQ2P8lSw_Ngt2pCod';

// Cargar librería de Supabase dinámicamente (por si acaso)
async function loadSupabase() {
  if (typeof supabase === 'undefined') {
    await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm');
  }
}

// Función principal
async function initApp() {
  try {
    await loadSupabase();
    const client = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    // Mostrar formulario
    document.getElementById('content').innerHTML = `
      <h2>Regístrate para ver predicciones</h2>
      <input type="email" id="email" placeholder="Email" /><br><br>
      <input type="password" id="password" placeholder="Contraseña" /><br><br>
      <button onclick="registerUser()">Registrarse</button>
      <p id="message"></p>
    `;

    // Función de registro accesible globalmente
    window.registerUser = async function () {
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      const msg = document.getElementById('message');

      if (!email || !password) {
        msg.innerText = 'Por favor, completa todos los campos.';
        return;
      }

      msg.innerText = 'Registrando...';

      try {
        const { data, error } = await client.auth.signUp({ email, password });
        if (error) throw error;

        const code = Math.random().toString(36).substring(2, 10).toUpperCase();
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30);

        const { error: dbError } = await client
          .from('users')
          .insert({
            id: data.user.id,
            email: email,
            unique_code: code,
            access_expires_at: expiresAt.toISOString()
          });

        if (dbError) throw dbError;

        msg.innerHTML = `<strong>¡Éxito!</strong><br>Tu código es: <code>${code}</code><br>Muéstraselo al administrador.`;
      } catch (err) {
        msg.innerText = 'Error: ' + (err.message || err);
      }
    };
  } catch (err) {
    document.getElementById('content').innerHTML = `
      <h2>Error al cargar la aplicación</h2>
      <p>Detalles: ${err.message || err}</p>
      <p>Verifica tu conexión o contacta al administrador.</p>
    `;
  }
}

// Iniciar la app
initApp();
