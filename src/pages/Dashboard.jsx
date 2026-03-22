import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  TrendingUp, 
  ChevronRight,
  GraduationCap,
  Bell,
  Search,
  Menu,
  BookOpen
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Sidebar from '../components/Sidebar';
import ProfileCompletion from '../components/ProfileCompletion';
import BannerCarousel from '../components/BannerCarousel';

const Dashboard = () => {
  const { user, profile, refreshProfile } = useAuth();
  const { isSidebarCollapsed, toggleSidebar, setSidebarCollapsed } = useTheme();
  
  const [showCompletion, setShowCompletion] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [banners, setBanners] = useState([]);

  useEffect(() => {
    if (profile && !profile.is_profile_complete) {
      setShowCompletion(true);
    }
  }, [profile]);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) setSidebarCollapsed(true);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [setSidebarCollapsed]);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/banners?active=eq.true&select=*`, {
          headers: {
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
          }
        });
        
        if (!response.ok) {
          console.warn("Tabela de banners não encontrada ou inacessível.");
          setBanners([]);
          return;
        }

        const data = await response.json();
        // Garantir que data é um array antes de setar
        if (Array.isArray(data)) {
          setBanners(data);
        } else {
          setBanners([]);
        }
      } catch (err) {
        console.error("Erro ao buscar banners:", err);
        setBanners([]);
      }
    };
    fetchBanners();
  }, []);

  const stats = [
    { label: 'Matérias', value: '8', icon: <BookOpen />, color: '#8b5cf6' },
    { label: 'Média Geral', value: '8.5', icon: <TrendingUp />, color: '#10b981' },
    { label: 'Faltas', value: '12%', icon: <Clock />, color: '#f59e0b' },
    { label: 'Tarefas', value: '4', icon: <CheckCircle2 />, color: '#3b82f6' },
  ];

  return (
    <div style={{ display: 'flex', background: 'var(--bg-main)', minHeight: '100vh', color: 'var(--text-main)', overflowX: 'hidden', transition: 'background-color 0.3s ease' }}>
      <Sidebar isMobile={isMobile} />
      
      <motion.main 
        animate={{ 
          marginLeft: isMobile ? '0' : (isSidebarCollapsed ? '80px' : '280px'),
          padding: isMobile ? '20px' : '40px 60px'
        }}
        style={{ flex: 1, width: '100%', transition: 'margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)' }}
      >
        {/* HEADER */}
        <header style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', width: '100%' }}>
            {isMobile && (
              <button 
                onClick={toggleSidebar}
                style={{ background: 'var(--hover-bg)', border: 'none', color: 'var(--text-main)', padding: '10px', borderRadius: '12px' }}
              >
                <Menu size={24} />
              </button>
            )}
            <div>
              <h1 style={{ fontSize: isMobile ? '1.5rem' : '2.5rem', fontWeight: '900', letterSpacing: '-2px' }}>
                Olá, {profile?.full_name?.split(' ')[0] || 'Estudante'}! 👋
              </h1>
              <p style={{ color: 'var(--text-muted)', fontWeight: '600' }}>Tenha uma ótima aula hoje.</p>
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ position: 'relative', display: isMobile ? 'none' : 'block' }}>
              <Search size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
              <input 
                type="text" 
                placeholder="Pesquisar..." 
                style={{ 
                  background: 'var(--hover-bg)', 
                  border: '1px solid var(--border-light)', 
                  borderRadius: '16px', 
                  padding: '12px 16px 12px 48px',
                  color: 'var(--text-main)',
                  width: '240px',
                  outline: 'none',
                  fontWeight: '600'
                }} 
              />
            </div>
            <button style={{ background: 'var(--hover-bg)', border: 'none', color: 'var(--text-main)', padding: '12px', borderRadius: '14px', position: 'relative' }}>
              <Bell size={22} />
              <div style={{ position: 'absolute', top: '10px', right: '10px', width: '10px', height: '10px', background: '#ef4444', borderRadius: '50%', border: '2px solid var(--bg-main)' }} />
            </button>
          </div>
        </header>

        {/* BANNERS */}
        {banners.length > 0 && <BannerCarousel banners={banners} isMobile={isMobile} />}

        {/* STATS */}
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)', gap: '24px', marginBottom: '40px' }}>
          {stats.map((stat, i) => (
            <motion.div 
              key={i}
              whileHover={{ y: -5 }}
              style={{ 
                background: 'var(--glass-bg)', 
                backdropFilter: 'blur(16px)',
                border: '1px solid var(--border-light)', 
                borderRadius: '24px', 
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}
            >
              <div style={{ color: stat.color, background: `${stat.color}15`, width: '40px', height: '40px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {stat.icon}
              </div>
              <div>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: '700' }}>{stat.label}</p>
                <p style={{ fontSize: '1.8rem', fontWeight: '900' }}>{stat.value}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CONTENT GRID */}
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr', gap: '32px' }}>
          {/* PRÓXIMAS AULAS */}
          <section style={{ background: 'var(--glass-bg)', border: '1px solid var(--border-light)', borderRadius: '32px', padding: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '900' }}>Próximas Aulas</h2>
              <button style={{ color: 'var(--primary)', background: 'none', border: 'none', fontWeight: '800', cursor: 'pointer' }}>Ver Grade Completa</button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {[
                { name: 'Cálculo Diferencial e Integral', room: 'Laboratório 04', time: '19:00 - 20:40', color: '#8b5cf6' },
                { name: 'Estrutura de Dados', room: 'Sala 202', time: '20:50 - 22:30', color: '#3b82f6' }
              ].map((aula, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px', background: 'var(--hover-bg)', borderRadius: '20px', gap: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ width: '4px', height: '40px', background: aula.color, borderRadius: '2px' }} />
                    <div>
                      <h4 style={{ fontWeight: '800' }}>{aula.name}</h4>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '600' }}>{aula.room} • {aula.time}</p>
                    </div>
                  </div>
                  <ChevronRight size={20} style={{ opacity: 0.3 }} />
                </div>
              ))}
            </div>
          </section>

          {/* LEMBRETES / TAREFAS */}
          <section style={{ background: 'var(--glass-bg)', border: '1px solid var(--border-light)', borderRadius: '32px', padding: '32px' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '900', marginBottom: '24px' }}>Lembretes</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {[
                { task: 'Entrega Projeto Backend', date: 'Hoje', priority: 'high' },
                { task: 'Estudar para prova de IHC', date: 'Amanhã', priority: 'medium' }
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '16px', background: 'var(--hover-bg)', borderRadius: '16px' }}>
                  <div style={{ marginTop: '4px' }}>
                    <AlertCircle size={18} color={item.priority === 'high' ? '#ef4444' : '#f59e0b'} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: '800' }}>{item.task}</h4>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600' }}>Prazo: {item.date}</p>
                  </div>
                </div>
              ))}
              <button style={{ width: '100%', padding: '16px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '16px', fontWeight: '800', marginTop: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <Plus size={20} /> Novo Lembrete
              </button>
            </div>
          </section>
        </div>
      </motion.main>

      <AnimatePresence>
        {showCompletion && (
          <ProfileCompletion onClose={() => setShowCompletion(false)} onRefresh={refreshProfile} />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;
