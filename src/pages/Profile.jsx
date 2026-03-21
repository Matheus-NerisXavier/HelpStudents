import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Mail, Globe, BookOpen, Clock, ArrowLeft, Heart, 
  GraduationCap, School, Lock, Eye, EyeOff, CheckCircle2, 
  AlertCircle, Hash, FileText, Loader2, Search, Pencil
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { logActivity } from '../lib/logger';
import Sidebar from '../components/Sidebar';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const { user, profile, session, refreshProfile, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  const [schoolSuggestions, setSchoolSuggestions] = useState([]);
  const [searching, setSearching] = useState(false);
  const [uploading, setUploading] = useState(false);
  const suggestionRef = useRef(null);
  const fileInputRef = useRef(null);

  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Estado do formulário
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    student_bio: '',
    school_name: '',
    course_name: '',
    course_year: '',
    education_level: 'Ensino Superior',
    class_name: '',
    course_period: 'Manhã',
    campus_type: 'Presencial',
    interests: [],
    avatar_url: ''
  });

  const [initialized, setInitialized] = useState(false);

  // 1. Inicialização Estável (Se authLoading terminar e profile vier, carrega dados. Se não vier, inicializa vazio)
  useEffect(() => {
    if (!authLoading && !initialized && user) {
      console.log("Profile Initializing Data...");
      if (profile) {
        setFormData({
          email: user.email || '',
          full_name: profile.full_name || '',
          student_bio: profile.student_bio || '',
          school_name: profile.school_name || '',
          course_name: profile.course_name || '',
          course_year: profile.course_year?.toString() || '',
          education_level: profile.education_level || 'Ensino Superior',
          class_name: profile.class_name || '',
          course_period: profile.course_period || 'Manhã',
          campus_type: profile.campus_type || 'Presencial',
          interests: Array.isArray(profile.interests) ? profile.interests : [],
          avatar_url: profile.avatar_url || ''
        });
      } else {
        // Caso não exista perfil ainda (raro mas possível)
        setFormData(prev => ({ ...prev, email: user.email || '' }));
      }
      setInitialized(true);
    }
  }, [user, profile, authLoading, initialized]);

  // 2. Busca de Instituição com BYPASS total do cliente Supabase (usando fetch nativo)
  useEffect(() => {
    if (!initialized) return;
    const term = formData.school_name;
    
    if (term.length < 2) {
      setSchoolSuggestions([]);
      setSearching(false);
      return;
    }

    // Não buscar se for exatamente o que já está salvo
    if (profile && term === profile.school_name && schoolSuggestions.length === 0) return;

    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const sUrl = import.meta.env.VITE_SUPABASE_URL;
        const sKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
        
        if (!sUrl || !sKey) {
          console.error("Profile: Config missing");
          return;
        }

        const endpoint = `${sUrl}/rest/v1/educational_institutions?name=ilike.*${encodeURIComponent(term)}*&select=name&limit=6`;
        
        console.log("Profile - Buscando via Fetch:", endpoint);
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        const response = await fetch(endpoint, {
          headers: {
            'apikey': sKey,
            'Authorization': `Bearer ${sKey}` // Usa Anon Key para garantir acesso público
          },
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) throw new Error("Fetch failed");
        
        const data = await response.json();
        console.log("Profile - Resultados:", data.length);
        setSchoolSuggestions(data.map(i => ({ nome: i.name })));
      } catch (err) {
        console.error("Profile Search Critico:", err);
      } finally {
        setSearching(false);
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [formData.school_name, initialized]);

  const selectSchool = (nome) => {
    setFormData(prev => ({ ...prev, school_name: nome }));
    setSchoolSuggestions([]);
    setSearching(false);
  };

  const handleUpdate = async (e) => {
    if (e) e.preventDefault();
    
    if (!user?.id || !session?.access_token) {
      setMessage({ type: 'error', text: 'Sessão expirada. Por favor, faça login novamente.' });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });
    
    try {
      const sUrl = import.meta.env.VITE_SUPABASE_URL;
      const sKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      const endpoint = `${sUrl}/rest/v1/user_profiles?id=eq.${user.id}`;
      
      const response = await fetch(endpoint, {
        method: 'PATCH',
        headers: {
          'apikey': sKey,
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          full_name: formData.full_name,
          student_bio: formData.student_bio,
          school_name: formData.school_name,
          course_name: formData.course_name,
          course_year: parseInt(formData.course_year) || 0,
          education_level: formData.education_level,
          class_name: formData.class_name,
          course_period: formData.course_period,
          campus_type: formData.campus_type,
          interests: formData.interests,
          updated_at: new Date().toISOString()
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || "Erro ao salvar perfil no banco.");
      }

      // Log de Auditoria (LGPD) 🛡️
      await logActivity({
        userId: user.id,
        token: session.access_token,
        action: 'profile_update',
        route: '/profile',
        oldData: {
          full_name: profile?.full_name,
          school_name: profile?.school_name,
          course_name: profile?.course_name,
          course_year: profile?.course_year,
          education_level: profile?.education_level,
          interests: profile?.interests
        },
        newData: {
          full_name: formData.full_name,
          school_name: formData.school_name,
          course_name: formData.course_name,
          course_year: formData.course_year,
          education_level: formData.education_level,
          interests: formData.interests
        }
      });

      if (formData.email !== user.email) {
        const { error: emailError } = await supabase.auth.updateUser({ email: formData.email });
        if (emailError) throw emailError;
        setMessage({ type: 'success', text: 'Perfil salvo! Verifique a confirmação no seu NOVO e-mail.' });
      } else {
        setMessage({ type: 'success', text: 'Perfil atualizado com sucesso! ✨' });
      }
      
      await refreshProfile();
      
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Erro inesperado ao salvar.' });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'Senhas não coincidem.' });
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      setMessage({ type: 'success', text: 'Senha alterada com sucesso!' });
      setShowPasswordForm(false);
      setNewPassword(''); setConfirmPassword('');
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setMessage({ type: 'error', text: 'Por favor, selecione uma imagem válida (.jpg, .png).' });
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'A imagem deve ter no máximo 2MB.' });
      return;
    }

    setUploading(true);
    setMessage({ type: '', text: '' });

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('avatars').getPublicUrl(fileName);
      
      // Forçar atualização do cache da imagem adicionando timestamp
      const publicUrl = `${data.publicUrl}?t=${new Date().getTime()}`;

      // Salvar URL direto no banco de dados (Bypass)
      const sUrl = import.meta.env.VITE_SUPABASE_URL;
      const sKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      const endpoint = `${sUrl}/rest/v1/user_profiles?id=eq.${user.id}`;
      
      const updateRes = await fetch(endpoint, {
        method: 'PATCH',
        headers: {
          'apikey': sKey,
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({ avatar_url: publicUrl })
      });

      if (!updateRes.ok) throw new Error("Erro ao vincular imagem ao perfil.");

      setFormData(prev => ({ ...prev, avatar_url: publicUrl }));
      await refreshProfile(); // Atualiza contexto e Dashboard imediatamente
      setMessage({ type: 'success', text: 'Foto atualizada com sucesso! ✨' });
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Erro ao enviar foto.' });
    } finally {
      setUploading(false);
    }
  };

  const toggleInterest = (interest) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const interestOptions = ['Tecnologia', 'Esportes', 'Música', 'Artes', 'Games', 'Fotografia', 'Culinária', 'Estudos'];
  const yearOptions = formData.education_level === 'Ensino Médio' ? ['1', '2', '3'] : ['1', '2', '3', '4', '5', '6'];

  if (authLoading || !initialized) {
    return (
      <div style={{ background: '#050608', height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
        <Loader2 className="animate-spin" size={48} color="#8b5cf6" style={{ marginBottom: '20px' }} />
        <p style={{ fontWeight: '800', opacity: 0.5 }}>Sincronizando seus dados...</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', background: '#050608', minHeight: '100vh', color: 'white', fontFamily: "'Outfit', sans-serif" }}>
      <Sidebar isCollapsed={isSidebarCollapsed} onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)} isMobile={isMobile} />
      
      <motion.main 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, marginLeft: isMobile ? '0' : (isSidebarCollapsed ? '80px' : '280px'), padding: isMobile ? '20px' : '40px 60px' }}
        style={{ flex: 1 }}
      >
        <header style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '40px' }}>
          <button onClick={() => navigate('/dashboard')} className="btn-glass" style={{ padding: '12px', borderRadius: '16px' }}><ArrowLeft size={20} /></button>
          <h1 style={{ fontSize: isMobile ? '1.8rem' : '2.5rem', fontWeight: '900', letterSpacing: '-2px' }}>Meu Perfil</h1>
        </header>

        {message.text && (
          <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} style={{ padding: '16px 24px', borderRadius: '20px', background: message.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: message.type === 'success' ? '#10b981' : '#ef4444', border: `1px solid ${message.type === 'success' ? '#10b981' : '#ef4444'}`, marginBottom: '32px', fontWeight: '800' }}>
            {message.text}
          </motion.div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 2fr', gap: '40px' }}>
          {/* LADO PREVIEW */}
          <section style={{ background: 'rgba(15, 23, 42, 0.4)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '32px', padding: '40px', textAlign: 'center', position: isMobile ? 'relative' : 'sticky', top: '40px', backdropFilter: 'blur(20px)', alignSelf: 'start' }}>
            
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleImageUpload} 
              accept="image/*" 
              style={{ display: 'none' }} 
            />
            
            <div style={{ position: 'relative', width: '120px', height: '120px', margin: '0 auto 24px auto' }}>
              <div 
                onClick={() => fileInputRef.current?.click()}
                style={{ 
                  width: '100%', 
                  height: '100%', 
                  borderRadius: '40px', 
                  background: formData.avatar_url ? 'transparent' : 'linear-gradient(135deg, #8b5cf6, #06b6d4)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  boxShadow: '0 20px 40px rgba(139, 92, 246, 0.2)',
                  cursor: 'pointer',
                  position: 'relative',
                  overflow: 'hidden',
                  border: formData.avatar_url ? '2px solid #8b5cf6' : 'none'
                }}
              >
                {uploading && (
                  <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
                    <Loader2 className="animate-spin" size={24} color="white" />
                  </div>
                )}
                {formData.avatar_url ? (
                  <img src={formData.avatar_url} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <User size={60} />
                )}
                <div 
                  className="avatar-overlay"
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: 0,
                    transition: 'opacity 0.2s',
                    color: 'white',
                    fontSize: '0.9rem',
                    fontWeight: '700'
                  }}
                >
                  Mudar Foto
                </div>
              </div>

              {/* Ícone de Lápis Flutuante */}
              <div 
                onClick={() => fileInputRef.current?.click()}
                style={{
                  position: 'absolute',
                  bottom: '-4px',
                  right: '-4px',
                  background: '#8b5cf6',
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '3px solid #0f172a',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                  zIndex: 20,
                  transition: 'transform 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                <Pencil size={18} color="white" />
              </div>
            </div>
            
            <style>{`
              div:hover > .avatar-overlay { opacity: 1 !important; }
            `}</style>

            <h2 style={{ fontSize: '1.75rem', fontWeight: '900', marginBottom: '4px' }}>{formData.full_name || 'Estudante'}</h2>
            <p style={{ color: '#8b5cf6', fontWeight: '700', marginBottom: '24px' }}>{formData.education_level}</p>
            <div style={{ textAlign: 'left', background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)' }}><Mail size={14} /> {formData.email}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)' }}><Globe size={14} /> {formData.school_name || 'Não definida'}</div>
            </div>
          </section>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            {/* SEGURANÇA */}
            <div style={{ background: 'rgba(15, 23, 42, 0.4)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '32px', padding: isMobile ? '24px' : '40px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '900', marginBottom: '24px', color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '10px' }}><Lock size={20} /> Acesso & Segurança</h3>
              <div style={{ marginBottom: '24px' }}>
                <label style={{ fontSize: '0.8rem', opacity: 0.5, display: 'block', marginBottom: '8px' }}>E-mail Primário</label>
                <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} style={{ width: '100%', padding: '16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', color: 'white' }} />
              </div>
              
              {!showPasswordForm ? (
                <button onClick={() => setShowPasswordForm(true)} className="btn-glass" style={{ color: '#8b5cf6', fontWeight: '800' }}>Alterar minha senha atual</button>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ position: 'relative' }}>
                    <input type={showNewPassword ? "text" : "password"} placeholder="Nova senha segura" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} style={{ width: '100%', padding: '16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', color: 'white' }} />
                    <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'white' }}>{showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                  </div>
                   <div style={{ position: 'relative' }}>
                    <input type={showConfirmPassword ? "text" : "password"} placeholder="Confirme a nova senha" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} style={{ width: '100%', padding: '16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', color: 'white' }} />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'white' }}>{showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                  </div>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button onClick={handleChangePassword} className="btn-primary">Salvar Senha</button>
                    <button onClick={() => setShowPasswordForm(false)} className="btn-glass">Cancelar</button>
                  </div>
                </div>
              )}
            </div>

            {/* FORMULÁRIO PRINCIPAL */}
            <form onSubmit={handleUpdate} style={{ background: 'rgba(15, 23, 42, 0.4)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '32px', padding: isMobile ? '24px' : '40px', display: 'flex', flexDirection: 'column', gap: '40px' }}>
              <section>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '900', marginBottom: '24px' }}>Dados do Estudante</h3>
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '20px' }}>
                  <div style={{ gridColumn: isMobile ? 'span 1' : 'span 2' }}>
                    <label style={{ fontSize: '0.8rem', opacity: 0.5, display: 'block', marginBottom: '8px' }}>Nome Completo</label>
                    <input type="text" value={formData.full_name} onChange={(e) => setFormData({...formData, full_name: e.target.value})} style={{ width: '100%', padding: '18px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '18px', color: 'white' }} />
                  </div>
                  <div style={{ gridColumn: isMobile ? 'span 1' : 'span 2' }}>
                     <label style={{ fontSize: '0.8rem', opacity: 0.5, display: 'block', marginBottom: '12px' }}>Nível de Ensino</label>
                     <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        {['Ensino Médio', 'Ensino Técnico', 'Ensino Superior'].map(lvl => (
                          <button key={lvl} type="button" onClick={() => setFormData({...formData, education_level: lvl})} style={{ padding: '12px 20px', borderRadius: '14px', background: formData.education_level === lvl ? 'rgba(139, 92, 246, 0.2)' : 'rgba(255,255,255,0.02)', border: `1px solid ${formData.education_level === lvl ? '#8b5cf6' : 'rgba(255,255,255,0.1)'}`, color: formData.education_level === lvl ? '#8b5cf6' : 'rgba(255,255,255,0.5)', fontWeight: '800' }}>{lvl}</button>
                        ))}
                     </div>
                  </div>
                </div>
              </section>

              <section>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '900', marginBottom: '24px' }}>Vida Acadêmica</h3>
                
                <div style={{ position: 'relative', marginBottom: '24px' }}>
                  <label style={{ fontSize: '0.8rem', opacity: 0.5, display: 'block', marginBottom: '8px' }}>Instituição / Escola</label>
                  <div style={{ position: 'relative' }}>
                    <input type="text" value={formData.school_name} onChange={(e) => setFormData({...formData, school_name: e.target.value})} placeholder="Busque sua faculdade ou escola..." style={{ width: '100%', padding: '18px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '18px', color: 'white' }} />
                    {searching && <div className="animate-pulse" style={{ position: 'absolute', right: '18px', top: '50%', transform: 'translateY(-50%)', color: '#06b6d4', fontWeight: '900', fontSize: '0.75rem' }}>BUSCANDO...</div>}
                  </div>
                  
                  <AnimatePresence>
                    {schoolSuggestions.length > 0 && (
                      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} ref={suggestionRef} style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#0a0c10', borderRadius: '20px', zIndex: 100, border: '1px solid rgba(255,255,255,0.1)', marginTop: '8px', overflow: 'hidden', boxShadow: '0 30px 60px rgba(0,0,0,0.6)' }}>
                        {schoolSuggestions.map((s, i) => (
                          <div key={i} onClick={() => selectSchool(s.nome)} style={{ padding: '16px 24px', cursor: 'pointer', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '0.9rem' }} onMouseEnter={(e) => e.target.style.background = 'rgba(139, 92, 246, 0.1)'} onMouseLeave={(e) => e.target.style.background = 'transparent'}>{s.nome}</div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '24px' }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', opacity: 0.5, display: 'block', marginBottom: '8px' }}>Curso / Série</label>
                    <input type="text" value={formData.course_name} onChange={(e) => setFormData({...formData, course_name: e.target.value})} style={{ width: '100%', padding: '18px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '18px', color: 'white' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.8rem', opacity: 0.5, display: 'block', marginBottom: '8px' }}>Ano / Período Atual</label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(40px, 1fr))', gap: '8px' }}>
                      {yearOptions.map(opt => (
                        <button key={opt} type="button" onClick={() => setFormData({...formData, course_year: opt})} style={{ padding: '12px 4px', background: formData.course_year === opt ? 'rgba(139, 92, 246, 0.2)' : 'rgba(255,255,255,0.02)', border: `1px solid ${formData.course_year === opt ? '#8b5cf6' : 'rgba(255,255,255,0.08)'}`, borderRadius: '12px', color: formData.course_year === opt ? '#8b5cf6' : 'rgba(255,255,255,0.5)', fontWeight: '900' }}>{opt}</button>
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              <section>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '900', marginBottom: '24px' }}>Interesses</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                  {interestOptions.map(i => (
                    <button key={i} type="button" onClick={() => toggleInterest(i)} style={{ padding: '12px 20px', borderRadius: '16px', background: formData.interests.includes(i) ? 'rgba(245, 158, 11, 0.15)' : 'rgba(255,255,255,0.02)', border: `1px solid ${formData.interests.includes(i) ? '#f59e0b' : 'rgba(255,255,255,0.08)'}`, color: formData.interests.includes(i) ? '#f59e0b' : 'rgba(255,255,255,0.5)', fontWeight: '800' }}>{i}</button>
                  ))}
                </div>
              </section>

              <section>
                <label style={{ fontSize: '0.8rem', opacity: 0.5, display: 'block', marginBottom: '12px' }}>Sua Bio</label>
                <textarea value={formData.student_bio} onChange={(e) => setFormData({...formData, student_bio: e.target.value})} placeholder="Conte um pouco sobre você..." style={{ width: '100%', height: '120px', padding: '18px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '18px', color: 'white', resize: 'none' }} />
              </section>

              <button type="submit" disabled={loading} className="btn-primary" style={{ padding: '22px', borderRadius: '24px', fontSize: '1.25rem', fontWeight: '900', boxShadow: '0 20px 40px rgba(139, 92, 246, 0.3)' }}>{loading ? 'Sincronizando...' : 'Publicar Alterações ✨'}</button>
            </form>
          </div>
        </div>
        <div style={{ height: '60px' }} />
      </motion.main>
    </div>
  );
};

export default Profile;
