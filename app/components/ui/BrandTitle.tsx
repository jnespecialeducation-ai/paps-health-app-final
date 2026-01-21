'use client';

import { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDumbbell } from '@fortawesome/free-solid-svg-icons';

export function BrandTitle() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <span className="inline-flex items-center gap-2">
      {mounted ? (
        <FontAwesomeIcon
          icon={faDumbbell}
          className="text-cyan-300/90 drop-shadow-[0_0_12px_rgba(34,211,238,0.35)]"
        />
      ) : null}
      <span className="text-gradient">내 손안의 AI 체력 코치</span>
    </span>
  );
}

