import React from 'react';
import Plot from 'react-plotly.js';

const InflationChart = ({ inflationData, selectedStates }) => {
  const colors = ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd'];
  
  const traces = selectedStates.map((state, index) => {
    const stateData = inflationData
      .filter(d => d.State === state)
      .map(d => ({
        year: d.Year,
        rate: parseFloat(d['Inflation Rate (%)'])
      }))
      .sort((a, b) => parseInt(a.year) - parseInt(b.year));
  
    return {
      x: stateData.map(d => d.year),
      y: stateData.map(d => d.rate),
      text: stateData.map(d => `${state}<br>Year: ${d.year}<br>Inflation Rate: ${d.rate.toFixed(2)}%`),
      name: state,
      type: 'scatter',
      mode: 'lines+markers',
      hoverinfo: 'text',
      line: { width: 2, color: colors[index % colors.length] },
      marker: { size: 8, color: colors[index % colors.length] }
    };
  });

  return (
    <Plot
      data={traces}
      layout={{
        title: { text: 'Inflation Rate by State (2014-2024)', font: { size: 18, color: '#333' } },
        xaxis: { title: 'Year', dtick: 1, range: ['2014', '2024'] },
        yaxis: { title: 'Inflation Rate (%)', zeroline: true, autorange: true },
        hovermode: 'closest',
        showlegend: true,
        margin: { t: 50, r: 150, b: 50, l: 70 }
      }}
      useResizeHandler
      style={{ width: '100%', height: '400px' }}
    />
  );
};

export default InflationChart;
