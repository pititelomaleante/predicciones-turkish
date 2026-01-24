// 🔑 Tus claves de Supabase
const SUPABASE_URL = 'https://xxbkbttwzkmbiiuqrdlo.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_YsH66sLWAARNM6gQ2P8lSw_Ngt2pCod';

// 👤 Tu email de administrador (¡cámbialo al tuyo!)
const ADMIN_EMAIL = 'yg611785@gmail.com'; // ← ¡REEMPLAZA ESTO!

const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Verificar si el usuario actual es el admin
async function checkAdmin() {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user || user.email !== ADMIN_EMAIL) {
    document.getElementById('admin-content').innerHTML = `
      <p>Acceso restringido. Solo el administrador puede entrar.</p>
      <button onclick="login()">Iniciar sesión como administrador</button>
    `;
    window.login = () => supabase.auth.signInWithOAuth({ provider: 'google' });
    // O usa email/contraseña:
    // window.login = () => {
    //   const email = prompt('Email de administrador:');
    //   const password = prompt('Contraseña:');
    //   supabase.auth.signInWithPassword({ email, password });
    // };
    return false;
  }
  return true;
}

// Aprobar un código
async function approveCode(code) {
  try {
    const { error } = await supabase
      .from('users')
      .update({
        is_approved: true,
        approved_at: new Date().toISOString()
      })
      .eq('unique_code', code)
      .eq('is_approved', false);

    if (error) throw error;
    
    document.getElementById('result').innerHTML = 
      `<p style="color:green">✅ Usuario aprobado correctamente.</p>`;
  } catch (err) {
    document.getElementById('result').innerHTML = 
      `<p style="color:red">❌ Error: ${err.message}</p>`;
  }
}

// Mostrar interfaz si es admin
async function initAdmin() {
  const isAdmin = await checkAdmin();
  if (!isAdmin) return;

  document.getElementById('admin-content').innerHTML = `
    <h2>Aprobar acceso de usuario</h2>
    <p>Ingresa el código único que te envió el usuario:</p>
    <input type="text" id="code" placeholder="Ej: A3B9XK2M" maxlength="10" />
    <button onclick="window.approveCode(document.getElementById('code').value)">
      Aprobar
    </button>
    <div id="result"></div>
  `;

  // Hacer approveCode accesible globalmente
  window.approveCode = approveCode;
}

// Iniciar
initAdmin();
