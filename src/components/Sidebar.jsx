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
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  GraduationCap,
  Moon,
  Sun
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';

const Sidebar = ({ isMobile }) => {
  const { signOut } = useAuth();
  const { theme, toggleTheme, isSidebarCollapsed: isCollapsed, toggleSidebar: onToggle } = useTheme();
  const navigate = useNavigate();
  const [showLogoutConfirm, setShowLogoutConfirm] = React.useState(false);
  const [openMenus, setOpenMenus] = React.useState({
    academic: window.location.pathname.startsWith('/academic')
  });

  const toggleMenu = (id) => {
    setOpenMenus(prev => ({ ...prev, [id]: !prev[id] }));
  };

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
    {
      icon: <GraduationCap size={22} />,
      label: 'Acadêmico',
      id: 'academic',
      isExpandable: true,
      active: window.location.pathname.startsWith('/academic'),
      subItems: [
        { label: 'Minhas Instituições', path: '/academic' },
        { label: 'Matérias', path: '/academic/subjects' },
        { label: 'Notas e Boletim', path: '/academic/grades' },
        { label: 'Faltas', path: '/academic/attendance' }
      ]
    },
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
          background: 'var(--sidebar-bg)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderRight: '1px solid var(--border-light)',
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
            <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <motion.div
                whileHover={{ x: (isCollapsed && !isMobile) ? 0 : 5, background: item.active && !item.isExpandable ? 'linear-gradient(90deg, var(--primary-glow), transparent)' : 'var(--hover-bg)' }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  if (item.isExpandable) {
                    if (isCollapsed && !isMobile) onToggle(); // Expand if it was collapsed
                    toggleMenu(item.id);
                  } else {
                    if (item.path) navigate(item.path);
                    if (isMobile && !isCollapsed && onToggle) {
                      onToggle();
                    }
                  }
                }}
                style={{
                  padding: '12px 16px',
                  borderRadius: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: (isCollapsed && !isMobile) ? 'center' : 'space-between',
                  gap: '12px',
                  cursor: 'pointer',
                  background: (item.active && !item.isExpandable) ? 'var(--primary)' : (item.active && item.isExpandable && (!isCollapsed || isMobile) ? 'var(--hover-bg)' : 'transparent'),
                  color: (item.active && !item.isExpandable) ? '#ffffff' : (item.active && item.isExpandable ? 'var(--primary)' : 'var(--text-main)'),
                  borderLeft: (item.active && !isCollapsed) ? '4px solid var(--primary)' : '4px solid transparent',
                  paddingLeft: (item.active && !isCollapsed) ? '12px' : '16px',
                  opacity: item.active ? 1 : 0.7,
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  position: 'relative',
                  fontWeight: item.active ? '700' : '600',
                  boxShadow: (item.active && !item.isExpandable) ? '0 4px 12px rgba(139, 92, 246, 0.1)' : 'none'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    color: (item.active && !item.isExpandable) ? '#ffffff' : (item.active ? 'var(--primary)' : 'inherit'),
                    display: 'flex',
                    filter: item.active ? 'drop-shadow(0 0 8px var(--primary-glow))' : 'none'
                  }}>
                    {item.icon}
                  </div>
                  {(!isCollapsed || isMobile) && (
                    <motion.span
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      style={{ fontSize: '0.95rem', fontWeight: item.active ? '800' : '600', letterSpacing: '-0.3px', transition: 'color 0.3s' }}
                    >
                      {item.label}
                    </motion.span>
                  )}
                </div>

                {item.isExpandable && (!isCollapsed || isMobile) && (
                  <div style={{ display: 'flex', alignItems: 'center', opacity: 0.5 }}>
                    {openMenus[item.id] ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </div>
                )}
              </motion.div>

              {/* SubItems Render */}
              {item.isExpandable && (!isCollapsed || isMobile) && (
                <AnimatePresence>
                  {openMenus[item.id] && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      style={{ display: 'flex', flexDirection: 'column', gap: '4px', overflow: 'hidden', paddingLeft: '44px' }}
                    >
                      {item.subItems.map((sub, j) => {
                        const isSubActive = window.location.pathname === sub.path;
                        return (
                          <motion.div
                            key={j}
                            whileHover={{ x: 5, color: isSubActive ? '#ffffff' : 'var(--primary)' }}
                            onClick={() => {
                              navigate(sub.path);
                              // Auto-recolher menu após selecionar subitem para liberar espaço na tela 🚀
                              if (!isCollapsed && onToggle) onToggle();
                            }}
                            style={{
                              padding: '10px 12px',
                              borderRadius: '12px',
                              cursor: 'pointer',
                              color: isSubActive ? '#ffffff' : 'var(--text-muted)',
                              background: isSubActive ? 'var(--primary)' : 'transparent',
                              fontSize: '0.85rem',
                              fontWeight: isSubActive ? '900' : '600',
                              transition: 'all 0.2s',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              boxShadow: isSubActive ? '0 4px 12px var(--primary-glow)' : 'none'
                            }}
                          >
                            {isSubActive && <motion.div layoutId="sub-indicator" style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#ffffff' }} />}
                            {sub.label}
                          </motion.div>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              )}
            </div>
          ))}
        </nav>

        {/* FOOTER ACTIONS */}
        <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>

          {/* BOTÃO DE TEMA */}
          <div
            onClick={toggleTheme}
            style={{
              padding: '12px',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: (isCollapsed && !isMobile) ? 'center' : 'flex-start',
              gap: '12px',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              background: 'var(--hover-bg)',
              transition: 'all 0.2s'
            }}
          >
            {theme === 'dark' ? <Sun size={22} color="#f59e0b" /> : <Moon size={22} color="#8b5cf6" />}
            {(!isCollapsed || isMobile) && <span style={{ fontSize: '0.95rem', fontWeight: '700' }}>{theme === 'dark' ? 'Modo Claro' : 'Modo Escuro'}</span>}
          </div>

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
                color: 'var(--text-muted)',
                background: 'var(--hover-bg)',
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
            <LogOut size={22} color="#ef4444" />
            {(!isCollapsed || isMobile) && <span style={{ fontSize: '0.95rem', fontWeight: '700', color: '#ef4444' }}>Sair da Conta</span>}
          </div>
        </div>
      </motion.div>

      {/* CONFIRMAÇÃO DE LOGOUT MODAL */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              inset: 0,
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
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-light)',
                borderRadius: '24px',
                padding: '32px',
                maxWidth: '400px',
                width: '100%',
                textAlign: 'center',
                boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
              }}
            >
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px auto' }}>
                <LogOut size={32} color="#ef4444" />
              </div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '900', marginBottom: '12px', color: 'var(--text-main)' }}>Sair da Conta?</h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: '32px', lineHeight: '1.5' }}>
                Tem certeza que deseja sair? Você precisará fazer login novamente para acessar a plataforma.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  style={{
                    padding: '14px',
                    borderRadius: '16px',
                    background: 'var(--hover-bg)',
                    border: '1px solid var(--border-light)',
                    color: 'var(--text-main)',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}
                >
                  Cancelar
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
