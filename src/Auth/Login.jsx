import React, { useState } from 'react';
import { Mail, Lock } from 'lucide-react';

export default function Login({ onLogin, onGoToSignup }) {
  // Add local state to capture input (optional, but good for real apps)
  const [email, setEmail] = useState('');

  const handleLoginClick = () => {
    // For now, we simulate a successful login with default coordinates
    // This triggers the 'isLoggedIn' state in App.jsx
    onLogin({ lng: -118.2437, lat: 34.0522 }); 
  };

  const inputGroupStyle = { position: 'relative', marginBottom: '20px' };
  const inputStyle = { width: '100%', padding: '16px 16px 16px 50px', backgroundColor: '#f1f5f9', borderRadius: '8px', border: 'none', fontSize: '16px', color: '#334155' };
  const iconStyle = { position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' };
  const buttonStyle = { width: '100%', padding: '16px', backgroundColor: '#020617', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize: '16px', marginTop: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' };

  return (
    <div style={{ maxWidth: '400px', width: '100%', margin: '0 auto', fontFamily: "'Inter', sans-serif" }}>
      <h2 style={{ fontSize: '36px', fontWeight: '900', color: '#0f172a', marginBottom: '40px' }}>LOGIN</h2>
      
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={inputGroupStyle}>
          <Mail style={iconStyle} size={20} />
          <input 
            type="email" 
            placeholder="Email Address" 
            style={inputStyle} 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        
        <div style={inputGroupStyle}>
          <Lock style={iconStyle} size={20} />
          <input type="password" placeholder="Password" style={inputStyle} />
        </div>
        
        {/* FIX: Call handleLoginClick to pass data back to App.jsx */}
        <button onClick={handleLoginClick} style={buttonStyle}>
          ENTER FIELD →
        </button>
      </div>
      
      <p style={{ marginTop: '30px', textAlign: 'center', fontSize: '14px', color: '#64748b', fontWeight: 'bold' }}>
        NEW HERE? <span onClick={onGoToSignup} style={{ color: '#166534', cursor: 'pointer' }}>JOIN US</span>
      </p>
    </div>
  );
}