import React from 'react';
import { GraduationCap, LogIn } from 'lucide-react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav style={{
      height: 'var(--nav-height)',
      display: 'flex',
      alignItems: 'center',
      padding: '0 24px',
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 1000,
      background: 'rgba(5, 6, 8, 0.8)',
      backdropFilter: 'blur(15px)',
      borderBottom: '1px solid var(--glass-border)'
    }}>
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {/* LOGO */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
          <div style={{
            background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
            padding: '8px',
            borderRadius: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 20px var(--primary-glow)'
          }}>
            <GraduationCap size={24} color="white" />
          </div>
          <span style={{ fontSize: '1.4rem', fontWeight: '900', letterSpacing: '-1px' }}>
            Help<span style={{ color: 'var(--secondary)' }}>Students</span>
          </span>
        </Link>

        {/* LINKS (Desktop) - Removidos conforme pedido (serão exibidos pós-login) */}
        <div style={{ flex: 1 }} />

        {/* ACTIONS */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Link to="/login" className="btn-glass" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', fontSize: '0.9rem' }}>
            <LogIn size={18} />
            <span>Entrar</span>
          </Link>
          <Link to="/signup" className="btn-primary" style={{ padding: '10px 24px', fontSize: '0.9rem', textDecoration: 'none' }}>
            Participar
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
