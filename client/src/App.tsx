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
    <Grid2 display="flex" justifyContent="inherit" alignItems="inherit" size="grow">
      <Grid2 display="flex" justifyContent="center" alignItems="center" size="grow">
        <MusicPlayer />
      </Grid2>
      <Grid2 display="flex" justifyContent="center" alignItems="center" size="grow">
        <ChatBox />
      </Grid2>
    </Grid2>
  );
};

export default App;

