import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { logActivity } from '../lib/logger';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const sessionRef = React.useRef(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId) => {
    if (!userId) return;
    try {
      const token = sessionRef.current?.access_token;
      if (!token) return;

      const sUrl = import.meta.env.VITE_SUPABASE_URL;
      const sKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      const endpoint = `${sUrl}/rest/v1/user_profiles?id=eq.${userId}&select=*`;
      
      const response = await fetch(endpoint, {
        headers: { 'apikey': sKey, 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        if (data?.[0]) setProfile(data[0]);
      }
    } catch (err) {
      // Erro silencioso em produção
    }
  };

  useEffect(() => {
    // 1. Carga inicial
    supabase.auth.getSession().then(async ({ data: { session: s } }) => {
      sessionRef.current = s;
      setSession(s);
      if (s?.user) {
        setUser(s.user);
        await fetchProfile(s.user.id);
        logActivity({
          userId: s.user.id,
          token: s.access_token,
          action: 'login',
          route: window.location.pathname
        });
      }
      setLoading(false);
    });

    // 2. Listener de mudanças
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, s) => {
      sessionRef.current = s;
      setSession(s);
      if (s?.user) {
        setUser(s.user);
        await fetchProfile(s.user.id);
        if (event === 'SIGNED_IN') {
          logActivity({
            userId: s.user.id,
            token: s.access_token,
            action: 'login',
            route: window.location.pathname
          });
        }
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
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
      setSession(null);
      setProfile(null);
    } catch (err) {
      console.error("Erro ao sair:", err);
      // Fallback: garante a limpeza local mesmo com erro na rede
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('sb-')) localStorage.removeItem(key);
      });
      setUser(null);
      setSession(null);
      setProfile(null);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      profile, 
      session,
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
