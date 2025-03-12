import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const InteractiveUSMap = () => {
  const [hoveredState, setHoveredState] = useState('');
  const [statesData, setStatesData] = useState(null);

  // URL for U.S. States GeoJSON data
  const geoJsonUrl = "https://raw.githubusercontent.com/PublicaMundi/MappingAPI/master/data/geojson/us-states.json";

  // Fetch GeoJSON data when the component mounts
  useEffect(() => {
    fetch(geoJsonUrl)
      .then(response => response.json())
      .then(data => setStatesData(data))
      .catch(err => console.error("Error fetching GeoJSON:", err));
  }, []);

  // Define behavior for each GeoJSON feature (state)
  const onEachFeature = (feature, layer) => {
    layer.on({
      mouseover: (e) => {
        const layer = e.target;
        layer.setStyle({
          weight: 2,
          color: '#666',
          fillOpacity: 0.7
        });
        setHoveredState(feature.properties.name);
      },
      mouseout: (e) => {
        const layer = e.target;
        layer.setStyle({
          weight: 1,
          color: '#fff',
          fillOpacity: 0.7
        });
        setHoveredState('');
      },
      click: (e) => {
        // Optionally, handle click events here.
      }
    });
  };

  return (
    <div style={{ position: 'relative' }}>
      <MapContainer center={[37.8, -96]} zoom={4} style={{ height: '600px', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {statesData && (
          <GeoJSON 
            data={statesData} 
            onEachFeature={onEachFeature}
            style={{
              fillColor: '#ECEFF1',
              weight: 1,
              color: '#fff',
              fillOpacity: 0.7,
            }} 
          />
        )}
      </MapContainer>
      {hoveredState && (
        <div style={{
          position: 'absolute',
          top: 10,
          right: 10,
          backgroundColor: 'white',
          padding: '5px 10px',
          border: '1px solid #ccc',
          borderRadius: '4px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          {hoveredState}
        </div>
      )}
    </div>
  );
};

export default InteractiveUSMap;
