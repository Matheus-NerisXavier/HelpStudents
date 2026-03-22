import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const BannerCarousel = ({ banners, isMobile }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (!banners || banners.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [banners]);

  if (!banners || banners.length === 0) return null;

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const currentBanner = banners[currentIndex];

  return (
    <div style={{ marginBottom: isMobile ? '24px' : '40px', position: 'relative' }}>
      <div 
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{ 
          position: 'relative', 
          width: '100%', 
          aspectRatio: isMobile ? '2.5 / 1' : '3.5 / 1',
          minHeight: isMobile ? '130px' : '200px',
          borderRadius: '24px', 
          overflow: 'hidden',
          boxShadow: '0 10px 30px rgba(0,0,0,0.15)'
        }}
      >
        <AnimatePresence mode="wait">
          <motion.a 
            key={currentIndex}
            href={currentBanner.redirect_url || '#'} 
            target="_blank" 
            rel="noreferrer"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            style={{ display: 'block', width: '100%', height: '100%', cursor: currentBanner.redirect_url ? 'pointer' : 'default' }}
          >
            <img 
              src={currentBanner.image_url} 
              alt="Banner" 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
            />
          </motion.a>
        </AnimatePresence>

        {/* SETAS DE NAVEGAÇÃO - Forçadas a exibição permanente com zIndex extremo */}
        {banners.length > 1 && (
          <>
            <button 
              onClick={(e) => { e.preventDefault(); handlePrev(); }}
              style={{
                position: 'absolute',
                left: '16px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'rgba(15, 23, 42, 0.7)',
                backdropFilter: 'blur(10px)',
                ...(!isMobile && { WebkitBackdropFilter: 'blur(10px)' }),
                border: '1px solid rgba(255,255,255,0.3)',
                borderRadius: '50%',
                width: isMobile ? '40px' : '48px',
                height: isMobile ? '40px' : '48px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                cursor: 'pointer',
                zIndex: 9999, // Forza as setas no topo máximo
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(15, 23, 42, 0.9)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(15, 23, 42, 0.7)'}
            >
              <span style={{ fontSize: isMobile ? '20px' : '24px', fontWeight: 'bold', marginLeft: '-2px' }}>&#10094;</span>
            </button>

            <button 
              onClick={(e) => { e.preventDefault(); handleNext(); }}
              style={{
                position: 'absolute',
                right: '16px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'rgba(15, 23, 42, 0.7)',
                backdropFilter: 'blur(10px)',
                ...(!isMobile && { WebkitBackdropFilter: 'blur(10px)' }),
                border: '1px solid rgba(255,255,255,0.3)',
                borderRadius: '50%',
                width: isMobile ? '40px' : '48px',
                height: isMobile ? '40px' : '48px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                cursor: 'pointer',
                zIndex: 9999,
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(15, 23, 42, 0.9)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(15, 23, 42, 0.7)'}
            >
              <span style={{ fontSize: isMobile ? '20px' : '24px', fontWeight: 'bold', marginRight: '-2px' }}>&#10095;</span>
            </button>
          </>
        )}

        {/* INDICADORES (Bolinhas) */}
        {banners.length > 1 && (
          <div style={{ position: 'absolute', bottom: '16px', left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: '8px', zIndex: 10 }}>
            {banners.map((_, idx) => (
              <div 
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                style={{
                  width: idx === currentIndex ? '24px' : '8px',
                  height: '8px',
                  borderRadius: '4px',
                  background: idx === currentIndex ? 'var(--primary)' : 'rgba(255,255,255,0.5)',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer'
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BannerCarousel;
