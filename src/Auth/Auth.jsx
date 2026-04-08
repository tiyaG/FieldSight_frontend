import React, { useState } from 'react';
import Login from './Login';
import Signup from './Signup';

// Change: Destructure 'onLoginSuccess' to match App.jsx
export default function Auth({ onLoginSuccess }) {
  const [view, setView] = useState('login');

  const screenBackgroundStyle = {
    height: '100vh',
    width: '100vw',
    backgroundColor: '#f8fafc',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: "'Inter', sans-serif"
  };

  const mainFormBoxStyle = {
    width: '900px',
    maxWidth: '95%',
    height: '600px',
    display: 'flex',
    boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
    borderRadius: '20px',
    overflow: 'hidden'
  };

  const leftPanelStyle = {
    flex: 1,
    backgroundColor: '#3b1e0d',
    color: 'white',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    padding: '60px',
  };

  const rightPanelStyle = {
    flex: 1,
    backgroundColor: 'white',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    padding: '60px',
  };

  return (
    <div style={screenBackgroundStyle}>
      <div style={mainFormBoxStyle}>
        
        <div style={leftPanelStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '40px' }}>
            <span style={{ fontSize: '30px' }}>🌱</span>
            <span style={{ letterSpacing: '2px', fontWeight: 'bold' }}>FIELDSIGHT</span>
          </div>
          <h1 style={{ fontSize: '60px', fontWeight: '900', lineHeight: '1.1', marginTop: '0' }}>
            {view === 'login' ? 'WELCOME BACK.' : 'GROW WITH US.'}
          </h1>
        </div>

        <div style={rightPanelStyle}>
          {view === 'login' ? (
            /* FIX: Pass onLoginSuccess down to the Login component */
            <Login 
              onLogin={onLoginSuccess} 
              onGoToSignup={() => setView('signup')} 
            />
          ) : (
            /* Note: You may want to update Signup later to also handle onLoginSuccess */
            <Signup onGoToLogin={() => setView('login')} />
          )}
        </div>
        
      </div>
    </div>
  );
}