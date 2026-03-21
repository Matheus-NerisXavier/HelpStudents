// Utilitário central de logs de auditoria (LGPD)
// Encapsula o bypass de fetch para garantir que os logs sejam gravados sem conflitos de lock.

const sUrl = import.meta.env.VITE_SUPABASE_URL;
const sKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const logActivity = async ({ userId, token, action, route, oldData, newData }) => {
  if (!userId || !token) {
    console.warn("Logger: Falha ao iniciar log (faltam credenciais)");
    return;
  }

  try {
    // 1. Tentar pegar IP público (opcional, LGPD)
    let userIp = '0.0.0.0';
    try {
      const ipRes = await fetch('https://api.ipify.org?format=json', { signal: AbortSignal.timeout(2000) });
      const ipData = await ipRes.json();
      userIp = ipData.ip;
    } catch (e) {
      // Silencia falha de IP
    }

    // 2. Enviar Log via FETCH BYPASS (PostgREST)
    const endpoint = `${sUrl}/rest/v1/activity_logs`;
    
    await fetch(endpoint, {
      method: 'POST',
      headers: {
        'apikey': sKey,
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({
        user_id: userId,
        action,
        route,
        old: oldData,
        new: newData,
        ip_address: userIp,
        user_agent: navigator.userAgent,
        created_at: new Date().toISOString()
      })
    });
    
  } catch (err) {
    console.error("Logger Critical Error:", err);
  }
};
