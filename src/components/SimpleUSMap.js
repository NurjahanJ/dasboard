import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// State coordinates for markers
const stateCoordinates = {
  'California': [36.7783, -119.4179],
  'Texas': [31.9686, -99.9018],
  'Florida': [27.6648, -81.5158],
  'New York': [42.1657, -74.9481],
  'Pennsylvania': [41.2033, -77.1945],
  'Illinois': [40.6331, -89.3985],
  'Ohio': [40.4173, -82.9071],
  'Georgia': [32.1656, -82.9001],
  'North Carolina': [35.7596, -79.0193],
  'Michigan': [44.3148, -85.6024]
};

const SimpleUSMap = ({ selectedStates, populationData }) => {
  return (
    <div style={{ height: '500px', width: '100%' }}>
      <MapContainer
        center={[39.8283, -98.5795]}
        zoom={4}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap contributors'
        />
        {selectedStates.map(state => {
          const coordinates = stateCoordinates[state];
          const population = populationData.find(d => d.State === state)?.Population || 'N/A';
          
          if (coordinates) {
            return (
              <Marker key={state} position={coordinates}>
                <Popup>
                  <strong>{state}</strong><br />
                  Population: {population}
                </Popup>
              </Marker>
            );
          }
          return null;
        })}
      </MapContainer>
    </div>
  );
};

export default SimpleUSMap;
