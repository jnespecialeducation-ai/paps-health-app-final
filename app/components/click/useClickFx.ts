'use client';

import { useCallback, useContext } from 'react';
import { ClickContext } from './ClickProvider';

// 클릭 이펙트와 사운드를 함께 처리하는 훅
export function useClickFx() {
  const context = useContext(ClickContext);
  
  if (!context) {
    throw new Error('useClickFx must be used within ClickProvider');
  }

  const { soundEnabled, playSound } = context;

  // 클릭 이벤트 핸들러 생성
  const handleClick = useCallback(
    <T extends HTMLElement>(
      e: React.MouseEvent<T>,
      originalOnClick?: (e: React.MouseEvent<T>) => void
    ) => {
      // 리플 이펙트 생성 (원래 onClick 전에)
      const target = e.currentTarget;
      const rect = target.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      createRipple(target, x, y);

      // 원래 onClick 실행
      if (originalOnClick) {
        originalOnClick(e);
      }

      // 사운드 재생
      if (soundEnabled) {
        playSound();
      }
    },
    [soundEnabled, playSound]
  );

  return { handleClick, soundEnabled };
}

// 네온 리플 이펙트 생성
function createRipple(container: HTMLElement, x: number, y: number): void {
  // container가 relative/absolute가 아니면 relative 추가
  const position = window.getComputedStyle(container).position;
  if (position === 'static') {
    container.style.position = 'relative';
  }
  // overflow는 항상 hidden으로 설정 (리플이 잘리도록)
  container.style.overflow = 'hidden';

  const ripple = document.createElement('div');
  const size = Math.max(container.offsetWidth, container.offsetHeight) * 2.5;
  
  // 초기 스타일 설정 (명확하게 보이도록)
  ripple.style.position = 'absolute';
  ripple.style.borderRadius = '50%';
  ripple.style.width = `${size}px`;
  ripple.style.height = `${size}px`;
  ripple.style.left = `${x - size / 2}px`;
  ripple.style.top = `${y - size / 2}px`;
  // 더 밝고 명확한 네온 그라데이션
  ripple.style.background = 'radial-gradient(circle, rgba(139, 92, 246, 1) 0%, rgba(59, 130, 246, 0.8) 25%, rgba(34, 211, 238, 0.6) 45%, transparent 70%)';
  ripple.style.pointerEvents = 'none';
  ripple.style.transform = 'scale(0)';
  ripple.style.opacity = '1';
  ripple.style.zIndex = '10000';
  ripple.style.willChange = 'transform, opacity';
  ripple.style.transformOrigin = 'center center';

  container.appendChild(ripple);

  // requestAnimationFrame을 사용하여 다음 프레임에서 애니메이션 시작
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      ripple.style.transition = 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
      ripple.style.transform = 'scale(2.5)';
      ripple.style.opacity = '0';
    });
  });

  // 애니메이션 종료 후 제거
  setTimeout(() => {
    if (ripple.parentNode) {
      ripple.remove();
    }
  }, 600);
}
