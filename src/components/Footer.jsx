import React from 'react';
import { GraduationCap, Github, Instagram, Twitter } from 'lucide-react';

const Footer = () => {
  return (
    <footer style={{
      padding: '80px 0 40px',
      borderTop: '1px solid var(--glass-border)',
      background: 'linear-gradient(to bottom, transparent, rgba(99, 102, 241, 0.05))'
    }}>
      <div className="container">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '40px',
          marginBottom: '60px'
        }}>
          {/* BRAND */}
          <div>
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
            <p style={{ maxWidth: '300px', fontSize: '0.9rem' }}>
              A maior comunidade de estudantes para troca de conhecimento, recursos e conexões. Facilitando sua vida escolar e universitária.
            </p>
          </div>

          {/* LINKS */}
          <div>
            <h4 style={{ marginBottom: '20px' }}>Plataforma</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.9rem' }}>
              <a href="#">Comunidade</a>
              <a href="#">Vestibulares</a>
              <a href="#">Caronas</a>
              <a href="#">Hospedagem</a>
            </div>
          </div>

          <div>
            <h4 style={{ marginBottom: '20px' }}>Suporte</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.9rem' }}>
              <a href="#">Ajuda</a>
              <a href="#">Regras da Comunidade</a>
              <a href="#">Privacidade</a>
              <a href="#">Termos de Uso</a>
            </div>
          </div>

          {/* SOCIAL */}
          <div>
            <h4 style={{ marginBottom: '20px' }}>Redes Sociais</h4>
            <div style={{ display: 'flex', gap: '16px' }}>
              <a href="#" className="btn-glass" style={{ padding: '10px', borderRadius: '50%' }}><Instagram size={20} /></a>
              <a href="#" className="btn-glass" style={{ padding: '10px', borderRadius: '50%' }}><Twitter size={20} /></a>
              <a href="#" className="btn-glass" style={{ padding: '10px', borderRadius: '50%' }}><Github size={20} /></a>
            </div>
          </div>
        </div>

        <div style={{
          paddingTop: '30px',
          borderTop: '1px solid var(--glass-border)',
          textAlign: 'center',
          fontSize: '0.85rem'
        }}>
          <p>© {new Date().getFullYear()} HelpStudents. Feito com ❤️ para estudantes.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
