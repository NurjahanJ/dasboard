import React from 'react';
import Plot from 'react-plotly.js';

const HPIHeatmap = ({ hpiData, states }) => {
  // Get unique years from the dataset and sort them numerically.
  const years = [...new Set(hpiData.map(d => d.Year))].sort((a, b) => parseInt(a) - parseInt(b));
  
  // Create a matrix (rows: years, columns: states) containing HPI values.
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
        reversescale: true,
        colorbar: {
          title: 'HPI Value',
          titleside: 'right',
          tickfont: { size: 10 },
          titlefont: { size: 12 }
        },
        hovertemplate: 'State: %{x}<br>Year: %{y}<br>HPI: %{z:.2f}<extra></extra>',
      }]}
      layout={{
        title: { text: 'Housing Price Index (HPI) by State and Year', font: { size: 18, color: '#333' } },
        xaxis: { 
          title: 'State', 
          tickangle: -45,
          automargin: true,
          type: 'category'
        },
        yaxis: { 
          title: 'Year', 
          autorange: 'reversed',
          type: 'category'
        },
        height: 500,
        margin: { t: 60, b: 120, l: 60, r: 60 },
        hovermode: 'closest',
        paper_bgcolor: 'white',
        plot_bgcolor: 'white'
      }}
      useResizeHandler
      style={{ width: '100%' }}
    />
  );
};

export default HPIHeatmap;
