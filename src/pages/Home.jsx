import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { 
  MessageSquare, 
  Car, 
  Home as HomeIcon, 
  Image as ImageIcon, 
  Briefcase, 
  BookOpen, 
  GraduationCap, 
  ArrowRight,
  Sparkles,
  Zap
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const BentoCard = ({ icon: Icon, title, description, delay, colSpan = 1, rowSpan = 1, color = "var(--primary)", glow = "var(--primary-glow)" }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95, y: 20 }}
    whileInView={{ opacity: 1, scale: 1, y: 0 }}
    whileHover={{ 
      y: -5, 
      boxShadow: `0 20px 40px ${glow}`,
      borderColor: color
    }}
    transition={{ duration: 0.3, delay: delay * 0.5 }}
    viewport={{ once: true, margin: "-50px" }}
    style={{
      gridColumn: `span ${colSpan}`,
      gridRow: `span ${rowSpan}`,
      padding: '32px',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      cursor: 'pointer',
      background: 'var(--glass-bg)',
      border: '1px solid var(--border-light)',
      borderRadius: '32px',
      position: 'relative',
      overflow: 'hidden',
      boxShadow: 'var(--card-shadow)'
    }}
  >
    {/* Glow de fundo no card */}
    <div style={{
      position: 'absolute',
      top: '-20px',
      right: '-20px',
      width: '120px',
      height: '120px',
      background: color,
      filter: 'blur(60px)',
      opacity: 0.15,
      borderRadius: '50%'
    }} />

    <div style={{
      background: `linear-gradient(135deg, ${color}22, transparent)`,
      border: `1px solid ${color}44`,
      padding: '16px',
      borderRadius: '20px',
      width: 'fit-content',
      boxShadow: `0 8px 16px ${glow}`
    }}>
      <Icon size={28} color={color} />
    </div>
    <h3 style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--text-main)', marginTop: 'auto' }}>{title}</h3>
    <p style={{ fontSize: '0.95rem', lineHeight: '1.6', color: 'var(--text-muted)' }}>{description}</p>
    
    <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.95rem', fontWeight: '700', color: color }}>
      Explorar <ArrowRight size={18} />
    </div>
  </motion.div>
);

