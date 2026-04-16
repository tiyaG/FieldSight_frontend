import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Battery, Radio, Loader2, PenTool, Play, Square, Navigation, Eye, CheckCircle2, AlertCircle, Wifi, WifiOff, Database, Activity } from 'lucide-react';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;
const VITE_API_URL = import.meta.env.VITE_API_URL || "https://api.fieldsightproject.com";

export default function Dashboard({ onLogout, farmCoords }) {
  const FARMER_ID = 8; 
  const ROVER_ID = 1; 

  const mapContainer = useRef(null);
  const map = useRef(null);
  const roverMarker = useRef(null);
  const resultMarkers = useRef(new Map()); 
  const animationRef = useRef(null);
  
  const telemetryWS = useRef(null);
  const scansWS = useRef(null);
  
  const [searchInput, setSearchInput] = useState('');
  const [currentCoords, setCurrentCoords] = useState(farmCoords || { lng: -121.88107, lat: 37.33332 });
  const [isScanning, setIsScanning] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawPath, setDrawPath] = useState([]); 
  
  // SYSTEM STATUS STATES (Linked to Telemetry)
  const [battery, setBattery] = useState(null); // null means no data
  const [liveTelemetry, setLiveTelemetry] = useState({ lat: 0, lng: 0, speed: null });
  
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [scanCount, setScanCount] = useState(0);
  const [showResults, setShowResults] = useState(false);
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
      return 0;
    }
    return 0;
  };

  const animateRover = (path) => {
    let index = 0;
    const move = () => {
      if (document.body.getAttribute('data-scanning') !== 'true') return;

      // Only run local simulation if backend hasn't taken over
      if (!realImagesReceived) {
        const nextPos = path[index];
        updateRoverMarker(nextPos);
        setLiveTelemetry(prev => ({ ...prev, lat: nextPos[1], lng: nextPos[0], speed: 1.2 }));
        setBattery(98); // Mock battery for simulation

        const mockScan = {
          scan_id: `sim_${Date.now()}_${index}`,
          gps_lng: nextPos[0],
          gps_lat: nextPos[1],
          disease_status: 'DIAGNOSTIC TEST',
          severity: 0,
          confidence_score: 1.0,
          isSimulated: true,
          timestamp: new Date().toLocaleTimeString()
        };
        setScanDataBuffer(prev => [...prev, mockScan]);
        setScanCount(prev => prev + 1);
        
        index = (index + 1) % path.length;
        animationRef.current = setTimeout(move, 1500); 
      }
    };
    move();
  };

  const updateRoverMarker = (pos) => {
    if (!map.current) return;
    if (!roverMarker.current) {
      const el = document.createElement('div');
      el.innerHTML = `<span style="font-size: 30px; filter: drop-shadow(0 0 5px white);">🚜</span>`;
      roverMarker.current = new mapboxgl.Marker(el).setLngLat(pos).addTo(map.current);
    } else {
      roverMarker.current.setLngLat(pos);
    }
    map.current.easeTo({ center: pos, duration: 1000 });
  };

  const connectWebSockets = (sessionId) => {
    const wsBase = VITE_API_URL.replace("https://", "wss://").replace("http://", "ws://");
    
    // TELEMETRY CONNECTION
    telemetryWS.current = new WebSocket(`${wsBase}/websocket/telemetry/${ROVER_ID}`);
    telemetryWS.current.onopen = () => setBackendStatus('online');
    telemetryWS.current.onerror = () => setBackendStatus('offline');
    telemetryWS.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === "telemetry.latest") {
            const tel = data.telemetry;
            setBattery(tel.battery);
            setLiveTelemetry({
                lat: tel.gps_lat,
                lng: tel.gps_lng,
                speed: 1.5 // Backend doesn't send speed, but we can assume movement
            });
            // Move marker to real GPS position
            updateRoverMarker([tel.gps_lng, tel.gps_lat]);
        }
    };

    // SCANS CONNECTION
    scansWS.current = new WebSocket(`${wsBase}/websocket/scans/${sessionId}`);
    scansWS.current.onmessage = (event) => {
       const data = JSON.parse(event.data);
       if (data.type === "scan.stored") {
          setRealImagesReceived(true);
          setScanDataBuffer(prev => [...prev.filter(s => !s.isSimulated), data.scan]);
          setScanCount(prev => prev + 1);
       }
    };
  };

  const handleRevealResults = () => {
    setShowResults(true);
    scanDataBuffer.forEach(scan => {
      const severityValue = normalizeSeverity(scan.severity);
      const markerColor = scan.isSimulated ? '#666' : (scan.disease_status === 'HEALTHY' ? '#4CAF50' : theme.severityColors[severityValue]);
      
      const popupContent = `
        <div style="color:black; font-family:sans-serif; width:240px; padding:12px; line-height:1.5;">
          <div style="display:flex; align-items:center; gap:8px; margin-bottom:10px; border-bottom:1px solid #eee; padding-bottom:8px;">
            <div style="width:10px; height:10px; border-radius:50%; background:${scan.isSimulated ? 'orange' : '#4CAF50'};"></div>
            <strong style="font-size:14px; letter-spacing:0.5px;">POINT DIAGNOSTICS</strong>
          </div>
          
          <div style="background:#f8f9fa; padding:10px; border-radius:8px; margin-bottom:10px; border:1px solid #eee;">
            <div style="font-size:11px; color:#888; text-transform:uppercase;">Connection Checkpoint</div>
            <div style="font-weight:bold; color:${scan.isSimulated ? '#e67e22' : '#27ae60'}; font-size:13px;">
              ${scan.isSimulated ? '⚠ OFFLINE / SIMULATED' : '✓ LIVE BACKEND STREAM'}
            </div>
          </div>

          <div style="font-size:12px; color:#444;">
            <div><strong>Status:</strong> ${scan.disease_status}</div>
            <div><strong>Severity:</strong> ${severityValue || 0}</div>
            <div><strong>Lat:</strong> ${scan.gps_lat.toFixed(5)}</div>
            <div><strong>Lng:</strong> ${scan.gps_lng.toFixed(5)}</div>
          </div>
        </div>
      `;

      new mapboxgl.Marker({ color: markerColor })
        .setLngLat([scan.gps_lng, scan.gps_lat])
        .setPopup(new mapboxgl.Popup({ offset: 25, maxWidth: '300px' }).setHTML(popupContent))
        .addTo(map.current);
    });
  };

  useEffect(() => {
    if (map.current) return; 
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
        id: 'route', 
        type: 'line', 
        source: 'route', 
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
  }, []); 

  useEffect(() => {
    document.body.setAttribute('data-drawing', isDrawing.toString());
    document.body.setAttribute('data-scanning', isScanning.toString());
  }, [isDrawing, isScanning]);

  const startFollowPath = async () => {
    if (drawPath.length < 2) return;
    setIsScanning(true);
    setIsDrawing(false);
    setScanCount(0);
    setScanDataBuffer([]);
    setRealImagesReceived(false);
    
    try {
      const response = await fetch(`${VITE_API_URL}/api/rover/start?farmer_id=${FARMER_ID}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem("token")}` },
        body: JSON.stringify({ path: drawPath })
      });
      const data = await response.json();
      if (response.ok) {
        setBackendStatus('online');
        setCurrentSessionId(data.session_id);
        connectWebSockets(data.session_id);
      } else {
        setBackendStatus('offline');
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
    <div style={{ height: '100vh', width: '100vw', display: 'flex', flexDirection: 'column', backgroundColor: '#F4F7F2', position: 'fixed', top: 0, left: 0, fontFamily: 'Inter, sans-serif' }}>
      <header style={{ height: '70px', backgroundColor: theme.darkBrown, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 30px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Radio size={28} color="#A5D6A7" />
          <span style={{ fontWeight: '900', letterSpacing: '2px' }}>FIELDSIGHT</span>
        </div>
        
        <div style={{ display: 'flex', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 15px', borderRadius: '12px', backgroundColor: backendStatus === 'online' ? '#2e7d32' : '#d32f2f', fontSize: '11px', fontWeight: 'bold' }}>
            {backendStatus === 'online' ? <Wifi size={14}/> : <WifiOff size={14}/>}
            {backendStatus === 'online' ? 'BACKEND CONNECTED' : 'OFFLINE / LOCAL MODE'}
          </div>
          <button onClick={onLogout} style={{ background: 'transparent', border: '1px solid white', color: 'white', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' }}>Logout</button>
        </div>
      </header>
      
      <main style={{ flex: 1, display: 'flex', padding: '20px', gap: '20px', overflow: 'hidden' }}>
        <div style={{ width: '320px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div style={{ backgroundColor: 'white', padding: '15px', borderRadius: '15px', border: '1px solid #ddd' }}>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '11px', color: '#888' }}>CONNECTION DIAGNOSTICS</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                <span>API Status:</span>
                <span style={{ color: backendStatus === 'online' ? 'green' : 'red', fontWeight: 'bold' }}>{backendStatus.toUpperCase()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                <span>Data Source:</span>
                <span style={{ color: realImagesReceived ? 'green' : 'orange', fontWeight: 'bold' }}>{realImagesReceived ? 'LIVE BACKEND' : 'SIMULATED'}</span>
              </div>
            </div>
          </div>

          {/* UPDATED SYSTEM STATUS SECTION */}
          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '15px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '11px', color: '#888', letterSpacing: '1px' }}>SYSTEM STATUS</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: theme.darkBrown }}>
                      <Battery size={24} color={battery ? (battery > 20 ? "#2e7d32" : "#d32f2f") : "#ccc"} /> 
                      <span style={{ fontSize: '24px', fontWeight: 'bold' }}>
                        {battery !== null ? `${battery}%` : 'NO CONN'}
                      </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#666', fontSize: '12px' }}>
                    <Navigation size={14} /> {liveTelemetry.speed !== null ? `${liveTelemetry.speed.toFixed(1)} m/s` : '-- m/s'}
                  </div>
                </div>
                {backendStatus !== 'online' && (
                    <div style={{ fontSize: '10px', color: '#d32f2f', fontWeight: 'bold', textAlign: 'center' }}>
                         ROVER TELEMETRY DISCONNECTED
                    </div>
                )}
            </div>
          </div>

          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '15px', border: isDrawing ? `2px solid ${theme.sageGreen}` : `1px solid #eee` }}>
            <h4 style={{ margin: '0 0 5px 0', fontSize: '13px', fontWeight: 'bold' }}>MISSION PLANNER</h4>
            <button 
              onClick={() => {
                setIsDrawing(!isDrawing);
                if (!isDrawing) setDrawPath([]);
              }}
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: 'none', backgroundColor: isDrawing ? theme.darkBrown : '#e2e8f0', color: isDrawing ? 'white' : '#475569', fontWeight: 'bold', cursor: 'pointer' }}>
              <PenTool size={18} style={{marginRight: '8px'}}/> {isDrawing ? 'FINISH DRAWING' : 'DRAW PATHWAY'}
            </button>
          </div>

          <div style={{ marginTop: 'auto' }}>
            {!isScanning ? (
              <button onClick={startFollowPath} disabled={drawPath.length < 2} style={{ width: '100%', padding: '18px', borderRadius: '12px', color: 'white', backgroundColor: drawPath.length < 2 ? '#ccc' : '#2e7d32', border: 'none', cursor: 'pointer' }}>
                <Play size={20} style={{marginRight: '8px'}} /> DEPLOY ROVER
              </button>
            ) : (
              <button onClick={stopScan} style={{ width: '100%', padding: '18px', borderRadius: '12px', color: 'white', backgroundColor: '#dc2626', border: 'none', cursor: 'pointer' }}>
                <Square size={20} style={{marginRight: '8px'}} /> STOP ROVER
              </button>
            )}
            {!isScanning && scanCount > 0 && !showResults && (
              <button onClick={handleRevealResults} style={{ width: '100%', marginTop: '10px', padding: '18px', borderRadius: '12px', color: 'white', backgroundColor: theme.darkBrown, border: 'none', cursor: 'pointer' }}>
                <Activity size={20} style={{marginRight: '8px'}} /> RUN {scanCount} DIAGNOSTICS
              </button>
            )}
          </div>
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div style={{ display: 'flex', gap: '10px' }}>
            <input 
              type="text" 
              placeholder="Search farm sectors..." 
              style={{ flex: 1, padding: '14px', borderRadius: '10px', border: '1px solid #ddd' }}
              value={searchInput} 
              onChange={(e) => setSearchInput(e.target.value)}
            />
            <button onClick={handleLocateFarm} style={{ padding: '0 25px', backgroundColor: theme.darkBrown, color: 'white', borderRadius: '10px', border: 'none', cursor: 'pointer' }}>SEARCH</button>
          </div>
          <div ref={mapContainer} style={{ flex: 1, borderRadius: '20px', overflow: 'hidden', position: 'relative', border: '6px solid white', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
             <div style={{ position: 'absolute', top: 20, right: 20, zIndex: 10, backgroundColor: 'white', padding: '8px 15px', borderRadius: '10px', fontSize: '12px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
                {realImagesReceived ? <Database size={16} color="green"/> : <AlertCircle size={16} color="orange"/>}
                {scanCount} {realImagesReceived ? 'LIVE DATA POINTS' : 'TEST POINTS'}
             </div>
          </div>
        </div>
      </main>
    </div>
  );
}