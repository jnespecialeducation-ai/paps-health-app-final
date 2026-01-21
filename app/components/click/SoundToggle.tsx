'use client';

import { useContext, useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faVolumeHigh, faVolumeXmark } from '@fortawesome/free-solid-svg-icons';
import { ClickContext } from './ClickProvider';
import { Button } from '../ui/Button';

export function SoundToggle() {
  const context = useContext(ClickContext);
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  if (!context) {
    return null;
  }

  const { soundEnabled, toggleSound } = context;

  if (!mounted) {
    return (
      <Button
        variant="secondary"
        className="gap-2"
        aria-label="사운드 토글"
      >
        <span className="h-4 w-4" />
        <span className="text-xs">Sound OFF</span>
      </Button>
    );
  }

  return (
    <Button
      variant="secondary"
      onClick={toggleSound}
      className="gap-2"
      aria-label={soundEnabled ? '사운드 끄기' : '사운드 켜기'}
      suppressHydrationWarning
    >
      <FontAwesomeIcon 
        icon={soundEnabled ? faVolumeHigh : faVolumeXmark} 
        className="h-4 w-4"
      />
      <span className="text-xs">Sound {soundEnabled ? 'ON' : 'OFF'}</span>
    </Button>
  );
}
