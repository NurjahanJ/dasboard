import React from 'react';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const USMap = ({ data, populationData }) => {
  const getColor = (hpiGrowth) => {
    return hpiGrowth > 100 ? '#800026' :
           hpiGrowth > 75  ? '#BD0026' :
           hpiGrowth > 50  ? '#E31A1C' :
           hpiGrowth > 25  ? '#FC4E2A' :
           hpiGrowth > 10  ? '#FD8D3C' :
           hpiGrowth > 5   ? '#FEB24C' :
           hpiGrowth > 0   ? '#FED976' :
                            '#FFEDA0';
  };

  const style = (feature) => {
    const stateName = feature.properties.name;
    const stateData = data.filter(d => d.State === stateName);
    
    if (stateData.length < 2) return { fillColor: '#ccc' };
    
    const firstHPI = parseFloat(stateData[0].HPI);
    const lastHPI = parseFloat(stateData[stateData.length - 1].HPI);
    const hpiGrowth = ((lastHPI - firstHPI) / firstHPI) * 100;

    return {
      fillColor: getColor(hpiGrowth),
      weight: 2,
      opacity: 1,
      color: 'white',
      dashArray: '3',
      fillOpacity: 0.7
    };
  };

  const onEachFeature = (feature, layer) => {
    const stateName = feature.properties.name;
    const stateData = data.filter(d => d.State === stateName);
    const population = populationData.find(d => d.State === stateName)?.Population || 'N/A';
    
    if (stateData.length >= 2) {
      const firstHPI = parseFloat(stateData[0].HPI);
      const lastHPI = parseFloat(stateData[stateData.length - 1].HPI);
      const hpiGrowth = ((lastHPI - firstHPI) / firstHPI) * 100;
      
      layer.bindPopup(`
        <strong>${stateName}</strong><br/>
        Population: ${population}<br/>
        HPI Growth: ${hpiGrowth.toFixed(2)}%
      `);
    }
  };

  return (
    <MapContainer
      center={[39.8283, -98.5795]}
      zoom={4}
      style={{ height: '500px', width: '100%' }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {/* GeoJSON data will be added here */}
    </MapContainer>
  );
};

export default USMap;
