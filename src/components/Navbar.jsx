import React from 'react';
import { GraduationCap, LogIn } from 'lucide-react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  const [isMobile, setIsMobile] = React.useState(window.innerWidth < 768);

  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <nav style={{
      height: 'var(--nav-height)',
      display: 'flex',
      alignItems: 'center',
      padding: isMobile ? '0 16px' : '0 24px',
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 1000,
      background: 'rgba(5, 6, 8, 0.8)',
      backdropFilter: 'blur(15px)',
      borderBottom: '1px solid var(--glass-border)'
    }}>
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', maxWidth: '1200px', margin: '0 auto' }}>
        {/* LOGO */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '8px' : '12px', cursor: 'pointer', textDecoration: 'none', color: 'white' }}>
          <div style={{
            background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
            padding: isMobile ? '6px' : '8px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 15px var(--primary-glow)'
          }}>
            <GraduationCap size={isMobile ? 20 : 24} color="white" />
          </div>
          <span style={{ fontSize: isMobile ? '1.1rem' : '1.4rem', fontWeight: '900', letterSpacing: '-0.5px' }}>
            Help<span style={{ color: 'var(--secondary)' }}>Students</span>
          </span>
        </Link>

        {/* ACTIONS */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Link to="/login" className="btn-glass" style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            padding: isMobile ? '8px 12px' : '10px 20px', 
            fontSize: '0.85rem' 
          }}>
            <LogIn size={16} />
            <span>Entrar</span>
          </Link>
          {!isMobile && (
            <Link to="/signup" className="btn-primary" style={{ padding: '10px 24px', fontSize: '0.9rem', textDecoration: 'none' }}>
              Participar
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
