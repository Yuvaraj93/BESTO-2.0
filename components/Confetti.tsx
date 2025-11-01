import React, { useEffect, useRef } from 'react';

interface ConfettiProps {
  isActive: boolean;
}

const Confetti: React.FC<ConfettiProps> = ({ isActive }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!isActive || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let particles: any[] = [];
    const particleCount = 200;
    const colors = ["#f9a8d4", "#f472b6", "#a78bfa", "#818cf8", "#60a5fa", "#38bdf8"];

    const createParticles = () => {
      particles = [];
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: -20,
          w: Math.random() * 10 + 5,
          h: Math.random() * 10 + 5,
          color: colors[Math.floor(Math.random() * colors.length)],
          speed: Math.random() * 3 + 2,
          tilt: Math.random() * 10 - 5,
          tiltAngle: 0,
          tiltAngleIncrement: Math.random() * 0.1 + 0.05
        });
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        ctx.save();
        ctx.fillStyle = p.color;
        ctx.translate(p.x + p.w / 2, p.y + p.h / 2);
        ctx.rotate(p.tiltAngle);
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      });
    };

    const update = () => {
      particles.forEach(p => {
        p.y += p.speed;
        p.x += p.tilt;
        p.tiltAngle += p.tiltAngleIncrement;
        if (p.y > canvas.height) {
          // Reset particle
          p.x = Math.random() * canvas.width;
          p.y = -20;
        }
      });
    };

    let animationFrameId: number;
    const animate = () => {
      update();
      draw();
      animationFrameId = requestAnimationFrame(animate);
    };

    createParticles();
    animate();
    
    const timeoutId = setTimeout(() => {
        // Stop creating new particles after some time
        particles = [];
    }, 5000);


    return () => {
      cancelAnimationFrame(animationFrameId);
      clearTimeout(timeoutId);
    };

  }, [isActive]);

  if (!isActive) return null;

  return <canvas ref={canvasRef} className="fixed top-0 left-0 w-full h-full pointer-events-none z-55" />;
};

export default Confetti;
