import React from 'react';
import Plot from 'react-plotly.js';

const ScatterPlot = ({ hpiData, inflationData, selectedStates }) => {
  const traces = selectedStates.map(state => {
    const stateData = hpiData
      .filter(d => d.State === state)
      .map(hpiPoint => {
        const inflationPoint = inflationData.find(
          d => d.State === state && d.Year === hpiPoint.Year
        );
        return {
          year: hpiPoint.Year,
          hpi: parseFloat(hpiPoint.HPI),
          inflation: inflationPoint ? parseFloat(inflationPoint['Inflation Rate (%)']) : null
        };
      })
      .filter(point => point.inflation !== null);
    
    return {
      x: stateData.map(d => d.inflation),
      y: stateData.map(d => d.hpi),
      text: stateData.map(d => `${state}<br>Year: ${d.year}<br>HPI: ${d.hpi.toFixed(1)}<br>Inflation: ${d.inflation.toFixed(1)}%`),
      name: state,
      type: 'scatter',
      mode: 'markers',
      hoverinfo: 'text',
      marker: { size: 10, opacity: 0.7 }
    };
  });
  
  return (
    <Plot
      data={traces}
      layout={{
        title: { text: 'Housing Prices vs Inflation Rate by State (2014-2024)', font: { size: 18, color: '#333' } },
        xaxis: { title: 'Inflation Rate (%)', zeroline: true },
        yaxis: { title: 'Housing Price Index (HPI)', zeroline: true },
        hovermode: 'closest',
        showlegend: true,
        margin: { t: 50 }
      }}
      useResizeHandler
      style={{ width: '100%', height: '400px' }}
    />
  );
};

export default ScatterPlot;
