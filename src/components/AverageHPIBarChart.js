import React from 'react';
import Plot from 'react-plotly.js';

const AverageHPIBarChart = ({ hpiData, states }) => {
  // Calculate average HPI for each state
  const averageData = states.map(state => {
    const stateData = hpiData.filter(d => d.State === state);
    const sumHPI = stateData.reduce((sum, d) => sum + parseFloat(d.HPI), 0);
    const avgHPI = stateData.length > 0 ? sumHPI / stateData.length : 0;
    return { state, avgHPI };
  });

  // Sort states descending by average HPI
  averageData.sort((a, b) => b.avgHPI - a.avgHPI);

  return (
    <Plot
      data={[
        {
          x: averageData.map(d => d.state),
          y: averageData.map(d => d.avgHPI),
          type: 'bar',
          text: averageData.map(d => `${d.avgHPI.toFixed(2)}`),
          hoverinfo: 'text',
          marker: { color: 'rgba(55,128,191,0.7)' },
        }
      ]}
      layout={{
        title: 'Average Housing Price Index (HPI) by State',
        xaxis: { title: 'State', automargin: true },
        yaxis: { title: 'Average HPI' },
        margin: { t: 50, b: 100, l: 50, r: 50 },
      }}
      useResizeHandler
      style={{ width: '100%', height: '500px' }}  // Updated height to match heat map
    />
  );
};

export default AverageHPIBarChart;