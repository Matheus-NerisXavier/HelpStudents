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
  ArrowRight 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const FeatureCard = ({ icon: Icon, title, description, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    whileHover={{ 
      y: -10, 
      scale: 1.02,
      boxShadow: "0 20px 40px rgba(139, 92, 246, 0.2)",
      borderColor: "var(--primary)"
    }}
    transition={{ duration: 0.5, delay }}
    viewport={{ once: true }}
    className="glass-card"
    style={{
      padding: '32px',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      cursor: 'pointer',
      background: 'rgba(255, 255, 255, 0.03)',
      border: '1px solid var(--glass-border)',
      position: 'relative',
      overflow: 'hidden'
    }}
  >
    <div style={{
      background: 'rgba(139, 92, 246, 0.1)',
      border: '1px solid rgba(139, 92, 246, 0.2)',
      padding: '12px',
      borderRadius: '12px',
      width: 'fit-content'
    }}>
      <Icon size={24} color="var(--primary)" />
    </div>
    <h3 style={{ fontSize: '1.25rem' }}>{title}</h3>
    <p style={{ fontSize: '0.95rem', lineHeight: '1.6', color: 'var(--text-muted)' }}>{description}</p>
    <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', fontWeight: '600', color: 'var(--secondary)' }}>
      Explorar <ArrowRight size={16} />
    </div>
  </motion.div>
);

const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div style={{ paddingTop: 'calc(var(--nav-height) + 20px)', paddingBottom: '60px' }}>
      <div className="container" style={{ padding: '0 20px' }}>
        {/* HERO SECTION */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          style={{ textAlign: 'center', maxWidth: '850px', margin: '0 auto 100px auto' }}
        >
          <motion.span variants={itemVariants} className="badge-premium">
            🚀 Revolutionizing Student Life
          </motion.span>
          
          <motion.h1 variants={itemVariants} style={{ fontSize: 'min(4.5rem, 12vw)', fontWeight: '900', letterSpacing: '-3px', marginBottom: '24px', lineHeight: 1 }}>
            A sua jornada acadêmica <br />
            <span className="text-gradient">elevada ao próximo nível.</span>
          </motion.h1>

          <motion.p variants={itemVariants} style={{ fontSize: '1.25rem', color: 'var(--text-muted)', marginBottom: '40px' }}>
            Conecte-se com milhares de alunos, compartilhe recursos e facilite sua vida escolar com a comunidade HelpStudents.
          </motion.p>
          
          <motion.div variants={itemVariants} style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
            <Link to="/signup" className="btn-primary" style={{ padding: '18px 36px', borderRadius: '16px' }}>
              Entrar na Comunidade
            </Link>
            <Link to="/login" className="btn-glass" style={{ padding: '18px 36px', borderRadius: '16px' }}>
              Acessar Conta
            </Link>
          </motion.div>
        </motion.div>

        {/* FEATURES GRID */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '32px' }}>
          <FeatureCard icon={MessageSquare} title="Fórum de Estudos" description="Tire suas dúvidas e ajude outros estudantes." delay={0.1} />
          <FeatureCard icon={ImageIcon} title="Mural de Fotos" description="Veja fotos de lousas e cadernos compartilhados." delay={0.2} />
          <FeatureCard icon={GraduationCap} title="Vestibulares" description="Acompanhe datas e notícias sobre exames." delay={0.3} />
          <FeatureCard icon={Car} title="Caronas" description="Economize e faça amigos solicitando caronas." delay={0.4} />
          <FeatureCard icon={HomeIcon} title="Hospedagem" description="Encontre repúblicas e colegas de quarto." delay={0.5} />
          <FeatureCard icon={Briefcase} title="Carreira" description="Oportunidades de estágio e dicas de mercado." delay={0.6} />
        </div>
      </div>
    </div>
  );
};

export default Home;
