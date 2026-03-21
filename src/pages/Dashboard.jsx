import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, 
  Search, 
  User as UserIcon, 
  Plus,
  Car
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import ProfileCompletion from '../components/ProfileCompletion';

const Dashboard = () => {
  const { user, profile, refreshProfile } = useAuth();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [showCompletion, setShowCompletion] = useState(false);

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
    <div style={{ display: 'flex', background: '#050608', minHeight: '100vh', color: 'white' }}>
      <Sidebar isCollapsed={isSidebarCollapsed} onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)} />
      
      <motion.main 
        animate={{ marginLeft: isSidebarCollapsed ? '80px' : '280px' }}
        style={{ flex: 1, padding: '40px 60px' }}
      >
        {/* TOP BAR */}
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '48px' }}>
          <div>
            <h1 style={{ fontSize: '2.5rem', fontWeight: '900', letterSpacing: '-1.5px', marginBottom: '4px' }}>
              {getGreeting()}, {firstName}! 👋
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '1.1rem', fontWeight: '500' }}>
              {profile?.school || 'Pronto para os estudos hoje?'}
            </p>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <div style={{ 
              position: 'relative', 
              background: 'rgba(255,255,255,0.03)', 
              border: '1px solid rgba(255,255,255,0.05)', 
              borderRadius: '16px', 
              padding: '12px 20px', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px', 
              width: '350px' 
            }}>
              <Search size={20} color="rgba(255,255,255,0.3)" />
              <input 
                type="text" 
                placeholder="Buscar materiais ou fóruns..." 
                style={{ background: 'none', border: 'none', color: 'white', outline: 'none', fontSize: '1rem', width: '100%' }} 
              />
            </div>
            
            <div style={{ display: 'flex', gap: '16px' }}>
              <div style={{ 
                width: '48px', 
                height: '48px', 
                borderRadius: '14px', 
                background: 'rgba(255,255,255,0.03)', 
                border: '1px solid rgba(255,255,255,0.05)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                cursor: 'pointer' 
              }}>
                <Bell size={24} />
              </div>
              <div style={{ 
                width: '48px', 
                height: '48px', 
                borderRadius: '14px', 
                background: 'var(--primary)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                cursor: 'pointer', 
                boxShadow: '0 0 20px rgba(139, 92, 246, 0.4)' 
              }}>
                <UserIcon size={24} color="white" />
              </div>
            </div>
          </div>
        </header>

        {/* QUICK ACTIONS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '48px' }}>
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

        {/* FEED SECTIONS */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '40px' }}>
          <div style={{ 
            background: 'rgba(255,255,255,0.02)', 
            border: '1px solid rgba(255,255,255,0.05)', 
            borderRadius: '32px', 
            padding: '40px' 
          }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: '900', marginBottom: '32px' }}>Feed da Comunidade</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {[1, 2, 3].map(item => (
                <motion.div 
                  key={item} 
                  whileHover={{ background: 'rgba(255,255,255,0.03)' }}
                  style={{ 
                    padding: '24px', 
                    borderRadius: '24px', 
                    background: 'rgba(255,255,255,0.01)', 
                    border: '1px solid rgba(255,255,255,0.03)',
                    transition: 'all 0.3s'
                  }}
                >
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '16px' }}>
                    <div style={{ 
                      width: '40px', 
                      height: '40px', 
                      borderRadius: '50%', 
                      background: 'linear-gradient(45deg, var(--primary), var(--secondary))',
                      border: '2px solid rgba(255,255,255,0.1)'
                    }}></div>
                    <div>
                      <span style={{ fontSize: '1rem', fontWeight: '800', display: 'block' }}>Aluno {item}</span>
                      <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.3)' }}>Engenharia • software {item * 5}m atrás</span>
                    </div>
                  </div>
                  <p style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.8)', lineHeight: '1.6' }}>
                    Acabei de publicar os novos resumos de Cálculo III e Física Experimental. Aproveitem para revisar antes da prova! 📚💪
                  </p>
                </motion.div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <div style={{ 
              background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(6, 182, 212, 0.1))', 
              border: '1px solid rgba(139, 92, 246, 0.2)', 
              borderRadius: '32px', 
              padding: '32px' 
            }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '900', marginBottom: '20px', color: 'var(--primary)' }}>Notícias do Campus</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {[
                  "📅 Período de inscrições para o ENEM 2026 começa na próxima semana.",
                  "🏆 Universidade XYZ ganha prêmio nacional de inovação.",
                  "🛡️ Novos protocolos de segurança no Campus Central."
                ].map((news, i) => (
                  <p key={i} style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)', lineHeight: '1.5' }}>{news}</p>
                ))}
              </div>
            </div>

            <div style={{ 
              background: 'rgba(255,255,255,0.02)', 
              border: '1px solid rgba(255,255,255,0.05)', 
              borderRadius: '32px', 
              padding: '32px' 
            }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '900', marginBottom: '20px' }}>Caronas Próximas</h3>
              <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.4)', textAlign: 'center', padding: '20px 0' }}>
                🚗 Nenhum motorista disponível para o seu trajeto no momento.
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
