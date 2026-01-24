// 🔑 CONFIGURACIÓN: PON AQUÍ TUS DATOS DE SUPABASE
const SUPABASE_URL = 'https://xxbkbttwzkmbiiuqrdlo.supabase.co';      // ← ¡Cambia esto!
const SUPABASE_ANON_KEY = 'sb_publishable_YsH66sLWAARNM6gQ2P8lSw_Ngt2pCod';    // ← ¡Cambia esto!

const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Función para generar código único de 8 letras/números
function generateCode() {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
}

// Registrar usuario y guardar su código
async function handleRegister(email, password) {
  try {
    // 1. Registrar en Supabase Auth
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;

    // 2. Generar código y fecha de expiración (+30 días)
    const code = generateCode();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    // 3. Guardar en tu tabla 'users'
    const { error: dbError } = await supabase
      .from('users')
      .insert({
        id: data.user.id,
        email: email,
        unique_code: code,
        access_expires_at: expiresAt.toISOString()
      });

    if (dbError) throw dbError;

    alert(`¡Registro exitoso! Tu código es: ${code}\nMuéstraselo al administrador para obtener acceso.`);
    location.reload(); // Recargar página
  } catch (err) {
    alert('Error: ' + err.message);
  }
}

// Mostrar formulario simple
document.getElementById('content').innerHTML = `
  <h2>Regístrate para ver predicciones</h2>
  <input type="email" id="email" placeholder="Email" /><br><br>
  <input type="password" id="password" placeholder="Contraseña" /><br><br>
  <button onclick="
    handleRegister(
      document.getElementById('email').value,
      document.getElementById('password').value
    )
  ">Registrarse</button>
`;
