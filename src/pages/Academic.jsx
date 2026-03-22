import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  GraduationCap, Plus, Pencil, Trash, School, BookOpen, Clock, AlertCircle, Loader2, Search, ChevronDown, Menu, ArrowLeft, ChevronRight, Check, ChevronLeft
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { supabase } from '../lib/supabase';
import Sidebar from '../components/Sidebar';

const Academic = () => {
  const { user, profile, loading: authLoading } = useAuth();
  const { isSidebarCollapsed, toggleSidebar, setSidebarCollapsed } = useTheme();
  
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [initialized, setInitialized] = useState(false);

  // Estados de Visualização
  const [userInstitutions, setUserInstitutions] = useState([]);
  const [showInstForm, setShowInstForm] = useState(false);
  const [editingInstId, setEditingInstId] = useState(null);
  const [formStep, setFormStep] = useState(1); 
  
  // Estado do Formulário
  const [instForm, setInstForm] = useState({
    institution_name: '', 
    course_name: '', 
    course_year: '', 
    course_period: [], 
    modality: 'Presencial',
    education_level: 'Ensino Superior',
    class_name: '',
    enrollment_id: ''
  });

  const [schoolSuggestions, setSchoolSuggestions] = useState([]);
  const [searching, setSearching] = useState(false);

  // Auto-recolher sidebar ao montar e redimensionar 📱
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) setSidebarCollapsed(true);
    };
    handleResize(); // Executa na montagem
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [setSidebarCollapsed]);

  useEffect(() => {
    if (!authLoading && !initialized && user) {
      const fetchInstitutions = async () => {
        const { data, error } = await supabase
          .from('user_institutions')
          .select('*')
          .eq('user_id', user.id)
          .order('is_primary', { ascending: false });
        if (!error && data) {
          setUserInstitutions(data);
        }
      };
      fetchInstitutions();
      setInitialized(true);
    }
  }, [user, authLoading, initialized]);

  useEffect(() => {
    if (!initialized || !showInstForm || formStep !== 1) return;
    const term = instForm.institution_name;
    
    if (term.length < 2) {
      setSchoolSuggestions([]);
      setSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const sUrl = import.meta.env.VITE_SUPABASE_URL;
        const sKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
        if (!sUrl || !sKey) return;
        const endpoint = `${sUrl}/rest/v1/educational_institutions?name=ilike.*${encodeURIComponent(term)}*&select=name&limit=6`;
        const response = await fetch(endpoint, {
          headers: { 'apikey': sKey, 'Authorization': `Bearer ${sKey}` }
        });
        if (!response.ok) throw new Error("Fetch failed");
        const data = await response.json();
        setSchoolSuggestions(data.map(i => ({ nome: i.name })));
      } catch (err) {
        console.error("Search Error:", err);
      } finally {
        setSearching(false);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [instForm.institution_name, initialized, showInstForm, formStep]);

  const selectSchool = (nome) => {
    setInstForm(prev => ({ ...prev, institution_name: nome }));
    setSchoolSuggestions([]);
    setSearching(false);
    setFormStep(2); 
  };

  const openEditForm = (inst) => {
    setEditingInstId(inst.id);
    setInstForm({
      institution_name: inst.institution_name,
      course_name: inst.course_name || '',
      course_year: inst.course_year?.toString() || '',
      course_period: Array.isArray(inst.course_period) ? inst.course_period : (inst.course_period ? [inst.course_period] : []),
      modality: inst.modality || 'Presencial',
      education_level: inst.education_level || 'Ensino Superior',
      class_name: inst.class_name || '',
      enrollment_id: inst.enrollment_id || ''
    });
    setFormStep(1);
    setShowInstForm(true);
  };

  const handleSaveInstitution = async () => {
    setLoading(true);
    try {
      if (editingInstId) {
        const { error } = await supabase
          .from('user_institutions')
          .update({
            institution_name: instForm.institution_name,
            course_name: instForm.course_name,
            course_year: parseInt(instForm.course_year) || null,
            course_period: instForm.course_period,
            modality: instForm.modality,
            education_level: instForm.education_level,
            class_name: instForm.class_name,
            enrollment_id: instForm.enrollment_id
          })
          .eq('id', editingInstId);
        if (error) throw error;
        setUserInstitutions(prev => prev.map(inst => inst.id === editingInstId ? { ...inst, ...instForm, course_year: parseInt(instForm.course_year) || null } : inst));
        setMessage({ type: 'success', text: 'Instituição atualizada!' });
      } else {
        const isFirst = userInstitutions.length === 0;
        const { data, error } = await supabase
          .from('user_institutions')
          .insert({
            user_id: user.id,
            institution_name: instForm.institution_name,
            course_name: instForm.course_name,
            course_year: parseInt(instForm.course_year) || null,
            course_period: instForm.course_period,
            modality: instForm.modality,
            education_level: instForm.education_level,
            class_name: instForm.class_name,
            enrollment_id: instForm.enrollment_id,
            is_primary: isFirst
          })
          .select().single();
        if (error) throw error;
        setUserInstitutions(prev => [data, ...prev].sort((a,b) => b.is_primary - a.is_primary));
        setMessage({ type: 'success', text: 'Instituição vinculada com sucesso!' });
      }
      setShowInstForm(false);
      setEditingInstId(null);
      setFormStep(1);
      setInstForm({ institution_name: '', course_name: '', course_year: '', course_period: [], modality: 'Presencial', education_level: 'Ensino Superior', class_name: '', enrollment_id: '' });
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Erro ao salvar.' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteInstitution = async (id) => {
    if (!window.confirm("Tem certeza que deseja remover esta instituição?")) return;
    setLoading(true);
    try {
      const { error } = await supabase.from('user_institutions').delete().eq('id', id);
      if (error) throw error;
      setUserInstitutions(prev => prev.filter(inst => inst.id !== id));
      setMessage({ type: 'success', text: 'Instituição removida.' });
    } catch (err) {
      setMessage({ type: 'error', text: 'Erro ao remover.' });
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || !initialized) {
    return (
      <div style={{ background: 'var(--bg-main)', height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-main)' }}>
        <Loader2 className="animate-spin" size={48} color="#8b5cf6" style={{ marginBottom: '20px' }} />
        <p style={{ fontWeight: '800', opacity: 0.7 }}>Acessando o Portal do Aluno...</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', background: 'var(--bg-main)', height: '100vh', color: 'var(--text-main)', overflow: 'hidden' }}>
      <Sidebar isMobile={isMobile} />
      
      <motion.main 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{ 
          flex: 1, 
          marginLeft: isMobile ? '0' : (isSidebarCollapsed ? '80px' : '280px'),
          padding: isMobile ? '20px' : '30px 60px',
          maxWidth: '1200px',
          margin: '0 auto',
          width: '100%',
          transition: 'margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <header style={{ marginBottom: '30px', display: 'flex', alignItems: 'center', gap: '24px', flexShrink: 0 }}>
          {isMobile && (
             <button onClick={toggleSidebar} style={{ background: 'var(--hover-bg)', border: 'none', color: 'var(--text-main)', padding: '10px', borderRadius: '12px' }}>
               <Menu size={24} />
             </button>
          )}
          {showInstForm && (
            <button onClick={() => { setShowInstForm(false); setEditingInstId(null); setFormStep(1); }} className="btn-glass" style={{ padding: '12px', borderRadius: '16px' }}>
              <ArrowLeft size={24} />
            </button>
          )}
          <div>
            <h1 style={{ fontSize: isMobile ? '2rem' : '3rem', fontWeight: '900', letterSpacing: '-2px', marginBottom: '4px' }}>
              Painel Acadêmico 🎓
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '1rem', fontWeight: '600' }}>
              {showInstForm ? `Passo ${formStep} de 3` : 'Gerencie suas instituições e matrículas.'}
            </p>
          </div>
        </header>

        <AnimatePresence mode="wait">
          {!showInstForm ? (
            <motion.section key="list" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} style={{ flex: 1, overflowY: 'auto', paddingBottom: '40px' }} className="custom-scrollbar">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <h3 style={{ fontSize: '1.6rem', fontWeight: '900' }}>Minhas Instituições</h3>
                <button onClick={() => setShowInstForm(true)} className="btn-primary" style={{ padding: '14px 28px', borderRadius: '16px', fontWeight: '800' }}>
                  <Plus size={20} style={{ marginRight: '8px' }} /> Adicionar
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
                {userInstitutions.length === 0 ? (
                  <div style={{ padding: '80px', textAlign: 'center', background: 'var(--glass-bg)', border: '1px solid var(--border-light)', borderRadius: '32px' }}>
                    <School size={80} style={{ margin: '0 auto 24px', opacity: 0.2 }} />
                    <p style={{ fontSize: '1.3rem', fontWeight: '800' }}>Vazio por aqui...</p>
                  </div>
                ) : (
                  userInstitutions.map(inst => (
                    <motion.div key={inst.id} whileHover={{ y: -4 }} style={{ padding: '24px 32px', background: 'var(--glass-bg)', border: '1px solid var(--border-light)', borderRadius: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                        <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'rgba(139, 92, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8b5cf6' }}>
                          <GraduationCap size={28} />
                        </div>
                        <div>
                          <p style={{ fontWeight: '900', fontSize: '1.4rem', marginBottom: '4px' }}>{inst.institution_name}</p>
                          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{inst.course_name || 'Educação Básica'} • {inst.education_level}</p>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '12px' }}>
                        <button onClick={() => openEditForm(inst)} className="btn-glass" style={{ padding: '12px', borderRadius: '14px' }}><Pencil size={20} /></button>
                        <button onClick={() => handleDeleteInstitution(inst.id)} className="btn-glass" style={{ padding: '12px', borderRadius: '14px', color: '#ef4444' }}><Trash size={20} /></button>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </motion.section>
          ) : (
            <motion.section key="wizard" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <div className="glass-card" style={{ width: '100%', maxWidth: '750px', padding: isMobile ? '24px' : '40px', position: 'relative', overflow: 'hidden' }}>
                
                {/* PROGRESS BAR */}
                <div style={{ height: '4px', background: 'var(--hover-bg)', position: 'absolute', top: 0, left: 0, width: '100%' }}>
                  <motion.div initial={{ width: 0 }} animate={{ width: `${(formStep / 3) * 100}%` }} style={{ height: '100%', background: 'var(--primary)', boxShadow: '0 0 15px var(--primary-glow)' }} />
                </div>

                <AnimatePresence mode="wait">
                  {formStep === 1 && (
                    <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} style={{ minHeight: '320px' }}>
                      <h3 style={{ fontSize: '1.8rem', fontWeight: '900', marginBottom: '12px' }}>Qual sua Instituição? 🔍</h3>
                      <p style={{ color: 'var(--text-muted)', marginBottom: '32px', fontWeight: '500' }}>Busque sua escola ou universidade pelo nome.</p>
                      
                      <div style={{ position: 'relative' }}>
                        <Search size={24} style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }} />
                        <input 
                          type="text" 
                          value={instForm.institution_name} 
                          onChange={(e) => setInstForm({...instForm, institution_name: e.target.value})} 
                          placeholder="Digite para buscar..." 
                          className="glass-input" 
                          style={{ paddingLeft: '60px', fontSize: '1.2rem', height: '64px', borderRadius: '18px' }}
                        />
                      </div>
                      
                      <div style={{ marginTop: '20px', minHeight: '140px' }}>
                        {searching && <p style={{ fontSize: '0.8rem', fontWeight: '900', color: 'var(--primary)', marginBottom: '12px' }} className="animate-pulse">SINCROZINANDO DADOS Estatais...</p>}
                        {schoolSuggestions.map((s, i) => (
                          <motion.div key={i} whileHover={{ x: 10, background: 'rgba(139, 92, 246, 0.1)' }} onClick={() => selectSchool(s.nome)} style={{ padding: '14px 20px', borderRadius: '14px', background: 'var(--hover-bg)', marginBottom: '8px', cursor: 'pointer', fontWeight: '700', border: '1px solid transparent', transition: 'all 0.2s' }}>
                            {s.nome}
                          </motion.div>
                        ))}
                        {!searching && instForm.institution_name.length > 2 && schoolSuggestions.length === 0 && (
                          <div onClick={() => setFormStep(2)} style={{ padding: '16px', borderRadius: '14px', border: '1px dashed var(--primary)', cursor: 'pointer', textAlign: 'center', color: 'var(--primary)', fontWeight: '800' }}>
                            Continuar com "{instForm.institution_name}"? Clique aqui 🚀
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}

                  {formStep === 2 && (
                    <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} style={{ minHeight: '320px' }}>
                      <h3 style={{ fontSize: '1.8rem', fontWeight: '900', marginBottom: '12px' }}>Sua Matrícula 📝</h3>
                      <p style={{ color: 'var(--text-muted)', marginBottom: '32px', fontWeight: '500' }}>Preencha os detalhes do seu curso e identificação.</p>
                      
                      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                        <div>
                          <label style={{ fontSize: '0.85rem', fontWeight: '800', opacity: 0.7, marginBottom: '8px', display: 'block' }}>Nível de Ensino</label>
                          <div style={{ position: 'relative' }}>
                            <select value={instForm.education_level} onChange={(e) => setInstForm({...instForm, education_level: e.target.value})} className="glass-input" style={{ appearance: 'none', paddingRight: '40px' }}>
                              {['Ensino Fundamental', 'Ensino Médio', 'Curso Técnico', 'Ensino Superior', 'Pós-Graduação'].map(lvl => <option key={lvl} value={lvl} style={{ background: 'var(--bg-card)' }}>{lvl}</option>)}
                            </select>
                            <ChevronDown size={18} style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', opacity: 0.5 }} />
                          </div>
                        </div>
                        <div>
                          <label style={{ fontSize: '0.85rem', fontWeight: '800', opacity: 0.7, marginBottom: '8px', display: 'block' }}>RA / Matrícula</label>
                          <input type="text" value={instForm.enrollment_id} onChange={(e) => setInstForm({...instForm, enrollment_id: e.target.value})} placeholder="Seu ID de aluno" className="glass-input" />
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
                        <div>
                          <label style={{ fontSize: '0.85rem', fontWeight: '800', opacity: 0.7, marginBottom: '8px', display: 'block' }}>Curso (Opcional)</label>
                          <input type="text" value={instForm.course_name} onChange={(e) => setInstForm({...instForm, course_name: e.target.value})} placeholder="Ex: Engenharia" className="glass-input" />
                        </div>
                        <div>
                          <label style={{ fontSize: '0.85rem', fontWeight: '800', opacity: 0.7, marginBottom: '8px', display: 'block' }}>Turma / Semestre</label>
                          <input type="text" value={instForm.class_name} onChange={(e) => setInstForm({...instForm, class_name: e.target.value})} placeholder="Ex: 3ºB, 5º Sem" className="glass-input" />
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {formStep === 3 && (
                    <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} style={{ minHeight: '320px' }}>
                      <h3 style={{ fontSize: '1.8rem', fontWeight: '900', marginBottom: '12px' }}>Seu Horário 🕰️</h3>
                      <p style={{ color: 'var(--text-muted)', marginBottom: '32px', fontWeight: '500' }}>Para finalizarmos, como você frequenta as aulas?</p>
                      
                      <div style={{ marginBottom: '24px' }}>
                        <label style={{ fontSize: '0.9rem', fontWeight: '800', opacity: 0.7, marginBottom: '16px', display: 'block' }}>Em qual(is) período(s)?</label>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          {['Manhã', 'Tarde', 'Noite', 'Integral'].map(p => (
                            <button key={p} type="button" onClick={() => setInstForm(prev => ({ ...prev, course_period: prev.course_period.includes(p) ? prev.course_period.filter(x => x !== p) : [...prev.course_period, p] }))} style={{ padding: '12px 20px', borderRadius: '14px', background: instForm.course_period.includes(p) ? 'rgba(139, 92, 246, 0.2)' : 'var(--hover-bg)', border: `2px solid ${instForm.course_period.includes(p) ? 'var(--primary)' : 'transparent'}`, color: instForm.course_period.includes(p) ? 'var(--primary)' : 'var(--text-muted)', fontWeight: '900' }}>{p}</button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label style={{ fontSize: '0.9rem', fontWeight: '800', opacity: 0.7, marginBottom: '16px', display: 'block' }}>Modalidade</label>
                        <div style={{ display: 'flex', gap: '10px' }}>
                          {['Presencial', 'EAD', 'Híbrido'].map(m => (
                            <button key={m} type="button" onClick={() => setInstForm({...instForm, modality: m})} style={{ flex: 1, padding: '14px', borderRadius: '16px', background: instForm.modality === m ? 'rgba(16, 185, 129, 0.2)' : 'var(--hover-bg)', border: `2px solid ${instForm.modality === m ? '#10b981' : 'transparent'}`, color: instForm.modality === m ? '#10b981' : 'var(--text-muted)', fontWeight: '900' }}>{m}</button>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* CONTROLS */}
                <div style={{ marginTop: '40px', display: 'flex', gap: '16px' }}>
                  {formStep > 1 && (
                    <button onClick={() => setFormStep(prev => prev - 1)} className="btn-glass" style={{ flex: 1, padding: '18px', borderRadius: '18px', fontWeight: '900', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                      <ChevronLeft size={20} /> Voltar
                    </button>
                  )}
                  {formStep < 3 ? (
                    <button onClick={() => setFormStep(prev => prev + 1)} disabled={!instForm.institution_name} className="btn-primary" style={{ flex: 2, padding: '18px', borderRadius: '18px', fontWeight: '900', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                      Próximo <ChevronRight size={20} />
                    </button>
                  ) : (
                    <button onClick={handleSaveInstitution} disabled={loading} className="btn-primary" style={{ flex: 2, padding: '18px', borderRadius: '18px', fontWeight: '900', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                      {loading ? 'Sincronizando...' : <><Check size={24} /> Concluir Matrícula</>}
                    </button>
                  )}
                </div>
              </div>
            </motion.section>
          )}
        </AnimatePresence>
      </motion.main>
    </div>
  );
};

export default Academic;
