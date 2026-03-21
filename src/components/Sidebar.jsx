import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  MessageSquare, 
  Newspaper, 
  Car, 
  User, 
  Settings, 
  LogOut,
  Bell,
  Search,
  BookOpen,
  Menu,
  ChevronLeft
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';

const Sidebar = ({ isCollapsed, onToggle, isMobile }) => {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [showLogoutConfirm, setShowLogoutConfirm] = React.useState(false);

  const handleSignOut = async () => {
    console.log("Iniciando logout...");
    setShowLogoutConfirm(false); // Fecha o modal na hora para feedback visual
    try {
      await signOut();
      console.log("Logout concluído, redirecionando...");
      window.location.href = '/';
    } catch (err) {
      console.error("Erro crítico no logout:", err);
      window.location.href = '/';
    }
  };

  const menuItems = [
    { icon: <LayoutDashboard size={22} />, label: 'Dashboard', id: 'dash', active: window.location.pathname === '/dashboard', path: '/dashboard' },
    { icon: <MessageSquare size={22} />, label: 'Fórum de Dúvidas', id: 'forum', path: '/forum' },
    { icon: <Newspaper size={22} />, label: 'Notícias Escolares', id: 'news', path: '/news' },
    { icon: <BookOpen size={22} />, label: 'Materiais de Estudo', id: 'docs', path: '/docs' },
    { icon: <Car size={22} />, label: 'Caronas Universitárias', id: 'rides', path: '/rides' },
    { icon: <User size={22} />, label: 'Meus Dados / Perfil', id: 'profile', active: window.location.pathname === '/profile', path: '/profile' },
  ];

  const sidebarWidth = 280;

  return (
    <>
      {/* BACKDROP PARA MOBILE */}
      <AnimatePresence>
        {isMobile && !isCollapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onToggle}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background: 'rgba(0,0,0,0.6)',
              backdropFilter: 'blur(4px)',
              zIndex: 90
            }}
          />
        )}
      </AnimatePresence>

      <motion.div 
        initial={false}
        animate={{ 
          width: isMobile ? sidebarWidth : (isCollapsed ? '80px' : '280px'),
          x: isMobile && isCollapsed ? -sidebarWidth : 0
        }}
        style={{
          height: '100vh',
          background: '#0a0c10',
          borderRight: '1px solid rgba(255,255,255,0.05)',
          display: 'flex',
          flexDirection: 'column',
          padding: (isCollapsed && !isMobile) ? '24px 12px' : '32px 20px',
          position: 'fixed',
          zIndex: 100,
          boxShadow: isMobile && !isCollapsed ? '20px 0 50px rgba(0,0,0,0.5)' : 'none'
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        {/* HEADER / LOGO */}
        <div style={{ 
          marginBottom: '40px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: (isCollapsed && !isMobile) ? 'center' : 'space-between',
          padding: (isCollapsed && !isMobile) ? '0' : '0 12px'
        }}>
          {(!isCollapsed || isMobile) && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{ display: 'flex', alignItems: 'center', gap: '12px' }}
            >
              <div style={{ 
                width: '40px', 
                height: '40px', 
                borderRadius: '10px', 
                overflow: 'hidden',
                background: 'rgba(139, 92, 246, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <img src={logo} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <span style={{ fontWeight: '900', fontSize: '1.25rem', letterSpacing: '-0.5px' }}>HelpStudents</span>
            </motion.div>
          )}
          
          {(isCollapsed && !isMobile) && (
            <div style={{ 
              width: '40px', 
              height: '40px', 
              borderRadius: '10px', 
              overflow: 'hidden',
              background: 'rgba(139, 92, 246, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <img src={logo} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          )}

          {/* REMOVIDO DAQUI O BOTÃO DE TOGGLE PARA LIMPAR O VISUAL */}
        </div>

        {/* MENU ITEMS */}
        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {/* ... (menuItems mapping) */}
          {menuItems.map((item, i) => (
            <motion.div
              key={i}
              whileHover={{ x: (isCollapsed && !isMobile) ? 0 : 5, background: 'rgba(255,255,255,0.03)' }}
              onClick={() => item.path && navigate(item.path)}
              style={{
                padding: '12px',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: (isCollapsed && !isMobile) ? 'center' : 'flex-start',
                gap: '12px',
                cursor: 'pointer',
                background: item.active ? 'rgba(139, 92, 246, 0.1)' : 'transparent',
                color: item.active ? 'var(--primary)' : 'rgba(255,255,255,0.5)',
                transition: 'all 0.2s',
                position: 'relative'
              }}
            >
              {item.icon}
              {(!isCollapsed || isMobile) && (
                <motion.span 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  style={{ fontSize: '0.95rem', fontWeight: '700' }}
                >
                  {item.label}
                </motion.span>
              )}
            </motion.div>
          ))}
        </nav>

        {/* FOOTER ACTIONS */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* BOTÃO DE EXPANDIR/RECOLHER (AGORA NO RODAPÉ NO DESKTOP) */}
          {!isMobile && (
            <div 
              onClick={onToggle}
              style={{
                padding: '12px',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: isCollapsed ? 'center' : 'flex-start',
                gap: '12px',
                cursor: 'pointer',
                color: 'rgba(255,255,255,0.4)',
                background: 'rgba(255,255,255,0.02)',
                transition: 'all 0.2s'
              }}
            >
              <div style={{ transform: isCollapsed ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }}>
                <ChevronLeft size={22} />
              </div>
              {!isCollapsed && <span style={{ fontSize: '0.95rem', fontWeight: '700' }}>Recolher Menu</span>}
            </div>
          )}

          {/* SAIR DA CONTA */}
          <div 
            onClick={() => setShowLogoutConfirm(true)}
            style={{
              padding: '12px',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: (isCollapsed && !isMobile) ? 'center' : 'flex-start',
              gap: '12px',
              cursor: 'pointer',
              color: '#ef4444'
            }}
          >
            <LogOut size={22} />
            {(!isCollapsed || isMobile) && <span style={{ fontSize: '0.95rem', fontWeight: '700' }}>Sair da Conta</span>}
          </div>
        </div>
      </motion.div>

      {/* MODAL DE CONFIRMAÇÃO */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.8)',
              backdropFilter: 'blur(8px)',
              zIndex: 1000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px'
            }}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              style={{
                background: '#0a0c10',
                border: '1px solid rgba(255,255,255,0.1)',
                padding: '40px',
                borderRadius: '32px',
                maxWidth: '400px',
                width: '100%',
                textAlign: 'center'
              }}
            >
              <div style={{ 
                width: '64px', 
                height: '64px', 
                borderRadius: '50%', 
                background: 'rgba(239, 68, 68, 0.1)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                margin: '0 auto 24px auto',
                color: '#ef4444'
              }}>
                <LogOut size={32} />
              </div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: '900', marginBottom: '12px', color: 'white' }}>Deseja mesmo sair?</h3>
              <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '32px', lineHeight: '1.5' }}>
                Você precisará entrar novamente com seu e-mail e senha para acessar seus dados.
              </p>
              <div style={{ display: 'flex', gap: '16px' }}>
                <button 
                  onClick={() => setShowLogoutConfirm(false)}
                  style={{
                    flex: 1,
                    padding: '16px',
                    borderRadius: '16px',
                    background: 'rgba(255,255,255,0.05)',
                    color: 'white',
                    border: 'none',
                    fontWeight: '700'
                  }}
                >
                  Não, voltar
                </button>
                <button 
                  onClick={handleSignOut}
                  style={{
                    flex: 1,
                    padding: '16px',
                    borderRadius: '16px',
                    background: '#ef4444',
                    color: 'white',
                    border: 'none',
                    fontWeight: '700',
                    boxShadow: '0 10px 20px rgba(239, 68, 68, 0.2)'
                  }}
                >
                  Sim, sair
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;
