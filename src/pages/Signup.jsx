import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Calendar, GraduationCap, ArrowLeft, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { getFriendlyErrorMessage } from '../utils/errorMessages';

const Signup = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    birthDate: '',
    school: '',
    acceptedTerms: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const [schoolSuggestions, setSchoolSuggestions] = useState([]);
  const [searching, setSearching] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSchoolSearch = async (value) => {
    setFormData(prev => ({ ...prev, school: value }));
    
    if (value.length >= 2) {
      setSearching(true);
      try {
        const { data, error } = await supabase
          .from('educational_institutions')
          .select('name')
          .ilike('name', `%${value}%`)
          .limit(6);

        if (!error && data) {
          setSchoolSuggestions(data.map(i => ({ nome: i.name })));
        }
      } catch (err) {
        console.error("Erro ao buscar no banco:", err);
      } finally {
        setSearching(false);
      }
    } else {
      setSchoolSuggestions([]);
    }
  };

  const selectSchool = (name) => {
    setFormData(prev => ({ ...prev, school: name }));
    setSchoolSuggestions([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validação básica LGPD
    if (!formData.acceptedTerms) {
      setError('Você precisa aceitar os termos de uso e privacidade.');
      setLoading(false);
      return;
    }

    try {
      // 1. Criar usuário no Auth do Supabase enviando metadados completos (para o Trigger usar)
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            birth_date: formData.birthDate,
            school: formData.school
          }
        }
      });

      if (authError) throw authError;

      if (authData.user) {
        // 2. Salvar nova instituição se não existir (O perfil já é criado pelo Trigger)
        if (formData.school) {
          await supabase
            .from('educational_institutions')
            .upsert([{ name: formData.school, verified: false }], { onConflict: 'name' });
        }

        // 3. Registrar Log de Consentimento LGPD (Tabela consent_logs)
        await supabase.from('consent_logs').insert([
          { user_id: authData.user.id, term_version: 'v1.0' }
        ]);

        // 4. Registrar Log de Atividade (Signup)
        await supabase.from('activity_logs').insert([
          { 
            user_id: authData.user.id, 
            action: 'signup', 
            details: { method: 'email', school: formData.school } 
          }
        ]);

        setSuccess(true);
        
        // Se houver sessão (email confirm off), a Home vai redirecionar para /dashboard
        // Se não houver (email confirm on), o usuário verá a Landing Page e deverá logar após confirmar
        setTimeout(() => navigate('/'), 3000);
      }
    } catch (err) {
      setError(getFriendlyErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      background: 'var(--bg-main)',
      color: 'var(--text-main)',
      fontFamily: "'Outfit', sans-serif",
      overflow: 'hidden'
    }}>
      {/* LADO ESQUERDO: Visual (Escondido em Mobile) */}
      <div style={{
        flex: 1,
        background: 'linear-gradient(135deg, #1e1b4b 0%, #050608 100%)',
        display: 'none',
        lg: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '60px',
        position: 'relative',
        overflow: 'hidden'
      }} className="signup-side-panel">
        <style>{`
          @media (min-width: 1024px) {
            .signup-side-panel { display: flex !important; }
          }
        `}</style>
        
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          style={{ position: 'relative', zIndex: 1 }}
        >
          <div style={{
            background: 'linear-gradient(135deg, var(--secondary), var(--accent))',
            width: '60px',
            height: '60px',
            borderRadius: '18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '32px',
            boxShadow: '0 0 30px rgba(6, 182, 212, 0.3)'
          }}>
            <GraduationCap size={32} color="var(--text-main)" />
          </div>
          <h1 style={{ fontSize: '3rem', fontWeight: '900', letterSpacing: '-1.5px', marginBottom: '20px', lineHeight: 1.1 }}>
            Junte-se à <br />
            <span style={{ color: 'var(--secondary)' }}>Comunidade.</span>
          </h1>
          <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', maxWidth: '350px', lineHeight: 1.6 }}>
            Crie sua conta e tenha acesso a caronas, fóruns e materiais de estudo exclusivos.
          </p>
        </motion.div>
      </div>

      {/* LADO DIREITO: Formulário (Scroll interno se necessário) */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        padding: '40px clamp(24px, 8vw, 60px)',
        background: 'var(--bg-main)',
        position: 'relative',
        overflowY: 'auto'
      }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{ maxWidth: '500px', width: '100%', margin: 'auto' }}
        >
          <div style={{ marginBottom: '32px' }}>
            <Link to="/login" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '24px' }}>
              <ArrowLeft size={16} /> Já tenho conta
            </Link>
            <h2 style={{ fontSize: '2.5rem', fontWeight: '900', marginBottom: '8px', letterSpacing: '-1px' }}>Criar Conta</h2>
            <p style={{ color: 'var(--text-muted)' }}>Preencha os dados abaixo para começar.</p>
          </div>

          {error && (
            <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#ef4444', padding: '12px', borderRadius: '12px', marginBottom: '24px', fontSize: '0.9rem' }}>
              {error}
            </div>
          )}

          {success && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              style={{ background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.2)', color: '#22c55e', padding: '24px', borderRadius: '20px', marginBottom: '32px', textAlign: 'center' }}>
              <ShieldCheck size={40} style={{ marginBottom: '12px' }} />
              <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '8px' }}>Cadastro Realizado!</h3>
              <p style={{ fontSize: '0.9rem' }}>Seja bem-vindo à nossa comunidade de estudos. Redirecionando...</p>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '8px' }}>Nome Completo</label>
                <div style={{ position: 'relative' }}>
                  <User style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={18} />
                  <input type="text" name="fullName" placeholder="Seu nome" value={formData.fullName} onChange={handleChange} required 
                    style={{ width: '100%', background: 'var(--bg-card)', border: '1px solid var(--glass-border)', borderRadius: '14px', padding: '14px 14px 14px 44px', color: 'var(--text-main)', outline: 'none' }} />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '8px' }}>Data Nasc.</label>
                <div style={{ position: 'relative' }}>
                  <Calendar style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={18} />
                  <input type="date" name="birthDate" value={formData.birthDate} onChange={handleChange} required
                    style={{ width: '100%', background: 'var(--bg-card)', border: '1px solid var(--glass-border)', borderRadius: '14px', padding: '14px 14px 14px 44px', color: 'var(--text-main)', outline: 'none' }} />
                </div>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '8px' }}>Instituição de Ensino (Opcional)</label>
              <div style={{ position: 'relative' }}>
                <GraduationCap style={{ position: 'absolute', left: '16px', top: '24px', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={18} />
                <input 
                  type="text" 
                  name="school" 
                  placeholder="Ex: USP, UNIP, Escola Estadual..." 
                  value={formData.school} 
                  onChange={(e) => handleSchoolSearch(e.target.value)}
                  style={{ 
                    width: '100%', 
                    background: 'var(--bg-card)', 
                    border: '1px solid var(--glass-border)', 
                    borderRadius: '14px', 
                    padding: '14px 14px 14px 44px', 
                    color: 'var(--text-main)', 
                    outline: 'none',
                    transition: 'border-color 0.3s'
                  }} 
                />
                
                {/* SUGESTÕES DINÂMICAS */}
                {schoolSuggestions.length > 0 && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    background: 'var(--glass-bg)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: '12px',
                    marginTop: '8px',
                    zIndex: 10,
                    boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                    overflow: 'hidden'
                  }}>
                    {schoolSuggestions.map((school, i) => (
                      <div 
                        key={i}
                        onClick={() => selectSchool(school.nome)}
                        style={{
                          padding: '12px 16px',
                          fontSize: '0.85rem',
                          cursor: 'pointer',
                          borderBottom: i === schoolSuggestions.length - 1 ? 'none' : '1px solid var(--border-light)',
                          transition: 'background 0.2s',
                        }}
                        onMouseEnter={(e) => e.target.style.background = 'rgba(139, 92, 246, 0.1)'}
                        onMouseLeave={(e) => e.target.style.background = 'transparent'}
                      >
                        {school.nome}
                      </div>
                    ))}
                  </div>
                )}

                {searching && (
                  <div style={{ position: 'absolute', right: '16px', top: '24px', transform: 'translateY(-50%)', fontSize: '0.7rem', color: 'var(--primary)' }}>
                    Buscando...
                  </div>
                )}
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                💡 Digite 3 letras para buscar faculdades ou escolas públicas.
              </p>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '8px' }}>E-mail</label>
              <div style={{ position: 'relative' }}>
                <Mail style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={18} />
                <input type="email" name="email" placeholder="seu@email.com" value={formData.email} onChange={handleChange} required
                  style={{ width: '100%', background: 'var(--bg-card)', border: '1px solid var(--glass-border)', borderRadius: '14px', padding: '14px 14px 14px 44px', color: 'var(--text-main)', outline: 'none' }} />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '8px' }}>Crie uma Senha Forte</label>
              <div style={{ position: 'relative' }}>
                <Lock style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={18} />
                <input type={showPassword ? "text" : "password"} name="password" placeholder="••••••••" value={formData.password} onChange={handleChange} required
                  style={{ width: '100%', background: 'var(--bg-card)', border: '1px solid var(--glass-border)', borderRadius: '14px', padding: '14px 44px 14px 44px', color: 'var(--text-main)', outline: 'none' }} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', background: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', marginTop: '10px' }}>
              <input type="checkbox" name="acceptedTerms" checked={formData.acceptedTerms} onChange={handleChange} required style={{ marginTop: '4px' }} />
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                Estou ciente e aceito os <span style={{ color: 'var(--primary)', fontWeight: '700' }}>Termos de Uso</span> e a <span style={{ color: 'var(--primary)', fontWeight: '700' }}>Política de Privacidade</span> (LGPD).
              </label>
            </div>

            <button type="submit" disabled={loading} className="btn-primary" style={{ padding: '16px', borderRadius: '14px', marginTop: '10px', fontSize: '1rem', fontWeight: '800', opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Criando Conta...' : 'Confirmar Cadastro'}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default Signup;
