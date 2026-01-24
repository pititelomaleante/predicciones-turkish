// Configuración
const SUPABASE_URL = 'https://xxbkbttwzkmbiiuqrdlo.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_YsH66sLWAARNM6gQ2P8lSw_Ngt2pCod';
const ADMIN_EMAIL = 'yg611785@gmail.com'; // Tu email de admin

// Función principal
async function initAdmin() {
  try {
    const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm');
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    const { data: { user } } = await supabase.auth.getUser();

    if (!user || user.email !== ADMIN_EMAIL) {
      document.getElementById('admin-content').innerHTML = `
        <p>Acceso restringido. Solo el administrador puede entrar.</p>
        <button onclick="loginAsAdmin()">Iniciar sesión</button>
      `;
      window.loginAsAdmin = () => {
        const email = prompt('Email de administrador:');
        const password = prompt('Contraseña:');
        supabase.auth.signInWithPassword({ email, password });
      };
      return;
    }

    // Hacer approveCode accesible globalmente
    window.approveCode = async (code) => {
      if (!code.trim()) {
        document.getElementById('result').innerText = 'Por favor, ingresa un código.';
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
        document.getElementById('result').innerHTML = '<p style="color:green">✅ Usuario aprobado.</p>';
      } catch (err) {
        document.getElementById('result').innerHTML = `<p style="color:red">❌ Error: ${err.message}</p>`;
      }
    };

    document.getElementById('admin-content').innerHTML = `
      <h2>Aprobar acceso de usuario</h2>
      <p>Ingresa el código único:</p>
      <input type="text" id="code" placeholder="Ej: A3B9XK2M" maxlength="10" />
      <button onclick="window.approveCode(document.getElementById('code').value)">Aprobar</button>
      <div id="result"></div>
    `;

  } catch (err) {
    document.getElementById('admin-content').innerHTML = 
      `<p style="color:red">Error: ${err.message}</p>`;
  }
}

// Iniciar
initAdmin();
