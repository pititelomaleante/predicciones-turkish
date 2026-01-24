const SUPABASE_URL = 'https://xxbkbttwzkmbiiuqrdlo.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_YsH66sLWAARNM6gQ2P8lSw_Ngt2pCod';

async function registerUser() {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const msg = document.getElementById('message');

  if (!email || !password) {
    msg.innerText = 'Por favor, completa todos los campos.';
    return;
  }

  msg.innerText = 'Registrando...';

  try {
    const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm');
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

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
}

document.getElementById('content').innerHTML = `
  <h2>Regístrate para ver predicciones</h2>
  <input type="email" id="email" placeholder="Email" /><br><br>
  <input type="password" id="password" placeholder="Contraseña" /><br><br>
  <button onclick="registerUser()">Registrarse</button>
  <p id="message"></p>
`;
