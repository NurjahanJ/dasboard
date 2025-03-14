import React from 'react';
import Plot from 'react-plotly.js';

const HPIIncreaseBarChart = ({ hpiData, states, populationData }) => {
  // Calculate the HPI increase for each state between 2014 and 2024,
  // and retrieve the population for the state from the populationData.
  const increaseData = states.map(state => {
    const stateData = hpiData.filter(d => d.State === state);
    const record2014 = stateData.find(d => d.Year === '2014' || d.Year === 2014);
    const record2024 = stateData.find(d => d.Year === '2024' || d.Year === 2024);

    let increase = 0;
    if (record2014 && record2024) {
      increase = parseFloat(record2024.HPI) - parseFloat(record2014.HPI);
    }
    // Find the corresponding population record for the state.
    const popRecord = populationData.find(d => d.State === state);
    const population = popRecord ? popRecord.Population : 'N/A';
    return { state, increase, population };
  });

  // Sort states in descending order by HPI increase.
  increaseData.sort((a, b) => b.increase - a.increase);

  return (
    <Plot
      data={[
        {
          x: increaseData.map(d => d.state),
          y: increaseData.map(d => d.increase),
          // Pass the population values via customdata.
          customdata: increaseData.map(d => d.population),
          type: 'bar',
          // Configure hovertemplate to display state, HPI increase and population.
          hovertemplate:
            'State: %{x}<br>HPI Increase: %{y:.2f}<br>Population: %{customdata}<extra></extra>',
          marker: { color: 'rgba(55,128,191,0.7)' },
        }
      ]}
      layout={{
        title: 'House Price Increase by State (2014-2024)',
        xaxis: { title: 'State', automargin: true },
        yaxis: { title: 'HPI Increase' },
        margin: { t: 50, b: 100, l: 50, r: 50 },
      }}
      useResizeHandler
      style={{ width: '100%', height: '500px' }}
    />
  );
};

export default HPIIncreaseBarChart;
