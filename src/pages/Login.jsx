import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, LogIn, ArrowLeft, Eye, EyeOff, GraduationCap, Github, Chrome } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { getFriendlyErrorMessage } from '../utils/errorMessages';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      if (data.user) {
        // Sucesso! O AuthContext vai detectar a mudança, mas forçamos o rumo ao dashboard
        navigate('/dashboard');
      }
    } catch (err) {
      setError(getFriendlyErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dark" style={{
      minHeight: '100vh',
      display: 'flex',
      background: 'var(--bg-main)',
      color: 'var(--text-main)',
      fontFamily: "'Outfit', sans-serif",
      overflow: 'hidden'
    }}>
      {/* LADO ESQUERDO: Visual/Branding (Escondido em Mobile) */}
      <div style={{
        flex: 1,
        background: 'linear-gradient(135deg, #1e1b4b 0%, #050608 100%)',
        display: 'none',
        lg: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '80px',
        position: 'relative',
        overflow: 'hidden'
      }} className="login-side-panel">
        <style>{`
          @media (min-width: 1024px) {
            .login-side-panel { display: flex !important; }
          }
        `}</style>
        
        {/* Decorativo: Blobs e Luzes */}
        <div style={{
          position: 'absolute',
          top: '-10%',
          left: '-10%',
          width: '400px',
          height: '400px',
          background: 'rgba(139, 92, 246, 0.2)',
          filter: 'blur(100px)',
          borderRadius: '50%'
        }} />
        <div style={{
          position: 'absolute',
          bottom: '10%',
          right: '10%',
          width: '300px',
          height: '300px',
          background: 'rgba(6, 182, 212, 0.15)',
          filter: 'blur(80px)',
          borderRadius: '50%'
        }} />

        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          style={{ position: 'relative', zIndex: 1 }}
        >
          <div style={{
            background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
            width: '80px',
            height: '80px',
            borderRadius: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '40px',
            boxShadow: '0 0 40px var(--primary-glow)'
          }}>
            <GraduationCap size={44} color="var(--text-main)" />
          </div>
          <h1 style={{ fontSize: '3.5rem', fontWeight: '900', letterSpacing: '-2px', marginBottom: '24px', lineHeight: 1 }}>
            Sua jornada <br />
            <span style={{ color: 'var(--secondary)' }}>começa aqui.</span>
          </h1>
          <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)', maxWidth: '400px', lineHeight: 1.6 }}>
            Junte-se a milhares de alunos que já estão transformando sua forma de estudar e colaborar.
          </p>
        </motion.div>

        {/* Citações ou Stats rápidas no rodapé do painel */}
        <div style={{ marginTop: 'auto', position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', gap: '20px', alignItems: 'center', opacity: 0.5 }}>
                <div style={{ borderLeft: '2px solid white', paddingLeft: '20px' }}>
                    <p style={{ fontSize: '0.9rem' }}>"O melhor lugar para encontrar caronas e resumos."</p>
                    <span style={{ fontSize: '0.8rem', fontWeight: '700' }}>— Matheus N., Estudante de TI</span>
                </div>
            </div>
        </div>
      </div>

      {/* LADO DIREITO: Formulário */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: 'clamp(24px, 8vw, 80px)',
        background: 'var(--bg-main)',
        position: 'relative'
      }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{ maxWidth: '420px', width: '100%', margin: '0 auto' }}
        >
          <div style={{ marginBottom: '40px' }}>
            <Link to="/" style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '10px', 
              color: 'var(--text-muted)', 
              fontSize: '0.95rem', 
              marginBottom: '32px',
              fontWeight: '500'
            }}>
              <ArrowLeft size={18} /> Voltar para a página inicial
            </Link>
            <h2 style={{ fontSize: '2.8rem', fontWeight: '900', marginBottom: '12px', letterSpacing: '-1.5px' }}>Login</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', lineHeight: '1.5' }}>
              Entre com seus dados para continuar seus estudos.
            </p>
          </div>

          {error && (
            <div style={{ 
              background: 'rgba(239, 68, 68, 0.1)', 
              border: '1px solid rgba(239, 68, 68, 0.2)', 
              color: '#ef4444', 
              padding: '12px', 
              borderRadius: '12px', 
              marginBottom: '24px', 
              fontSize: '0.9rem' 
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.95rem', fontWeight: '700', marginBottom: '12px' }}>E-mail</label>
              <div style={{ position: 'relative' }}>
                <Mail style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={22} />
                <input
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    background: 'var(--bg-card)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: '20px',
                    padding: '20px 20px 20px 60px',
                    color: 'var(--text-main)',
                    outline: 'none',
                    fontSize: '1rem',
                    transition: 'all 0.3s'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'var(--primary)';
                    e.target.style.background = 'rgba(139, 92, 246, 0.05)';
                    e.target.style.boxShadow = '0 0 20px rgba(139, 92, 246, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'var(--glass-border)';
                    e.target.style.background = 'var(--bg-card)';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <label style={{ fontSize: '0.95rem', fontWeight: '700' }}>Senha</label>
                <a href="#" style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: '600' }}>Esqueceu a senha?</a>
              </div>
              <div style={{ position: 'relative' }}>
                <Lock style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={22} />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Sua senha secreta"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    background: 'var(--bg-card)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: '20px',
                    padding: '20px 60px 20px 60px',
                    color: 'var(--text-main)',
                    outline: 'none',
                    fontSize: '1rem',
                    transition: 'all 0.3s'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'var(--primary)';
                    e.target.style.background = 'rgba(139, 92, 246, 0.05)';
                    e.target.style.boxShadow = '0 0 20px rgba(139, 92, 246, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'var(--glass-border)';
                    e.target.style.background = 'var(--bg-card)';
                    e.target.style.boxShadow = 'none';
                  }}
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '20px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    padding: 0,
                    color: 'var(--text-muted)',
                    cursor: 'pointer'
                  }}
                >
                  {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="btn-primary" 
              style={{ 
                padding: '20px', 
                borderRadius: '20px', 
                marginTop: '10px', 
                fontSize: '1.1rem', 
                fontWeight: '900',
                opacity: loading ? 0.7 : 1,
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? 'Entrando...' : 'Entrar Agora'}
            </button>
          </form>

          <p style={{ marginTop: '40px', textAlign: 'center', fontSize: '1rem', color: 'var(--text-muted)' }}>
            Novo por aqui? <Link to="/signup" style={{ color: 'var(--secondary)', fontWeight: '800' }}>Crie sua conta gratuita.</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
