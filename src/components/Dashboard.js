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
    const traces = selectedStates.map(state => {
      // Get data for this state and calculate year-over-year changes
      const stateData = inflationData
        .filter(d => d.State === state)
        .sort((a, b) => parseInt(a.Year) - parseInt(b.Year));

      const yearlyChanges = stateData.map((d, i) => {
        if (i === 0) return null;
        const currentRate = parseFloat(d['Inflation Rate (%)']);
        const prevRate = parseFloat(stateData[i - 1]['Inflation Rate (%)']);
        return {
          year: d.Year,
          change: currentRate - prevRate,
          rate: currentRate
        };
      }).filter(d => d !== null);

      return {
        x: yearlyChanges.map(d => d.year),
        y: yearlyChanges.map(d => d.change),
        text: yearlyChanges.map(d => 
          `${state}<br>Year: ${d.year}<br>Change: ${d.change.toFixed(2)}%<br>Rate: ${d.rate.toFixed(2)}%`
        ),
        name: state,
        type: 'scatter',
        mode: 'lines+markers',
        hoverinfo: 'text',
        line: { width: 2 },
        marker: { size: 8 }
      };
    });

    return (
      <Plot
        data={traces}
        layout={{
          title: {
            text: 'Yearly Changes in Inflation Rate by State (2014-2024)',
            font: { size: 18, color: '#333' }
          },
          xaxis: { 
            title: 'Year',
            dtick: 1 // Show every year on x-axis
          },
          yaxis: { 
            title: 'Change in Inflation Rate (%)',
            zeroline: true
          },
          hovermode: 'closest',
          showlegend: true,
          margin: { t: 50, r: 50, b: 50, l: 70 }
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
            {renderInflationChart()}
          </Grid>
          <Grid item xs={12}>
            {renderScatterPlot()}
          </Grid>
          <Grid item xs={12}>
            {renderHPIHeatmap()}
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default Dashboard;
