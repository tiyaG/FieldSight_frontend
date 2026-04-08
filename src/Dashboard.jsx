import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Battery, Power, Square, Radio, AlertTriangle } from 'lucide-react';

// Accessing the .env variable
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;
mapboxgl.accessToken = MAPBOX_TOKEN;

export default function Dashboard({ onLogout, farmCoords }) {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const marker = useRef(null);
  
  const [searchInput, setSearchInput] = useState('');
  const [currentCoords, setCurrentCoords] = useState(farmCoords);
  const [mapError, setMapError] = useState(null);

  useEffect(() => {
    // BUG CHECK 1: Is the token actually reaching the code?
    if (!MAPBOX_TOKEN) {
      setMapError("TOKEN ERROR: VITE_MAPBOX_TOKEN is undefined. Please restart your terminal with 'npm run dev'.");
      return;
    }

    // BUG CHECK 2: Are coordinates arriving from Login?
    if (!currentCoords || !currentCoords.lat) {
      setMapError("DATA ERROR: No coordinates received from the Login page.");
      return;
    }

    if (map.current) return;
    
    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/satellite-v9',
        center: [currentCoords.lng, currentCoords.lat],
        zoom: 17,
        pitch: 45
      });

      // FIX: Force a resize 200ms after load to ensure the gray box disappears
      map.current.on('load', () => {
        setTimeout(() => {
          if (map.current) map.current.resize();
        }, 200);
      });

      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

      marker.current = new mapboxgl.Marker({ color: '#15803d' })
        .setLngLat([currentCoords.lng, currentCoords.lat])
        .addTo(map.current);

    } catch (err) {
      setMapError("CRITICAL ERROR: " + err.message);
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [currentCoords]);

  const handleLocateFarm = async () => {
    if (!searchInput || !map.current) return;
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(searchInput)}.json?access_token=${MAPBOX_TOKEN}`;
    
    try {
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.features && data.features.length > 0) {
        const [lng, lat] = data.features[0].center;
        setCurrentCoords({ lng, lat });
        map.current.flyTo({ center: [lng, lat], zoom: 18, essential: true });
        if (marker.current) marker.current.setLngLat([lng, lat]);
        
        setTimeout(() => {
          if (map.current) map.current.resize();
        }, 300);
      }
    } catch (error) {
      console.error("Search failed:", error);
    }
  };

  // Styles
  const containerStyle = { height: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#f8fafc', fontFamily: "'Inter', sans-serif" };
  const headerStyle = { height: '70px', backgroundColor: '#3b1e0d', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 30px' };
  const mainStyle = { flex: 1, display: 'flex', padding: '20px', gap: '20px', overflow: 'hidden' };
  const sidebarStyle = { width: '300px', display: 'flex', flexDirection: 'column', gap: '20px' };
  const cardStyle = { backgroundColor: 'white', padding: '20px', borderRadius: '15px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' };
  const errorBoxStyle = { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fee2e2', borderRadius: '20px', color: '#b91c1c', textAlign: 'center', padding: '40px' };
  const bigButtonStyle = (color) => ({ flex: 1, padding: '20px', borderRadius: '12px', border: 'none', color: 'white', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', backgroundColor: color });

  return (
    <div style={containerStyle}>
      <header style={headerStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Radio size={28} color="#4ade80" />
          <span style={{ fontWeight: '900', letterSpacing: '2px', fontSize: '20px' }}>FIELDSIGHT</span>
        </div>
        <button onClick={onLogout} style={{ backgroundColor: 'transparent', border: '1px solid white', color: 'white', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer' }}>Logout</button>
      </header>
      
      <main style={mainStyle}>
        <div style={sidebarStyle}>
          <div style={cardStyle}>
            <h3 style={{ margin: '0 0 10px 0', color: '#64748b', fontSize: '11px' }}>STATUS</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#15803d' }}>
              <Battery size={24} /> <span style={{ fontSize: '24px', fontWeight: 'bold' }}>88%</span>
            </div>
          </div>
          <div style={cardStyle}>
            <h3 style={{ margin: '0 0 10px 0', color: '#64748b', fontSize: '11px' }}>COORDINATES</h3>
            <div style={{ fontSize: '14px' }}>
              <div>Lat: {currentCoords?.lat?.toFixed(4) || 'N/A'}</div>
              <div>Lng: {currentCoords?.lng?.toFixed(4) || 'N/A'}</div>
            </div>
          </div>
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div style={{ display: 'flex', gap: '10px' }}>
            <input 
              type="text" 
              placeholder="Search field location..." 
              style={{ flex: 1, padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0' }} 
              value={searchInput} 
              onChange={(e) => setSearchInput(e.target.value)} 
              onKeyDown={(e) => e.key === 'Enter' && handleLocateFarm()} 
            />
            <button onClick={handleLocateFarm} style={{ padding: '0 20px', backgroundColor: '#3b1e0d', color: 'white', borderRadius: '10px', cursor: 'pointer' }}>LOCATE</button>
          </div>
          
          <div style={{ display: 'flex', gap: '20px' }}>
            <button style={bigButtonStyle('#22c55e')}><Power /> START</button>
            <button style={bigButtonStyle('#ef4444')}><Square /> STOP</button>
          </div>

          {mapError ? (
            <div style={errorBoxStyle}>
              <AlertTriangle size={64} />
              <h2 style={{ marginTop: '20px', fontSize: '24px' }}>System Diagnosis</h2>
              <p style={{ fontSize: '16px', maxWidth: '80%' }}>{mapError}</p>
            </div>
          ) : (
            <div ref={mapContainer} style={{ flex: 1, borderRadius: '20px', overflow: 'hidden', backgroundColor: '#e2e8f0' }} />
          )}
        </div>
      </main>
    </div>
    
  );
}