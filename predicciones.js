const SUPABASE_URL = 'https://xxbkbttwzkmbiiuqrdlo.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_YsH66sLWAARNM6gQ2P8lSw_Ngt2pCod';

async function initPredictions() {
  try {
    const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm');
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    // Verificar si hay usuario logueado
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      document.getElementById('predictions-content').innerHTML = `
        <p>No has iniciado sesión.</p>
        <button onclick="window.location.href='index.html'">Ir a inicio</button>
      `;
      return;
    }

    // Verificar si está aprobado
    const { data, error } = await supabase
      .from('users')
      .select('is_approved')
      .eq('id', user.id)
      .single();

    if (error || !data || !data.is_approved) {
      document.getElementById('predictions-content').innerHTML = `
        <p>Acceso no autorizado. Contacta al administrador.</p>
        <button onclick="window.location.href='index.html'">Volver</button>
      `;
      return;
    }

    // Cargar predicciones
    const { data: matches, error: matchesError } = await supabase
      .from('matches')
      .select('*')
      .order('match_date', { ascending: false });

    if (matchesError) {
      document.getElementById('predictions-content').innerHTML = 
        `<p>Error al cargar predicciones.</p>`;
      return;
    }

    if (matches.length === 0) {
      document.getElementById('predictions-content').innerHTML = 
        `<p>No hay predicciones disponibles aún.</p>`;
      return;
    }

    let html = '<h2>Últimas predicciones</h2>';
    matches.forEach(match => {
      const date = new Date(match.match_date).toLocaleDateString('es-ES');
      html += `
        <div style="border:1px solid #ccc; padding:10px; margin:10px 0;">
          <h3>${match.home_team} vs ${match.away_team} (${match.sport})</h3>
          <p><strong>Fecha:</strong> ${date}</p>
          <p><strong>Predicción:</strong> ${match.prediction}</p>
          <p><strong>Razón:</strong> ${match.reason}</p>
        </div>
      `;
    });

    document.getElementById('predictions-content').innerHTML = html;

  } catch (err) {
    document.getElementById('predictions-content').innerHTML = `
      <p>Error: ${err.message}</p>
      <button onclick="window.location.href='index.html'">Volver</button>
    `;
  }
}

// Iniciar
initPredictions();
