import React from 'react';
import Plot from 'react-plotly.js';

const HPIIncreaseBarChart = ({ hpiData, states, populationData }) => {
  // Helper functions to clean state names and parse population values
  const cleanState = (name) => name.replace(/[^a-zA-Z ]/g, '').trim();
  const parsePopulation = (pop) => parseInt(pop.replace(/,/g, ''), 10);

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

    // Clean and match the state name
    const popRecord = populationData.find(d => cleanState(d.State) === state);
    const rawPopulation = popRecord ? parsePopulation(popRecord.Population) : null;
    const formattedPopulation = rawPopulation ? rawPopulation.toLocaleString() : 'N/A';

    return { state, increase, population: formattedPopulation };
  });

  // Sort states in descending order by HPI increase.
  increaseData.sort((a, b) => b.increase - a.increase);

  return (
    <Plot
      data={[
        {
          x: increaseData.map(d => d.state),
          y: increaseData.map(d => d.increase),
          customdata: increaseData.map(d => d.population),
          type: 'bar',
          hovertemplate:
            'State: %{x}<br>HPI Increase: %{y:.2f}<br>Population: %{customdata}<extra></extra>',
          marker: { color: 'rgba(55,128,191,0.7)' },
        }
      ]}
      layout={{
        title: 'House Price Increase by State (2014–2024)',
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
