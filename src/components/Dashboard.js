import React, { useState, useEffect } from 'react';
import { Box, Container, Grid, Typography, Select, MenuItem, Slider, CircularProgress, Alert } from '@mui/material';
import Papa from 'papaparse';
import Plot from 'react-plotly.js';
import USMap from './USMap';

const Dashboard = () => {
  const [hpiData, setHpiData] = useState([]);
  const [inflationData, setInflationData] = useState([]);
  const [populationData, setPopulationData] = useState([]);
  const [selectedStates, setSelectedStates] = useState(['California']);
  const [yearRange, setYearRange] = useState([2014, 2024]);
  const [states, setStates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const loadCSV = async (file) => {
          const response = await fetch(file);
          if (!response.ok) {
            throw new Error(`Failed to load ${file}`);
          }
          const reader = response.body.getReader();
          const result = await reader.read();
          const decoder = new TextDecoder('utf-8');
          const csv = decoder.decode(result.value);
          return new Promise((resolve) => {
            Papa.parse(csv, {
              header: true,
              complete: (results) => resolve(results.data.filter(row => Object.values(row).some(val => val)))
            });
          });
        };

        const [hpi, inflation, population] = await Promise.all([
          loadCSV('/state_hpi.csv'),
          loadCSV('/state_inflation_rates.csv'),
          loadCSV('/State_poplution.csv')
        ]);

        setHpiData(hpi);
        setInflationData(inflation);
        setPopulationData(population);
        setStates([...new Set(hpi.map(d => d.State))]);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const calculateYearlyChange = (data, metric) => {
    const yearlyChange = {};
    states.forEach(state => {
      const stateData = data.filter(d => d.State === state);
      stateData.sort((a, b) => parseInt(a.Year) - parseInt(b.Year));
      yearlyChange[state] = stateData.map((d, i) => {
        if (i === 0) return 0;
        const currentValue = parseFloat(d[metric]);
        const previousValue = parseFloat(stateData[i - 1][metric]);
        return ((currentValue - previousValue) / previousValue) * 100;
      });
    });
    return yearlyChange;
  };

  const calculateCorrelation = (state) => {
    const stateHPI = hpiData.filter(d => d.State === state).map(d => parseFloat(d.HPI));
    const stateInflation = inflationData.filter(d => d.State === state).map(d => parseFloat(d['Inflation Rate (%)']));
    
    const n = stateHPI.length;
    const sumX = stateInflation.reduce((a, b) => a + b, 0);
    const sumY = stateHPI.reduce((a, b) => a + b, 0);
    const sumXY = stateInflation.reduce((sum, x, i) => sum + x * stateHPI[i], 0);
    const sumX2 = stateInflation.reduce((sum, x) => sum + x * x, 0);
    const sumY2 = stateHPI.reduce((sum, y) => sum + y * y, 0);

    const correlation = (n * sumXY - sumX * sumY) / 
      Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
    
    return correlation;
  };

  const renderHPITrendChart = () => {
    const traces = selectedStates.map(state => ({
      x: hpiData.filter(d => d.State === state).map(d => d.Year),
      y: hpiData.filter(d => d.State === state).map(d => d.HPI),
      name: state,
      type: 'scatter',
      mode: 'lines+markers'
    }));

    return (
      <Plot
        data={traces}
        layout={{
          title: 'HPI Trends Over Time',
          xaxis: { title: 'Year', range: yearRange },
          yaxis: { title: 'House Price Index (HPI)' },
          hovermode: 'closest'
        }}
        useResizeHandler
        className="chart-container"
        style={{ width: '100%', height: '400px' }}
      />
    );
  };

  const renderInflationChart = () => {
    const traces = selectedStates.map(state => ({
      x: inflationData.filter(d => d.State === state).map(d => d.Year),
      y: inflationData.filter(d => d.State === state).map(d => d['Inflation Rate (%)']),
      name: state,
      type: 'scatter',
      mode: 'lines+markers'
    }));

    return (
      <Plot
        data={traces}
        layout={{
          title: 'Inflation Rate Trends',
          xaxis: { title: 'Year', range: yearRange },
          yaxis: { title: 'Inflation Rate (%)' },
          hovermode: 'closest'
        }}
        useResizeHandler
        className="chart-container"
        style={{ width: '100%', height: '400px' }}
      />
    );
  };

  const renderScatterPlot = () => {
    const filteredData = selectedStates.flatMap(state => {
      const stateHPI = hpiData.filter(d => d.State === state && 
        parseInt(d.Year) >= yearRange[0] && parseInt(d.Year) <= yearRange[1]);
      const stateInflation = inflationData.filter(d => d.State === state &&
        parseInt(d.Year) >= yearRange[0] && parseInt(d.Year) <= yearRange[1]);
      
      return stateHPI.map((d, i) => ({
        x: parseFloat(stateInflation[i]['Inflation Rate (%)']),
        y: parseFloat(d.HPI),
        state: state,
        year: d.Year
      }));
    });

    const traces = selectedStates.map(state => ({
      x: filteredData.filter(d => d.state === state).map(d => d.x),
      y: filteredData.filter(d => d.state === state).map(d => d.y),
      text: filteredData.filter(d => d.state === state).map(d => d.year),
      name: state,
      type: 'scatter',
      mode: 'markers',
      marker: { size: 10 }
    }));

    return (
      <Plot
        data={traces}
        layout={{
          title: 'Inflation vs HPI Correlation',
          xaxis: { title: 'Inflation Rate (%)' },
          yaxis: { title: 'House Price Index (HPI)' },
          hovermode: 'closest',
          showlegend: true
        }}
        useResizeHandler
        className="chart-container"
        style={{ width: '100%', height: '400px' }}
      />
    );
  };

  const renderCorrelationHeatmap = () => {
    const correlations = states.map(state => calculateCorrelation(state));
    
    return (
      <Plot
        data={[{
          z: [correlations],
          x: states,
          type: 'heatmap',
          colorscale: 'RdBu',
          zmin: -1,
          zmax: 1
        }]}
        layout={{
          title: 'Correlation Between Inflation and HPI by State',
          xaxis: { title: 'State' },
          yaxis: { title: 'Correlation', showticklabels: false },
          height: 200
        }}
        useResizeHandler
        className="chart-container"
        style={{ width: '100%', height: '250px' }}
      />
    );
  };

  const renderYearlyChangeChart = () => {
    const hpiChanges = calculateYearlyChange(hpiData, 'HPI');
    const inflationChanges = calculateYearlyChange(inflationData, 'Inflation Rate (%)');
    
    const traces = selectedStates.flatMap(state => [
      {
        x: hpiData
          .filter(d => d.State === state && 
            parseInt(d.Year) >= yearRange[0] && parseInt(d.Year) <= yearRange[1])
          .map(d => d.Year)
          .slice(1),
        y: hpiChanges[state]
          .filter((_, i) => {
            const year = parseInt(hpiData.find(d => d.State === state).Year) + i;
            return year >= yearRange[0] && year <= yearRange[1];
          })
          .slice(1),
        name: `${state} HPI Change`,
        type: 'bar'
      },
      {
        x: inflationData
          .filter(d => d.State === state &&
            parseInt(d.Year) >= yearRange[0] && parseInt(d.Year) <= yearRange[1])
          .map(d => d.Year)
          .slice(1),
        y: inflationChanges[state]
          .filter((_, i) => {
            const year = parseInt(inflationData.find(d => d.State === state).Year) + i;
            return year >= yearRange[0] && year <= yearRange[1];
          })
          .slice(1),
        name: `${state} Inflation Change`,
        type: 'bar'
      }
    ]);

    return (
      <Plot
        data={traces}
        layout={{
          title: 'Yearly % Change in HPI vs Inflation',
          xaxis: { title: 'Year' },
          yaxis: { title: '% Change' },
          barmode: 'group',
          showlegend: true
        }}
        useResizeHandler
        className="chart-container"
        style={{ width: '100%', height: '400px' }}
      />
    );
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box m={3}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Container maxWidth="xl">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Housing Price Index & Inflation Dashboard
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Select
              multiple
              value={selectedStates}
              onChange={(e) => setSelectedStates(e.target.value)}
              sx={{ width: '100%', mb: 2 }}
            >
              {states.map((state) => (
                <MenuItem key={state} value={state}>
                  {state}
                </MenuItem>
              ))}
            </Select>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography gutterBottom>Year Range</Typography>
            <Slider
              value={yearRange}
              onChange={(e, newValue) => setYearRange(newValue)}
              min={2014}
              max={2024}
              valueLabelDisplay="auto"
              sx={{ width: '100%' }}
            />
          </Grid>
          
          <Grid item xs={12}>
            <Box className="chart-container">
              <USMap data={hpiData} populationData={populationData} />
            </Box>
          </Grid>
          
          <Grid item xs={12} md={6}>
            {renderHPITrendChart()}
          </Grid>
          <Grid item xs={12} md={6}>
            {renderInflationChart()}
          </Grid>
          <Grid item xs={12}>
            {renderScatterPlot()}
          </Grid>
          <Grid item xs={12}>
            {renderCorrelationHeatmap()}
          </Grid>
          <Grid item xs={12}>
            {renderYearlyChangeChart()}
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default Dashboard;
