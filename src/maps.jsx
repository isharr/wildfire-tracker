//AIzaSyBjJskhvdjF6bT7Zat3G-MfIj54W4Xz3Ew
import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import Papa from 'papaparse'; 
import { kml } from 'togeojson';


const fireIcon = new L.Icon({
  iconUrl: 'https://maps.google.com/mapfiles/kml/shapes/firedept.png',
  iconSize: [40, 40]
});

const Maps = () => {
  const [fireEvents, setFireEvents] = useState([]);
  const [loading, setLoading] = useState(true); 

  useEffect(() => {
    async function fetchWildfires() {
      try {
        const res = await fetch('https://eonet.gsfc.nasa.gov/api/v2.1/events');
        const data = await res.json();

        const wildfires = data.events.filter(
          (event) => event.categories.some(c => c.title === 'Wildfires')
        );

        const fireMarkers = wildfires.map(event => {
          const last = event.geometries[event.geometries.length - 1];
          return {
            title: event.title,
            lat: last.coordinates[1],
            lng: last.coordinates[0],
            date: last.date
          };
        });

        setFireEvents(fireMarkers);
        setLoading(false); 
      } catch (err) {
        console.error('Failed to fetch wildfire data:', err);
        setLoading(false); 
      }
    }

    fetchWildfires();
  }, []);

  const handleCSVUpload = (file) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        console.log('Raw PapaParse results:', results);
        const parsedData = results.data
          .filter(row => row.lat && row.lng)
          .map(row => ({
            title: row.title || 'Unnamed Fire',
            lat: parseFloat(row.lat),
            lng: parseFloat(row.lng),
            date: row.date || new Date().toISOString()
          }));
  
        console.log('Parsed CSV data:', parsedData);
  
        setFireEvents(parsedData);
        setLoading(false);
      },
      error: (err) => {
        console.error('CSV parsing error:', err);
      }
    });
  };

  const handleGeoJSONUpload = (file) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const geojson = JSON.parse(event.target.result);
  
        const parsedData = geojson.features
          .filter(f => f.geometry && f.geometry.type === 'Point')
          .map(f => ({
            title: f.properties?.title || 'Unnamed Fire',
            lat: f.geometry.coordinates[1],
            lng: f.geometry.coordinates[0],
            date: f.properties?.date || new Date().toISOString()
          }));
  
        setFireEvents(parsedData);
        setLoading(false);
      } catch (err) {
        console.error('GeoJSON parsing error:', err);
      }
    };
  
    reader.readAsText(file);
  };

  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const name = file.name.toLowerCase();

    if (name.endsWith('.csv')) {
      handleCSVUpload(file);
    } else if (name.endsWith('.geojson') || name.endsWith('.json')) {
      handleGeoJSONUpload(file);
    } else if (name.endsWith('.kml')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const parser = new DOMParser();
        const xml = parser.parseFromString(event.target.result, 'text/xml');
        const geojson = kml(xml);

        const parsedData = geojson.features
          .filter(f => f.geometry && f.geometry.type === 'Point')
          .map(f => ({
            title: f.properties?.name || 'Unnamed Fire',
            lat: f.geometry.coordinates[1],
            lng: f.geometry.coordinates[0],
            date: f.properties?.date || new Date().toISOString()
          }));

        setFireEvents(parsedData);
        setLoading(false);
      };
      reader.readAsText(file);
    } else {
      alert('Unsupported file type');
    }

    e.target.value = '';
  };

  if (loading) {
    return <div className="loader">Loading wildfires...</div>;
  }

  return (
    <div>
      {/* FLEX TOP BAR */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        padding: '12px 20px',
        backgroundColor: '#fef3c7',
        borderBottom: '1px solid #facc15'
      }}>
        {/* LEFT: Upload Button */}
        <label className='custom-upload' style={{ fontWeight: 600, cursor: 'pointer' }}>
          📄 Upload .CSV, .GEOJSON, .KML
          <input
            id="file-upload"
            type="file"
            onChange={handleUpload}
            accept=".csv,.geojson,.kml"
            style={{ display: 'none' }}
          />
        </label>

        {/* RIGHT: Alert Text */}
        <div style={{
          color: '#92400e',
          fontSize: '15px',
          fontWeight: 500,
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginTop: '4px',
          marginLeft: '1px',
        }}>
          🔥 Displaying <strong>NASA EONET wildfire data</strong>. Drop your own <strong>CSV, GeoJSON, or KML</strong> to visualize custom wildfire events.
        </div>
      </div>

      {/* MAP */}
      <MapContainer center={[48.4284, -123.3656]} zoom={2} style={{ height: '100vh', width: '100vw' }} worldCopyJump={true} maxBounds={[[90, -180], [-90, 180]]}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {fireEvents.map((event, i) => (
          <Marker key={i} position={[event.lat, event.lng]} icon={fireIcon}>
            <Popup>
              <h3>{event.title}</h3>
              <p>{new Date(event.date).toLocaleString()}</p>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default Maps;
