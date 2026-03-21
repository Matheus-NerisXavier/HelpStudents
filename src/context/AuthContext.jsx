import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const logAccess = async (userId) => {
    console.log("RL: Registrando acesso para o usuário:", userId);
    let userIp = '0.0.0.0';
    
    try {
      // Capturar IP público (LGPD)
      const ipResponse = await fetch('https://api.ipify.org?format=json');
      const ipData = await ipResponse.json();
      userIp = ipData.ip;
    } catch (ipErr) {
      console.warn("RL Warning: Não foi possível obter o IP:", ipErr);
    }

    try {
      const { error } = await supabase.from('access_logs').insert([
        { 
          user_id: userId,
          ip_address: userIp,
          user_agent: navigator.userAgent
        }
      ]);
      
      if (error) {
        console.error("RL Error: Falha ao inserir em access_logs:", error);
      } else {
        console.log("RL Success: Acesso registrado com IP:", userIp);
      }
    } catch (err) {
      console.error("RL Critical: Erro de exceção no logAccess:", err);
    }
  };

  const fetchProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (!error && data) {
        setProfile(data);
      }
    } catch (err) {
      console.error("Erro ao buscar perfil:", err);
    }
  };

  useEffect(() => {
    const getSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUser(session.user);
          logAccess(session.user.id);
          await fetchProfile(session.user.id);
        }
      } catch (err) {
        console.error("Erro ao carregar sessão inicial:", err);
      } finally {
        setLoading(false);
      }
    };

    getSession();

    // Timeout de segurança: se o Supabase demorar demais, libera a tela
    const safetyTimeout = setTimeout(() => {
      setLoading(false);
    }, 3000);

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      try {
        if (session?.user) {
          setUser(session.user);
          logAccess(session.user.id);
          await fetchProfile(session.user.id);
        } else {
          setUser(null);
          setProfile(null);
        }
      } catch (err) {
        console.error("Erro na mudança de estado de autenticação:", err);
      } finally {
        setLoading(false);
      }
    });

    return () => {
      clearTimeout(safetyTimeout);
      subscription.unsubscribe();
    };
  }, []);

  const logout = async () => {
    try {
      // 1. Tentar o logout oficial
      await supabase.auth.signOut();
      
      // 2. Limpar manual de todos os tokens do Supabase no LocalStorage
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('sb-')) {
          localStorage.removeItem(key);
        }
      });

      // 3. Resetar estados locais
      setUser(null);
      setProfile(null);
    } catch (err) {
      console.error("Erro ao sair:", err);
      // Fallback: garante a limpeza local mesmo com erro na rede
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('sb-')) localStorage.removeItem(key);
      });
      setUser(null);
      setProfile(null);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      profile, 
      loading, 
      signOut: logout, 
      refreshProfile: () => fetchProfile(user?.id) 
    }}>
      {loading ? (
        <div style={{ 
          height: '100vh', 
          width: '100vw', 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center', 
          justifyContent: 'center', 
          background: '#050608',
          color: 'white',
          fontFamily: "'Outfit', sans-serif"
        }}>
          <div style={{ 
            width: '80px', 
            height: '80px', 
            borderRadius: '20px', 
            overflow: 'hidden',
            background: 'rgba(139, 92, 246, 0.1)',
            marginBottom: '24px',
            boxShadow: '0 0 40px rgba(139, 92, 246, 0.2)'
          }}>
            <img src="/src/assets/logo.png" alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div className="loader-dots" style={{ fontSize: '1.5rem', fontWeight: '800', letterSpacing: '-0.5px' }}>
            HelpStudents
          </div>
          <style>{`
            .loader-dots::after {
              content: '...';
              animation: dots 1.5s steps(4, end) infinite;
              width: 0;
              display: inline-block;
              overflow: hidden;
            }
            @keyframes dots { to { width: 1.25em; } }
          `}</style>
        </div>
      ) : children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
