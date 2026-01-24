const SUPABASE_URL = 'https://xxbkbttwzkmbiiuqrdlo.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_YsH66sLWAARNM6gQ2P8lSw_Ngt2pCod';

// 🔑 TU USER ID REAL (cámbialo por el tuyo)
const ADMIN_USER_ID = 'd7409179-68b6-4304-9345-6d33608e22eb'; // ← ¡REEMPLAZA ESTO!

async function initAdmin() {
  try {
    const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm');
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    const { data: { user } } = await supabase.auth.getUser();

    // Solo tú (por User ID) puedes entrar
    if (!user || user.id !== ADMIN_USER_ID) {
      document.getElementById('admin-content').innerHTML = `
        <p>Acceso restringido. Solo el administrador puede entrar.</p>
        <button onclick="loginAsAdmin()">Iniciar sesión</button>
      `;
      window.loginAsAdmin = () => {
        const email = prompt('Email:');
        const password = prompt('Contraseña:');
        supabase.auth.signInWithPassword({ email, password });
      };
      return;
    }

    // Función para aprobar
    window.approveCode = async (code) => {
      if (!code.trim()) {
        document.getElementById('result').innerText = 'Ingresa un código.';
        return;
      }
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
        document.getElementById('result').innerHTML = '<p style="color:green">✅ Aprobado.</p>';
      } catch (err) {
        document.getElementById('result').innerHTML = `<p style="color:red">❌ ${err.message}</p>`;
      }
    };

    document.getElementById('admin-content').innerHTML = `
      <h2>Panel de Administrador</h2>
      <p>Usuario: ${user.email}</p>
      <hr>
      <p>Ingresa el código único:</p>
      <input type="text" id="code" placeholder="Ej: A3B9XK2M" maxlength="10" />
      <button onclick="window.approveCode(document.getElementById('code').value)">Aprobar</button>
      <div id="result"></div>
      <br>
      <button onclick="logout()">Cerrar sesión</button>
    `;
    window.logout = async () => {
      await supabase.auth.signOut();
      location.reload();
    };

  } catch (err) {
    document.getElementById('admin-content').innerHTML = 
      `<p style="color:red">Error: ${err.message}</p>`;
  }
}

initAdmin();
