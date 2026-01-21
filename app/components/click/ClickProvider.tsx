'use client';

import { createContext, useState, useEffect, useCallback, PropsWithChildren } from 'react';
import { playClickSound, initClickSound } from './click-sound';

interface ClickContextValue {
  soundEnabled: boolean;
  toggleSound: () => void;
  playSound: () => void;
}

export const ClickContext = createContext<ClickContextValue | null>(null);

export function ClickProvider({ children }: PropsWithChildren) {
  // localStorage에서 초기 상태 복원
  const [soundEnabled, setSoundEnabled] = useState(() => {
    if (typeof window === 'undefined') return false;
    const saved = localStorage.getItem('soundEnabled');
    return saved === '1';
  });

  // localStorage에 상태 저장
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('soundEnabled', soundEnabled ? '1' : '0');
    }
  }, [soundEnabled]);

  // AudioContext 초기화 (첫 사용자 클릭 시 또는 soundEnabled가 true일 때)
  useEffect(() => {
    const handleFirstInteraction = () => {
      initClickSound();
      // soundEnabled가 true면 즉시 초기화 시도
      if (soundEnabled) {
        playClickSound(true);
      }
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('touchstart', handleFirstInteraction);
    };

    window.addEventListener('click', handleFirstInteraction, { once: true });
    window.addEventListener('touchstart', handleFirstInteraction, { once: true });

    return () => {
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('touchstart', handleFirstInteraction);
    };
  }, [soundEnabled]);

  const toggleSound = useCallback(() => {
    setSoundEnabled((prev) => {
      const next = !prev;
      // 토글 시 한 번 재생해서 사용자에게 피드백
      if (next) {
        initClickSound(); // AudioContext 초기화 시도
        playClickSound(true);
      }
      return next;
    });
  }, []);

  const playSound = useCallback(() => {
    playClickSound(soundEnabled);
  }, [soundEnabled]);

  return (
    <ClickContext.Provider value={{ soundEnabled, toggleSound, playSound }}>
      {children}
    </ClickContext.Provider>
  );
}
