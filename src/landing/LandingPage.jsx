import React, { useState, useEffect } from 'react';

const LandingPage = ({ onLoginClick, onAboutClick }) => {
  const theme = {
    sageGreenBg: '#acc0a4',
    pastelBrown: '#d7c0ae',
    darkBrownText: '#3e322b',
    accentGreen: '#5e6b56',
    white: '#ffffff',
  };

  const [hoveredCard, setHoveredCard] = useState(null);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const crops = ['🍅', '🌿', '🌱', '🍃', '🍅', '🥬'];

  return (
    <div style={{ 
      backgroundColor: theme.sageGreenBg, 
      minHeight: '100vh', 
      width: '100%',
      color: theme.darkBrownText, 
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      overflowX: 'hidden',
      position: 'relative'
    }}>
      
      {/* --- CROP FALLING ANIMATION --- */}
      <div className="crop-container">
        {[...Array(12)].map((_, i) => (
          <div key={i} className="falling-crop" style={{ 
            left: `${Math.random() * 100}%`, 
            animationDelay: `${Math.random() * 2}s`,
            fontSize: `${Math.random() * 20 + 20}px`
          }}>
            {crops[i % crops.length]}
          </div>
        ))}
      </div>

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
          <div className="logo-pulse"></div>
          FieldSight <span style={{ color: theme.accentGreen, fontWeight: '400' }}>Project</span>
        </div>
        
        <nav style={{ display: 'flex', gap: '40px' }}>
          <a href="#home" className="nav-link-modern">Home</a>
          
          {/* NAVIGATION TRIGGER FOR ABOUT US */}
          <button 
            onClick={onAboutClick} 
            className="nav-link-modern" 
            style={{ background: 'none', border: 'none', cursor: 'pointer', outline: 'none' }}
          >
            About Us
          </button>

          <a href="#product" className="nav-link-modern">Our Product</a>
        </nav>

        <button onClick={onLoginClick} className="shiny-login-btn">
          Client Login
        </button>
      </header>

      {/* --- HERO SECTION --- */}
      <main style={{ width: '100%', maxWidth: '1200px', margin: '0 auto', padding: '180px 5% 100px 5%', boxSizing: 'border-box' }}>
        
        <section id="home" style={{ textAlign: 'center', marginBottom: '150px' }}>
          <div className="hero-text-container" style={{ opacity: Math.max(1 - scrollY/500, 0), transform: `translateY(${scrollY * 0.3}px)` }}>
            <h1 className="hero-title">
                The New Era of <br/> 
                <span className="text-outline">Digital Agriculture</span>
            </h1>
            <p className="hero-subtitle">Autonomy meets the Earth. Precision meets the Crop.</p>
          </div>

          <div className="hero-depth-container">
            <div className="hero-image-wrapper">
              <img 
                src="/farmers-tending-crops-stockcake.webp" 
                alt="Farmers" 
                className="main-hero-img"
              />
              <div className="image-vignette"></div>
              <div className="ui-overlay">
                  <div className="pulse-dot"></div>
                  <span>SYSTEM ONLINE</span>
              </div>
            </div>
            <div className="hero-shadow"></div>
          </div>
        </section>

        {/* --- MISSION SECTION --- */}
        <section id="aboutus" className="reveal-section" style={{ textAlign: 'center', marginBottom: '150px' }}>
          <h3 className="section-tag">Our Mission</h3>
          <h2 className="mission-statement">
            "At FieldSight, our mission is to empower farmers with real-time, actionable insights through autonomous technology, ensuring <span className="highlight">no harvest is lost</span> to preventable outbreaks."
          </h2>
        </section>

        {/* --- PURPOSE & SOLUTION GRID --- */}
        <section className="grid-layout">
          
          {/* PURPOSE CARD */}
          <div 
            className="interactive-card"
            onMouseEnter={() => setHoveredCard('purpose')}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <div className="card-icon">🌍</div>
            <h3>Purpose</h3>
            <p style={{ lineHeight: '1.8', opacity: 0.9 }}>
              Agriculture is the backbone of our society, yet farmers still rely heavily on manual field scouting, a process that is both grueling and imperfect. The reality is that manual inspection isn’t fast enough to keep up with the spread of disease. We created FieldSight to provide a timely, automated response.
            </p>
          </div>

          {/* SOLUTION CARD */}
          <div 
            className="interactive-card"
            onMouseEnter={() => setHoveredCard('solution')}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <div className="card-icon">🤖</div>
            <h3>Our Solution</h3>
            <p style={{ marginBottom: '20px', lineHeight: '1.8', opacity: 0.9 }}>
              Our flagship solution is an autonomous rover designed specifically for precision monitoring in the field. The FieldSight rover acts as a farmer’s "eyes on the ground."
            </p>
            <ul style={{ paddingLeft: '0', listStyle: 'none', textAlign: 'left' }}>
              <li style={{ marginBottom: '12px' }}>
                <strong>• Autonomous Navigation:</strong> Moves down rows of tomato crops without human supervision.
              </li>
              <li style={{ marginBottom: '12px' }}>
                <strong>• AI-Powered Vision:</strong> Analyzes plant health in real-time.
              </li>
              <li style={{ marginBottom: '12px' }}>
                <strong>• Instant Transmission:</strong> Pings location immediately upon threat detection.
              </li>
            </ul>
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

        .falling-crop {
          position: fixed;
          top: -50px;
          z-index: 1;
          animation: fall 4s linear forwards;
          opacity: 0.6;
          pointer-events: none;
        }

        @keyframes fall {
          to { transform: translateY(110vh) rotate(360deg); opacity: 0; }
        }

        .hero-title {
          font-size: clamp(3.5rem, 10vw, 6.5rem);
          font-weight: 900;
          line-height: 0.85;
          letter-spacing: -4px;
          margin-bottom: 25px;
        }

        .text-outline {
          -webkit-text-stroke: 1.5px #3e322b;
          color: transparent;
        }

        .hero-subtitle {
          font-size: 1.1rem;
          font-weight: 700;
          opacity: 0.6;
          letter-spacing: 4px;
          text-transform: uppercase;
        }

        .hero-depth-container {
          position: relative;
          width: 100%;
          display: flex;
          justify-content: center;
          padding: 40px 0;
          animation: float 6s ease-in-out infinite;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-15px); }
        }

        .hero-image-wrapper {
          position: relative;
          z-index: 2;
          border-radius: 40px;
          overflow: hidden;
          width: 100%;
          max-width: 1100px;
          border: 1px solid rgba(255,255,255,0.2);
        }

        .main-hero-img {
          width: 100%;
          height: 650px;
          object-fit: cover;
          display: block;
        }

        .image-vignette {
          position: absolute;
          inset: 0;
          background: radial-gradient(circle, transparent 40%, rgba(0,0,0,0.3) 100%);
          pointer-events: none;
        }

        .hero-shadow {
          position: absolute;
          bottom: 10px;
          width: 85%;
          height: 40px;
          background: rgba(0,0,0,0.2);
          filter: blur(40px);
          border-radius: 100%;
          z-index: 1;
        }

        .ui-overlay {
          position: absolute;
          bottom: 30px;
          left: 30px;
          background: rgba(255,255,255,0.9);
          color: #3e322b;
          padding: 12px 24px;
          border-radius: 100px;
          font-size: 11px;
          font-weight: 900;
          display: flex;
          align-items: center;
          gap: 10px;
          backdrop-filter: blur(5px);
          box-shadow: 0 10px 20px rgba(0,0,0,0.1);
        }

        .pulse-dot {
          width: 8px;
          height: 8px;
          background: #4CAF50;
          border-radius: 50%;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(76, 175, 80, 0.7); }
          70% { box-shadow: 0 0 0 10px rgba(76, 175, 80, 0); }
          100% { box-shadow: 0 0 0 0 rgba(76, 175, 80, 0); }
        }

        .grid-layout {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: 40px;
        }

        .interactive-card {
          background: rgba(255, 255, 255, 0.45);
          padding: 60px 45px;
          border-radius: 40px;
          border: 1px solid rgba(255,255,255,0.4);
          transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
          backdrop-filter: blur(10px);
          text-align: left;
        }

        .interactive-card h3 {
          font-size: 2rem;
          font-weight: 900;
          margin-bottom: 20px;
        }

        .interactive-card:hover {
          background: #d7c0ae;
          transform: translateY(-15px);
          box-shadow: 0 30px 60px rgba(62, 50, 43, 0.15);
        }

        .shiny-login-btn {
          background: #3e322b;
          color: white;
          padding: 14px 32px;
          border-radius: 100px;
          border: none;
          font-weight: 800;
          cursor: pointer;
          transition: 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .shiny-login-btn:hover {
          transform: scale(1.05);
          box-shadow: 0 10px 25px rgba(62, 50, 43, 0.2);
        }

        .nav-link-modern {
          text-decoration: none;
          color: #3e322b;
          font-weight: 700;
          font-size: 13px;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          padding: 0;
          font-family: inherit;
        }

        .logo-pulse {
          width: 14px;
          height: 14px;
          background: #5e6b56;
          border-radius: 3px;
          animation: rotate 8s infinite linear;
        }

        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .modern-footer {
          background: #3e322b;
          color: #d7c0ae;
          padding: 120px 5% 60px 5%;
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

        .section-tag {
          text-transform: uppercase;
          letter-spacing: 5px;
          font-size: 13px;
          color: #5e6b56;
          margin-bottom: 20px;
          font-weight: 800;
        }

        .mission-statement {
          font-size: clamp(1.8rem, 4vw, 2.5rem);
          max-width: 900px;
          margin: 0 auto;
          line-height: 1.3;
          font-weight: 700;
        }

        .highlight {
          color: #ffffff;
          background: #5e6b56;
          padding: 0 10px;
          border-radius: 4px;
        }

        body { background-color: #acc0a4; margin: 0; }
      `}</style>
    </div>
  );
};

export default LandingPage;