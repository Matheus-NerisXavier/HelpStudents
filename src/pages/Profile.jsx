import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  User, Mail, Camera, ArrowLeft, Menu,
  Save, Loader2, Lock, ShieldCheck, Eye, EyeOff
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { supabase } from '../lib/supabase';
import { logActivity } from '../lib/logger';
import Sidebar from '../components/Sidebar';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const { user, profile, session, refreshProfile, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  const { isSidebarCollapsed, toggleSidebar, setSidebarCollapsed } = useTheme();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const [formData, setFormData] = useState({
    full_name: '',
    student_bio: '',
    interests: []
  });

  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [showPass, setShowPass] = useState(false);

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        student_bio: profile.student_bio || '',
        interests: profile.interests || []
      });
    }
  }, [profile]);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) setSidebarCollapsed(true);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [setSidebarCollapsed]);

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'Imagem muito grande (máx 2MB).' });
      return;
    }

    setUploading(true);
    setMessage({ type: '', text: '' });

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      // Upload para o bucket 'avatars'
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Obter URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Atualizar perfil com a nova URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      await refreshProfile();
      setMessage({ type: 'success', text: 'Foto de perfil atualizada! 📸' });
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          student_bio: formData.student_bio,
          interests: formData.interests,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;

      await logActivity({
        userId: user.id,
        token: session.access_token,
        action: 'profile_update',
        route: '/profile'
      });

      await refreshProfile();
      setMessage({ type: 'success', text: 'Perfil atualizado com sucesso! ✨' });
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'As senhas não coincidem.' });
      return;
    }
    if (passwordData.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'A senha deve ter pelo menos 6 caracteres.' });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: passwordData.newPassword });
      if (error) throw error;
      setMessage({ type: 'success', text: 'Senha alterada com sucesso! 🔐' });
      setPasswordData({ newPassword: '', confirmPassword: '' });
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div style={{ background: 'var(--bg-main)', height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-main)' }}>
        <Loader2 className="animate-spin" size={48} color="#8b5cf6" style={{ marginBottom: '20px' }} />
        <p style={{ fontWeight: '800', opacity: 0.5 }}>Sincronizando dados...</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', background: 'var(--bg-main)', minHeight: '100vh', color: 'var(--text-main)', overflowX: 'hidden' }}>
      <Sidebar isMobile={isMobile} />
      
      <motion.main 
        animate={{ 
          marginLeft: isMobile ? '0' : (isSidebarCollapsed ? '80px' : '280px'),
          padding: isMobile ? '20px' : '40px 60px'
        }}
        style={{ 
          flex: 1, 
          maxWidth: '1200px',
          margin: '0 auto',
          width: '100%',
          transition: 'margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      >
        <header style={{ marginBottom: '40px', display: 'flex', alignItems: 'center', gap: '20px' }}>
          {isMobile ? (
            <button onClick={toggleSidebar} style={{ background: 'var(--hover-bg)', border: 'none', color: 'var(--text-main)', padding: '10px', borderRadius: '12px' }}>
              <Menu size={24} />
            </button>
          ) : (
            <button onClick={() => navigate('/dashboard')} style={{ background: 'var(--hover-bg)', border: 'none', color: 'var(--text-main)', padding: '10px', borderRadius: '12px' }}>
              <ArrowLeft size={24} />
            </button>
          )}
          <h1 style={{ fontSize: isMobile ? '1.8rem' : '2.5rem', fontWeight: '900', letterSpacing: '-2px' }}>Meu Perfil</h1>
        </header>

        {message.text && (
          <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} style={{ padding: '16px 24px', borderRadius: '20px', background: message.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: message.type === 'success' ? '#10b981' : '#ef4444', border: `1px solid ${message.type === 'success' ? '#10b981' : '#ef4444'}`, marginBottom: '32px', fontWeight: '800', zIndex: 100 }}>
            {message.text}
          </motion.div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '350px 1fr', gap: '40px' }}>
          {/* CARTÃO LATERAL */}
          <div className="glass-card" style={{ padding: '40px', textAlign: 'center', height: 'fit-content', position: isMobile ? 'static' : 'sticky', top: '40px' }}>
            <div style={{ position: 'relative', width: '130px', height: '130px', margin: '0 auto 24px' }}>
              <div 
                style={{ 
                  width: '100%', 
                  height: '100%', 
                  borderRadius: '50%', 
                  background: 'linear-gradient(45deg, var(--primary), #d946ef)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  overflow: 'hidden',
                  border: '4px solid var(--hover-bg)',
                  boxShadow: '0 0 20px rgba(139, 92, 246, 0.3)'
                }}
              >
                {uploading ? (
                  <Loader2 className="animate-spin" size={40} color="white" />
                ) : profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <User size={60} color="white" />
                )}
              </div>
              <button 
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                style={{ position: 'absolute', bottom: '0', right: '0', background: 'var(--primary)', border: '4px solid var(--bg-card)', color: 'white', padding: '10px', borderRadius: '50%', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}
              >
                <Camera size={18} />
              </button>
              <input type="file" ref={fileInputRef} onChange={handleAvatarUpload} accept="image/*" style={{ display: 'none' }} />
            </div>
            <h2 style={{ fontWeight: '900', fontSize: '1.5rem', marginBottom: '8px' }}>{profile?.full_name || 'Estudante'}</h2>
            <p style={{ color: 'var(--text-muted)', fontWeight: '600', marginBottom: '24px' }}>@{user?.email?.split('@')[0]}</p>
          </div>

          {/* FORMULÁRIOS */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
            {/* INFORMAÇÕES BÁSICAS */}
            <div className="glass-card" style={{ padding: isMobile ? '24px' : '40px' }}>
              <h3 style={{ fontSize: '1.3rem', fontWeight: '900', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <User size={24} color="#8b5cf6" /> Informações Básicas
              </h3>
              <form onSubmit={handleSave}>
                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', marginBottom: '10px', fontWeight: '800', fontSize: '0.85rem', opacity: 0.6 }}>Nome Completo</label>
                  <input type="text" value={formData.full_name} onChange={(e) => setFormData({...formData, full_name: e.target.value})} className="glass-input" placeholder="Seu nome" />
                </div>
                <div style={{ marginBottom: '32px' }}>
                  <label style={{ display: 'block', marginBottom: '10px', fontWeight: '800', fontSize: '0.85rem', opacity: 0.6 }}>Bio Estudantil</label>
                  <textarea value={formData.student_bio} onChange={(e) => setFormData({...formData, student_bio: e.target.value})} className="glass-input" rows="4" placeholder="Fale um pouco sobre você..." style={{ resize: 'none' }} />
                </div>
                <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', padding: '18px', borderRadius: '18px', fontWeight: '900', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
                  {loading ? <Loader2 className="animate-spin" /> : <Save size={20} />} Atualizar Perfil
                </button>
              </form>
            </div>

            {/* SEGURANÇA */}
            <div className="glass-card" style={{ padding: isMobile ? '24px' : '40px' }}>
              <h3 style={{ fontSize: '1.3rem', fontWeight: '900', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <ShieldCheck size={24} color="#10b981" /> Segurança
              </h3>
              <form onSubmit={handlePasswordUpdate}>
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
                  <div style={{ position: 'relative' }}>
                    <label style={{ display: 'block', marginBottom: '10px', fontWeight: '800', fontSize: '0.85rem', opacity: 0.6 }}>Nova Senha</label>
                    <input type={showPass ? "text" : "password"} value={passwordData.newPassword} onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})} className="glass-input" placeholder="••••••••" style={{ paddingRight: '50px' }} />
                    <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: '15px', top: '42px', background: 'none', border: 'none', color: 'var(--text-muted)' }}>
                      {showPass ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '10px', fontWeight: '800', fontSize: '0.85rem', opacity: 0.6 }}>Confirmar Senha</label>
                    <input type={showPass ? "text" : "password"} value={passwordData.confirmPassword} onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})} className="glass-input" placeholder="••••••••" />
                  </div>
                </div>
                <button type="submit" disabled={loading} className="btn-glass" style={{ width: '100%', padding: '18px', borderRadius: '18px', fontWeight: '900', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
                  <Lock size={20} /> Alterar Senha
                </button>
              </form>
            </div>
          </div>
        </div>
      </motion.main>
    </div>
  );
};

export default Profile;
