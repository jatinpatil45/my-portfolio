import { useRef, ReactNode, useCallback } from 'react';
import { motion, useMotionValue, useSpring, useMotionTemplate } from 'framer-motion';

interface TiltCardProps {
  children: ReactNode;
  className?: string;
  tiltAmount?: number;
  glareEnabled?: boolean;
}

const SPRING_CONFIG = { stiffness: 260, damping: 28, mass: 0.5 };

const TiltCard = ({
  children,
  className = '',
  tiltAmount = 15,
  glareEnabled = true,
}: TiltCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const rectRef = useRef<DOMRect | null>(null);
  const rafRef = useRef<number | null>(null);

  const rawRotateX = useMotionValue(0);
  const rawRotateY = useMotionValue(0);
  const rotateX = useSpring(rawRotateX, SPRING_CONFIG);
  const rotateY = useSpring(rawRotateY, SPRING_CONFIG);

  const glareX = useMotionValue(50);
  const glareY = useMotionValue(50);
  const glareOpacity = useMotionValue(0);
  const glareBackground = useMotionTemplate`radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255,255,255,0.14) 0%, transparent 60%)`;

  const handleMouseEnter = useCallback(() => {
    if (window.matchMedia && window.matchMedia('(pointer: coarse)').matches) return;
    if (cardRef.current) {
      rectRef.current = cardRef.current.getBoundingClientRect();
      glareOpacity.set(1);
    }
  }, [glareOpacity]);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!rectRef.current) return;
      const clientX = e.clientX;
      const clientY = e.clientY;

      if (rafRef.current !== null) return;
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        const rect = rectRef.current;
        if (!rect || rect.width === 0 || rect.height === 0) return;

        const relX = (clientX - rect.left) / rect.width;
        const relY = (clientY - rect.top) / rect.height;

        rawRotateX.set((relY - 0.5) * 2 * -tiltAmount);
        rawRotateY.set((relX - 0.5) * 2 * tiltAmount);
        glareX.set(relX * 100);
        glareY.set(relY * 100);
      });
    },
    [tiltAmount, rawRotateX, rawRotateY, glareX, glareY]
  );

  const handleMouseLeave = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    rectRef.current = null;
    rawRotateX.set(0);
    rawRotateY.set(0);
    glareOpacity.set(0);
  }, [rawRotateX, rawRotateY, glareOpacity]);

  return (
    <motion.div
      ref={cardRef}
      className={`relative ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transformPerspective: 1000,
        rotateX,
        rotateY,
      }}
    >
      {children}
      {glareEnabled && (
        <motion.div
          className="absolute inset-0 pointer-events-none overflow-hidden"
          style={{
            borderRadius: 'inherit',
            background: glareBackground,
            opacity: glareOpacity,
            transition: 'opacity 0.25s ease',
          }}
        />
      )}
    </motion.div>
  );
};

export default TiltCard;
