import { useState } from 'react';

export default function AlertBanner() {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <div style={{
      backgroundColor: '#fef3c7',
      color: '#92400e',
      padding: '12px 24px',
      borderBottom: '1px solid #facc15',
      fontSize: '15px',
      fontWeight: '500',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      gap: '12px',
    }}>
      <span>🔥 Displaying <strong>NASA EONET wildfire data</strong>. Drop your own <strong>CSV, GeoJSON, or KML</strong> to visualize custom events.</span>
      <button onClick={() => setVisible(false)} style={{
        marginLeft: 'auto',
        background: 'transparent',
        border: 'none',
        fontSize: '20px',
        color: '#92400e',
        cursor: 'pointer'
      }}>&times;</button>
    </div>
  );
}
