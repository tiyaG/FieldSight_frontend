import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Camera, ArrowLeft } from 'lucide-react';

const AboutUs = ({ onBackClick }) => {
  const theme = {
    sageGreenBg: '#acc0a4',
    pastelBrown: '#d7c0ae',
    darkBrownText: '#3e322b',
    accentGreen: '#5e6b56',
    white: '#ffffff',
  };

  const [scrollY, setScrollY] = useState(0);
  const galleryRef = useRef(null);

  // Map your uploaded images to the gallery
  const projectImages = [
    "/IMG_2992.JPG",
    "/IMG_3202.JPG",
    "/IMG_3210.JPG",
    "/IMG_2990.JPG",
    "/IMG_3718.JPG",
    "/07669375-501E-442A-95DA-FB8F0F48E19B.JPG"
  ];

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollGallery = (direction) => {
    if (galleryRef.current) {
      const scrollAmount = direction === 'left' ? -400 : 400;
      galleryRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div style={{ 
      backgroundColor: theme.sageGreenBg, 
      minHeight: '100vh', 
      width: '100%', 
      color: theme.darkBrownText, 
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      margin: 0,
      padding: 0,
      overflowX: 'hidden'
    }}>
      
      {/* --- DYNAMIC HEADER --- */}
      <header style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        padding: scrollY > 50 ? '10px 8%' : '25px 8%', 
        alignItems: 'center',
        backgroundColor: scrollY > 50 ? 'rgba(215, 192, 174, 0.95)' : 'transparent',
        backdropFilter: 'blur(15px)',
        position: 'fixed',
        top: 0,
        zIndex: 1000,
        width: '100%',
        boxSizing: 'border-box',
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        borderBottom: scrollY > 50 ? `1px solid rgba(62, 50, 43, 0.1)` : '1px solid transparent'
      }}>
        <div style={{ fontSize: '1.6rem', fontWeight: '900', letterSpacing: '-1px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className="logo-pulse-green"></div>
          FieldSight <span style={{ color: theme.accentGreen, fontWeight: '400' }}>Engineers</span>
        </div>
        
        <button onClick={onBackClick} className="back-nav-btn-modern">
          <ArrowLeft size={16} /> RETURN TO MISSION
        </button>
      </header>

      <main style={{ width: '100%', maxWidth: '1300px', margin: '0 auto', padding: '180px 5% 100px 5%', boxSizing: 'border-box' }}>
        
        {/* --- HERO SECTION --- */}
        <header style={{ marginBottom: '60px', textAlign: 'center' }}>
          <h1 className="hero-title-about-centered">
            Meet The<br/>
            <span className="text-outline-about">Engineers.</span>
          </h1>
          <p className="hero-subtitle-about">
            Theta Tau • San Jose State University • Class of 2026
          </p>
        </header>

        {/* --- MAIN TEAM IMAGE --- */}
        <section style={{ marginBottom: '100px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div className="team-frame-refined">
            <img 
              src="/IMG_3194.JPG" 
              alt="FieldSight Engineering Team" 
              className="big-team-img"
            />
            <div className="image-vignette-about"></div>
          </div>
          
          <div style={{ marginTop: '60px', maxWidth: '850px', textAlign: 'center' }}>
            <h2 className="team-description-text-centered">
              We are a team of <strong>18 engineers</strong> developing autonomous rovers to help community farmers identify diseases in crop beds at an early stage. Through the integration of <strong>software, mechanical, electrical, and microcontroller systems</strong>, our AI-driven technology analyzes diverse plant types, making plant monitoring more accessible, accurate, and efficient.
            </h2>
          </div>
        </section>

        {/* --- PROJECT GALLERY --- */}
        <section style={{ marginBottom: '100px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px' }}>
            <div>
              <h3 className="section-tag-about">Engineering Log</h3>
              <h2 style={{ fontSize: '3rem', fontWeight: 900, margin: 0, letterSpacing: '-2px' }}>Project Artifacts</h2>
            </div>
            <div style={{ display: 'flex', gap: '12px', marginBottom: '10px' }}>
              <button onClick={() => scrollGallery('left')} className="gallery-nav-modern"><ChevronLeft size={24}/></button>
              <button onClick={() => scrollGallery('right')} className="gallery-nav-modern"><ChevronRight size={24}/></button>
            </div>
          </div>

          <div ref={galleryRef} className="gallery-scroll-modern">
            {projectImages.map((imgSrc, i) => (
              <div key={i} className="artifact-card-modern">
                <div className="artifact-visual">
                  <img src={imgSrc} alt={`Artifact ${i}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div className="artifact-info">
                  <span className="serial-no">SYSTEM_ARTIFACT_00{i + 1}</span>
                  <span className="status-badge">DOCUMENTED</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* --- MODERN FOOTER --- */}
      <footer className="footer-modern-about">
        <div className="footer-logo-bg">FIELDSIGHT</div>
        <div style={{ position: 'relative', zIndex: 2 }}>
          <p style={{ fontWeight: 800, fontSize: '14px', margin: 0 }}>© 2026 FIELD SIGHT SYSTEMS • SJSU THETA TAU</p>
          <p style={{ opacity: 0.5, fontSize: '12px', marginTop: '5px' }}>Advanced Agricultural Autonomy Group</p>
        </div>
      </footer>

      <style>{`
        .logo-pulse-green {
          width: 14px; height: 14px; background: #5e6b56; border-radius: 3px;
          animation: rotate 8s infinite linear;
        }

        .hero-title-about-centered {
          font-size: clamp(3.5rem, 10vw, 7rem);
          font-weight: 900; line-height: 0.85; letter-spacing: -5px; margin: 0 auto;
          text-align: center;
        }

        .text-outline-about {
          -webkit-text-stroke: 1.5px #3e322b; color: transparent;
        }

        .hero-subtitle-about {
          margin-top: 25px; font-size: 1.1rem; font-weight: 700; opacity: 0.6;
          letter-spacing: 3px; text-transform: uppercase;
        }

        .back-nav-btn-modern {
          background: #3e322b; color: white; border: none; padding: 12px 24px;
          border-radius: 100px; cursor: pointer; font-weight: 800; font-size: 12px;
          display: flex; align-items: center; gap: 8px; transition: 0.3s;
        }
        .back-nav-btn-modern:hover { transform: scale(1.05); background: #5e6b56; }

        .team-frame-refined {
          width: 100%;
          max-width: 1000px;
          height: 500px;
          border-radius: 40px;
          overflow: hidden;
          position: relative;
          box-shadow: 0 20px 40px rgba(0,0,0,0.1);
          border: 4px solid white;
        }

        .big-team-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .image-vignette-about {
          position: absolute;
          inset: 0;
          background: linear-gradient(to bottom, transparent 60%, rgba(62, 50, 43, 0.2));
        }

        .team-description-text-centered {
          font-size: clamp(1.3rem, 2.2vw, 1.6rem);
          line-height: 1.6;
          font-weight: 400;
          color: #3e322b;
          text-align: center;
        }

        .gallery-scroll-modern { display: flex; gap: 25px; overflow-x: auto; scrollbar-width: none; padding: 20px 0; }
        .gallery-scroll-modern::-webkit-scrollbar { display: none; }

        .artifact-card-modern {
          flex: 0 0 320px; background: white; border-radius: 30px; overflow: hidden;
          box-shadow: 0 10px 30px rgba(0,0,0,0.05); transition: 0.3s;
        }
        .artifact-card-modern:hover { transform: scale(1.02); }

        .artifact-visual {
          height: 300px; background: #f0f3ef; display: flex; align-items: center; 
          justify-content: center; position: relative; overflow: hidden;
        }

        .artifact-info { padding: 20px; display: flex; justify-content: space-between; align-items: center; }
        .serial-no { font-size: 11px; font-weight: 900; opacity: 0.5; }
        .status-badge { background: #acc0a4; color: #3e322b; padding: 4px 10px; border-radius: 5px; font-size: 9px; font-weight: 900; }

        .gallery-nav-modern {
          width: 54px; height: 54px; border-radius: 50%; border: 1.5px solid #3e322b;
          background: transparent; cursor: pointer; display: flex; align-items: center; justify-content: center;
          transition: 0.3s;
        }
        .gallery-nav-modern:hover { background: #3e322b; color: white; }

        .footer-modern-about {
          background: #3e322b; color: white; padding: 100px 5%; border-radius: 60px 60px 0 0;
          text-align: center; position: relative; overflow: hidden;
        }
        .footer-logo-bg {
          position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
          font-size: 10rem; font-weight: 900; opacity: 0.03; letter-spacing: -10px;
        }

        .section-tag-about { text-transform: uppercase; letter-spacing: 4px; font-size: 12px; color: #5e6b56; font-weight: 800; margin-bottom: 5px; }

        @keyframes rotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default AboutUs;