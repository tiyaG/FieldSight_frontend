import React, { useState } from 'react';
import Auth from './Auth/Auth';
import Dashboard from './Dashboard'; // Make sure this matches the filename exactly!

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [farmLocation, setFarmLocation] = useState({ lng: -118.2437, lat: 34.0522 });

  const handleLoginSuccess = (coords) => {
    if (coords) setFarmLocation(coords);
    setIsLoggedIn(true);
  };

  return (
    <div style={{ height: '100vh', width: '100vw', display: 'flex', flexDirection: 'column' }}>
      {!isLoggedIn ? (
        <Auth onLoginSuccess={handleLoginSuccess} />
      ) : (
        <Dashboard onLogout={() => setIsLoggedIn(false)} farmCoords={farmLocation} />
      )}
    </div>
  );
}