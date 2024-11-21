//import { useState } from 'react'
//import './App.css'
// src/App.tsx
// src/App.tsx

import React from 'react';
import ChatBox from './ChatBox';
import MusicPlayer from './MusicPlayer';
import { Grid2 } from '@mui/material';

const App: React.FC = () => {
  return (
    <Grid2
      spacing={2}
      sx={{
        height: '100vh', // Full viewport height
        width: '100vw',  // Full viewport width
        justifyContent: 'center', // Center horizontally
        alignItems: 'center',     // Center vertically
        backgroundColor: '#f5f5f5', // Optional: Add a background color
      }}
    >
      <Grid2
        display="flex"
        justifyContent="center"
        alignItems="center"
      >
        <ChatBox />
      </Grid2>
      <Grid2
        display="flex"
        justifyContent="center"
        alignItems="center"
      >
        <MusicPlayer />
      </Grid2>
    </Grid2>
  );
};

export default App;

