import React from 'react';
import { GraduationCap, Instagram, Facebook } from 'lucide-react';

const Footer = () => {
  const [isMobile, setIsMobile] = React.useState(window.innerWidth < 768);

  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <footer style={{
      padding: isMobile ? '60px 0 30px' : '80px 0 40px',
      borderTop: '1px solid var(--glass-border)',
      background: 'linear-gradient(to bottom, transparent, rgba(99, 102, 241, 0.05))'
    }}>
      <div className="container" style={{ padding: isMobile ? '0 20px' : '0 24px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: isMobile ? '40px' : '40px',
          marginBottom: isMobile ? '40px' : '60px',
          textAlign: isMobile ? 'center' : 'left'
        }}>
          {/* BRAND */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: isMobile ? 'center' : 'flex-start' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
              <div style={{
                background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                padding: '6px',
                borderRadius: '8px',
                display: 'flex'
              }}>
                <GraduationCap size={20} color="white" />
              </div>
              <span style={{ fontSize: '1.25rem', fontWeight: '800' }}>HelpStudents</span>
            </div>
            <p style={{ maxWidth: isMobile ? '100%' : '300px', fontSize: '0.9rem', lineHeight: '1.6' }}>
              A maior comunidade de estudantes para troca de conhecimento, recursos e conexões. Facilitando sua vida escolar e universitária.
            </p>
          </div>
 
          {/* LINKS */}
          <div>
            <h4 style={{ marginBottom: '20px', fontSize: '1.1rem', color: 'var(--text-main)' }}>Plataforma</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.9rem' }}>
              <a href="#" style={{ color: 'var(--text-muted)' }}>Comunidade</a>
              <a href="#" style={{ color: 'var(--text-muted)' }}>Vestibulares</a>
              <a href="#" style={{ color: 'var(--text-muted)' }}>Caronas</a>
              <a href="#" style={{ color: 'var(--text-muted)' }}>Hospedagem</a>
            </div>
          </div>
 
          <div>
            <h4 style={{ marginBottom: '20px', fontSize: '1.1rem', color: 'var(--text-main)' }}>Suporte</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.9rem' }}>
              <a href="#" style={{ color: 'var(--text-muted)' }}>Ajuda</a>
              <a href="#" style={{ color: 'var(--text-muted)' }}>Regras da Comunidade</a>
              <a href="#" style={{ color: 'var(--text-muted)' }}>Privacidade</a>
              <a href="#" style={{ color: 'var(--text-muted)' }}>Termos de Uso</a>
            </div>
          </div>
 
          {/* SOCIAL */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: isMobile ? 'center' : 'flex-start' }}>
            <h4 style={{ marginBottom: '20px', fontSize: '1.1rem', color: 'var(--text-main)' }}>Redes Sociais</h4>
            <div style={{ display: 'flex', gap: '16px' }}>
              <a href="#" className="btn-glass" style={{ padding: '10px', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--hover-bg)', color: 'var(--text-main)' }}>
                <Instagram size={18} />
              </a>
              <a href="#" className="btn-glass" style={{ padding: '10px', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--hover-bg)', color: 'var(--text-main)' }}>
                <Facebook size={18} />
              </a>
              {/* Ícone X (SVG customizado) */}
              <a href="#" className="btn-glass" style={{ padding: '10px', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--hover-bg)', color: 'var(--text-main)' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4l16 16M4 20L20 4"></path>
                </svg>
              </a>
              {/* Ícone TikTok (SVG customizado) */}
              <a href="#" className="btn-glass" style={{ padding: '10px', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--hover-bg)', color: 'var(--text-main)' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"></path>
                </svg>
              </a>
            </div>
          </div>
        </div>
 
        <div style={{
          paddingTop: '30px',
          borderTop: '1px solid var(--border-light)',
          textAlign: 'center',
          fontSize: '0.9rem',
          color: 'var(--text-muted)'
        }}>
          <p>© {new Date().getFullYear()} HelpStudents. Feito com ❤️ para estudantes.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
