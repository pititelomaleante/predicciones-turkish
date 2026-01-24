const SUPABASE_URL = 'https://xxbkbttwzkmbiiuqrdlo.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_YsH66sLWAARNM6gQ2P8lSw_Ngt2pCod';

async function initAuth() {
  const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm');
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  const {  { user } } = await supabase.auth.getUser();

  if (user) {
    // Usuario ya logueado: verificar si está aprobado
    const { data, error } = await supabase
      .from('users')
      .select('is_approved')
      .eq('id', user.id)
      .single();

    if (!error && data && data.is_approved) {
      document.getElementById('auth-content').innerHTML = `
        <p>Bienvenido.</p>
        <button onclick="window.location.href='predicciones.html'">Ver predicciones</button>
        <br><br>
        <button onclick="logout()">Cerrar sesión</button>
      `;
      window.logout = async () => {
        await supabase.auth.signOut();
        location.reload();
      };
      return;
    } else {
      document.getElementById('auth-content').innerHTML = `
        <p>Tu cuenta está pendiente de aprobación.</p>
        <button onclick="logout()">Cerrar sesión</button>
      `;
      window.logout = async () => {
        await supabase.auth.signOut();
        location.reload();
      };
      return;
    }
  }

  // Mostrar formulario de registro e inicio de sesión
  document.getElementById('auth-content').innerHTML = `
    <div style="border:1px solid #ccc; padding:15px; margin-bottom:20px;">
      <h2>¿Nuevo usuario?</h2>
      <input type="email" id="reg-email" placeholder="Email" /><br><br>
      <input type="password" id="reg-password" placeholder="Contraseña" /><br><br>
      <button onclick="registerUser()">Registrarse</button>
      <p id="reg-message"></p>
    </div>

    <div style="border:1px solid #ccc; padding:15px;">
      <h2>¿Ya tienes cuenta?</h2>
      <input type="email" id="login-email" placeholder="Email" /><br><br>
      <input type="password" id="login-password" placeholder="Contraseña" /><br><br>
      <button onclick="loginUser()">Iniciar sesión</button>
      <p id="login-message"></p>
    </div>
  `;

  // Registro
  window.registerUser = async () => {
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;
    const msg = document.getElementById('reg-message');

    if (!email || !password) {
      msg.innerText = 'Completa todos los campos.';
      return;
    }

    msg.innerText = 'Registrando...';
    try {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;

      const code = Math.random().toString(36).substring(2, 10).toUpperCase();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);

      const { error: dbError } = await supabase
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

  // Inicio de sesión
  window.loginUser = async () => {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const msg = document.getElementById('login-message');

    if (!email || !password) {
      msg.innerText = 'Completa todos los campos.';
      return;
    }

    msg.innerText = 'Iniciando sesión...';
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      location.reload(); // Recargar para mostrar estado
    } catch (err) {
      msg.innerText = 'Error: ' + (err.message || err);
    }
  };
}

initAuth();
