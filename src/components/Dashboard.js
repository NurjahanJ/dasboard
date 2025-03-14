import React, { useState, useEffect } from 'react';
import { Box, Container, Grid, Typography, CircularProgress, Alert } from '@mui/material';
import Papa from 'papaparse';
import StateSelector from './StateSelector';
import InflationChart from './InflationChart';
import ScatterPlot from './ScatterPlot';
import HPIHeatmap from './HPIHeatmap';
import HPIIncreaseBarChart from './HPIIncreaseBarChart';

/**
 * Dashboard component that displays housing price index and inflation data.
 */
const Dashboard = () => {
  const [hpiData, setHpiData] = useState([]);
  const [inflationData, setInflationData] = useState([]);
  const [populationData, setPopulationData] = useState([]); // New state for population data
  const [selectedStates, setSelectedStates] = useState(['California']);
  const [states, setStates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Handles selecting all states.
   */
  const handleSelectAll = () => {
    setSelectedStates([...states]);
  };

  /**
   * Handles clearing the state selection.
   */
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
              complete: (results) =>
                resolve(results.data.filter((row) => Object.values(row).some((val) => val)))
            });
          });
        };

        // Load all CSV files concurrently.
        const [hpi, inflation, population] = await Promise.all([
          loadCSV('/state_hpi.csv'),
          loadCSV('/state_inflation_rates.csv'),
          loadCSV('/State_poplution.csv')
        ]);

        setHpiData(hpi);
        setInflationData(inflation);
        setPopulationData(population);
        setStates([...new Set(hpi.map((d) => d.State))]);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    loadData();
  }, []);

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
    <Container maxWidth="xl" sx={{ padding: 4 }}>
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Housing Price Index & Inflation Dashboard
        </Typography>
        <Grid container spacing={3}>
          {/* State Selection */}
          <Grid item xs={12}>
            <StateSelector 
              states={states}
              selectedStates={selectedStates}
              onChange={(e) => setSelectedStates(e.target.value)}
              onSelectAll={handleSelectAll}
              onClearSelection={handleClearSelection}
            />
          </Grid>
          {/* Line Chart and Scatter Plot Side by Side */}
          <Grid container item xs={12} spacing={3}>
            <Grid item xs={12} md={6}>
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Inflation Rate Changes Over Time
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  This line chart displays the trend in inflation rates over time for the selected states. Each line represents a state, and individual data points indicate the inflation rate for a specific year. Hover over a point to reveal detailed information about that year’s inflation rate.
                </Typography>
                <InflationChart inflationData={inflationData} selectedStates={selectedStates} />
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Relationship Between Housing Prices and Inflation
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  The scatter plot visualizes the relationship between housing prices (HPI) and inflation rates for the selected states. Each marker represents a data point from a specific year in a state. Hovering over a marker displays the housing price index and the corresponding inflation rate.
                </Typography>
                <ScatterPlot 
                  hpiData={hpiData} 
                  inflationData={inflationData} 
                  selectedStates={selectedStates} 
                />
              </Box>
            </Grid>
          </Grid>
          {/* Heat Map and HPI Increase Bar Chart Side by Side */}
          <Grid container item xs={12} spacing={3}>
            <Grid item xs={12} md={6}>
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Housing Price Index Heat Map
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  The heat map presents a color-coded matrix of housing price indices across states and years. The x-axis lists the states, and the y-axis represents the years. Darker colors indicate higher housing prices. Hover over a cell to view the exact HPI value.
                </Typography>
                <HPIHeatmap hpiData={hpiData} states={states} />
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  House Price Increase by State (2014-2024)
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  This bar chart ranks the states by their increase in Housing Price Index (HPI) from 2014 to 2024.
                  Hover over a bar to view the HPI increase along with the state’s population.
                </Typography>
                <HPIIncreaseBarChart 
                  hpiData={hpiData} 
                  states={states} 
                  populationData={populationData} 
                />
              </Box>
            </Grid>
          </Grid>
          {/* Conclusion Section */}
          <Grid item xs={12}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Conclusion
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Analysis indicates that inflation has impacted housing prices in different U.S. states over the past decade, though not uniformly across all regions. A simple theory proposed that states experiencing higher inflation rates would also see proportionately larger increases in housing prices, as rising costs for construction materials, labor, and increased demand in dynamic markets drive up prices. In states with strong local economies, such as California and Texas, a clear upward trend in both inflation rates and housing prices supports this theory. However, in regions with less robust local economies or where housing supply is ample, the direct impact of inflation on housing prices was less pronounced. These findings suggest that inflation is one of several key drivers influencing housing markets, with regional economic growth, market demand, and housing supply constraints also playing significant roles. Further studies incorporating additional economic variables are needed to fully understand the complex interplay between inflation and housing prices.
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default Dashboard;
