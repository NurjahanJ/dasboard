import React, { useState, useEffect } from 'react';
import { Box, Container, Grid, Typography, Select, MenuItem, Button, CircularProgress, Alert } from '@mui/material';
import Papa from 'papaparse';
import Plot from 'react-plotly.js';

const Dashboard = () => {
  const [hpiData, setHpiData] = useState([]);
  const [inflationData, setInflationData] = useState([]);
  const [selectedStates, setSelectedStates] = useState(['California']);
  const [states, setStates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const handleSelectAll = () => {
    setSelectedStates([...states]);
  };

  const handleClearSelection = () => {
    setSelectedStates([]);
  };

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

        const [hpi, inflation] = await Promise.all([
          loadCSV('/state_hpi.csv'),
          loadCSV('/state_inflation_rates.csv')
        ]);

        setHpiData(hpi);
        setInflationData(inflation);
        setStates([...new Set(hpi.map(d => d.State))]);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    loadData();
  }, []);







  const renderInflationChart = () => {
    const colors = ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd'];
  
    const traces = selectedStates.map((state, index) => {
      const stateData = inflationData
        .filter(d => d.State === state)
        .map(d => ({
          year: d.Year,
          rate: parseFloat(d['Inflation Rate (%)']) // Use actual inflation rate
        }))
        .sort((a, b) => parseInt(a.year) - parseInt(b.year));
  
      return {
        x: stateData.map(d => d.year),
        y: stateData.map(d => d.rate),
        text: stateData.map(d => 
          `${state}<br>Year: ${d.year}<br>Inflation Rate: ${d.rate.toFixed(2)}%`
        ),
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
  

  const renderScatterPlot = () => {
    const traces = selectedStates.map(state => {
      // Combine HPI and inflation data for each state and year
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
        .filter(point => point.inflation !== null); // Remove points with missing data

      return {
        x: stateData.map(d => d.inflation),
        y: stateData.map(d => d.hpi),
        text: stateData.map(d => `${state}<br>Year: ${d.year}<br>HPI: ${d.hpi.toFixed(1)}<br>Inflation: ${d.inflation.toFixed(1)}%`),
        name: state,
        type: 'scatter',
        mode: 'markers',
        hoverinfo: 'text',
        marker: {
          size: 10,
          opacity: 0.7
        }
      };
    });

    return (
      <Plot
        data={traces}
        layout={{
          title: {
            text: 'Housing Prices vs Inflation Rate by State (2014-2024)',
            font: { size: 18, color: '#333' }
          },
          xaxis: { 
            title: 'Inflation Rate (%)',
            zeroline: true
          },
          yaxis: { 
            title: 'Housing Price Index (HPI)',
            zeroline: true
          },
          hovermode: 'closest',
          showlegend: true,
          margin: { t: 50 }
        }}
        useResizeHandler
        style={{ width: '100%', height: '400px' }}
      />
    );
  };

  const renderHPIHeatmap = () => {
    // Get unique years and sort them
    const years = [...new Set(hpiData.map(d => d.Year))].sort();
    
    // Create a matrix of HPI values [years x states]
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
          colorbar: {
            title: 'HPI Value',
            titleside: 'right'
          }
        }]}
        layout={{
          title: {
            text: 'Housing Price Index (HPI) by State and Year',
            font: { size: 18, color: '#333' }
          },
          xaxis: { 
            title: 'State',
            tickangle: 45
          },
          yaxis: { 
            title: 'Year',
            autorange: 'reversed' // Show earliest years at the top
          },
          height: 500,
          margin: { t: 50, b: 100 } // Increased bottom margin for rotated state labels
        }}
        useResizeHandler
        style={{ width: '100%' }}
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
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Housing Price Index & Inflation Dashboard
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 3 }}>
              <Select
                multiple
                value={selectedStates}
                onChange={(e) => setSelectedStates(e.target.value)}
                sx={{ minWidth: 200, flex: 1 }}
                displayEmpty
              >
                {states.map((state) => (
                  <MenuItem key={state} value={state}>
                    {state}
                  </MenuItem>
                ))}
              </Select>
              <Button variant="contained" onClick={handleSelectAll}>
                Select All States
              </Button>
              <Button variant="outlined" onClick={handleClearSelection}>
                Clear Selection
              </Button>
            </Box>
          </Grid>
          
          <Grid item xs={12}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Inflation Rate Changes Over Time
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Track year-over-year inflation changes by state. Positive values show rising inflation, negative values show declining inflation. 
                Hover over points to see exact rates.
              </Typography>
              {renderInflationChart()}
            </Box>
          </Grid>
          <Grid item xs={12}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Relationship Between Housing Prices and Inflation
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Explore how housing prices respond to inflation. Each point shows a state's data for a specific year. 
                Look for patterns in how prices change with inflation rates.
              </Typography>
              {renderScatterPlot()}
            </Box>
          </Grid>
          <Grid item xs={12}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Housing Price Index Heat Map
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Compare housing prices across states and time. Darker colors show higher prices. 
                Use this view to spot regional patterns and price trends.
              </Typography>
              {renderHPIHeatmap()}
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default Dashboard;
