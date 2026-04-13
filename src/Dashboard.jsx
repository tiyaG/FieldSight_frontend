import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Battery, Radio, Loader2, ShieldAlert, PenTool, Play, Square } from 'lucide-react';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

export default function Dashboard({ onLogout, farmCoords }) {
  // 1. DYNAMIC API URL 
  const API_URL = import.meta.env.VITE_API_URL || "http://64.181.240.74:8000";

  const mapContainer = useRef(null);
  const map = useRef(null);
  const roverMarker = useRef(null);
  const resultMarkers = useRef(new Map()); 
  const pollInterval = useRef(null);
  
  const [searchInput, setSearchInput] = useState('');
  const [currentCoords, setCurrentCoords] = useState(farmCoords || { lng: -121.88107, lat: 37.33332 });
  const [isScanning, setIsScanning] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawPath, setDrawPath] = useState([]);
  const [error, setError] = useState(null);
  const [battery, setBattery] = useState(88);

  const theme = {
    sageGreen: '#A3B18A',
    darkBrown: '#3E2723',
    severity: { early: '#FFD700', moderate: '#FF8C00', critical: '#FF0000' }
  };

  // Initialize Map
  useEffect(() => {
    if (!MAPBOX_TOKEN || !mapContainer.current) return;
    
    mapboxgl.accessToken = MAPBOX_TOKEN;
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/satellite-v9',
      center: [currentCoords.lng, currentCoords.lat],
      zoom: 18
    });

    map.current.on('load', () => {
      map.current.addSource('route', {
        type: 'geojson',
        data: { type: 'Feature', geometry: { type: 'LineString', coordinates: [] } }
      });
      map.current.addLayer({
        id: 'route',
        type: 'line',
        source: 'route',
        paint: { 'line-color': '#A5D6A7', 'line-width': 4, 'line-dasharray': [2, 1] }
      });
    });

    return () => map.current?.remove();
    // Added farmCoords to dependency array so it updates if user logs in with new coords
  }, [farmCoords]); 

  // Handle Path Drawing
  useEffect(() => {
    if (!map.current) return;
    const handleMapClick = (e) => {
      if (!isDrawing) return;
      const newPoint = [e.lngLat.lng, e.lngLat.lat];
      setDrawPath(prev => {
        const updated = [...prev, newPoint];
        map.current.getSource('route')?.setData({ 
          type: 'Feature', 
          geometry: { type: 'LineString', coordinates: updated } 
        });
        return updated;
      });
    };
    map.current.on('click', handleMapClick);
    return () => map.current?.off('click', handleMapClick);
  }, [isDrawing]);

  // FETCH TELEMETRY & IMAGES
  const pollBackend = async () => {
    const token = localStorage.getItem("token");
    try {
      // 1. Get Rover Position
      const telRes = await fetch(`${API_URL}/api/telemetry/latest`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const telData = await telRes.json();
      
      if (telData && telRes.ok) {
        const pos = [telData.longitude, telData.latitude];
        setBattery(telData.battery_level);
        
        if (!roverMarker.current) {
          const el = document.createElement('div');
          el.innerHTML = `<span style="font-size: 30px;">🚜</span>`;
          roverMarker.current = new mapboxgl.Marker(el).setLngLat(pos).addTo(map.current);
        } else {
          roverMarker.current.setLngLat(pos);
        }
        map.current.easeTo({ center: pos, duration: 800 });
      }

      // 2. Get Detections
      const imgRes = await fetch(`${API_URL}/api/images/detections`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const detections = await imgRes.json();

      if (imgRes.ok && Array.isArray(detections)) {
        detections.forEach(det => {
          if (!resultMarkers.current.has(det.id)) {
            const color = theme.severity[det.severity.toLowerCase()] || '#ccc';
            const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
              <div style="padding: 10px;">
                <img src="${det.image_url}" style="width:100%; border-radius:4px; margin-bottom:5px;"/>
                <strong style="color: ${color};">${det.label}</strong>
                <p style="font-size: 10px; margin:0;">AI Confidence: ${(det.confidence * 100).toFixed(1)}%</p>
              </div>
            `);

            const marker = new mapboxgl.Marker({ color })
              .setLngLat([det.lng, det.lat])
              .setPopup(popup)
              .addTo(map.current);
            
            resultMarkers.current.set(det.id, marker);
          }
        });
      }
    } catch (err) {
      console.error("Polling error:", err);
    }
  };

  const startFollowPath = async () => {
    if (drawPath.length < 2) return setError("Please draw a path first.");
    const token = localStorage.getItem("token");

    try {
      setIsScanning(true);
      setError(null);

      const response = await fetch(`${API_URL}/api/rover/start`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ path: drawPath })
      });

      if (!response.ok) throw new Error("Backend failed to start rover");
      pollInterval.current = setInterval(pollBackend, 1500);

    } catch (err) {
      setError(`Connection Failure: ${err.message}`);
      setIsScanning(false);
    }
  };

  const stopScan = async () => {
    const token = localStorage.getItem("token");
    clearInterval(pollInterval.current);
    await fetch(`${API_URL}/api/rover/stop`, { 
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    setIsScanning(false);
    setError("MANUAL OVERRIDE: Rover stopped.");
  };

  const handleLocateFarm = async () => {
    if (!searchInput.trim()) return;
    const res = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(searchInput)}.json?access_token=${MAPBOX_TOKEN}`);
    const data = await res.json();
    if (data.features?.length > 0) {
      const [lng, lat] = data.features[0].center;
      setCurrentCoords({ lng, lat });
      map.current.flyTo({ center: [lng, lat], zoom: 18 });
    }
  };

  return (
    <div style={{ height: '100vh', width: '100vw', display: 'flex', flexDirection: 'column', backgroundColor: '#F4F7F2', position: 'fixed', top: 0, left: 0, fontFamily: "'Inter', sans-serif" }}>
      <header style={{ height: '70px', backgroundColor: theme.darkBrown, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 30px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Radio size={28} color="#A5D6A7" />
          <span style={{ fontWeight: '900', letterSpacing: '2px' }}>FIELDSIGHT</span>
        </div>
        <button onClick={onLogout} style={{ background: 'transparent', border: '1px solid white', color: 'white', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer' }}>Logout</button>
      </header>
      
      <main style={{ flex: 1, display: 'flex', padding: '20px', gap: '20px', overflow: 'hidden' }}>
        <div style={{ width: '320px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '15px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '11px', color: '#4A4A4A' }}>SYSTEM STATUS</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: theme.darkBrown }}>
              <Battery size={24} color="#2e7d32" /> <span style={{ fontSize: '24px', fontWeight: 'bold' }}>{battery}%</span>
            </div>
          </div>

          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '15px', border: `1px solid ${theme.sageGreen}` }}>
            <h4 style={{ margin: '0 0 15px 0', fontSize: '13px', fontWeight: 'bold' }}>PATH PLANNER</h4>
            <button 
              onClick={() => {
                setIsDrawing(!isDrawing);
                if (!isDrawing) {
                  setDrawPath([]);
                  map.current.getSource('route')?.setData({ type: 'Feature', geometry: { type: 'LineString', coordinates: [] } });
                }
              }}
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: 'none', backgroundColor: isDrawing ? '#FF8C00' : theme.sageGreen, color: 'white', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer' }}>
              <PenTool size={18} /> {isDrawing ? 'LOCK PATH' : 'DRAW PATH'}
            </button>
          </div>

          {error && (
            <div style={{ backgroundColor: '#FEE2E2', padding: '15px', borderRadius: '15px', color: '#991B1B', display: 'flex', gap: '10px', fontSize: '12px', border: '1px solid #EF4444' }}>
              <ShieldAlert size={20} /> <div>{error}</div>
            </div>
          )}

          <div style={{ display: 'flex', gap: '10px', marginTop: 'auto' }}>
            {!isScanning ? (
              <button 
                onClick={startFollowPath} 
                disabled={drawPath.length < 2}
                style={{ flex: 1, padding: '18px', borderRadius: '12px', color: 'white', fontWeight: 'bold', backgroundColor: (drawPath.length < 2) ? '#ccc' : '#2e7d32', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                <Play /> START MISSION
              </button>
            ) : (
              <button 
                onClick={stopScan} 
                style={{ flex: 1, padding: '18px', borderRadius: '12px', color: 'white', fontWeight: 'bold', backgroundColor: '#dc2626', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                <Square /> STOP ROVER
              </button>
            )}
          </div>
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div style={{ display: 'flex', gap: '10px' }}>
            <input 
              type="text" 
              placeholder="Enter farm address..." 
              style={{ flex: 1, padding: '14px', borderRadius: '10px', border: '1px solid #ddd' }}
              value={searchInput} 
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLocateFarm()}
            />
            <button onClick={handleLocateFarm} style={{ padding: '0 25px', backgroundColor: theme.darkBrown, color: 'white', borderRadius: '10px', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>LOCATE</button>
          </div>

          <div ref={mapContainer} style={{ flex: 1, borderRadius: '20px', overflow: 'hidden', backgroundColor: '#eee', position: 'relative', border: '6px solid white', cursor: isDrawing ? 'crosshair' : 'grab' }}>
             {isScanning && (
               <div style={{ position: 'absolute', top: 20, left: '50%', transform: 'translateX(-50%)', backgroundColor: 'rgba(46, 125, 50, 0.9)', color: 'white', padding: '8px 20px', borderRadius: '30px', fontSize: '13px', zIndex: 10, display: 'flex', alignItems: 'center', gap: '10px' }}>
                 <Loader2 size={16} className="animate-spin" /> LIVE ROVER TELEMETRY ACTIVE
               </div>
             )}
          </div>
        </div>
      </main>
    </div>
  );
}