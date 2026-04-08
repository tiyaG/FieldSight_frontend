import React from 'react';
import { User, MapPin, ShieldCheck, AtSign, ArrowRight } from 'lucide-react';

export default function Signup({ onGoToLogin }) {
  // Theme Colors from your Landing Page
  const theme = {
    sageGreen: '#A3B18A',   // The background from your "Why Choose" section
    darkBrown: '#3E2723',    // The footer/button color
    lightTan: '#FAF9F6',    // Soft off-white for the card
    textGrey: '#4A4A4A',    // Muted grey for subtexts
    white: '#FFFFFF'
  };

  const containerStyle = {
    position: 'fixed',      // Covers full screen edge-to-edge
    top: 0,
    left: 0,
    height: '100vh',
    width: '100vw',
    backgroundColor: theme.sageGreen, 
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: "'Inter', sans-serif",
    margin: 0,
    padding: 0,
    zIndex: 1000
  };

  const cardStyle = {
    backgroundColor: theme.white,
    padding: '40px',
    borderRadius: '12px',
    boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
    width: '100%',
    maxWidth: '450px',
    textAlign: 'center',
    boxSizing: 'border-box'
  };

  const titleStyle = {
    fontSize: '32px',
    fontWeight: '400', 
    fontFamily: "'Times New Roman', serif", // Serif to match landing page headers
    color: theme.darkBrown,
    marginBottom: '8px'
  };

  const inputStyle = {
    width: '100%',
    padding: '12px 12px 12px 42px',
    backgroundColor: '#F9FAF8',
    borderRadius: '6px',
    border: '1px solid #DDD', // "Closed" neat border
    fontSize: '15px',
    color: theme.darkBrown,
    boxSizing: 'border-box',
    outline: 'none'
  };

  const iconStyle = {
    position: 'absolute',
    left: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: theme.sageGreen,
  };

  const buttonStyle = {
    width: '100%',
    padding: '16px',
    backgroundColor: theme.darkBrown,
    color: theme.white,
    border: 'none',
    borderRadius: '6px',
    fontWeight: 'bold',
    cursor: 'pointer',
    fontSize: '16px',
    marginTop: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    fontFamily: "'Inter', sans-serif"
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <h2 style={titleStyle}>Join FieldSight</h2>
        <p style={{ color: theme.textGrey, marginBottom: '30px', fontSize: '14px' }}>
          Register your farm to start monitoring.
        </p>
        
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {/* Row for Names */}
          <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
              <div style={{ flex: 1, position: 'relative' }}>
                  <User style={iconStyle} size={18} />
                  <input type="text" placeholder="First Name" style={inputStyle} />
              </div>
              <div style={{ flex: 1, position: 'relative' }}>
                  <input type="text" placeholder="Last Name" style={{...inputStyle, paddingLeft: '15px'}} />
              </div>
          </div>

          <div style={{ position: 'relative', marginBottom: '15px' }}>
            <MapPin style={iconStyle} size={18} />
            <input type="text" placeholder="Farm Name" style={inputStyle} />
          </div>

          <div style={{ position: 'relative', marginBottom: '15px' }}>
            <AtSign style={iconStyle} size={18} />
            <input type="text" placeholder="Username" style={inputStyle} />
          </div>
          
          <div style={{ position: 'relative', marginBottom: '20px' }}>
            <ShieldCheck style={iconStyle} size={18} />
            <input type="password" placeholder="Password" style={inputStyle} />
          </div>
          
          <button onClick={onGoToLogin} style={buttonStyle}>
            CREATE ACCOUNT <ArrowRight size={20} />
          </button>
        </div>
        
        <p style={{ marginTop: '25px', fontSize: '14px', color: theme.textGrey, fontWeight: '500' }}>
          ALREADY A MEMBER? <span onClick={onGoToLogin} style={{ color: theme.darkBrown, cursor: 'pointer', fontWeight: 'bold', textDecoration: 'underline' }}>LOGIN</span>
        </p>
      </div>
    </div>
  );
}