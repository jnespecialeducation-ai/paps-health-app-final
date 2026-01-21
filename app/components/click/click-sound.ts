// 클릭 사운드 재생 유틸리티
// 브라우저 정책상 첫 사용자 제스처 이후에만 재생 가능

let audioContext: AudioContext | null = null;
let clickSoundBuffer: AudioBuffer | null = null;
let isInitialized = false;

// AudioContext 초기화 (사용자 제스처 후)
export function initClickSound(): void {
  if (isInitialized || typeof window === 'undefined') return;
  
  try {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    isInitialized = true;
  } catch (e) {
    console.warn('AudioContext 초기화 실패:', e);
  }
}

// 버블 팝 스타일의 경쾌한 클릭 사운드 생성
function generateClickSound(context: AudioContext): AudioBuffer {
  const sampleRate = context.sampleRate;
  const duration = 0.03; // 30ms (더 짧게)
  const frameCount = sampleRate * duration;
  const buffer = context.createBuffer(1, frameCount, sampleRate);
  const data = buffer.getChannelData(0);

  // 버블 팝 느낌: 여러 주파수 조합 (600Hz + 800Hz + 1000Hz)
  for (let i = 0; i < frameCount; i++) {
    const t = i / sampleRate;
    // 여러 주파수 조합으로 버블 팝 느낌
    const freq1 = 600;
    const freq2 = 800;
    const freq3 = 1000;
    // 빠른 감쇠 (버블이 터지는 느낌)
    const envelope = Math.exp(-t * 50) * (1 - t * 20); // 더 빠른 감쇠
    // 주파수 조합
    const wave1 = Math.sin(2 * Math.PI * freq1 * t);
    const wave2 = Math.sin(2 * Math.PI * freq2 * t) * 0.6;
    const wave3 = Math.sin(2 * Math.PI * freq3 * t) * 0.4;
    data[i] = (wave1 + wave2 + wave3) * envelope * 0.45; // 볼륨 증가
  }

  return buffer;
}

// 클릭 사운드 재생
export function playClickSound(enabled: boolean): void {
  if (!enabled || !audioContext || typeof window === 'undefined') return;

  try {
    // AudioContext가 suspended 상태면 resume
    if (audioContext.state === 'suspended') {
      audioContext.resume();
    }

    // 버퍼가 없으면 생성
    if (!clickSoundBuffer) {
      clickSoundBuffer = generateClickSound(audioContext);
    }

    const source = audioContext.createBufferSource();
    source.buffer = clickSoundBuffer;
    source.connect(audioContext.destination);
    source.start(0);
  } catch (e) {
    // 사운드 재생 실패는 조용히 무시 (브라우저 정책 등)
    console.debug('클릭 사운드 재생 실패:', e);
  }
}
