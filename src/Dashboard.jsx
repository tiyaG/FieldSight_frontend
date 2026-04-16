import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Battery, Radio, PenTool, Play, Square, Navigation, AlertCircle, Wifi, WifiOff, Database, Activity, ExternalLink } from 'lucide-react';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;
const VITE_API_URL = import.meta.env.VITE_API_URL || "https://api.fieldsightproject.com";

export default function Dashboard({ onLogout, farmCoords }) {
  const ROVER_ID = 1; 

  const mapContainer = useRef(null);
  const map = useRef(null);
  const roverMarker = useRef(null);
  const animationRef = useRef(null);
  const activeMarkers = useRef([]); 
  const lastScanMarker = useRef(null); // Track the very last pinpoint for the "View Results" button
  
  const telemetryWS = useRef(null);
  const scansWS = useRef(null);
  
  const [searchInput, setSearchInput] = useState('');
  const [currentCoords, setCurrentCoords] = useState(farmCoords || { lng: -121.88107, lat: 37.33332 });
  const [isScanning, setIsScanning] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawPath, setDrawPath] = useState([]); 
  
  const [battery, setBattery] = useState(null);
  const [liveTelemetry, setLiveTelemetry] = useState({ lat: 0, lng: 0, speed: null });
  
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [scanCount, setScanCount] = useState(0);
  const [scanDataBuffer, setScanDataBuffer] = useState([]); 

  const [backendStatus, setBackendStatus] = useState('checking'); 
  const [realImagesReceived, setRealImagesReceived] = useState(false);

  const theme = {
    sageGreen: '#A3B18A',
    darkBrown: '#3E2723',
    severityColors: {
      1: '#FFD700', 
      2: '#FF8C00', 
      3: '#FF0000', 
      0: '#4CAF50'  
    }
  };

  const normalizeSeverity = (severity) => {
    if (typeof severity === "number") return severity;
    if (typeof severity === "string") {
      const s = severity.toLowerCase().trim();
      if (s === "low" || s === "early") return 1;
      if (s === "medium" || s === "moderate") return 2;
      if (s === "high" || s === "critical") return 3;
    }
    return 0;
  };

  const dropScanPin = (scan) => {
    if (!map.current) return;

    const severityValue = normalizeSeverity(scan.severity);
    const markerColor = scan.disease_status === 'HEALTHY' ? theme.severityColors[0] : theme.severityColors[severityValue] || '#FF0000';

    const popupHTML = `
      <div style="color:black; font-family: 'Inter', sans-serif; min-width: 200px; padding: 10px;">
        <div style="font-weight:bold; border-bottom:1px solid #eee; padding-bottom:5px; margin-bottom:10px; display:flex; justify-content:space-between;">
          <span>SCAN #${scan.scan_id}</span>
          <span style="color:#888; font-size:10px;">${new Date().toLocaleTimeString()}</span>
        </div>
        <img src="${scan.image_url}" style="width:100%; border-radius:8px; margin-bottom:10px; border:1px solid #ddd;" alt="Crop Scan"/>
        <div style="font-size:12px; line-height:1.4;">
          <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
            <strong>Status:</strong> <span style="color:${markerColor}">${scan.disease_status}</span>
          </div>
          <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
            <strong>Severity:</strong> <span>Level ${severityValue}/3</span>
          </div>
          <p style="font-size:11px; color:#555; background:#f9f9f9; padding:5px; border-radius:4px; margin-top:8px;">${scan.short_explanation || 'No description available.'}</p>
        </div>
      </div>
    `;

    const popup = new mapboxgl.Popup({ offset: 25, maxWidth: '300px' }).setHTML(popupHTML);
    const marker = new mapboxgl.Marker({ color: markerColor })
      .setLngLat([scan.gps_lng, scan.gps_lat])
      .setPopup(popup)
      .addTo(map.current);
    
    lastScanMarker.current = marker; // Store for the "View Results" button
    activeMarkers.current.push(marker);
  };

  const connectWebSockets = (sessionId) => {
    const token = localStorage.getItem("token");
    if (!token || !sessionId) return;

    const wsBase = VITE_API_URL.replace("https://", "wss://").replace("http://", "ws://");
    const telemetryUrl = `${wsBase}/websocket/telemetry/${ROVER_ID}?token=${token}`;
    const scansUrl = `${wsBase}/websocket/scans/${sessionId}?token=${token}`;

    telemetryWS.current = new WebSocket(telemetryUrl);
    scansWS.current = new WebSocket(scansUrl);

    telemetryWS.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "telemetry.latest") {
        const tel = data.telemetry;
        setBattery(tel.battery);
        setLiveTelemetry({ lat: tel.gps_lat, lng: tel.gps_lng, speed: 1.5 });
        updateRoverMarker([tel.gps_lng, tel.gps_lat]);
      }
    };

    scansWS.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "scan.stored") {
        setRealImagesReceived(true);
        const newScan = data.scan;
        setScanDataBuffer(prev => [...prev, newScan]);
        setScanCount(prev => prev + 1);
        dropScanPin(newScan);
      }
    };

    telemetryWS.current.onopen = () => setBackendStatus('online');
    telemetryWS.current.onerror = () => setBackendStatus('offline');
  };

  const updateRoverMarker = (pos) => {
    if (!map.current) return;
    if (!roverMarker.current) {
      const el = document.createElement('div');
      el.innerHTML = `<span style="font-size: 30px; filter: drop-shadow(0 0 5px white); transition: all 0.5s ease;">🚜</span>`;
      roverMarker.current = new mapboxgl.Marker(el).setLngLat(pos).addTo(map.current);
    } else {
      roverMarker.current.setLngLat(pos);
    }
    map.current.easeTo({ center: pos, duration: 1000 });
  };

  const animateRover = (path) => {
    let index = 0;
    const move = () => {
      if (document.body.getAttribute('data-scanning') !== 'true') return;
      if (index < path.length) {
        const nextPos = path[index];
        updateRoverMarker(nextPos);
        setLiveTelemetry(prev => ({ ...prev, lat: nextPos[1], lng: nextPos[0], speed: 1.2 }));
        index++;
        animationRef.current = setTimeout(move, 2000); 
      }
    };
    move();
  };

  useEffect(() => {
    mapboxgl.accessToken = MAPBOX_TOKEN;
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/satellite-v9',
      center: [currentCoords.lng, currentCoords.lat],
      zoom: 18,
      attributionControl: false 
    });

    map.current.on('load', () => {
      map.current.addSource('route', { 
        type: 'geojson', 
        data: { type: 'Feature', geometry: { type: 'LineString', coordinates: [] } } 
      });
      map.current.addLayer({ 
        id: 'route', type: 'line', source: 'route', 
        paint: { 'line-color': '#FFF', 'line-width': 3, 'line-dasharray': [2, 1] } 
      });
    });

    map.current.on('click', (e) => {
      if (document.body.getAttribute('data-drawing') === 'true') {
        setDrawPath(current => {
          const next = [...current, [e.lngLat.lng, e.lngLat.lat]];
          if (map.current.getSource('route')) {
            map.current.getSource('route').setData({ type: 'Feature', geometry: { type: 'LineString', coordinates: next } });
          }
          return next;
        });
      }
    });

    return () => map.current?.remove();
  }, []);

  const startFollowPath = async () => {
    if (drawPath.length < 2) return;
    
    activeMarkers.current.forEach(m => m.remove());
    activeMarkers.current = [];
    lastScanMarker.current = null;

    updateRoverMarker(drawPath[0]);

    // CHECK AND FIX MISSING FARMER_ID
    let storedFarmerId = localStorage.getItem("farmer_id");
    
    if (!storedFarmerId || storedFarmerId === "null") {
      console.log("Detecting missing farmer_id... attempting to recover.");
      // If the dashboard was passed farmCoords, we can often find the ID there
      if (farmCoords && farmCoords.id) {
        localStorage.setItem("farmer_id", farmCoords.id);
        storedFarmerId = farmCoords.id;
      } else {
        // Default to ID 1 if we are in a testing environment
        localStorage.setItem("farmer_id", "1");
        storedFarmerId = "1";
      }
    }

    const token = localStorage.getItem("token");

    setIsScanning(true);
    setIsDrawing(false);
    setScanCount(0);
    setScanDataBuffer([]);
    setRealImagesReceived(false);
    
    try {
      const response = await fetch(`${VITE_API_URL}/api/rover/start?farmer_id=${storedFarmerId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ path: drawPath })
      });
      const data = await response.json();
      if (response.ok) {
        // Ensure token and ID are set in case they were refreshed
        localStorage.setItem("token", token);
        localStorage.setItem("farmer_id", storedFarmerId);
        
        setBackendStatus('online');
        setCurrentSessionId(data.session_id);
        connectWebSockets(data.session_id); 
      }
    } catch (err) {
      setBackendStatus('offline');
    }

    animateRover(drawPath); 
  };

  const stopScan = async () => {
    setIsScanning(false); 
    if (animationRef.current) clearTimeout(animationRef.current);
    
    if (currentSessionId) {
      try {
        await fetch(`${VITE_API_URL}/api/rover/stop/${currentSessionId}`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${localStorage.getItem("token")}` }
        });
      } catch (e) {}
    }

    if (scanCount === 0) {
      alert("Scan Complete: No anomalies found along this pathway.");
    }
  };

  const viewLatestResult = () => {
    if (lastScanMarker.current) {
      const lngLat = lastScanMarker.current.getLngLat();
      map.current.flyTo({ center: lngLat, zoom: 20 });
      lastScanMarker.current.togglePopup();
    }
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

  useEffect(() => {
    document.body.setAttribute('data-drawing', isDrawing.toString());
    document.body.setAttribute('data-scanning', isScanning.toString());
  }, [isDrawing, isScanning]);

  return (
    <div style={{ height: '100vh', width: '100vw', display: 'flex', flexDirection: 'column', backgroundColor: '#F4F7F2', position: 'fixed', top: 0, left: 0, fontFamily: 'Inter, sans-serif' }}>
      <header style={{ height: '70px', backgroundColor: theme.darkBrown, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 30px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Radio size={28} color="#A5D6A7" />
          <span style={{ fontWeight: '900', letterSpacing: '2px' }}>FIELDSIGHT</span>
        </div>
        
        <div style={{ display: 'flex', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 15px', borderRadius: '12px', backgroundColor: backendStatus === 'online' ? '#2e7d32' : '#d32f2f', fontSize: '11px', fontWeight: 'bold' }}>
            {backendStatus === 'online' ? <Wifi size={14}/> : <WifiOff size={14}/>}
            {backendStatus === 'online' ? 'BACKEND CONNECTED' : 'OFFLINE'}
          </div>
          <button onClick={onLogout} style={{ background: 'transparent', border: '1px solid white', color: 'white', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' }}>Logout</button>
        </div>
      </header>
      
      <main style={{ flex: 1, display: 'flex', padding: '20px', gap: '20px', overflow: 'hidden' }}>
        <div style={{ width: '320px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ backgroundColor: 'white', padding: '15px', borderRadius: '15px', border: '1px solid #ddd' }}>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '11px', color: '#888' }}>SCANNING DATA</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                <span>Anomalies Found:</span>
                <span style={{ color: scanCount > 0 ? 'red' : 'green', fontWeight: 'bold' }}>{scanCount}</span>
              </div>
              
              <button 
                onClick={viewLatestResult}
                disabled={scanCount === 0}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', backgroundColor: scanCount > 0 ? theme.darkBrown : '#f1f1f1', color: scanCount > 0 ? 'white' : '#ccc', border: 'none', fontSize: '12px', fontWeight: 'bold', cursor: scanCount > 0 ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <ExternalLink size={14}/> VIEW LATEST RESULT
              </button>
            </div>
          </div>

          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '15px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '11px', color: '#888' }}>ROVER STATUS</h3>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: theme.darkBrown }}>
                  <Battery size={24} color={battery > 20 ? "#2e7d32" : "#d32f2f"} /> 
                  <span style={{ fontSize: '24px', fontWeight: 'bold' }}>{battery !== null ? `${battery}%` : '--'}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#666', fontSize: '12px' }}>
                <Navigation size={14} /> {liveTelemetry.speed ? `${liveTelemetry.speed} m/s` : '--'}
              </div>
            </div>
          </div>

          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '15px', border: isDrawing ? `2px solid ${theme.sageGreen}` : `1px solid #eee` }}>
            <h4 style={{ margin: '0 0 5px 0', fontSize: '13px', fontWeight: 'bold' }}>MISSION CONTROL</h4>
            <button 
              onClick={() => {
                setIsDrawing(!isDrawing);
                if (!isDrawing) setDrawPath([]);
              }}
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: 'none', backgroundColor: isDrawing ? theme.darkBrown : '#e2e8f0', color: isDrawing ? 'white' : '#475569', fontWeight: 'bold', cursor: 'pointer' }}>
              <PenTool size={18} style={{marginRight: '8px'}}/> {isDrawing ? 'FINISH PATH' : 'DRAW NEW PATH'}
            </button>
          </div>

          <div style={{ marginTop: 'auto' }}>
            {!isScanning ? (
              <button onClick={startFollowPath} disabled={drawPath.length < 2} style={{ width: '100%', padding: '18px', borderRadius: '12px', color: 'white', backgroundColor: drawPath.length < 2 ? '#ccc' : '#2e7d32', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>
                <Play size={20} style={{marginRight: '8px'}} /> START AUTONOMOUS SCAN
              </button>
            ) : (
              <button onClick={stopScan} style={{ width: '100%', padding: '18px', borderRadius: '12px', color: 'white', backgroundColor: '#dc2626', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>
                <Square size={20} style={{marginRight: '8px'}} /> EMERGENCY STOP
              </button>
            )}
          </div>
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div style={{ display: 'flex', gap: '10px' }}>
            <input 
              type="text" 
              placeholder="Enter farm coordinates or address..." 
              style={{ flex: 1, padding: '14px', borderRadius: '10px', border: '1px solid #ddd' }}
              value={searchInput} 
              onChange={(e) => setSearchInput(e.target.value)}
            />
            <button onClick={handleLocateFarm} style={{ padding: '0 25px', backgroundColor: theme.darkBrown, color: 'white', borderRadius: '10px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>SEARCH</button>
          </div>
          <div ref={mapContainer} style={{ flex: 1, borderRadius: '20px', overflow: 'hidden', position: 'relative', border: '6px solid white', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
             <div style={{ position: 'absolute', top: 20, right: 20, zIndex: 10, backgroundColor: 'white', padding: '10px 20px', borderRadius: '12px', fontSize: '13px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
                <Activity size={18} color={scanCount > 0 ? "red" : "green"}/>
                LIVE INCIDENTS: {scanCount}
             </div>
          </div>
        </div>
      </main>
    </div>
  );
}