import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Camera } from 'lucide-react';

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

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const teams = [
    { title: "💻 SOFTWARE TEAM", text: "Architecting the digital brain, autonomous pathfinding, and real-time cloud sync." },
    { title: "⚙️ MECHANICAL TEAM", text: "Designing the rugged chassis, suspension systems, and weatherproof housing." },
    { title: "⚡ ELECTRICAL TEAM", text: "Managing power distribution, sensor arrays, and high-speed data transmission." },
    { title: "🔬 MICRO TEAM", text: "Precision micro-controllers and low-level firmware optimization." }
  ];

  // Logic for gallery horizontal scrolling
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
      position: 'relative'
    }}>
      
      {/* --- FIXED HEADER (Title and Photo Placeholder) --- */}
      <header style={{ 
        position: 'fixed', top: 0, width: '100%', height: '180px', zIndex: 100, 
        display: 'flex', gap: '30px', padding: '0 8%', boxSizing: 'border-box',
        alignItems: 'center', backgroundColor: scrollY > 10 ? 'rgba(172, 192, 164, 0.98)' : 'rgba(172, 192, 164, 0.8)',
        backdropFilter: 'blur(20px)', borderBottom: scrollY > 10 ? `1px solid rgba(62, 50, 43, 0.1)` : '1px solid transparent',
        transition: '0.3s'
      }}>
        <div style={{ flex: '0 0 auto', textAlign: 'left' }}>
            <h1 style={{ fontWeight: '900', fontSize: '3rem', margin: '0 0 10px 0', letterSpacing: '-2px', lineHeight: 1 }}>Meet The<br/>Team.</h1>
            <button onClick={onBackClick} className="back-btn">← Back to Mission</button>
        </div>

        {/* THETA TAU PHOTO PLACEHOLDER (Beside Title) */}
        <div style={{ flex: '1', height: '120px', backgroundColor: theme.pastelBrown, borderRadius: '20px', position: 'relative', border: `3px dashed ${theme.darkBrownText}`, boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{fontWeight: '800', opacity: 0.5, textTransform: 'uppercase', fontSize: '11px', letterSpacing: '1px'}}>[ PASTE THETA TAU GROUP PHOTO URL HERE ]</div>
            <div style={{ position: 'absolute', bottom: '10px', right: '15px', fontSize: '12px', fontWeight: 'bold' }}>Engineering Class of 2026</div>
        </div>
      </header>

      {/* --- CONTENT SECTION (Scrolls over the background) --- */}
      <main style={{ position: 'relative', zIndex: 2, paddingTop: '180px', paddingBottom: '100px' }}>
        
        {/* TEAM STORY SECTION */}
        <section className="scroll-reveal-section" style={{ padding: '80px 8%', maxWidth: '1000px', margin: '0 auto' }}>
          <div style={{ display: 'flex', gap: '60px', alignItems: 'center', backgroundColor: theme.pastelBrown, padding: '60px', borderRadius: '40px', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}>
            
            <div style={{ flex: '1' }}>
                <div style={{ borderBottom: `4px solid ${theme.darkBrownText}`, paddingBottom: '10px', marginBottom: '20px', fontSize: '1.8rem', fontWeight: '800' }}>Project Engineers</div>
                <p style={{ lineHeight: '1.8', opacity: 0.9 }}>
                    A collaborative collective of dedicated problem-solvers from the Theta Tau Engineering fraternity. We came together to solve manual scouting in agriculture, combining our skills in computer logic, physics, circuitry, and core material science.
                </p>
            </div>

            <div style={{ flex: '1' }}>
              {teams.map((team, index) => (
                <div key={index} style={{ marginBottom: '20px', padding: '15px', background: 'rgba(255,255,255,0.4)', borderRadius: '15px', transition: '0.4s' }} className="team-item-list">
                  <h4 style={{ fontWeight: '800', margin: '0 0 5px 0' }}>{team.title}</h4>
                  <p style={{ opacity: 0.7, margin: 0, fontSize: '14px' }}>{team.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* PROJECT GALLERY SECTION WITH ARROWS (NO IMAGES, BLANK SLOTS) */}
        <section className="scroll-reveal-section" style={{ padding: '0 8%', maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '40px' }}>
            <h2 style={{ fontSize: '3rem', fontWeight: '900', margin: 0 }}>Project Artifacts</h2>
            <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => scrollGallery('left')} className="arrow-btn"><ChevronLeft /></button>
                <button onClick={() => scrollGallery('right')} className="arrow-btn"><ChevronRight /></button>
            </div>
          </div>
          
          <div ref={galleryRef} className="gallery-carousel">
            {[1, 2, 3, 4, 5].map((idx) => (
              <div key={idx} className="gallery-card">
                  <div className="empty-photo-card">
                    <Camera size={40} />
                    <span>[ PASTE GALLERY IMAGE URL HERE ]</span>
                  </div>
                  <div className="card-label">PROJECT_SCAN_0{idx}</div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="modern-footer">
        <div className="footer-content">
          <div className="footer-logo">FIELDSIGHT</div>
          <p>© 2026 • Advanced Agricultural Systems</p>
        </div>
      </footer>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;700;900&display=swap');
        
        html { scroll-behavior: smooth; }
        
        .back-btn {
          background: #3e322b; color: white; border: none; padding: 10px 20px;
          border-radius: 50px; cursor: pointer; font-weight: 700; transition: 0.3s;
          font-family: inherit; font-size: 13px;
        }
        .back-btn:hover { background: #5e6b56; transform: translateY(-2px); }

        .team-item-list:hover {
          transform: translateX(10px);
          background: white;
        }

        /* Gallery Carousel Styles */
        .gallery-carousel {
          display: flex; gap: 20px; overflow-x: auto; padding-bottom: 20px;
          scrollbar-width: none; /* Hide scrollbar for clean look */
        }
        .gallery-carousel::-webkit-scrollbar { display: none; }
        
        .gallery-card {
          flex: 0 0 350px;
          border-radius: 20px;
        }

        .empty-photo-card {
          height: 350px;
          background-color: white;
          border-radius: 20px;
          border: 3px dashed rgba(62, 50, 43, 0.2);
          box-sizing: border-box;
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          gap: 15px; text-align: center; color: rgba(62, 50, 43, 0.4);
          font-weight: 800; text-transform: uppercase; font-size: 11px; letter-spacing: 1px;
          padding: 30px;
        }

        .card-label {
            margin-top: 15px; font-weight: 800; font-size: 12px; opacity: 0.6;
            text-align: center;
        }

        .arrow-btn {
            background: white; color: #3e322b; border: 1px solid rgba(0,0,0,0.1);
            width: 50px; height: 50px; border-radius: 50%;
            cursor: pointer; display: flex; align-items: center; justify-content: center;
            transition: 0.3s;
        }
        .arrow-btn:hover { background: #3e322b; color: white; transform: scale(1.1); }

        .modern-footer {
          background: #3e322b;
          color: #d7c0ae;
          padding: 100px 5% 60px 5%;
          border-radius: 80px 80px 0 0;
          text-align: center;
        }

        .footer-logo {
          font-size: 5rem;
          font-weight: 900;
          opacity: 0.05;
          margin-bottom: -15px;
          letter-spacing: -5px;
        }

        body { background-color: #acc0a4; margin: 0; }
      `}</style>
    </div>
  );
};

export default AboutUs;