const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = React.useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  return (
    <div style={{ 
      paddingTop: isMobile ? '80px' : 'calc(var(--nav-height) + 60px)', 
      paddingBottom: '100px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      
      {/* BACKGROUND BLOBS ANIMADOS (Agora mais sutis para não interferir nas cores da marca) */}
      <div style={{
        position: 'absolute', top: '10%', left: '5%', width: '40vw', height: '40vw',
        background: 'var(--primary)', filter: 'blur(150px)', opacity: 0.05, borderRadius: '50%', zIndex: -1,
        animation: 'float 10s ease-in-out infinite'
      }} />
      <div style={{
        position: 'absolute', top: '40%', right: '5%', width: '30vw', height: '30vw',
        background: 'var(--secondary)', filter: 'blur(150px)', opacity: 0.05, borderRadius: '50%', zIndex: -1,
        animation: 'float 12s ease-in-out infinite reverse'
      }} />

      <div className="container" style={{ padding: isMobile ? '0 20px' : '0 40px', maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* HERO SECTION 🚀 */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          style={{ 
            textAlign: 'center', 
            maxWidth: '900px', 
            margin: isMobile ? '0 auto 80px auto' : '0 auto 120px auto',
            position: 'relative'
          }}
        >
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: 'var(--hover-bg)',
              border: '1px solid var(--border-light)',
              padding: '8px 16px',
              borderRadius: '30px',
              marginBottom: '32px',
              color: 'var(--text-main)',
              fontWeight: '600',
              fontSize: '0.9rem'
            }}
          >
            <Sparkles size={16} color="var(--accent-warm)" /> A Revolução Universitária começou
          </motion.div>
          
          <h1 style={{ 
            fontSize: isMobile ? '2.5rem' : 'clamp(3rem, 6vw, 4.5rem)', 
            fontWeight: '900', 
            letterSpacing: isMobile ? '-1px' : '-2px', 
            marginBottom: '24px', 
            lineHeight: 1.1,
            color: 'var(--text-main)'
          }}>
            A sua jornada acadêmica <br />
            <span style={{
              background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              display: 'inline-block'
            }}>elevada ao próximo nível.</span>
          </h1>

          <p style={{ 
            fontSize: isMobile ? '1.1rem' : '1.3rem', 
            color: 'var(--text-main)', 
            fontWeight: '500',
            marginBottom: '48px',
            maxWidth: '700px',
            margin: '0 auto 48px auto',
            lineHeight: 1.6
          }}>
            Diga adeus à desorganização. Conecte-se com milhares de alunos, divida caronas, encontre alojamentos e domine suas matérias com a <b>HelpStudents</b>.
          </p>
          
          <div style={{ 
            display: 'flex', 
            flexDirection: isMobile ? 'column' : 'row',
            gap: '20px', 
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            <Link to="/signup" className="btn-primary" style={{ 
              padding: '20px 48px', 
              borderRadius: '20px', 
              fontSize: '1.2rem',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              width: isMobile ? '100%' : 'auto',
              justifyContent: 'center'
            }}>
              Começar Gratuitamente <Zap size={20} />
            </Link>
            <Link to="/login" style={{ 
              padding: '20px 48px', 
              borderRadius: '20px', 
              fontSize: '1.2rem',
              fontWeight: '700',
              color: 'var(--text-main)',
              background: 'var(--hover-bg)',
              border: '1px solid var(--border-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: isMobile ? '100%' : 'auto',
              transition: 'all 0.3s'
            }}>
              Já tenho conta
            </Link>
          </div>
        </motion.div>

        {/* BENTO BOX FEATURES GRID 🍱 */}
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <h2 style={{ fontSize: isMobile ? '2rem' : '3rem', fontWeight: '900', color: 'var(--text-main)', marginBottom: '16px', letterSpacing: '-1px' }}>
            Tudo o que você precisa em um só lugar.
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem' }}>Recursos criados de aluno para aluno.</p>
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', 
          gridAutoRows: 'minmax(250px, auto)',
          gap: isMobile ? '20px' : '32px' 
        }}>
          <BentoCard 
            icon={MessageSquare} 
            title="Fórum e Resumos" 
            description="Acabou o desespero na véspera da prova. Compartilhe resumos, tire dúvidas com veteranos e domine qualquer matéria rapidamente." 
            delay={0.1}
            colSpan={isMobile ? 1 : 2}
            color="#8b5cf6"
            glow="rgba(139, 92, 246, 0.4)"
          />
          <BentoCard 
            icon={Car} 
            title="Caronas Universitárias" 
            description="Divida os custos da gasolina e faça networking no caminho para o campus." 
            delay={0.2}
            color="#06b6d4"
            glow="rgba(6, 182, 212, 0.4)"
          />
          <BentoCard 
            icon={HomeIcon} 
            title="Alojamentos & Repúblicas" 
            description="Encontre o lugar perfeito e roommates que combinam com você." 
            delay={0.3}
            color="#10b981"
            glow="rgba(16, 185, 129, 0.4)"
          />
          <BentoCard 
            icon={GraduationCap} 
            title="Central do Vestibular" 
            description="Alertas de datas, provas anteriores e guia definitivo." 
            delay={0.4}
            color="#f59e0b"
            glow="rgba(245, 158, 11, 0.4)"
          />
          <BentoCard 
            icon={Briefcase} 
            title="Carreira & Estágios" 
            description="As melhores vagas e dicas para decolar no mercado de trabalho antes mesmo de formar." 
            delay={0.5}
            color="#ec4899"
            glow="rgba(236, 72, 153, 0.4)"
          />
        </div>

      </div>
      
      {/* Estilos inline para animações Keyframes (apenas para fallback, se precisar de classe global colocamos no index.css) */}
      <style>{`
        @keyframes float {
          0% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-30px) scale(1.05); }
          100% { transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
};

export default Home;
