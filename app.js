document.addEventListener('DOMContentLoaded', async () => {
  const supabase = window.supabase.createClient(
    'https://xxbkbttwzkmbiiuqrdlo.supabase.co',
    'sb_publishable_YsH66sLWAARNM6gQ2P8lSw_Ngt2pCod'
  );

  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    const { data, error } = await supabase
      .from('users')
      .select('is_approved')
      .eq('id', user.id)
      .single();

    if (!error && data?.is_approved) {
      document.getElementById('content').innerHTML = `
        <p>Bienvenido.</p>
        <button onclick="location.href='predicciones.html'">Ver predicciones</button>
        <br><br>
        <button onclick="logout()">Cerrar sesión</button>
      `;
      window.logout = () => supabase.auth.signOut().then(() => location.reload());
      return;
    } else {
      document.getElementById('content').innerHTML = `<p>Cuenta pendiente de aprobación.</p>`;
      return;
    }
  }

  document.getElementById('content').innerHTML = `
    <div style="border:1px solid #ccc; padding:15px; margin-bottom:20px;">
      <h3>Registro</h3>
      <input type="email" id="email" placeholder="Email" /><br><br>
      <input type="password" id="password" placeholder="Contraseña" /><br><br>
      <button onclick="register()">Registrarse</button>
      <p id="msg"></p>
    </div>
  `;

  window.register = async () => {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const msg = document.getElementById('msg');
    if (!email || !password) return msg.innerText = 'Completa los campos.';
    msg.innerText = 'Registrando...';
    try {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
      const code = Math.random().toString(36).substring(2, 10).toUpperCase();
      const exp = new Date(); exp.setDate(exp.getDate() + 30);
      await supabase.from('users').insert({
        id: data.user.id,
        email,
        unique_code: code,
        access_expires_at: exp.toISOString()
      });
      msg.innerHTML = `<strong>¡Éxito!</strong><br>Código: <code>${code}</code>`;
    } catch (err) {
      msg.innerText = 'Error: ' + (err.message || err);
    }
  };
});
