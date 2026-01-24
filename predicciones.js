const SUPABASE_URL = 'https://xxbkbttwzkmbiiuqrdlo.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_YsH66sLWAARNM6gQ2P8lSw_Ngt2pCod';

async function loadPredictions() {
  try {
    const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm');
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    const {  { user } } = await supabase.auth.getUser();
    if (!user) {
      document.getElementById('predictions-content').innerHTML = 
        `<p>Debes iniciar sesión. <a href="index.html">Regístrate</a>.</p>`;
      return;
    }

    const { data, error } = await supabase
      .from('users')
      .select('is_approved')
      .eq('id', user.id)
      .single();

    if (error || !data || !data.is_approved) {
      document.getElementById('predictions-content').innerHTML = 
        `<p>Acceso no autorizado. Contacta al administrador.</p>`;
      return;
    }

    const {  matches } = await supabase
      .from('matches')
      .select('*')
      .order('match_date', { ascending: false });

    if (matches.length === 0) {
      document.getElementById('predictions-content').innerHTML = 
        `<p>No hay predicciones aún.</p>`;
      return;
    }

    let html = '<h2>Predicciones</h2>';
    matches.forEach(m => {
      const date = new Date(m.match_date).toLocaleDateString('es-ES');
      html += `
        <div style="border:1px solid #ccc; padding:10px; margin:10px 0;">
          <strong>${m.home_team} vs ${m.away_team}</strong> (${m.sport})<br>
          <em>${date}</em><br>
          ${m.prediction}<br>
          <small>${m.reason}</small>
        </div>
      `;
    });
    document.getElementById('predictions-content').innerHTML = html;

  } catch (err) {
    document.getElementById('predictions-content').innerHTML = 
      `<p>Error: ${err.message}</p>`;
  }
}

loadPredictions();
