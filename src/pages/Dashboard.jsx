import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, 
  Search, 
  User as UserIcon, 
  Plus,
  Car,
  Menu
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import ProfileCompletion from '../components/ProfileCompletion';

const Dashboard = () => {
  const { user, profile, refreshProfile } = useAuth();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [showCompletion, setShowCompletion] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

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

  // Monitora se o perfil está incompleto
  React.useEffect(() => {
    if (profile && !profile.is_profile_complete) {
      setShowCompletion(true);
    } else {
      setShowCompletion(false);
    }
  }, [profile]);
  
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  const firstName = (profile?.full_name || user?.user_metadata?.full_name)?.split(' ')[0] || 'Estudante';
  
  return (
    <div style={{ display: 'flex', background: '#050608', minHeight: '100vh', color: 'white', overflowX: 'hidden' }}>
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
                style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: 'white', padding: '10px', borderRadius: '12px' }}
              >
                <Menu size={24} />
              </button>
            )}
            <div>
              <h1 style={{ fontSize: isMobile ? '1.8rem' : '2.5rem', fontWeight: '900', letterSpacing: '-1px', marginBottom: '4px' }}>
                {getGreeting()}, {firstName}! 👋
              </h1>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: isMobile ? '0.9rem' : '1.1rem', fontWeight: '500' }}>
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
              background: 'rgba(255,255,255,0.03)', 
              border: '1px solid rgba(255,255,255,0.05)', 
              borderRadius: '16px', 
              padding: '12px 16px', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px', 
              flex: 1,
              maxWidth: isMobile ? '100%' : '350px' 
            }}>
              <Search size={18} color="rgba(255,255,255,0.3)" />
              <input 
                type="text" 
                placeholder="Buscar..." 
                style={{ background: 'none', border: 'none', color: 'white', outline: 'none', fontSize: '0.9rem', width: '100%' }} 
              />
            </div>
            
            <div style={{ display: 'flex', gap: '12px' }}>
              <div style={{ 
                width: '44px', 
                height: '44px', 
                borderRadius: '12px', 
                background: 'rgba(255,255,255,0.03)', 
                border: '1px solid rgba(255,255,255,0.05)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center' 
              }}>
                <Bell size={20} />
              </div>
              <div style={{ 
                width: '44px', 
                height: '44px', 
                borderRadius: '12px', 
                background: 'var(--primary)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                boxShadow: '0 0 20px rgba(139, 92, 246, 0.3)' 
              }}>
                <UserIcon size={20} color="white" />
              </div>
            </div>
          </div>
        </header>

        {/* QUICK ACTIONS GRID */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', 
          gap: isMobile ? '16px' : '24px', 
          marginBottom: isMobile ? '32px' : '48px' 
        }}>
          {[
            { title: 'Criar Tópico', desc: 'Tire uma dúvida no fórum', icon: <Plus size={28} />, color: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' },
            { title: 'Pedir Carona', desc: 'Encontre motoristas próximos', icon: <Car size={28} />, color: 'linear-gradient(135deg, #06b6d4, #0891b2)' },
            { title: 'Material Novo', desc: 'Compartilhe seus estudos', icon: <Plus size={28} />, color: 'linear-gradient(135deg, #10b981, #059669)' },
          ].map((card, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -8, scale: 1.02 }}
              style={{
                padding: '32px',
                borderRadius: '28px',
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.05)',
                cursor: 'pointer',
                boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
              }}
            >
              <div style={{ 
                width: '56px', 
                height: '56px', 
                borderRadius: '16px', 
                background: card.color, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                marginBottom: '24px',
                boxShadow: '0 0 20px rgba(0,0,0,0.3)'
              }}>
                {card.icon}
              </div>
              <h4 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '8px' }}>{card.title}</h4>
              <p style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.4)', lineHeight: '1.5' }}>{card.desc}</p>
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
            background: 'rgba(255,255,255,0.02)', 
            border: '1px solid rgba(255,255,255,0.05)', 
            borderRadius: isMobile ? '24px' : '32px', 
            padding: isMobile ? '24px' : '40px' 
          }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: '900', marginBottom: '32px' }}>Feed da Comunidade</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {[1, 2, 3].map(item => (
                <motion.div 
                  key={item} 
                  whileHover={{ background: 'rgba(255,255,255,0.03)' }}
                  style={{ 
                    padding: isMobile ? '16px' : '24px', 
                    borderRadius: '20px', 
                    background: 'rgba(255,255,255,0.01)', 
                    border: '1px solid rgba(255,255,255,0.03)',
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
                      <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)' }}>Engenharia • {item * 5}m atrás</span>
                    </div>
                  </div>
                  <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.8)', lineHeight: '1.6' }}>
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
                  <p key={i} style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', lineHeight: '1.5' }}>{news}</p>
                ))}
              </div>
            </div>

            <div style={{ 
              background: 'rgba(255,255,255,0.02)', 
              border: '1px solid rgba(255,255,255,0.05)', 
              borderRadius: isMobile ? '24px' : '32px', 
              padding: '24px' 
            }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '900', marginBottom: '16px' }}>Caronas Próximas</h3>
              <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)', textAlign: 'center', padding: '10px 0' }}>
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
