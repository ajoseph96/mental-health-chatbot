// src/MusicPlayer.tsx

// src/MusicPlayer.tsx

import React, { useRef, useState, useEffect } from 'react';
import { Button, Slider, Box } from '@mui/material';
import { VolumeUp, VolumeOff } from '@mui/icons-material';

const MusicPlayer: React.FC = () => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(0.5);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.volume = volume;
    }
  }, [volume]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (audio) {
      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
      } else {
        audio.play().catch((error) => {
          console.error('Error playing audio:', error);
        });
        setIsPlaying(true);
      }
    }
  };

  const handleVolumeChange = (_event: Event, newValue: number | number[]) => {
    if (typeof newValue === 'number') {
      setVolume(newValue / 100);
    }
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
      <audio ref={audioRef} src="/boundless.mp3" loop />
      <Button
        onClick={togglePlay}
        variant="contained"
        color="primary" 
        startIcon={isPlaying ? <VolumeOff /> : <VolumeUp />}
      >
        {isPlaying ? 'Stop Music' : 'Play Music'}
      </Button>
      {isPlaying && (
        <Box sx={{ width: 150, ml: 2 }}>
          <Slider
            value={volume * 100}
            onChange={handleVolumeChange}
            aria-labelledby="volume-slider"
            min={0}
            max={100}
            color="primary" 
          />
        </Box>
      )}
    </Box>
  );
};

export default MusicPlayer;

