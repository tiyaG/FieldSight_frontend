import React, { useState } from 'react';
import LandingPage from './landing/LandingPage';
import Auth from './Auth/Auth';
import Dashboard from './Dashboard'; 
import AboutUs from './AboutUs'; // Ensure the file path matches your VS Code structure

export default function App() {
  // 'landing' is the default view for fieldsightproject.com
  const [currentView, setCurrentView] = useState('landing');
  
  // Default coordinates (San Jose area fallback)
  const [farmLocation, setFarmLocation] = useState({ lng: -121.88107, lat: 37.33332 });

  // Called when Login.jsx successfully gets an access_token from /auth/login
  const handleLoginSuccess = (coords) => {
    if (coords) {
      setFarmLocation(coords);
    }
    setCurrentView('dashboard'); 
  };

  // Resets the view and clears local state on logout
  const handleLogout = () => {
    localStorage.removeItem("token"); // Clean up the session token
    setCurrentView('landing'); 
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      width: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      margin: 0,
      padding: 0,
      overflowX: 'hidden' 
    }}>
      
      {/* 1. LANDING PAGE - Default Entry Point */}
      {currentView === 'landing' && (
        <LandingPage 
          onLoginClick={() => setCurrentView('login')} 
          onAboutClick={() => setCurrentView('about')}
          onProductClick={() => setCurrentView('product')}
        />
      )}

      {/* 2. ABOUT US VIEW - Team & Gallery */}
      {currentView === 'about' && (
        <AboutUs onBackClick={() => setCurrentView('landing')} />
      )}

      {/* 3. OUR PRODUCT VIEW - (Placeholder for your product page) */}
      {currentView === 'product' && (
        <div style={{ backgroundColor: '#acc0a4', minHeight: '100vh', padding: '100px' }}>
             <button onClick={() => setCurrentView('landing')} style={{cursor: 'pointer'}}>← Back</button>
             <h1>Our Product Page Coming Soon</h1>
             {/* You can swap this <div> for a proper <OurProduct /> component later */}
        </div>
      )}

      {/* 4. AUTHENTICATION VIEW (Login/Signup) */}
      {currentView === 'login' && (
        <Auth 
          onLoginSuccess={handleLoginSuccess} 
          onBack={() => setCurrentView('landing')} 
        />
      )}

      {/* 5. DASHBOARD VIEW - Protected View */}
      {currentView === 'dashboard' && (
        <Dashboard 
          onLogout={handleLogout} 
          farmCoords={farmLocation} 
        />
      )}

    </div>
  );
}