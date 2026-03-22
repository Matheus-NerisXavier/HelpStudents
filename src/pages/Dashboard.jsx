import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, 
  Search, 
  User as UserIcon, 
  Plus,
  Car,
  Menu,
  BookOpen
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import ProfileCompletion from '../components/ProfileCompletion';
import BannerCarousel from '../components/BannerCarousel';

const Dashboard = () => {
  const { user, profile, refreshProfile } = useAuth();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [showCompletion, setShowCompletion] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [banners, setBanners] = useState([]);
  const [loadingBanners, setLoadingBanners] = useState(true);
  // Monitora redimensionamento para responsividade
  React.useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) setIsSidebarCollapsed(true);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Busca banners de marketing
  React.useEffect(() => {
    const fetchBanners = async () => {
      try {
        const { supabase } = await import('../lib/supabase'); // Corrigido path
        const { data, error } = await supabase
          .from('marketing_banners')
          .select('*')
          .eq('is_active', true);
        
        if (!error && data) setBanners(data);
      } catch (err) {
        console.error('Erro banners:', err);
      } finally {
        setLoadingBanners(false);
      }
    };
    fetchBanners();
  }, []);

  // Monitora se o perfil está incompleto
  React.useEffect(() => {
    console.log("Dashboard - User:", user?.email);
    console.log("Dashboard - Profile Data:", profile);
    
    // Considera incompleto se is_profile_complete for FALSE ou NULL/undefined
    if (profile && (profile.is_profile_complete === false || profile.is_profile_complete === null || profile.is_profile_complete === undefined)) {
      console.log("Dashboard - Perfil Incompleto Detectado!");
      setShowCompletion(true);
    } else {
      setShowCompletion(false);
    }
  }, [profile, user]);
  
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  const firstName = (profile?.full_name || user?.user_metadata?.full_name)?.split(' ')[0] || 'Estudante';
  
  return (
    <div style={{ display: 'flex', background: 'var(--bg-main)', minHeight: '100vh', color: 'var(--text-main)', overflowX: 'hidden', transition: 'background-color 0.3s ease' }}>
      <Sidebar isCollapsed={isSidebarCollapsed} onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)} isMobile={isMobile} />
      
      <motion.main 
        animate={{ 
          marginLeft: isMobile ? '0' : (isSidebarCollapsed ? '80px' : '280px'),
          padding: isMobile ? '20px' : '40px 60px'
        }}
        style={{ flex: 1, position: 'relative' }}
      >
        {/* TOP BAR / HEADER */}
        <header style={{ 
          display: 'flex', 
          flexDirection: isMobile ? 'column' : 'row',
          justifyContent: 'space-between', 
          alignItems: isMobile ? 'flex-start' : 'center', 
          marginBottom: isMobile ? '32px' : '48px',
          gap: isMobile ? '20px' : '0'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', width: '100%' }}>
            {isMobile && (
              <button 
                onClick={() => setIsSidebarCollapsed(false)}
                style={{ background: 'var(--hover-bg)', border: 'none', color: 'var(--text-main)', padding: '10px', borderRadius: '12px' }}
              >
                <Menu size={24} />
              </button>
            )}
            <div>
              <h1 style={{ 
                fontSize: isMobile ? '1.8rem' : '2.5rem', 
                fontWeight: '900', 
                letterSpacing: '-1px', 
                marginBottom: '4px'
              }}>
                <span style={{
                  background: 'linear-gradient(to right, var(--text-main), var(--primary))',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>
                  {getGreeting()}, {firstName}!
                </span> 👋
              </h1>
              <p style={{ color: 'var(--text-muted)', fontSize: isMobile ? '0.9rem' : '1.1rem', fontWeight: '500' }}>
                {profile?.school || 'Pronto para os estudos hoje?'}
              </p>
            </div>
          </div>
          
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '16px', 
            width: isMobile ? '100%' : 'auto',
            justifyContent: 'space-between'
          }}>
            <div style={{ 
              position: 'relative', 
              background: 'var(--hover-bg)', 
              border: '1px solid var(--border-light)', 
              borderRadius: '16px', 
              padding: '12px 16px', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px', 
              flex: 1,
              maxWidth: isMobile ? '100%' : '350px' 
            }}>
              <Search size={18} color="var(--text-muted)" />
              <input 
                type="text" 
                placeholder="Buscar..." 
                style={{ background: 'none', border: 'none', color: 'var(--text-main)', outline: 'none', fontSize: '0.9rem', width: '100%' }} 
              />
            </div>
            
            <div style={{ display: 'flex', gap: isMobile ? '12px' : '16px' }}>
              <div style={{ 
                width: isMobile ? '48px' : '56px', 
                height: isMobile ? '48px' : '56px', 
                borderRadius: '50%', 
                background: 'var(--hover-bg)', 
                border: '1px solid var(--border-light)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                color: 'var(--text-main)',
                cursor: 'pointer'
              }}>
                <Bell size={isMobile ? 20 : 24} />
              </div>
              <div style={{ 
                width: isMobile ? '48px' : '56px', 
                height: isMobile ? '48px' : '56px', 
                borderRadius: '50%', 
                background: profile?.avatar_url ? 'transparent' : 'var(--primary)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                boxShadow: '0 8px 16px var(--primary-glow)',
                overflow: 'hidden',
                border: profile?.avatar_url ? '2px solid var(--primary)' : 'none',
                cursor: 'pointer'
              }}>

                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <UserIcon size={isMobile ? 20 : 24} color="white" />
                )}
              </div>
            </div>
          </div>
        </header>

        {/* BANNER DE INCENTIVO (Apenas se o perfil estiver incompleto) */}
        <AnimatePresence>
          {profile && !profile.is_profile_complete && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              style={{
                background: 'linear-gradient(90deg, rgba(139, 92, 246, 0.15), rgba(6, 182, 212, 0.15))',
                borderRadius: '20px',
                padding: isMobile ? '16px' : '20px 32px',
                border: '1px solid rgba(139, 92, 246, 0.2)',
                marginBottom: '32px',
                display: 'flex',
                flexDirection: isMobile ? 'column' : 'row',
                justifyContent: 'space-between',
                alignItems: isMobile ? 'flex-start' : 'center',
                gap: '16px',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <div style={{ position: 'relative', zIndex: 1 }}>
                <h4 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '4px', color: 'var(--text-main)' }}>Seu perfil está quase pronto! 🎓</h4>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                  Complete seus dados de turma e horário para se conectar com seus colegas.
                </p>
              </div>
              <button 
                onClick={() => setShowCompletion(true)}
                className="btn-primary"
                style={{ 
                  padding: '10px 24px', 
                  fontSize: '0.9rem', 
                  borderRadius: '12px',
                  whiteSpace: 'nowrap',
                  position: 'relative',
                  zIndex: 1
                }}
              >
                Completar Agora
              </button>
              
              {/* Efeito decorativo no banner */}
              <div style={{
                position: 'absolute',
                right: '-20px',
                top: '-20px',
                width: '100px',
                height: '100px',
                background: 'var(--primary)',
                filter: 'blur(50px)',
                opacity: 0.2
              }} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* CARROSSEL DE BANNERS */}
        <BannerCarousel banners={banners} isMobile={isMobile} />

        {/* QUICK ACTIONS GRID */}

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', 
          gap: isMobile ? '16px' : '24px', 
          marginBottom: isMobile ? '32px' : '48px' 
        }}>
          {[
            { title: 'Criar Tópico', desc: 'Tire uma dúvida no fórum', icon: <Plus size={28} color="white" />, color: '#8b5cf6', glow: 'rgba(139, 92, 246, 0.4)' },
            { title: 'Pedir Carona', desc: 'Encontre motoristas próximos', icon: <Car size={28} color="white" />, color: '#06b6d4', glow: 'rgba(6, 182, 212, 0.4)' },
            { title: 'Material Novo', desc: 'Compartilhe seus estudos', icon: <BookOpen size={28} color="white" />, color: '#10b981', glow: 'rgba(16, 185, 129, 0.4)' },
          ].map((card, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -8, scale: 1.02, boxShadow: `0 20px 40px ${card.glow}` }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              style={{
                padding: '32px',
                borderRadius: '32px',
                background: 'var(--glass-bg)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid var(--glass-border)',
                cursor: 'pointer',
                boxShadow: 'var(--card-shadow)',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <div style={{
                position: 'absolute',
                top: 0, right: 0, width: '150px', height: '150px',
                background: card.color,
                filter: 'blur(80px)',
                opacity: 0.15,
                borderRadius: '50%'
              }} />
              
              <div style={{ 
                width: '64px', 
                height: '64px', 
                borderRadius: '20px', 
                background: `linear-gradient(135deg, ${card.color}, #000)`, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                marginBottom: '24px',
                boxShadow: `0 10px 20px ${card.glow}`,
                position: 'relative',
                zIndex: 2
              }}>
                {card.icon}
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '8px', position: 'relative', zIndex: 2, color: 'var(--text-main)' }}>{card.title}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', fontWeight: '500', position: 'relative', zIndex: 2 }}>{card.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* FEED SECTIONS GRID */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr', 
          gap: isMobile ? '24px' : '40px' 
        }}>
          <div style={{ 
            background: 'var(--glass-bg)', 
            border: '1px solid var(--border-light)', 
            borderRadius: isMobile ? '24px' : '32px', 
            padding: isMobile ? '24px' : '40px' 
          }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: '900', marginBottom: '32px' }}>Feed da Comunidade</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {[1, 2, 3].map(item => (
                <motion.div 
                  key={item} 
                  whileHover={{ background: 'var(--hover-bg)' }}
                  style={{ 
                    padding: isMobile ? '16px' : '24px', 
                    borderRadius: '20px', 
                    background: 'var(--glass-bg)', 
                    border: '1px solid var(--glass-border)',
                    transition: 'all 0.3s'
                  }}
                >
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '12px' }}>
                    <div style={{ 
                      width: '36px', 
                      height: '36px', 
                      borderRadius: '50%', 
                      background: 'linear-gradient(45deg, var(--primary), var(--secondary))',
                    }}></div>
                    <div>
                      <span style={{ fontSize: '0.95rem', fontWeight: '800', display: 'block' }}>Aluno {item}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Engenharia • {item * 5}m atrás</span>
                    </div>
                  </div>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-main)', lineHeight: '1.6' }}>
                    Acabei de publicar os novos resumos de Cálculo III e Física Experimental. Aproveitem para revisar antes da prova! 📚💪
                  </p>
                </motion.div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '24px' : '32px' }}>
            <div style={{ 
              background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(6, 182, 212, 0.1))', 
              border: '1px solid rgba(139, 92, 246, 0.2)', 
              borderRadius: isMobile ? '24px' : '32px', 
              padding: isMobile ? '24px' : '32px' 
            }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '900', marginBottom: '16px', color: 'var(--primary)' }}>Notícias do Campus</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[
                  "📅 Inscrições para o ENEM 2026 começam na próxima semana.",
                  "🏆 Universidade XYZ ganha prêmio nacional.",
                  "🛡️ Novos protocolos de segurança no Campus."
                ].map((news, i) => (
                  <p key={i} style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>{news}</p>
                ))}
              </div>
            </div>

            <div style={{ 
              background: 'var(--glass-bg)', 
              border: '1px solid var(--border-light)', 
              borderRadius: isMobile ? '24px' : '32px', 
              padding: '24px' 
            }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '900', marginBottom: '16px' }}>Caronas Próximas</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center', padding: '10px 0' }}>
                🚗 Nenhum motorista disponível no momento.
              </p>
            </div>
          </div>
        </div>
        <section style={{ height: '100px' }} />
      </motion.main>

      <AnimatePresence>
        {showCompletion && (
          <ProfileCompletion 
            user={user} 
            onComplete={() => {
              setShowCompletion(false);
              refreshProfile();
            }} 
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;
