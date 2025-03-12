import React from 'react';
import { Box, Select, MenuItem, Button } from '@mui/material';

const StateSelector = ({ states, selectedStates, onChange, onSelectAll, onClearSelection }) => (
  <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 3 }}>
    <Select
      multiple
      value={selectedStates}
      onChange={onChange}
      sx={{ minWidth: 200, flex: 1 }}
      displayEmpty
    >
      {states.map(state => (
        <MenuItem key={state} value={state}>
          {state}
        </MenuItem>
      ))}
    </Select>
    <Button variant="contained" onClick={onSelectAll}>
      Select All States
    </Button>
    <Button variant="outlined" onClick={onClearSelection}>
      Clear Selection
    </Button>
  </Box>
);

export default StateSelector;
