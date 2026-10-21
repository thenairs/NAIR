'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  motion,
  useAnimationControls,
  useReducedMotion,
  useSpring,
} from 'motion/react';
import { cn } from '@/lib/utils';
import { type AIState } from './ai-core';

export interface AIRobotAvatarProps {
  size?: number | string;
  state?: AIState;
  expression?: 'neutral' | 'happy' | 'alert' | 'thinking' | 'wink' | 'sleepy' | 'dizzy';
  gaze?: boolean;
  className?: string;
  onClick?: () => void;
  showStatusLight?: boolean;
  'aria-label'?: string;
}

const VIEWBOX = 100;
const CENTER_X = 50;
const EYE_Y = 46;
const EYE_OFFSET = 11;
const EYE_WIDTH = 8;
const EYE_HEIGHT = 16;
const EYE_RADIUS = 4;
const GAZE_RANGE = 4;
const GAZE_FALLOFF = 220;

const EASE_OUT = [0.23, 1, 0.32, 1] as const;
const EASE_IN = [0.4, 0, 1, 1] as const;
const BLINK_MIN_MS = 2800;
const BLINK_EXTRA_MS = 2400;
const DOUBLE_BLINK_CHANCE = 0.28;

const SACCADE_TARGETS = [
  { x: -0.8, y: -0.9 },
  { x: 0.8, y: -0.9 },
  { x: -0.5, y: -0.4 },
  { x: 0.6, y: -0.8 },
] as const;

