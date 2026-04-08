import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Battery, Power, Square, Radio, AlertTriangle, LogOut, MapPin } from 'lucide-react';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;
mapboxgl.accessToken = MAPBOX_TOKEN;

export default function Dashboard({ onLogout, farmCoords }) {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const marker = useRef(null);
  
  const [searchInput, setSearchInput] = useState('');
  const [currentCoords, setCurrentCoords] = useState(farmCoords);
  const [mapError, setMapError] = useState(null);
  const [hoveredBtn, setHoveredBtn] = useState(null); // Track which button is hovered

  useEffect(() => {
    if (!MAPBOX_TOKEN) {
      setMapError("TOKEN ERROR: VITE_MAPBOX_TOKEN is undefined. Please restart your terminal.");
      return;
    }
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

      map.current.on('load', () => {
        setTimeout(() => { if (map.current) map.current.resize(); }, 200);
      });

      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
      marker.current = new mapboxgl.Marker({ color: '#3E2723' })
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
      }
    } catch (error) { console.error("Search failed:", error); }
  };

  // Theme Colors
  const theme = {
    sageGreen: '#A3B18A',
    darkBrown: '#3E2723',
    lightBrownHighlight: '#D7CCC8', // The requested Light Brown highlight
    cardWhite: '#FFFFFF',
    textGrey: '#4A4A4A'
  };

  // Styles
  const containerStyle = { 
    height: '100vh', 
    width: '100vw',
    display: 'flex', 
    flexDirection: 'column', 
    backgroundColor: theme.sageGreen, // FULL GREEN BACKGROUND
    fontFamily: "'Inter', sans-serif",
    position: 'fixed',
    top: 0,
    left: 0
  };

  const headerStyle = { 
    height: '70px', 
    backgroundColor: theme.darkBrown, 
    color: 'white', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    padding: '0 30px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.2)'
  };

  const mainStyle = { flex: 1, display: 'flex', padding: '20px', gap: '20px', overflow: 'hidden' };
  
  const sidebarStyle = { width: '300px', display: 'flex', flexDirection: 'column', gap: '20px' };
  
  const cardStyle = { 
    backgroundColor: theme.cardWhite, 
    padding: '20px', 
    borderRadius: '15px', 
    boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
    transition: 'all 0.3s ease'
  };

  const inputStyle = { 
    flex: 1, 
    padding: '14px', 
    borderRadius: '10px', 
    border: 'none', 
    fontSize: '14px',
    backgroundColor: theme.cardWhite,
    boxShadow: hoveredBtn === 'input' ? `0 0 0 3px ${theme.lightBrownHighlight}` : 'none',
    transition: 'all 0.2s'
  };

  const bigButtonStyle = (color, id) => ({ 
    flex: 1, 
    padding: '18px', 
    borderRadius: '12px', 
    border: hoveredBtn === id ? `3px solid ${theme.lightBrownHighlight}` : 'none', 
    color: 'white', 
    fontWeight: 'bold', 
    cursor: 'pointer', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    gap: '10px', 
    backgroundColor: color,
    transition: 'all 0.2s',
    transform: hoveredBtn === id ? 'scale(1.02)' : 'scale(1)'
  });

  return (
    <div style={containerStyle}>
      <header style={headerStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Radio size={28} color="#A5D6A7" />
          <span style={{ fontWeight: '900', letterSpacing: '2px', fontSize: '20px', fontFamily: "'Times New Roman', serif" }}>FIELDSIGHT</span>
        </div>
        <button 
          onMouseEnter={() => setHoveredBtn('logout')}
          onMouseLeave={() => setHoveredBtn(null)}
          onClick={onLogout} 
          style={{ 
            backgroundColor: hoveredBtn === 'logout' ? theme.lightBrownHighlight : 'transparent', 
            border: '1px solid white', 
            color: hoveredBtn === 'logout' ? theme.darkBrown : 'white', 
            padding: '8px 16px', 
            borderRadius: '8px', 
            cursor: 'pointer',
            fontWeight: 'bold'
          }}>
          <LogOut size={16} style={{marginRight: '5px'}}/> Logout
        </button>
      </header>
      
      <main style={mainStyle}>
        <div style={sidebarStyle}>
          {/* Status Card with Hover Effect */}
          <div 
            style={{...cardStyle, backgroundColor: hoveredBtn === 'status' ? theme.lightBrownHighlight : theme.cardWhite}}
            onMouseEnter={() => setHoveredBtn('status')}
            onMouseLeave={() => setHoveredBtn(null)}
          >
            <h3 style={{ margin: '0 0 10px 0', color: theme.textGrey, fontSize: '11px', letterSpacing: '1px' }}>BATTERY STATUS</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: theme.darkBrown }}>
              <Battery size={24} /> <span style={{ fontSize: '24px', fontWeight: 'bold' }}>88%</span>
            </div>
          </div>

          <div style={cardStyle}>
            <h3 style={{ margin: '0 0 10px 0', color: theme.textGrey, fontSize: '11px', letterSpacing: '1px' }}>COORDINATES</h3>
            <div style={{ fontSize: '14px', color: theme.darkBrown, fontWeight: '500' }}>
              <div style={{display: 'flex', alignItems: 'center', gap: '5px'}}><MapPin size={14}/> Lat: {currentCoords?.lat?.toFixed(4) || 'N/A'}</div>
              <div style={{marginLeft: '19px'}}>Lng: {currentCoords?.lng?.toFixed(4) || 'N/A'}</div>
            </div>
          </div>
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {/* Search Box with Light Brown Highlight */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <input 
              type="text" 
              placeholder="Enter the address field..." 
              style={inputStyle} 
              onMouseEnter={() => setHoveredBtn('input')}
              onMouseLeave={() => setHoveredBtn(null)}
              value={searchInput} 
              onChange={(e) => setSearchInput(e.target.value)} 
              onKeyDown={(e) => e.key === 'Enter' && handleLocateFarm()} 
            />
            <button 
              onMouseEnter={() => setHoveredBtn('locate')}
              onMouseLeave={() => setHoveredBtn(null)}
              onClick={handleLocateFarm} 
              style={{ 
                padding: '0 25px', 
                backgroundColor: hoveredBtn === 'locate' ? theme.lightBrownHighlight : theme.darkBrown, 
                color: hoveredBtn === 'locate' ? theme.darkBrown : 'white', 
                borderRadius: '10px', 
                cursor: 'pointer',
                border: 'none',
                fontWeight: 'bold'
              }}>
              LOCATE
            </button>
          </div>
          
          <div style={{ display: 'flex', gap: '20px' }}>
            <button 
              onMouseEnter={() => setHoveredBtn('start')}
              onMouseLeave={() => setHoveredBtn(null)}
              style={bigButtonStyle('#2e7d32', 'start')}
            >
              <Power /> START
            </button>
            <button 
              onMouseEnter={() => setHoveredBtn('stop')}
              onMouseLeave={() => setHoveredBtn(null)}
              style={bigButtonStyle('#c62828', 'stop')}
            >
              <Square /> STOP
            </button>
          </div>

          <div ref={mapContainer} style={{ flex: 1, borderRadius: '20px', overflow: 'hidden', border: `4px solid ${theme.cardWhite}`, boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }} />
        </div>
      </main>
    </div>
  );
}