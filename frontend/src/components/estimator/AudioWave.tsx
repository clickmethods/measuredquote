import React from 'react';

interface AudioWaveProps {
  isActive: boolean;
  barCount?: number;
}

const AudioWave: React.FC<AudioWaveProps> = ({ isActive, barCount = 7 }) => {
  const bars = Array.from({ length: barCount }, (_, i) => i);

  // Gradient colors from left (#2563EB) to center (#3B82F6) to right (#22C55E)
  const getBarColor = (index: number) => {
    const ratio = index / (barCount - 1);
    if (ratio < 0.5) {
      // Blue to lighter blue
      return '#2563EB';
    } else if (ratio < 0.75) {
      return '#3B82F6';
    } else {
      // Transition to green
      return '#22C55E';
    }
  };

  return (
    <div className="flex items-center justify-center gap-[3px] h-[40px]">
      {bars.map((i) => (
        <div
          key={i}
          className="audio-bar"
          style={{
            width: '4px',
            minHeight: isActive ? '6px' : '3px',
            height: isActive ? undefined : '3px',
            borderRadius: '2px',
            backgroundColor: getBarColor(i),
            animationDelay: `${i * 0.12}s`,
            animationPlayState: isActive ? 'running' : 'paused',
          }}
        />
      ))}
      <style>{`
        @keyframes audioBarBounce {
          0%, 100% {
            height: 6px;
            opacity: 0.5;
          }
          25% {
            height: 18px;
            opacity: 0.8;
          }
          50% {
            height: 32px;
            opacity: 1;
          }
          75% {
            height: 12px;
            opacity: 0.7;
          }
        }
        .audio-bar {
          animation: audioBarBounce 0.8s ease-in-out infinite;
          transition: all 0.3s ease;
        }
      `}</style>
    </div>
  );
};

export default AudioWave;
