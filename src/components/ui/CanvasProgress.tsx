import React, { useEffect, useRef } from 'react';

interface CanvasProgressProps {
  percentage: number;
  color?: string;
  size?: number;
}

export const CanvasProgress: React.FC<CanvasProgressProps> = ({
  percentage,
  color = '#14b8a6', // Teal por defecto
  size = 90
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const scale = window.devicePixelRatio || 1;
    canvas.width = size * scale;
    canvas.height = size * scale;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
    ctx.scale(scale, scale);

    let animationId: number;
    let waveOffset = 0;
    const targetHeightRatio = 1 - percentage / 100;
    let currentHeightRatio = 1; // Empezar vacío y animar hacia arriba

    const render = () => {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, size, size);

      // Interpolación suave del nivel del agua
      currentHeightRatio += (targetHeightRatio - currentHeightRatio) * 0.04;

      // Dibujar fondo del círculo
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, size / 2 - 4, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(241, 245, 249, 0.4)';
      ctx.fill();

      // Recortar dibujo al círculo interior
      ctx.save();
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, size / 2 - 4, 0, Math.PI * 2);
      ctx.clip();

      // Dibujar primera onda del agua (fondo)
      const waveHeight = 4.5;
      const waveLength = size / 1.1;
      const waterLevel = size * currentHeightRatio;

      ctx.beginPath();
      ctx.moveTo(0, waterLevel);
      for (let x = 0; x <= size; x++) {
        const y = Math.sin((x / waveLength) + waveOffset) * waveHeight + waterLevel;
        ctx.lineTo(x, y);
      }
      ctx.lineTo(size, size);
      ctx.lineTo(0, size);
      ctx.closePath();

      // Gradiente del agua
      const grad = ctx.createLinearGradient(0, waterLevel - waveHeight, 0, size);
      grad.addColorStop(0, color);
      grad.addColorStop(1, adjustColorBrightness(color, -25));
      ctx.fillStyle = grad;
      ctx.fill();

      // Dibujar segunda onda (frente, más clara)
      ctx.beginPath();
      ctx.moveTo(0, waterLevel);
      for (let x = 0; x <= size; x++) {
        const y = Math.cos((x / (waveLength * 0.85)) - waveOffset) * (waveHeight * 0.7) + waterLevel;
        ctx.lineTo(x, y);
      }
      ctx.lineTo(size, size);
      ctx.lineTo(0, size);
      ctx.closePath();
      ctx.fillStyle = 'rgba(255, 255, 255, 0.16)';
      ctx.fill();

      ctx.restore();

      // Dibujar borde del círculo
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, size / 2 - 2, 0, Math.PI * 2);
      ctx.strokeStyle = color;
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Dibujar texto de porcentaje en el centro
      ctx.font = 'bold 13px font-mono, ui-monospace, monospace';
      ctx.fillStyle = percentage > 55 ? '#ffffff' : '#0f172a';
      
      // Respaldo de sombra si el texto está sobre agua clara
      if (percentage <= 55) {
        ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
        ctx.shadowBlur = 3;
      }
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${percentage.toFixed(0)}%`, size / 2, size / 2);
      ctx.shadowBlur = 0;

      waveOffset += 0.06;
      animationId = requestAnimationFrame(render);
    };

    function adjustColorBrightness(hex: string, percent: number) {
      let R = parseInt(hex.substring(1, 3), 16);
      let G = parseInt(hex.substring(3, 5), 16);
      let B = parseInt(hex.substring(5, 7), 16);

      R = Math.max(0, Math.min(255, R + percent));
      G = Math.max(0, Math.min(255, G + percent));
      B = Math.max(0, Math.min(255, B + percent));

      const rHex = R.toString(16).padStart(2, '0');
      const gHex = G.toString(16).padStart(2, '0');
      const bHex = B.toString(16).padStart(2, '0');

      return `#${rHex}${gHex}${bHex}`;
    }

    render();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [percentage, color, size]);

  return <canvas ref={canvasRef} className="rounded-full shadow-inner select-none pointer-events-none" />;
};
