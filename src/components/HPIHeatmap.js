import React from 'react';
import Plot from 'react-plotly.js';

const HPIHeatmap = ({ hpiData, states }) => {
  const years = [...new Set(hpiData.map(d => d.Year))].sort();
  
  const hpiMatrix = years.map(year => {
    return states.map(state => {
      const dataPoint = hpiData.find(d => d.State === state && d.Year === year);
      return dataPoint ? parseFloat(dataPoint.HPI) : null;
    });
  });
  
  return (
    <Plot
      data={[{
        z: hpiMatrix,
        x: states,
        y: years,
        type: 'heatmap',
        colorscale: 'RdBu',
        colorbar: { title: 'HPI Value', titleside: 'right' }
      }]}
      layout={{
        title: { text: 'Housing Price Index (HPI) by State and Year', font: { size: 18, color: '#333' } },
        xaxis: { title: 'State', tickangle: 45 },
        yaxis: { title: 'Year', autorange: 'reversed' },
        height: 500,
        margin: { t: 50, b: 100 }
      }}
      useResizeHandler
      style={{ width: '100%' }}
    />
  );
};

export default HPIHeatmap;