export const AIRobotAvatar: React.FC<AIRobotAvatarProps> = ({
  size = 64,
  state = 'idle',
  expression,
  gaze = true,
  className,
  onClick,
  showStatusLight = true,
  'aria-label': ariaLabel = 'Friendly AI Assistant Robot',
}) => {
  const shouldReduceMotion = useReducedMotion();
  const leftLid = useAnimationControls();
  const rightLid = useAnimationControls();
  const headControls = useAnimationControls();
  const svgRef = useRef<SVGSVGElement | null>(null);

  const gazeX = useSpring(0, { damping: 25, stiffness: 240 });
  const gazeY = useSpring(0, { damping: 25, stiffness: 240 });

  const resolvedSize = typeof size === 'number' ? `${size}px` : size;

  const isThinking = state === 'thinking';
  const isStreaming = state === 'streaming';
  const isDone = state === 'done';
  const isError = state === 'error';
  const isListening = state === 'listening';

  const mountedRef = useRef(false);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Blinking animation
  const blink = useCallback(
    async (double = false) => {
      if (!mountedRef.current || isError) return;
      const closeT = { duration: 0.065, ease: EASE_IN };
      const openT = { duration: 0.15, ease: EASE_OUT };

      await Promise.all([
        leftLid.start({ scaleY: 0.06 }, closeT),
        rightLid.start({ scaleY: 0.06 }, closeT),
      ]);

      if (!mountedRef.current) return;

      await Promise.all([
        leftLid.start({ scaleY: 1 }, double ? closeT : openT),
        rightLid.start({ scaleY: 1 }, double ? closeT : openT),
      ]);

      if (double) {
        await blink(false);
      }
    },
    [leftLid, rightLid, isError]
  );

  // Idle blinking cycle
  useEffect(() => {
    if (shouldReduceMotion || isError) return;
    let timeout: ReturnType<typeof setTimeout>;
    let active = true;

    const schedule = () => {
      timeout = setTimeout(() => {
        if (active) {
          blink(Math.random() < DOUBLE_BLINK_CHANCE);
        }
        schedule();
      }, BLINK_MIN_MS + Math.random() * BLINK_EXTRA_MS);
    };

    schedule();
    return () => {
      active = false;
      clearTimeout(timeout);
    };
  }, [blink, shouldReduceMotion, isError]);

  // Pointer gaze tracking
  useEffect(() => {
    if (!gaze || shouldReduceMotion || isThinking || isError) return;

    const handlePointerMove = (event: PointerEvent) => {
      const svg = svgRef.current;
      if (!svg) return;
      const rect = svg.getBoundingClientRect();
      const dx = event.clientX - (rect.left + rect.width / 2);
      const dy = event.clientY - (rect.top + rect.height / 2);
      const distance = Math.sqrt(dx * dx + dy * dy);
      const reach = Math.min(1, distance / GAZE_FALLOFF) * GAZE_RANGE;
      const angle = Math.atan2(dy, dx);

      gazeX.set(Math.cos(angle) * reach);
      gazeY.set(Math.sin(angle) * reach);
    };

    window.addEventListener('pointermove', handlePointerMove);
    return () => window.removeEventListener('pointermove', handlePointerMove);
  }, [gaze, gazeX, gazeY, isThinking, isError, shouldReduceMotion]);

  // Thinking saccades
  useEffect(() => {
    if (!isThinking || shouldReduceMotion) return;
    let timeout: ReturnType<typeof setTimeout>;
    let active = true;
    let idx = 0;

    const schedule = () => {
      timeout = setTimeout(() => {
        if (!active) return;
        const target = SACCADE_TARGETS[idx % SACCADE_TARGETS.length];
        idx++;
        gazeX.set(target.x * GAZE_RANGE);
        gazeY.set(target.y * GAZE_RANGE);
        schedule();
      }, 700 + Math.random() * 600);
    };

    schedule();
    return () => {
      active = false;
      clearTimeout(timeout);
    };
  }, [gazeX, gazeY, isThinking, shouldReduceMotion]);

  // Status-based LED antenna color
  const statusColor = isError
    ? '#EF4444' // red
    : isDone
    ? '#10B981' // emerald
    : isThinking || isStreaming
    ? '#38BDF8' // cyan
    : isListening
    ? '#3B82F6' // blue
    : '#38BDF8'; // cyan idle

  const isHappyExpression = expression === 'happy' || isDone;

  return (
    <div
      className={cn(
        'relative inline-flex items-center justify-center select-none shrink-0',
        onClick && 'cursor-pointer',
        className
      )}
      style={{ width: resolvedSize, height: resolvedSize }}
      onClick={onClick}
      role={onClick ? 'button' : 'img'}
      aria-label={ariaLabel}
    >
      <motion.svg
        ref={svgRef}
        viewBox={`0 0 ${VIEWBOX} ${VIEWBOX}`}
        className="w-full h-full overflow-visible"
        animate={headControls}
        initial={{ y: 0 }}
      >
        <defs>
          {/* Ceramic White Robot Body Gradient */}
          <linearGradient id="robot-chassis-grad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="45%" stopColor="#F8FAFC" />
            <stop offset="100%" stopColor="#E2E8F0" />
          </linearGradient>

          {/* Obsidian OLED Visor Screen Gradient */}
          <linearGradient id="robot-visor-grad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0B132B" />
            <stop offset="60%" stopColor="#0A192F" />
            <stop offset="100%" stopColor="#030712" />
          </linearGradient>

          {/* Eye Glow Cyan Gradient */}
          <linearGradient id="robot-eye-grad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#67E8F9" />
            <stop offset="100%" stopColor="#38BDF8" />
          </linearGradient>

          {/* Ear Pod Metallic Gradient */}
          <linearGradient id="robot-ear-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#E2E8F0" />
            <stop offset="100%" stopColor="#CBD5E1" />
          </linearGradient>

          {/* Soft Cyan Bloom Filter */}
          <filter id="cyan-bloom" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Ambient Hover Float Container */}
        <motion.g
          animate={
            shouldReduceMotion
              ? undefined
              : {
                  y: isThinking ? [0, -4, 0] : [0, -2.5, 0],
                  rotate: isThinking ? [0, -1.5, 1.5, 0] : [0, -0.6, 0.6, 0],
                }
          }
          transition={{
            repeat: Infinity,
            duration: isThinking ? 2 : 3.8,
            ease: 'easeInOut',
          }}
          style={{ transformOrigin: '50px 50px' }}
        >
          {/* Subtle Base Shadow Under Robot */}
          <ellipse
            cx="50"
            cy="94"
            rx="24"
            ry="4"
            fill="black"
            opacity="0.12"
            className="blur-xs"
          />

          {/* 1. Top Antenna */}
          <g>
            {/* Antenna Stem */}
            <line
              x1="50"
              y1="16"
              x2="50"
              y2="8"
              stroke="#94A3B8"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            {/* Antenna Ball Tip */}
            {showStatusLight && (
              <>
                <motion.circle
                  cx="50"
                  cy="6.5"
                  r="5"
                  fill={statusColor}
                  opacity="0.35"
                  animate={
                    isThinking || isStreaming
                      ? { scale: [1, 1.4, 1], opacity: [0.3, 0.7, 0.3] }
                      : { scale: [1, 1.15, 1], opacity: [0.25, 0.45, 0.25] }
                  }
                  transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
                  style={{ transformOrigin: '50px 6.5px' }}
                />
                <circle
                  cx="50"
                  cy="6.5"
                  r="3.2"
                  fill={statusColor}
                  filter="url(#cyan-bloom)"
                />
              </>
            )}
          </g>

          {/* 2. Side Ear Pods (Left & Right) */}
          {/* Left Ear */}
          <rect
            x="9"
            y="43"
            width="7"
            height="18"
            rx="3.5"
            fill="url(#robot-ear-grad)"
            stroke="#94A3B8"
            strokeWidth="1"
          />
          <circle cx="12.5" cy="52" r="1.5" fill="#38BDF8" opacity="0.8" />

          {/* Right Ear */}
          <rect
            x="84"
            y="43"
            width="7"
            height="18"
            rx="3.5"
            fill="url(#robot-ear-grad)"
            stroke="#94A3B8"
            strokeWidth="1"
          />
          <circle cx="87.5" cy="52" r="1.5" fill="#38BDF8" opacity="0.8" />

          {/* 3. Main Head Chassis (Smooth Ceramic Rounded Shell) */}
          <rect
            x="14"
            y="15"
            width="72"
            height="70"
            rx="26"
            fill="url(#robot-chassis-grad)"
            stroke="#CBD5E1"
            strokeWidth="1.5"
            filter="drop-shadow(0 4px 10px rgba(0,0,0,0.06))"
          />

          {/* Top Chassis Specular Arc */}
          <path
            d="M 28 20 Q 50 16 72 20"
            stroke="#FFFFFF"
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.85"
            fill="none"
          />

          {/* 4. Glossy Curved OLED Visor Screen */}
          <rect
            x="21"
            y="26"
            width="58"
            height="46"
            rx="18"
            fill="url(#robot-visor-grad)"
            stroke="#1E293B"
            strokeWidth="1.5"
          />

          {/* Visor Glass Reflection Highlight */}
          <path
            d="M 25 32 Q 50 27 73 30"
            stroke="#FFFFFF"
            strokeWidth="1.2"
            strokeLinecap="round"
            opacity="0.18"
            fill="none"
          />

          {/* 5. The Living Expressive Eyes */}
          {isError ? (
            /* Dizzy Spiral Eyes for Error State */
            <g>
              <text x="39" y="52" textAnchor="middle" fill="#EF4444" fontSize="13" fontWeight="bold">✕</text>
              <text x="61" y="52" textAnchor="middle" fill="#EF4444" fontSize="13" fontWeight="bold">✕</text>
            </g>
          ) : isHappyExpression ? (
            /* Cute Happy Crescent Eyes (^ ^) */
            <g filter="url(#cyan-bloom)">
              <path
                d="M 33 48 Q 39 40 45 48"
                fill="none"
                stroke="#38BDF8"
                strokeWidth="3.2"
                strokeLinecap="round"
              />
              <path
                d="M 55 48 Q 61 40 67 48"
                fill="none"
                stroke="#38BDF8"
                strokeWidth="3.2"
                strokeLinecap="round"
              />
            </g>
          ) : (
            /* Dynamic Gazing & Blinking Eyes */
            <g filter="url(#cyan-bloom)">
              {/* Left Eye */}
              <motion.rect
                x={CENTER_X - EYE_OFFSET - EYE_WIDTH / 2}
                y={EYE_Y - EYE_HEIGHT / 2}
                width={EYE_WIDTH}
                height={EYE_HEIGHT}
                rx={EYE_RADIUS}
                fill="url(#robot-eye-grad)"
                animate={leftLid}
                initial={{ scaleY: 1 }}
                style={{
                  transformOrigin: `${CENTER_X - EYE_OFFSET}px ${EYE_Y}px`,
                  x: gazeX,
                  y: gazeY,
                }}
              />

              {/* Right Eye */}
              <motion.rect
                x={CENTER_X + EYE_OFFSET - EYE_WIDTH / 2}
                y={EYE_Y - EYE_HEIGHT / 2}
                width={EYE_WIDTH}
                height={EYE_HEIGHT}
                rx={EYE_RADIUS}
                fill="url(#robot-eye-grad)"
                animate={rightLid}
                initial={{ scaleY: 1 }}
                style={{
                  transformOrigin: `${CENTER_X + EYE_OFFSET}px ${EYE_Y}px`,
                  x: gazeX,
                  y: gazeY,
                }}
              />
            </g>
          )}

          {/* 6. Glowing LED Blush Cheeks */}
          <g>
            <motion.ellipse
              cx="31"
              cy="58"
              rx="3"
              ry="1.8"
              fill="#38BDF8"
              opacity="0.5"
              animate={{ opacity: isStreaming ? [0.4, 0.8, 0.4] : [0.4, 0.65, 0.4] }}
              transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
            />
            <motion.ellipse
              cx="69"
              cy="58"
              rx="3"
              ry="1.8"
              fill="#38BDF8"
              opacity="0.5"
              animate={{ opacity: isStreaming ? [0.4, 0.8, 0.4] : [0.4, 0.65, 0.4] }}
              transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
            />
          </g>

          {/* 7. Subtle Chin Notch / Mouth Indicator */}
          <line
            x1="47"
            y1="64"
            x2="53"
            y2="64"
            stroke="#38BDF8"
            strokeWidth="1.2"
            strokeLinecap="round"
            opacity="0.3"
          />
        </motion.g>
      </motion.svg>
    </div>
  );
};

export default AIRobotAvatar;
