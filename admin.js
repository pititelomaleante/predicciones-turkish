document.addEventListener('DOMContentLoaded', async () => {
  const supabase = window.supabase.createClient(
    'https://xxbkbttwzkmbiiuqrdlo.supabase.co',
    'sb_publishable_YsH66sLWAARNM6gQ2P8lSw_Ngt2pCod'
  );

  // 🔑 TU USER ID REAL (obligatorio)
  const ADMIN_ID = 'd7409179-68b6-4304-9345-6d33608e22eb';

  const { data: { user } } = await supabase.auth.getUser();

  if (!user || user.id !== ADMIN_ID) {
    document.getElementById('admin-content').innerHTML = `
      <p>Inicia sesión como admin:</p>
      <input type="email" id="e" placeholder="Email" /><br><br>
      <input type="password" id="p" placeholder="Contraseña" /><br><br>
      <button onclick="login()">Entrar</button>
      <p id="m"></p>
    `;
    window.login = async () => {
      const e = document.getElementById('e').value;
      const p = document.getElementById('p').value;
      const m = document.getElementById('m');
      m.innerText = 'Verificando...';
      try {
        const { error } = await supabase.auth.signInWithPassword({ email: e, password: p });
        if (error) throw error;
        location.reload();
      } catch {
        m.innerText = 'Acceso denegado.';
      }
    };
    return;
  }

  document.getElementById('admin-content').innerHTML = `
    <p>Aprobar código:</p>
    <input type="text" id="c" placeholder="Código" maxlength="10" />
    <button onclick="approve()">Aprobar</button>
    <p id="r"></p>
  `;
  window.approve = async () => {
    const c = document.getElementById('c').value.trim();
    const r = document.getElementById('r');
    if (!c) return r.innerText = 'Ingresa código.';
    try {
      const { error } = await supabase
        .from('users')
        .update({ is_approved: true })
        .eq('unique_code', c)
        .eq('is_approved', false);
      r.innerHTML = error ? '❌ Error' : '✅ Aprobado';
    } catch {
      r.innerHTML = '❌ Error';
    }
  };
});
