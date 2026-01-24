const SUPABASE_URL = 'https://xxbkbttwzkmbiiuqrdlo.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_YsH66sLWAARNM6gQ2P8lSw_Ngt2pCod';

// Tu User ID real (obligatorio para seguridad)
const ADMIN_USER_ID = 'd7409179-68b6-4304-9345-6d33608e22eb'; // ← ¡REEMPLAZA ESTO!

async function initAdmin() {
  const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm');
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  const {  { user } } = await supabase.auth.getUser();

  if (!user || user.id !== ADMIN_USER_ID) {
    // Mostrar formulario de login SIN revelar que es admin
    document.getElementById('admin-content').innerHTML = `
      <p>Inicia sesión con tus credenciales de administrador.</p>
      <input type="email" id="admin-email" placeholder="Email" /><br><br>
      <input type="password" id="admin-password" placeholder="Contraseña" /><br><br>
      <button onclick="loginAsAdmin()">Iniciar sesión</button>
      <p id="admin-message"></p>
    `;
    window.loginAsAdmin = async () => {
      const email = document.getElementById('admin-email').value;
      const password = document.getElementById('admin-password').value;
      const msg = document.getElementById('admin-message');

      if (!email || !password) {
        msg.innerText = 'Completa todos los campos.';
        return;
      }

      msg.innerText = 'Verificando...';
      try {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        location.reload(); // Recargar para verificar si es admin
      } catch (err) {
        msg.innerText = 'Acceso denegado.';
      }
    };
    return;
  }

  // Si es el admin real, mostrar panel
  document.getElementById('admin-content').innerHTML = `
    <p>Panel de aprobación</p>
    <input type="text" id="code" placeholder="Código único" maxlength="10" />
    <button onclick="approveCode()">Aprobar</button>
    <p id="result"></p>
    <br>
    <button onclick="logoutAdmin()">Cerrar sesión</button>
  `;

  window.approveCode = async () => {
    const code = document.getElementById('code').value.trim();
    const result = document.getElementById('result');
    if (!code) {
      result.innerText = 'Ingresa un código.';
      return;
    }

    try {
      const { error } = await supabase
        .from('users')
        .update({ is_approved: true, approved_at: new Date().toISOString() })
        .eq('unique_code', code)
        .eq('is_approved', false);

      if (error) throw error;
      result.innerHTML = '<p style="color:green">✅ Aprobado.</p>';
    } catch (err) {
      result.innerHTML = `<p style="color:red">❌ Error.</p>`;
    }
  };

  window.logoutAdmin = async () => {
    await supabase.auth.signOut();
    location.reload();
  };
}

initAdmin();
