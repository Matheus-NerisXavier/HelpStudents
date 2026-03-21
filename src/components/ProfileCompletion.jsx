import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  GraduationCap, 
  Calendar, 
  Clock, 
  BookOpen, 
  CheckCircle2,
  ChevronRight,
  Sun,
  CloudSun,
  Moon,
  Zap
} from 'lucide-react';
import { supabase } from '../lib/supabase';

const ProfileCompletion = ({ user, onComplete }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [formData, setFormData] = useState({
    course_name: '',
    course_year: '',
    course_period: '',
    student_bio: ''
  });

  // Monitora redimensionamento
  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const years = [1, 2, 3, 4, 5, 6];
  const periods = [
    { id: 'Manhã', icon: Sun, color: '#f59e0b' },
    { id: 'Tarde', icon: CloudSun, color: '#06b6d4' },
    { id: 'Noite', icon: Moon, color: '#8b5cf6' },
    { id: 'Integral', icon: Zap, color: '#10b981' }
  ];

  const handleNext = () => setStep(prev => prev + 1);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({
          course_name: formData.course_name,
          course_year: parseInt(formData.course_year),
          course_period: formData.course_period,
          student_bio: formData.student_bio,
          is_profile_complete: true
        })
        .eq('id', user.id);

      if (error) throw error;
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
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      background: 'rgba(5, 6, 8, 0.85)',
      backdropFilter: 'blur(10px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <motion.div
        variants={modalVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        style={{
          width: '100%',
          maxWidth: '500px',
          background: 'rgba(15, 23, 42, 0.8)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '32px',
          padding: isMobile ? '24px' : '40px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Progress Bar */}
        <div style={{ 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          height: '4px', 
          background: 'linear-gradient(to right, #8b5cf6, #06b6d4)',
          width: `${(step / 3) * 100}%`,
          transition: 'width 0.5s ease'
        }} />

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div style={{ marginBottom: '32px' }}>
                <div style={{ 
                  width: '56px', 
                  height: '56px', 
                  borderRadius: '16px', 
                  background: 'rgba(139, 92, 246, 0.1)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  marginBottom: '20px'
                }}>
                  <GraduationCap size={28} color="#8b5cf6" />
                </div>
                <h2 style={{ fontSize: isMobile ? '1.5rem' : '1.75rem', fontWeight: '800', marginBottom: '8px' }}>Seu curso</h2>
                <p style={{ color: '#94a3b8', fontSize: isMobile ? '0.9rem' : '1rem' }}>Qual curso você está fazendo e em qual ano você está?</p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ position: 'relative' }}>
                  <BookOpen style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} size={20} />
                  <input 
                    type="text"
                    placeholder="Nome do Curso (ex: Engenharia Mecânica)"
                    value={formData.course_name}
                    onChange={(e) => setFormData({...formData, course_name: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '16px 16px 16px 48px',
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '16px',
                      color: 'white',
                      fontSize: '1rem',
                      outline: 'none'
                    }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                  {years.map(y => (
                    <button
                      key={y}
                      onClick={() => setFormData({...formData, course_year: y.toString()})}
                      style={{
                        padding: '12px',
                        background: formData.course_year === y.toString() ? 'rgba(139, 92, 246, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                        border: `1px solid ${formData.course_year === y.toString() ? '#8b5cf6' : 'rgba(255, 255, 255, 0.1)'}`,
                        borderRadius: '12px',
                        color: formData.course_year === y.toString() ? '#a78bfa' : '#94a3b8',
                        fontWeight: '600',
                        transition: '0.3s'
                      }}
                    >
                      {y}º Ano
                    </button>
                  ))}
                </div>
              </div>

              <button
                disabled={!formData.course_name || !formData.course_year}
                onClick={handleNext}
                style={{
                  width: '100%',
                  marginTop: '40px',
                  padding: '16px',
                  background: (formData.course_name && formData.course_year) ? 'linear-gradient(135deg, #8b5cf6, #7c3aed)' : '#1e293b',
                  color: 'white',
                  borderRadius: '16px',
                  fontWeight: '700',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  cursor: (formData.course_name && formData.course_year) ? 'pointer' : 'not-allowed'
                }}
              >
                Próximo <ChevronRight size={20} />
              </button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div style={{ marginBottom: '32px' }}>
                <div style={{ 
                  width: '56px', 
                  height: '56px', 
                  borderRadius: '16px', 
                  background: 'rgba(6, 182, 212, 0.1)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  marginBottom: '20px'
                }}>
                  <Clock size={28} color="#06b6d4" />
                </div>
                <h2 style={{ fontSize: '1.75rem', fontWeight: '800', marginBottom: '8px' }}>Turno das aulas</h2>
                <p style={{ color: '#94a3b8' }}>Qual horário você costuma estar na instituição?</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                {periods.map(p => (
                  <button
                    key={p.id}
                    onClick={() => setFormData({...formData, course_period: p.id})}
                    style={{
                      padding: '24px 16px',
                      background: formData.course_period === p.id ? `${p.color}15` : 'rgba(255, 255, 255, 0.03)',
                      border: `1px solid ${formData.course_period === p.id ? p.color : 'rgba(255, 255, 255, 0.1)'}`,
                      borderRadius: '20px',
                      color: 'white',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '12px',
                      transition: '0.3s'
                    }}
                  >
                    <p.icon size={24} color={formData.course_period === p.id ? p.color : '#64748b'} />
                    <span style={{ fontWeight: '600', fontSize: '1rem' }}>{p.id}</span>
                  </button>
                ))}
              </div>

              <button
                disabled={!formData.course_period}
                onClick={handleNext}
                style={{
                  width: '100%',
                  marginTop: '40px',
                  padding: '16px',
                  background: formData.course_period ? 'linear-gradient(135deg, #06b6d4, #0891b2)' : '#1e293b',
                  color: 'white',
                  borderRadius: '16px',
                  fontWeight: '700',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  cursor: formData.course_period ? 'pointer' : 'not-allowed'
                }}
              >
                Só mais um passo <ChevronRight size={20} />
              </button>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div style={{ marginBottom: '32px' }}>
                <div style={{ 
                  width: '56px', 
                  height: '56px', 
                  borderRadius: '16px', 
                  background: 'rgba(16, 185, 129, 0.1)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  marginBottom: '20px'
                }}>
                  <CheckCircle2 size={28} color="#10b981" />
                </div>
                <h2 style={{ fontSize: '1.75rem', fontWeight: '800', marginBottom: '8px' }}>Para finalizar!</h2>
                <p style={{ color: '#94a3b8' }}>Conte um pouco sobre você (opcional) para conectarmos você com outros alunos.</p>
              </div>

              <textarea 
                placeholder="Ex: Estudante de Engenharia apaixonado por tecnologia e café. Busco caronas e parceiros de estudo!"
                value={formData.student_bio}
                onChange={(e) => setFormData({...formData, student_bio: e.target.value})}
                style={{
                  width: '100%',
                  height: '150px',
                  padding: '16px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '16px',
                  color: 'white',
                  fontSize: '1rem',
                  outline: 'none',
                  resize: 'none',
                  fontFamily: 'inherit'
                }}
              />

              <button
                disabled={loading}
                onClick={handleSubmit}
                style={{
                  width: '100%',
                  marginTop: '40px',
                  padding: '16px',
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  color: 'white',
                  borderRadius: '16px',
                  fontWeight: '700',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 10px 20px rgba(16, 185, 129, 0.2)'
                }}
              >
                {loading ? 'Salvando...' : 'Concluir Perfil'}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default ProfileCompletion;
