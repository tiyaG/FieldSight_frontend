import React, { useState } from 'react';
import { Mail, Lock, ArrowRight } from 'lucide-react';

export default function Login({ onLogin, onGoToSignup }) {
  const [email, setEmail] = useState('');

  const handleLoginClick = () => {
    onLogin({ lng: -118.2437, lat: 34.0522 }); 
  };

  const theme = {
    sageGreen: '#A3B18A',   // The green from your landing page section
    darkBrown: '#3E2723',    // Espresso brown for buttons/text
    cardWhite: '#FFFFFF'
  };

  // MAIN FIX: These styles ensure the green covers every pixel of the background
  const containerStyle = {
    position: 'fixed',      // Fixes it to the viewport
    top: 0,
    left: 0,
    height: '100vh',        // Full viewport height
    width: '100vw',         // Full viewport width
    backgroundColor: theme.sageGreen, 
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: "'Inter', sans-serif",
    margin: 0,
    padding: 0,
    zIndex: 1000            // Ensures it sits on top of any other layout elements
  };

  const cardStyle = {
    backgroundColor: theme.cardWhite,
    padding: '50px',
    borderRadius: '12px',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
    width: '100%',
    maxWidth: '400px',
    textAlign: 'center'
  };

  const inputStyle = { 
    width: '100%', 
    padding: '14px 14px 14px 45px', 
    marginBottom: '15px',
    borderRadius: '6px', 
    border: '1px solid #DDD', 
    fontSize: '16px',
    boxSizing: 'border-box'
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <h2 style={{ color: theme.darkBrown, fontSize: '32px', marginBottom: '10px' }}>Login</h2>
        <p style={{ color: '#666', marginBottom: '30px', fontSize: '14px' }}>Welcome back to FieldSight</p>
        
        <div style={{ position: 'relative' }}>
          <Mail style={{ position: 'absolute', left: '15px', top: '15px', color: theme.sageGreen }} size={18} />
          <input 
            type="email" 
            placeholder="Email Address" 
            style={inputStyle} 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        
        <div style={{ position: 'relative' }}>
          <Lock style={{ position: 'absolute', left: '15px', top: '15px', color: theme.sageGreen }} size={18} />
          <input type="password" placeholder="Password" style={inputStyle} />
        </div>
        
        <button onClick={handleLoginClick} style={{
          width: '100%',
          padding: '16px',
          backgroundColor: theme.darkBrown,
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          fontWeight: 'bold',
          cursor: 'pointer',
          marginTop: '10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px'
        }}>
          ENTER FIELD <ArrowRight size={18} />
        </button>

        <p style={{ marginTop: '25px', fontSize: '14px', color: '#444' }}>
          NEW HERE? <span onClick={onGoToSignup} style={{ color: theme.darkBrown, cursor: 'pointer', fontWeight: 'bold', textDecoration: 'underline' }}>JOIN US</span>
        </p>
      </div>
    </div>
  );
}