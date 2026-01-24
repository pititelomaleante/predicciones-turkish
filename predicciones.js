// 🔑 Configuración de Supabase
const SUPABASE_URL = 'https://xxbkbttwzkmbiiuqrdlo.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_YsH66sLWAARNM6gQ2P8lSw_Ngt2pCod';

const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Verificar si el usuario está aprobado
async function checkAccess() {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { allowed: false, message: 'Debes iniciar sesión para ver predicciones.' };
  }

  // Buscar al usuario en tu tabla 'users'
  const { data, error } = await supabase
    .from('users')
    .select('is_approved')
    .eq('id', user.id)
    .single();

  if (error || !data || !data.is_approved) {
    return { allowed: false, message: 'Acceso no autorizado. Contacta al administrador.' };
  }

  return { allowed: true };
}

// Cargar y mostrar predicciones
async function loadPredictions() {
  const { data, error } = await supabase
    .from('matches')
    .select('*')
    .order('match_date', { ascending: false });

  if (error) {
    document.getElementById('predictions-content').innerHTML = 
      `<p>Error al cargar predicciones.</p>`;
    return;
  }

  if (data.length === 0) {
    document.getElementById('predictions-content').innerHTML = 
      `<p>No hay predicciones disponibles aún.</p>`;
    return;
  }

  let html = '<h2>Últimas predicciones</h2>';
  data.forEach(match => {
    const date = new Date(match.match_date).toLocaleDateString('es-ES');
    html += `
      <div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0;">
        <h3>${match.home_team} vs ${match.away_team} (${match.sport})</h3>
        <p><strong>Fecha:</strong> ${date}</p>
        <p><strong>Predicción:</strong> ${match.prediction}</p>
        <p><strong>Razón:</strong> ${match.reason}</p>
      </div>
    `;
  });

  document.getElementById('predictions-content').innerHTML = html;
}

// Iniciar la app
async function init() {
  const { allowed, message } = await checkAccess();
  
  if (!allowed) {
    document.getElementById('predictions-content').innerHTML = 
      `<p style="color:red">${message}</p>`;
    return;
  }

  await loadPredictions();
}

init();
