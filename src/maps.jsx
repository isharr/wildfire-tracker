import { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import Papa from 'papaparse';
import { kml } from 'togeojson';

// Filter events by number of days
function filterByDays(events, days) {
  if (days === 0) return events;
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  return events.filter(e => new Date(e.date) >= cutoff);
}

const Maps = () => {
  const [allEvents,   setAllEvents]   = useState([]);
  const [fireEvents,  setFireEvents]  = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [selected,    setSelected]    = useState(null);
  const [filterDays,  setFilterDays]  = useState(0);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [countdown,   setCountdown]   = useState(300);
  const [dataSource,  setDataSource]  = useState('nasa');

  async function fetchWildfires() {
    try {
      const res  = await fetch('https://eonet.gsfc.nasa.gov/api/v2.1/events?limit=200');
      const data = await res.json();
      const wildfires = data.events.filter(e =>
        e.categories.some(c => c.title === 'Wildfires')
      );
      const markers = wildfires.map(event => {
        const last = event.geometries[event.geometries.length - 1];
        return {
          title: event.title,
          lat:   last.coordinates[1],
          lng:   last.coordinates[0],
          date:  last.date,
          id:    event.id,
        };
      });
      setAllEvents(markers);
      setFireEvents(markers);
      setLastUpdated(new Date());
      setDataSource('nasa');
    } catch (err) {
      console.error('Failed to fetch wildfire data:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchWildfires(); }, []);

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) { fetchWildfires(); return 300; }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setFireEvents(filterByDays(allEvents, filterDays));
  }, [filterDays, allEvents]);

  const handleCSVUpload = (file) => {
    Papa.parse(file, {
      header: true, skipEmptyLines: true,
      complete: (results) => {
        const parsed = results.data
          .filter(r => r.lat && r.lng)
          .map(r => ({
            title: r.title || 'Unnamed Fire',
            lat:   parseFloat(r.lat),
            lng:   parseFloat(r.lng),
            date:  r.date || new Date().toISOString(),
            id:    Math.random().toString(),
          }));
        setAllEvents(parsed);
        setFireEvents(parsed);
        setDataSource('custom');
        setLoading(false);
      }
    });
  };

  const handleGeoJSONUpload = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const geojson = JSON.parse(e.target.result);
      const parsed = geojson.features
        .filter(f => f.geometry?.type === 'Point')
        .map(f => ({
          title: f.properties?.title || 'Unnamed Fire',
          lat:   f.geometry.coordinates[1],
          lng:   f.geometry.coordinates[0],
          date:  f.properties?.date || new Date().toISOString(),
          id:    Math.random().toString(),
        }));
      setAllEvents(parsed);
      setFireEvents(parsed);
      setDataSource('custom');
    };
    reader.readAsText(file);
  };

  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const name = file.name.toLowerCase();
    if (name.endsWith('.csv')) handleCSVUpload(file);
    else if (name.endsWith('.geojson') || name.endsWith('.json')) handleGeoJSONUpload(file);
    else if (name.endsWith('.kml')) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const xml     = new DOMParser().parseFromString(ev.target.result, 'text/xml');
        const geojson = kml(xml);
        const parsed  = geojson.features
          .filter(f => f.geometry?.type === 'Point')
          .map(f => ({
            title: f.properties?.name || 'Unnamed Fire',
            lat:   f.geometry.coordinates[1],
            lng:   f.geometry.coordinates[0],
            date:  f.properties?.date || new Date().toISOString(),
            id:    Math.random().toString(),
          }));
        setAllEvents(parsed);
        setFireEvents(parsed);
        setDataSource('custom');
      };
      reader.readAsText(file);
    }
    e.target.value = '';
  };

  const recentCount = filterByDays(allEvents, 7).length;
  const sorted      = [...fireEvents].sort((a, b) => new Date(b.date) - new Date(a.date));
  const mostRecent  = sorted[0];
  const mins = Math.floor(countdown / 60);
  const secs = String(countdown % 60).padStart(2, '0');

  if (loading) {
    return (
      <div className="wf-loading">
        <div className="wf-spinner" />
        <p>Loading wildfire data from NASA EONET…</p>
      </div>
    );
  }

  return (
    <div className="wf-root">

      {/* Sidebar */}
      <div className="wf-sidebar">
        <div className="wf-logo">
          <span>🔥</span>
          <div>
            <div className="wf-logo-title">WildFire</div>
            <div className="wf-logo-sub">Live Tracker</div>
          </div>
        </div>

        <div className="wf-stats">
          <div className="wf-stat">
            <div className="wf-stat-value red">{fireEvents.length}</div>
            <div className="wf-stat-label">Active Fires</div>
          </div>
          <div className="wf-stat">
            <div className="wf-stat-value orange">{recentCount}</div>
            <div className="wf-stat-label">Last 7 Days</div>
          </div>
        </div>

        {mostRecent && (
          <div className="wf-section">
            <div className="wf-section-label">Most Recent</div>
            <div className="wf-recent-card" onClick={() => setSelected(mostRecent)}>
              <div className="wf-recent-title">{mostRecent.title}</div>
              <div className="wf-recent-date">{new Date(mostRecent.date).toLocaleDateString()}</div>
            </div>
          </div>
        )}

        <div className="wf-section">
          <div className="wf-section-label">Filter by Date</div>
          {[{label:'All time',val:0},{label:'Last 7 days',val:7},{label:'Last 30 days',val:30},{label:'Last 90 days',val:90}].map(f => (
            <button key={f.val} className={`wf-btn ${filterDays===f.val?'active':''}`} onClick={() => setFilterDays(f.val)}>
              {f.label}
            </button>
          ))}
        </div>

        <div className="wf-section">
          <div className="wf-section-label">Custom Data</div>
          <label className="wf-upload-btn">
            Upload CSV / GeoJSON / KML
            <input type="file" accept=".csv,.geojson,.json,.kml" onChange={handleUpload} style={{display:'none'}} />
          </label>
          {dataSource === 'custom' && (
            <button className="wf-btn" style={{marginTop:'0.5rem'}} onClick={() => { fetchWildfires(); setFilterDays(0); }}>
              ↩ Back to NASA data
            </button>
          )}
        </div>

        <div className="wf-footer">
          <div className="wf-source">{dataSource==='nasa'?'📡 NASA EONET':'📄 Custom Upload'}</div>
          {dataSource==='nasa' && <div className="wf-refresh">Auto-refresh in {mins}:{secs}</div>}
          {lastUpdated && <div className="wf-updated">Updated {lastUpdated.toLocaleTimeString()}</div>}
        </div>
      </div>

      {/* Map */}
      <div className="wf-map-wrap">
        <MapContainer center={[20,0]} zoom={2} style={{height:'100%',width:'100%'}}>
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          />
          {fireEvents.map((event, i) => (
            <CircleMarker
              key={event.id||i}
              center={[event.lat, event.lng]}
              radius={8}
              pathOptions={{ color:'#ff4444', fillColor:'#ff2200', fillOpacity:0.75, weight:1.5 }}
              eventHandlers={{ click: () => setSelected(event) }}
            >
              <Popup>
                <div style={{fontFamily:'monospace',minWidth:180}}>
                  <strong style={{color:'#ff4444'}}>{event.title}</strong><br/>
                  <span style={{color:'#888',fontSize:12}}>{new Date(event.date).toLocaleString()}</span><br/>
                  <span style={{fontSize:11}}>{event.lat.toFixed(4)}°, {event.lng.toFixed(4)}°</span>
                </div>
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>

        <div className="wf-badge">🔥 {fireEvents.length} active fires</div>
      </div>

      {/* Details panel */}
      {selected && (
        <div className="wf-details">
          <button className="wf-details-close" onClick={() => setSelected(null)}>×</button>
          <div className="wf-details-title">{selected.title}</div>
          <div className="wf-details-row"><span className="wf-details-label">Date</span><span>{new Date(selected.date).toLocaleString()}</span></div>
          <div className="wf-details-row"><span className="wf-details-label">Latitude</span><span>{selected.lat.toFixed(5)}°</span></div>
          <div className="wf-details-row"><span className="wf-details-label">Longitude</span><span>{selected.lng.toFixed(5)}°</span></div>
          <div className="wf-details-row"><span className="wf-details-label">Source</span><span>{dataSource==='nasa'?'NASA EONET':'Custom Upload'}</span></div>
          <a className="wf-details-link" href={`https://www.google.com/maps?q=${selected.lat},${selected.lng}`} target="_blank" rel="noreferrer">
            View on Google Maps →
          </a>
        </div>
      )}
    </div>
  );
};

export default Maps;