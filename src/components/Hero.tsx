import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Zap, ShieldCheck, Cpu } from 'lucide-react';
import heroBgImage from '../assets/hero_bright_daylight.jpg';

interface HeroProps {
  onBookCall: () => void;
  onOpenAssessment: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onBookCall, onOpenAssessment }) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.23, 1, 0.32, 1] as const,
      },
    },
  };

  return (
    <section className="relative w-full min-h-[90vh] sm:min-h-screen flex flex-col justify-center overflow-hidden bg-slate-50 text-slate-900">
      
      {/* 1. HERO BACKGROUND IMAGE (BRIGHT DAYLIGHT ARCHITECTURAL SUITE) */}
      <div className="absolute inset-0 w-full h-full pointer-events-none select-none overflow-hidden z-0">
        <img
          src={heroBgImage}
          alt="NAIR.AI Autonomous AI Collaboration and Enterprise Intelligence"
          className="w-full h-full object-cover object-center"
          loading="eager"
        />
        {/* Subtle, soft natural daylight diffusion on the left to ensure effortless text contrast */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/70 via-white/30 to-transparent pointer-events-none" />
      </div>

      {/* 2. MAIN FOREGROUND CONTENT (BLENDED WITH BRIGHT THEME & SIGNATURE BLUE ACCENTS) */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 w-full max-w-[1600px] mx-auto px-6 sm:px-10 lg:pl-8 lg:pr-12 xl:pl-10 xl:pr-14 pt-28 sm:pt-36 lg:pt-36 pb-20 sm:pb-24 lg:pb-28"
      >
        <div className="max-w-4xl flex flex-col justify-center text-left items-start">
          
          {/* Eyebrow / Kicker: Frosted Glass Capsule with Electric Blue Accent */}
          <motion.div
            variants={itemVariants}
            className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/85 border border-sky-200/90 backdrop-blur-md mb-6 shadow-[0_2px_12px_rgba(14,165,233,0.12)]"
          >
            <span className="w-2 h-2 rounded-full bg-[#0284C7] animate-pulse shrink-0 shadow-[0_0_8px_rgba(2,132,199,0.5)]" />
            <span className="text-xs sm:text-sm font-semibold tracking-wide text-slate-800">
              Want to implement AI, but not sure where to start?{' '}
              <span className="text-[#0369A1] font-bold">Work smarter not harder with these proven strategies.</span>
            </span>
          </motion.div>

          {/* Main Headline: Deep Executive Navy/Slate + Electric Royal Blue to Cyan Gradient */}
          <motion.h1
            variants={itemVariants}
            className="font-display text-4xl sm:text-6xl lg:text-[4.75rem] xl:text-[5.25rem] font-extrabold tracking-tight leading-[1.08] sm:leading-[1.05] mb-6"
          >
            <span className="text-[#0A192F] block">
              Harness the Power of
            </span>
            <span className="text-transparent bg-gradient-to-r from-[#1D4ED8] via-[#0284C7] to-[#00D2FF] bg-clip-text block mt-1 drop-shadow-[0_2px_16px_rgba(2,132,199,0.22)]">
              Autonomous AI.
            </span>
          </motion.h1>

          {/* Sub-description: Crisp Executive Slate-700 */}
          <motion.p
            variants={itemVariants}
            className="text-base sm:text-lg lg:text-xl text-slate-700 leading-relaxed mb-8 sm:mb-9 max-w-2xl font-normal"
          >
            Production-grade multi-agent swarms, zero-retention governance, and private inference engines engineered directly into your enterprise infrastructure.
          </motion.p>

          {/* Action Buttons: Electric Blue Signature CTA + Clean Frosted Glass Audit Button */}
          <motion.div
            variants={itemVariants}
            className="flex flex-wrap items-center gap-4 mb-10 sm:mb-12 w-full sm:w-auto"
          >
            <button
              type="button"
              onClick={onBookCall}
              className="px-8 sm:px-9 py-3.5 sm:py-4 rounded-full bg-gradient-to-r from-[#1D4ED8] via-[#2563EB] to-[#0284C7] hover:from-[#1E40AF] hover:to-[#1D4ED8] text-white font-mono text-xs sm:text-sm font-extrabold tracking-wider uppercase transition-all duration-200 shadow-[0_10px_30px_rgba(29,78,216,0.35)] hover:scale-103 active:scale-97 cursor-pointer flex items-center gap-2.5 group border border-blue-400/30"
            >
              <span>Explore Solutions</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5] group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              type="button"
              onClick={onOpenAssessment}
              className="px-7 sm:px-8 py-3.5 sm:py-4 rounded-full bg-white/80 hover:bg-white text-slate-800 hover:text-[#1D4ED8] border border-slate-300/80 hover:border-[#1D4ED8]/50 font-mono text-xs sm:text-sm font-bold tracking-wider uppercase transition-all duration-200 backdrop-blur-md cursor-pointer hover:scale-102 active:scale-98 shadow-sm"
            >
              <span>Take Readiness Audit</span>
            </button>
          </motion.div>

          {/* 3 Horizontal Micro-Feature Badges: Blended with Bright Theme & Blue Accents */}
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 pt-6 border-t border-slate-300/70 max-w-3xl w-full"
          >
            {/* Feature 1: Multi-Agent Swarms */}
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-full bg-white/90 border border-sky-200 flex items-center justify-center text-[#1D4ED8] shadow-[0_2px_10px_rgba(2,132,199,0.12)] shrink-0 backdrop-blur-sm">
                <Zap className="w-5 h-5 text-[#0284C7] fill-[#0284C7]/20" />
              </div>
              <div className="text-left">
                <div className="font-display font-bold text-sm text-[#0A192F] leading-tight">
                  Multi-Agent Swarms
                </div>
                <div className="text-xs text-slate-600 font-medium leading-tight mt-0.5">
                  Production-Grade
                </div>
              </div>
            </div>

            {/* Feature 2: Zero-Retention */}
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-full bg-white/90 border border-sky-200 flex items-center justify-center text-[#1D4ED8] shadow-[0_2px_10px_rgba(2,132,199,0.12)] shrink-0 backdrop-blur-sm">
                <ShieldCheck className="w-5 h-5 text-[#0284C7]" />
              </div>
              <div className="text-left">
                <div className="font-display font-bold text-sm text-[#0A192F] leading-tight">
                  Zero-Retention
                </div>
                <div className="text-xs text-slate-600 font-medium leading-tight mt-0.5">
                  Enterprise Governance
                </div>
              </div>
            </div>

            {/* Feature 3: Private Inference */}
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-full bg-white/90 border border-sky-200 flex items-center justify-center text-[#1D4ED8] shadow-[0_2px_10px_rgba(2,132,199,0.12)] shrink-0 backdrop-blur-sm">
                <Cpu className="w-5 h-5 text-[#0284C7]" />
              </div>
              <div className="text-left">
                <div className="font-display font-bold text-sm text-[#0A192F] leading-tight">
                  Private Inference
                </div>
                <div className="text-xs text-slate-600 font-medium leading-tight mt-0.5">
                  Direct Infrastructure
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* 4. BALANCED COMPACT WAVE STRUCTURE (HARMONIC ACROSS ENTIRE BOTTOM) */}
      <div className="absolute bottom-0 left-0 right-0 w-full overflow-hidden leading-none z-20 pointer-events-none select-none h-10 sm:h-14 md:h-16 lg:h-20">
        <svg
          viewBox="0 0 1440 80"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          className="relative block w-full h-full"
        >
          <defs>
            {/* Luminous blue/sky aura along the wave crest */}
            <linearGradient id="waveGlowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.15" />
              <stop offset="35%" stopColor="#60A5FA" stopOpacity="0.4" />
              <stop offset="65%" stopColor="#38BDF8" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#1D4ED8" stopOpacity="0.2" />
            </linearGradient>

            {/* Translucent glass under-swell */}
            <linearGradient id="waveGlassBackdrop" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.05" />
              <stop offset="50%" stopColor="#38BDF8" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#2563EB" stopOpacity="0.12" />
            </linearGradient>
            
            {/* Specular crest line highlight */}
            <linearGradient id="crestHighlight" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.3" />
              <stop offset="25%" stopColor="#38BDF8" stopOpacity="0.75" />
              <stop offset="50%" stopColor="#FFFFFF" stopOpacity="0.9" />
              <stop offset="75%" stopColor="#38BDF8" stopOpacity="0.75" />
              <stop offset="100%" stopColor="#60A5FA" stopOpacity="0.3" />
            </linearGradient>
          </defs>

          {/* BACK SWELL: Ambient subtle frosted wave glow */}
          <path
            d="M 0,35 C 240,55 480,10 720,35 C 960,60 1200,10 1440,35 L 1440,80 L 0,80 Z"
            fill="url(#waveGlassBackdrop)"
          />
          <path
            d="M 0,35 C 240,55 480,10 720,35 C 960,60 1200,10 1440,35"
            stroke="url(#waveGlowGradient)"
            strokeWidth="2"
          />

          {/* FOREGROUND MAIN WAVE: Balanced, compact pure white wave across the entire bottom */}
          <path
            d="M 0,42 C 240,65 480,18 720,42 C 960,68 1200,18 1440,42 L 1440,80 L 0,80 Z"
            fill="#FFFFFF"
          />

          {/* Luminous Specular Stroke along the wave rim */}
          <path
            d="M 0,42 C 240,65 480,18 720,42 C 960,68 1200,18 1440,42"
            stroke="url(#crestHighlight)"
            strokeWidth="1.5"
          />
        </svg>
      </div>
    </section>
  );
};

export default Hero;
