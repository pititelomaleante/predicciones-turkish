// 🔑 Tus claves de Supabase
const SUPABASE_URL = 'https://xxbkbttwzkmbiiuqrdlo.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_YsH66sLWAARNM6gQ2P8lSw_Ngt2pCod';

// 👤 Tu email de administrador
const ADMIN_EMAIL = 'yg611785@gmail.com';

async function initAdmin() {
  try {
    // Cargar librería de Supabase dinámicamente
    const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm');
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    // Verificar si es admin
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user || user.email !== ADMIN_EMAIL) {
      document.getElementById('admin-content').innerHTML = `
        <p>Acceso restringido. Solo el administrador puede entrar.</p>
        <button onclick="login()">Iniciar sesión</button>
      `;
      window.login = () => {
        const email = prompt('Email:');
        const password = prompt('Contraseña:');
        supabase.auth.signInWithPassword({ email, password });
      };
      return;
    }

    // Función para aprobar
    window.approveCode = async (code) => {
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
          `<p style="color:green">✅ Usuario aprobado.</p>`;
      } catch (err) {
        document.getElementById('result').innerHTML = 
          `<p style="color:red">❌ Error: ${err.message}</p>`;
      }
    };

    // Mostrar interfaz
    document.getElementById('admin-content').innerHTML = `
      <h2>Aprobar acceso de usuario</h2>
      <p>Ingresa el código único:</p>
      <input type="text" id="code" placeholder="Ej: A3B9XK2M" maxlength="10" />
      <button onclick="window.approveCode(document.getElementById('code').value)">Aprobar</button>
      <div id="result"></div>
    `;

  } catch (err) {
    document.getElementById('admin-content').innerHTML = 
      `<p style="color:red">Error al cargar: ${err.message}</p>`;
  }
}

// Iniciar
initAdmin();
