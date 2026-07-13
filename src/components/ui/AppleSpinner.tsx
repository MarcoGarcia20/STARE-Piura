import React from 'react';

interface AppleSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: string;
  className?: string;
}

export const AppleSpinner: React.FC<AppleSpinnerProps> = ({ 
  size = 'md', 
  color = 'text-teal-400', 
  className = '' 
}) => {
  const dimensions = {
    sm: 'w-4 h-4',
    md: 'w-7 h-7',
    lg: 'w-10 h-10',
    xl: 'w-14 h-14',
  };

  return (
    <div className={`relative ${dimensions[size]} ${color} ${className}`} aria-label="Cargando">
      <svg 
        viewBox="0 0 24 24" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
        style={{ 
          animation: 'spin 0.8s steps(12) infinite'
        }}
      >
        {Array.from({ length: 12 }).map((_, i) => {
          const rotate = i * 30;
          // Opacidad progresiva para crear el efecto de cola del spinner clásico de iOS/macOS
          const opacity = 0.15 + (i / 11) * 0.85;
          return (
            <line
              key={i}
              x1="12"
              y1="3"
              x2="12"
              y2="6.5"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              transform={`rotate(${rotate} 12 12)`}
              opacity={opacity}
            />
          );
        })}
      </svg>
    </div>
  );
};
