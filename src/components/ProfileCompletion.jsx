import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  GraduationCap, 
  Clock, 
  BookOpen, 
  CheckCircle2,
  ChevronRight,
  Sun,
  CloudSun,
  Moon,
  Coffee,
  Book,
  School,
  Trophy,
  History,
  Heart,
  Palette,
  Bike,
  Music,
  Code,
  Gamepad2,
  Camera,
  Utensils,
  Globe,
  MapPin,
  Search,
  ArrowLeft
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { logActivity } from '../lib/logger';

const ProfileCompletion = ({ user, onComplete }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  
  // Estados de Autocompletar
  const [schoolSuggestions, setSchoolSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searching, setSearching] = useState(false); // Adicionado estado faltante
  const suggestionRef = useRef(null);

  const [formData, setFormData] = useState({
    education_level: '',
    school_name: '',
    course_name: '',
    course_year: '',
    course_period: '',
    campus_type: '',
    class_name: '',
    study_schedule: [],
    student_bio: '',
    interests: []
  });

  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    const handleClickOutside = (event) => {
      if (suggestionRef.current && !suggestionRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    window.addEventListener('resize', handleResize);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const searchInstitutions = async (term) => {
    if (term.length >= 2) {
      setSearching(true);
      try {
        const { data } = await supabase
          .from('educational_institutions')
          .select('name')
          .ilike('name', `%${term}%`)
          .limit(5);

        if (data) {
          setSchoolSuggestions(data.map(i => ({ nome: i.name })));
          setShowSuggestions(true); // Ensure suggestions are shown when data is available
        }
      } catch (err) {
        console.error("Erro ao buscar instituições:", err);
      } finally {
        setSearching(false);
      }
    } else {
      setSchoolSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const levels = [
    { id: 'Ensino Médio', icon: School, label: 'Ensino Médio' },
    { id: 'Ensino Técnico', icon: Trophy, label: 'Ensino Técnico' },
    { id: 'Ensino Superior', icon: GraduationCap, label: 'Ensino Superior' },
    { id: 'Outros', icon: Book, label: 'Outros' }
  ];

  const interestOptions = [
    { id: 'Tecnologia', icon: Code },
    { id: 'Esportes', icon: Bike },
    { id: 'Música', icon: Music },
    { id: 'Artes', icon: Palette },
    { id: 'Games', icon: Gamepad2 },
    { id: 'Fotografia', icon: Camera },
    { id: 'Culinária', icon: Utensils },
    { id: 'Estudos', icon: BookOpen }
  ];

  const getYearOptions = () => {
    if (formData.education_level === 'Ensino Médio') return [1, 2, 3];
    if (formData.education_level === 'Ensino Técnico') return [1, 2, 3, 4];
    return [1, 2, 3, 4, 5, 6];
  };

  const getYearLabel = (y) => {
    if (formData.education_level === 'Ensino Médio') return `${y}º`;
    return `${y}º Ano`;
  };

  const schedules = [
    { id: 'Manhã', icon: Sun },
    { id: 'Tarde', icon: CloudSun },
    { id: 'Noite', icon: Moon },
    { id: 'Madrugada', icon: Coffee }
  ];

  const handleNext = () => setStep(prev => prev + 1);
  const handleBack = () => setStep(prev => prev - 1);

  const handleScheduleToggle = (id) => {
    setFormData(prev => ({
      ...prev,
      study_schedule: prev.study_schedule.includes(id)
        ? prev.study_schedule.filter(s => s !== id)
        : [...prev.study_schedule, id],
      course_period: prev.study_schedule.includes(id) 
        ? (prev.study_schedule.filter(s => s !== id)[0] || '') 
        : (prev.course_period || id)
    }));
  };

  const handleInterestToggle = (id) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(id)
        ? prev.interests.filter(i => i !== id)
        : [...prev.interests, id]
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const { error: profileError } = await supabase
        .from('user_profiles')
        .update({
          student_bio: formData.student_bio,
          interests: formData.interests,
          is_profile_complete: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (profileError) throw profileError;

      // Inserir Vínculo Acadêmico (Instituição)
      const { error: instError } = await supabase
        .from('user_institutions')
        .insert({
          user_id: user.id,
          institution_name: formData.school_name || "Instituição Inicial",
          course_name: formData.course_name,
          course_year: parseInt(formData.course_year) || null,
          course_period: formData.study_schedule || [],
          class_name: formData.class_name,
          modality: formData.campus_type || 'Presencial',
          education_level: formData.education_level || 'Ensino Superior',
          is_primary: true
        });

      if (instError) throw instError;

      if (session) {
        await logActivity({
          userId: user.id,
          token: session.access_token,
          action: 'profile_completion',
          route: '/onboarding',
          oldData: null,
          newData: formData
        });
      }

      onComplete();
    } catch (err) {
      console.error("Erro ao salvar perfil:", err);
    } finally {
      setLoading(false);
    }
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.9, y: 20 },
    visible: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.9, y: -20 }
  };

  return (
    <div className="dark" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      background: 'rgba(5, 6, 8, 0.95)',
      backdropFilter: 'blur(16px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000,
      padding: '20px',
      color: 'var(--text-main)',
      fontFamily: "'Outfit', sans-serif"
    }}>
      <motion.div
        variants={modalVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        style={{
          width: '100%',
          maxWidth: '540px',
          background: 'rgba(15, 23, 42, 0.95)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '32px',
          padding: isMobile ? '28px' : '48px',
          boxShadow: '0 30px 60px -12px rgba(0, 0, 0, 0.7)',
          position: 'relative',
          maxHeight: '90vh',
          overflowY: 'auto'
        }}
      >
        <div style={{ 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          height: '4px', 
          background: 'linear-gradient(to right, #8b5cf6, #06b6d4, #10b981)',
          width: `${(step / 6) * 100}%`,
          transition: 'width 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
        }} />

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div style={{ marginBottom: '40px' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '20px', background: 'rgba(139, 92, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
                  <History size={32} color="#8b5cf6" />
                </div>
                <h2 style={{ fontSize: '2rem', fontWeight: '900', marginBottom: '12px', letterSpacing: '-1px' }}>Em que estágio você está?</h2>
                <p style={{ color: '#94a3b8', fontSize: '1.1rem' }}>Sua jornada começa com a sua base atual.</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '14px' }}>
                {levels.map(level => (
                  <button
                    key={level.id}
                    onClick={() => { setFormData({...formData, education_level: level.id}); handleNext(); }}
                    style={{
                      padding: '24px',
                      background: formData.education_level === level.id ? 'rgba(139, 92, 246, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                      border: `1px solid ${formData.education_level === level.id ? '#8b5cf6' : 'rgba(255, 255, 255, 0.08)'}`,
                      borderRadius: '24px',
                      color: 'var(--text-main)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '20px',
                      transition: '0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                  >
                    <div style={{ padding: '12px', background: 'var(--border-light)', borderRadius: '16px' }}>
                      <level.icon size={24} color={formData.education_level === level.id ? '#8b5cf6' : '#64748b'} />
                    </div>
                    <span style={{ fontWeight: '800', fontSize: '1.2rem' }}>{level.label}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div style={{ marginBottom: '40px' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '20px', background: 'rgba(6, 182, 212, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
                  <School size={32} color="#06b6d4" />
                </div>
                <h2 style={{ fontSize: '2rem', fontWeight: '900', marginBottom: '12px', letterSpacing: '-1px' }}>Instituição</h2>
                <p style={{ color: '#94a3b8', fontSize: '1.1rem' }}>Onde você estuda atualmente?</p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                <div style={{ position: 'relative' }}>
                  <Globe style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} size={24} />
                  <input 
                    type="text"
                    placeholder={formData.education_level === 'Ensino Superior' ? "Ex: USP, Uni..." : "Ex: Colégio Objetivo..."}
                    value={formData.school_name}
                    onChange={(e) => {
                       setFormData({...formData, school_name: e.target.value});
                       searchInstitutions(e.target.value);
                    }}
                    onFocus={() => formData.school_name.length >= 2 && setShowSuggestions(true)}
                    style={{ width: '100%', padding: '20px 20px 20px 60px', background: 'rgba(255, 255, 255, 0.04)', border: '1px solid var(--border-light)', borderRadius: '20px', color: 'var(--text-main)', outline: 'none', fontSize: '1.1rem' }}
                  />
                  {searching && <div style={{ position: 'absolute', right: '20px', top: '50%', transform: 'translateY(-50%)', fontSize: '0.8rem', color: '#06b6d4' }}>Buscando...</div>}

                  {/* AUTOCOMPLETAR */}
                  <AnimatePresence>
                    {showSuggestions && schoolSuggestions.length > 0 && (
                      <motion.div 
                        ref={suggestionRef}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        style={{
                          position: 'absolute',
                          top: '105%',
                          left: 0,
                          right: 0,
                          background: '#1a1d24',
                          border: '1px solid rgba(255,255,255,0.15)',
                          borderRadius: '20px',
                          zIndex: 100,
                          boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
                          overflow: 'hidden'
                        }}
                      >
                        {schoolSuggestions.map((s, i) => (
                          <div 
                            key={i}
                            onClick={() => {
                              setFormData({...formData, school_name: s.nome});
                              setShowSuggestions(false);
                            }}
                            style={{ padding: '16px 24px', cursor: 'pointer', borderBottom: i < schoolSuggestions.length - 1 ? '1px solid var(--border-light)' : 'none', display: 'flex', alignItems: 'center', gap: '14px', transition: '0.2s' }}
                            onMouseEnter={(e) => e.target.style.background = 'var(--border-light)'}
                            onMouseLeave={(e) => e.target.style.background = 'none'}
                          >
                            <Search size={16} color="var(--border-light)" />
                            <span style={{ fontSize: '1rem', fontWeight: '600' }}>{s.nome}</span>
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                
                {formData.education_level === 'Ensino Superior' && (
                  <div>
                    <p style={{ color: '#94a3b8', fontSize: '0.95rem', marginBottom: '16px', fontWeight: '700' }}>Modalidade do curso:</p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                      <button onClick={() => setFormData({...formData, campus_type: 'Presencial'})} style={{ padding: '20px', background: formData.campus_type === 'Presencial' ? 'rgba(6, 182, 212, 0.2)' : 'rgba(255,255,255,0.04)', border: `1px solid ${formData.campus_type === 'Presencial' ? '#06b6d4' : 'var(--border-light)'}`, borderRadius: '20px', color: 'var(--text-main)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', fontWeight: '700', cursor: 'pointer' }}>
                         <MapPin size={20} /> Presencial
                      </button>
                      <button onClick={() => setFormData({...formData, campus_type: 'EAD'})} style={{ padding: '20px', background: formData.campus_type === 'EAD' ? 'rgba(6, 182, 212, 0.2)' : 'rgba(255,255,255,0.04)', border: `1px solid ${formData.campus_type === 'EAD' ? '#06b6d4' : 'var(--border-light)'}`, borderRadius: '20px', color: 'var(--text-main)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', fontWeight: '700', cursor: 'pointer' }}>
                         <Globe size={20} /> EAD
                      </button>
                    </div>
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '14px' }}>
                  <button onClick={handleBack} className="btn-glass" style={{ padding: '20px', borderRadius: '20px' }}>Voltar</button>
                  <button disabled={!formData.school_name || (formData.education_level === 'Ensino Superior' && !formData.campus_type)} onClick={handleNext} className="btn-primary" style={{ padding: '20px', borderRadius: '20px' }}>Próximo</button>
                </div>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div style={{ marginBottom: '40px' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '20px', background: 'rgba(139, 92, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
                  <GraduationCap size={32} color="#8b5cf6" />
                </div>
                <h2 style={{ fontSize: '2rem', fontWeight: '900', marginBottom: '12px', letterSpacing: '-1px' }}>
                  {formData.education_level === 'Ensino Médio' ? 'Ano Letivo' : 'Seu Curso'}
                </h2>
                <p style={{ color: '#94a3b8', fontSize: '1.1rem' }}>Especifique sua área de estudo.</p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {formData.education_level !== 'Ensino Médio' && (
                  <div style={{ position: 'relative' }}>
                    <BookOpen style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} size={24} />
                    <input 
                      type="text"
                      placeholder="Nome do Curso (ex: Direito)"
                      value={formData.course_name}
                      onChange={(e) => setFormData({...formData, course_name: e.target.value})}
                      style={{ width: '100%', padding: '20px 20px 20px 60px', background: 'rgba(255, 255, 255, 0.04)', border: '1px solid var(--border-light)', borderRadius: '20px', color: 'var(--text-main)', outline: 'none', fontSize: '1.1rem' }}
                    />
                  </div>
                )}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
                  {getYearOptions().map(y => (
                    <button key={y} onClick={() => setFormData({...formData, course_year: y.toString()})} style={{ padding: '16px', background: formData.course_year === y.toString() ? 'rgba(139, 92, 246, 0.2)' : 'rgba(255, 255, 255, 0.04)', border: `1px solid ${formData.course_year === y.toString() ? '#8b5cf6' : 'var(--border-light)'}`, borderRadius: '16px', color: 'var(--text-main)', fontWeight: '800', cursor: 'pointer' }}>
                      {getYearLabel(y)}
                    </button>
                  ))}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '14px' }}>
                  <button onClick={handleBack} className="btn-glass" style={{ padding: '20px', borderRadius: '20px' }}>Voltar</button>
                  <button disabled={(!formData.course_name && formData.education_level !== 'Ensino Médio') || !formData.course_year} onClick={handleNext} className="btn-primary" style={{ padding: '20px', borderRadius: '20px' }}>Próximo</button>
                </div>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div style={{ marginBottom: '40px' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '20px', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
                  <Clock size={32} color="#10b981" />
                </div>
                <h2 style={{ fontSize: '2rem', fontWeight: '900', marginBottom: '12px', letterSpacing: '-1px' }}>Turma & Horários</h2>
                <p style={{ color: '#94a3b8', fontSize: '1.1rem' }}>Ajude seus colegas a te localizarem.</p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
                <input 
                  type="text"
                  placeholder="Nome da Turma (Ex: 3ºB, Grupo TI...)"
                  value={formData.class_name}
                  onChange={(e) => setFormData({...formData, class_name: e.target.value})}
                  style={{ width: '100%', padding: '20px', background: 'rgba(255, 255, 255, 0.04)', border: '1px solid var(--border-light)', borderRadius: '20px', color: 'var(--text-main)', outline: 'none', fontSize: '1.1rem' }}
                />
                <div>
                  <p style={{ color: '#94a3b8', fontSize: '0.95rem', marginBottom: '16px', fontWeight: '800' }}>Em quais turnos você estuda?</p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    {schedules.map(s => (
                      <button key={s.id} onClick={() => handleScheduleToggle(s.id)} style={{ padding: '16px', background: formData.study_schedule.includes(s.id) ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.04)', border: `1px solid ${formData.study_schedule.includes(s.id) ? '#10b981' : 'var(--border-light)'}`, borderRadius: '16px', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1rem', fontWeight: '700', cursor: 'pointer' }}>
                        <s.icon size={18} color={formData.study_schedule.includes(s.id) ? '#10b981' : '#64748b'} />
                        {s.id}
                      </button>
                    ))}
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '14px' }}>
                  <button onClick={handleBack} className="btn-glass" style={{ padding: '20px', borderRadius: '20px' }}>Voltar</button>
                  <button disabled={!formData.class_name || formData.study_schedule.length === 0} onClick={handleNext} className="btn-primary" style={{ padding: '20px', borderRadius: '20px' }}>Próximo</button>
                </div>
              </div>
            </motion.div>
          )}

          {step === 5 && (
            <motion.div key="step5" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div style={{ marginBottom: '40px' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '20px', background: 'rgba(139, 92, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
                  <Heart size={32} color="#8b5cf6" />
                </div>
                <h2 style={{ fontSize: '2rem', fontWeight: '900', marginBottom: '12px', letterSpacing: '-1px' }}>Seus Interesses</h2>
                <p style={{ color: '#94a3b8', fontSize: '1.1rem' }}>Conecte-se com pessoas afins.</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                {interestOptions.map(option => (
                  <button
                    key={option.id}
                    onClick={() => handleInterestToggle(option.id)}
                    style={{
                      padding: '20px',
                      background: formData.interests.includes(option.id) ? 'rgba(139, 92, 246, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                      border: `1px solid ${formData.interests.includes(option.id) ? '#8b5cf6' : 'var(--border-light)'}`,
                      borderRadius: '20px',
                      color: 'var(--text-main)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      transition: '0.2s',
                      cursor: 'pointer'
                    }}
                  >
                    <option.icon size={22} color={formData.interests.includes(option.id) ? '#8b5cf6' : '#64748b'} />
                    <span style={{ fontWeight: '800', fontSize: '1.1rem' }}>{option.id}</span>
                  </button>
                ))}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '14px', marginTop: '40px' }}>
                <button onClick={handleBack} className="btn-glass" style={{ padding: '20px', borderRadius: '20px' }}>Voltar</button>
                <button disabled={formData.interests.length === 0} onClick={handleNext} className="btn-primary" style={{ padding: '20px', borderRadius: '20px' }}>Próximo</button>
              </div>
            </motion.div>
          )}

          {step === 6 && (
            <motion.div key="step6" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div style={{ marginBottom: '40px' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '20px', background: 'rgba(245, 158, 11, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
                  <CheckCircle2 size={32} color="#f59e0b" />
                </div>
                <h2 style={{ fontSize: '2rem', fontWeight: '900', marginBottom: '12px', letterSpacing: '-1px' }}>Quase pronto!</h2>
                <p style={{ color: '#94a3b8', fontSize: '1.1rem' }}>Fale um pouco sobre você (Bio).</p>
              </div>

              <textarea 
                placeholder="Ex: Aluno de Direito apaixonado por tecnologia!"
                value={formData.student_bio}
                onChange={(e) => setFormData({...formData, student_bio: e.target.value})}
                style={{ width: '100%', height: '180px', padding: '24px', background: 'rgba(255, 255, 255, 0.04)', border: '1px solid var(--border-light)', borderRadius: '24px', color: 'var(--text-main)', outline: 'none', resize: 'none', fontSize: '1.1rem', lineHeight: '1.6' }}
              />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '14px', marginTop: '32px' }}>
                <button onClick={handleBack} className="btn-glass" style={{ padding: '20px', borderRadius: '20px' }}>Voltar</button>
                <button onClick={handleSubmit} disabled={loading} className="btn-primary" style={{ padding: '20px', borderRadius: '20px', fontWeight: '900', fontSize: '1.2rem' }}>{loading ? 'Sincronizando...' : 'Finalizar Perfil'}</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default ProfileCompletion;
