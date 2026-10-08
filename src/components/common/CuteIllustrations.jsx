import React from 'react';

// Original Cute Cartoon Vector Illustrations for BrightPath
// Lightweight, scalable, high-performance SVG characters & elements
// Child-friendly, playful vector illustrations and mascots

// 1. Pip the Friendly Educational Owl 🦉
export const PipOwl = ({ size = 64, className = '', animate = true }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`${animate ? 'mascot-bounce' : ''} ${className}`}
    style={{ overflow: 'visible', display: 'inline-block' }}
  >
    {/* Body */}
    <ellipse cx="50" cy="56" rx="34" ry="36" fill="#6366F1" />
    <ellipse cx="50" cy="62" rx="24" ry="26" fill="#EEF2FF" />
    
    {/* Belly Feather Details */}
    <path d="M42 55 Q50 60 58 55" stroke="#818CF8" strokeWidth="2.5" strokeLinecap="round" fill="none" />
    <path d="M44 64 Q50 69 56 64" stroke="#818CF8" strokeWidth="2.5" strokeLinecap="round" fill="none" />
    <path d="M46 73 Q50 77 54 73" stroke="#818CF8" strokeWidth="2.5" strokeLinecap="round" fill="none" />

    {/* Ear Tufts */}
    <polygon points="26,24 38,36 20,38" fill="#4F46E5" />
    <polygon points="74,24 80,38 62,36" fill="#4F46E5" />

    {/* Cute Round Eye Patches */}
    <circle cx="37" cy="42" r="14" fill="#FFFFFF" />
    <circle cx="63" cy="42" r="14" fill="#FFFFFF" />

    {/* Eyes with Big Sparkles */}
    <circle cx="38" cy="43" r="8" fill="#1E1B4B" />
    <circle cx="62" cy="43" r="8" fill="#1E1B4B" />
    <circle cx="41" cy="40" r="3" fill="#FFFFFF" />
    <circle cx="65" cy="40" r="3" fill="#FFFFFF" />
    <circle cx="36" cy="46" r="1.5" fill="#FFFFFF" />
    <circle cx="60" cy="46" r="1.5" fill="#FFFFFF" />

    {/* Sweet Beak */}
    <polygon points="50,45 44,53 56,53" fill="#F59E0B" />

    {/* Rosy Cheeks */}
    <ellipse cx="27" cy="49" rx="5" ry="3" fill="#FDA4AF" opacity="0.8" />
    <ellipse cx="73" cy="49" rx="5" ry="3" fill="#FDA4AF" opacity="0.8" />

    {/* Cute Little Wings */}
    <path d="M16 54 C12 65 20 74 24 72 C22 65 20 58 24 52 Z" fill="#4F46E5" />
    <path d="M84 54 C88 65 80 74 76 72 C78 65 80 58 76 52 Z" fill="#4F46E5" />

    {/* Tiny Feet */}
    <ellipse cx="43" cy="91" rx="5" ry="3" fill="#F59E0B" />
    <ellipse cx="57" cy="91" rx="5" ry="3" fill="#F59E0B" />
  </svg>
);

// 2. Sunny the Cheerful Smiling Star ⭐
export const SunnyStar = ({ size = 56, className = '', animate = true }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`${animate ? 'star-twinkle' : ''} ${className}`}
    style={{ overflow: 'visible', display: 'inline-block' }}
  >
    {/* Glow Aura */}
    <circle cx="50" cy="50" r="42" fill="#FEF3C7" opacity="0.6" />
    
    {/* Star Body */}
    <path
      d="M50 8 
         L61 35 
         L90 37 
         L67 56 
         L74 85 
         L50 69 
         L26 85 
         L33 56 
         L10 37 
         L39 35 Z"
      fill="#FBBF24"
      stroke="#F59E0B"
      strokeWidth="3"
      strokeLinejoin="round"
    />

    {/* Happy Eyes */}
    <circle cx="43" cy="46" r="3.5" fill="#78350F" />
    <circle cx="57" cy="46" r="3.5" fill="#78350F" />
    <circle cx="44.5" cy="44.5" r="1.2" fill="#FFFFFF" />
    <circle cx="58.5" cy="44.5" r="1.2" fill="#FFFFFF" />

    {/* Rosy Pink Cheeks */}
    <ellipse cx="37" cy="51" rx="3.5" ry="2" fill="#F43F5E" opacity="0.75" />
    <ellipse cx="63" cy="51" rx="3.5" ry="2" fill="#F43F5E" opacity="0.75" />

    {/* Cheerful Smiling Mouth */}
    <path d="M46 52 Q50 58 54 52" stroke="#78350F" strokeWidth="2.5" strokeLinecap="round" fill="none" />
  </svg>
);

// 3. Barnaby the Gentle Learning Bear 🐻
export const BarnabyBear = ({ size = 64, className = '', animate = true }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`${animate ? 'mascot-bounce' : ''} ${className}`}
    style={{ overflow: 'visible', display: 'inline-block' }}
  >
    {/* Round Ears */}
    <circle cx="28" cy="28" r="14" fill="#B45309" />
    <circle cx="28" cy="28" r="8" fill="#FDE68A" />
    <circle cx="72" cy="28" r="14" fill="#B45309" />
    <circle cx="72" cy="28" r="8" fill="#FDE68A" />

    {/* Head */}
    <ellipse cx="50" cy="52" rx="36" ry="32" fill="#D97706" />

    {/* Muzzle */}
    <ellipse cx="50" cy="62" rx="18" ry="14" fill="#FEF3C7" />
    
    {/* Cute Heart Nose */}
    <path d="M47 56 C47 54 50 53 50 55 C50 53 53 54 53 56 C53 59 50 61 50 61 C50 61 47 59 47 56 Z" fill="#78350F" />
    
    {/* Smile */}
    <path d="M47 62 Q50 66 53 62" stroke="#78350F" strokeWidth="2" strokeLinecap="round" fill="none" />

    {/* Eyes with Sparkles */}
    <circle cx="36" cy="46" r="4" fill="#451A03" />
    <circle cx="64" cy="46" r="4" fill="#451A03" />
    <circle cx="37" cy="44.5" r="1.5" fill="#FFFFFF" />
    <circle cx="65" cy="44.5" r="1.5" fill="#FFFFFF" />

    {/* Cheeks */}
    <ellipse cx="28" cy="54" rx="4.5" ry="2.5" fill="#FB7185" opacity="0.8" />
    <ellipse cx="72" cy="54" rx="4.5" ry="2.5" fill="#FB7185" opacity="0.8" />
  </svg>
);

// 4. Hoppy the Playful Bunny 🐰
export const HoppyBunny = ({ size = 64, className = '', animate = true }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`${animate ? 'mascot-bounce' : ''} ${className}`}
    style={{ overflow: 'visible', display: 'inline-block' }}
  >
    {/* Long Bunny Ears */}
    <ellipse cx="38" cy="24" rx="8" ry="20" fill="#FED7AA" transform="rotate(-8 38 24)" />
    <ellipse cx="38" cy="24" rx="4.5" ry="14" fill="#FDA4AF" transform="rotate(-8 38 24)" />
    <ellipse cx="62" cy="24" rx="8" ry="20" fill="#FED7AA" transform="rotate(8 62 24)" />
    <ellipse cx="62" cy="24" rx="4.5" ry="14" fill="#FDA4AF" transform="rotate(8 62 24)" />

    {/* Head */}
    <ellipse cx="50" cy="56" rx="32" ry="28" fill="#FFEDD5" />

    {/* Cheerful Eyes */}
    <circle cx="38" cy="50" r="4" fill="#1E1B4B" />
    <circle cx="62" cy="50" r="4" fill="#1E1B4B" />
    <circle cx="39.5" cy="48.5" r="1.5" fill="#FFFFFF" />
    <circle cx="63.5" cy="48.5" r="1.5" fill="#FFFFFF" />

    {/* Cute Pink Nose */}
    <polygon points="50,56 46,60 54,60" fill="#F43F5E" />

    {/* Bunny Whiskers */}
    <line x1="24" y1="58" x2="36" y2="60" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="24" y1="64" x2="36" y2="63" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="64" y1="60" x2="76" y2="58" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="64" y1="63" x2="76" y2="64" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" />

    {/* Smile */}
    <path d="M47 62 Q50 66 53 62" stroke="#1E1B4B" strokeWidth="2" strokeLinecap="round" fill="none" />

    {/* Rosy Cheeks */}
    <ellipse cx="32" cy="56" rx="4" ry="2.5" fill="#FDA4AF" opacity="0.8" />
    <ellipse cx="68" cy="56" rx="4" ry="2.5" fill="#FDA4AF" opacity="0.8" />
  </svg>
);

// 5. Cheerful Rainbow with Pastel Smiling Clouds 🌈
export const RainbowClouds = ({ width = 120, height = 70, className = '' }) => (
  <svg
    width={width}
    height={height}
    viewBox="0 0 160 90"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={{ overflow: 'visible', display: 'inline-block' }}
  >
    {/* Rainbow Arcs */}
    <path d="M30 75 A50 50 0 0 1 130 75" stroke="#F43F5E" strokeWidth="9" strokeLinecap="round" fill="none" />
    <path d="M38 75 A42 42 0 0 1 122 75" stroke="#FB923C" strokeWidth="9" strokeLinecap="round" fill="none" />
    <path d="M46 75 A34 34 0 0 1 114 75" stroke="#FBBF24" strokeWidth="9" strokeLinecap="round" fill="none" />
    <path d="M54 75 A26 26 0 0 1 106 75" stroke="#34D399" strokeWidth="9" strokeLinecap="round" fill="none" />
    <path d="M62 75 A18 18 0 0 1 98 75" stroke="#60A5FA" strokeWidth="9" strokeLinecap="round" fill="none" />
    <path d="M70 75 A10 10 0 0 1 90 75" stroke="#A78BFA" strokeWidth="9" strokeLinecap="round" fill="none" />

    {/* Left Smiling Pastel Cloud */}
    <g transform="translate(10, 48)">
      <ellipse cx="25" cy="24" rx="20" ry="14" fill="#E0F2FE" />
      <circle cx="16" cy="18" r="11" fill="#E0F2FE" />
      <circle cx="32" cy="15" r="13" fill="#E0F2FE" />
      <circle cx="21" cy="22" r="2" fill="#475569" />
      <circle cx="29" cy="22" r="2" fill="#475569" />
      <path d="M23 26 Q25 29 27 26" stroke="#475569" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <ellipse cx="16" cy="24" rx="2.5" ry="1.5" fill="#FDA4AF" />
      <ellipse cx="34" cy="24" rx="2.5" ry="1.5" fill="#FDA4AF" />
    </g>

    {/* Right Smiling Pastel Cloud */}
    <g transform="translate(95, 48)">
      <ellipse cx="25" cy="24" rx="20" ry="14" fill="#FFFFFF" />
      <circle cx="16" cy="18" r="11" fill="#FFFFFF" />
      <circle cx="32" cy="15" r="13" fill="#FFFFFF" />
      <circle cx="21" cy="22" r="2" fill="#475569" />
      <circle cx="29" cy="22" r="2" fill="#475569" />
      <path d="M23 26 Q25 29 27 26" stroke="#475569" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <ellipse cx="16" cy="24" rx="2.5" ry="1.5" fill="#FDA4AF" />
      <ellipse cx="34" cy="24" rx="2.5" ry="1.5" fill="#FDA4AF" />
    </g>
  </svg>
);

// 6. Smiling Victory Trophy Mascot 🏆
export const TrophyMascot = ({ size = 60, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={{ overflow: 'visible', display: 'inline-block' }}
  >
    {/* Base Pedestal */}
    <rect x="30" y="80" width="40" height="12" rx="4" fill="#475569" />
    <rect x="36" y="74" width="28" height="8" rx="2" fill="#64748B" />
    <rect x="44" y="60" width="12" height="16" fill="#F59E0B" />

    {/* Handles */}
    <path d="M26 30 C12 30 12 52 28 52" stroke="#F59E0B" strokeWidth="6" strokeLinecap="round" fill="none" />
    <path d="M74 30 C88 30 88 52 72 52" stroke="#F59E0B" strokeWidth="6" strokeLinecap="round" fill="none" />

    {/* Golden Cup Body */}
    <path d="M24 20 L76 20 L72 54 C72 64 62 68 50 68 C38 68 28 64 28 54 Z" fill="#FBBF24" />
    <ellipse cx="50" cy="20" rx="26" ry="6" fill="#FDE68A" />

    {/* Smiling Face */}
    <circle cx="43" cy="38" r="3" fill="#78350F" />
    <circle cx="57" cy="38" r="3" fill="#78350F" />
    <circle cx="44" cy="37" r="1" fill="#FFFFFF" />
    <circle cx="58" cy="37" r="1" fill="#FFFFFF" />
    <path d="M46 44 Q50 50 54 44" stroke="#78350F" strokeWidth="2.5" strokeLinecap="round" fill="none" />
    <ellipse cx="37" cy="42" rx="3" ry="1.8" fill="#F43F5E" opacity="0.8" />
    <ellipse cx="63" cy="42" rx="3" ry="1.8" fill="#F43F5E" opacity="0.8" />
    
    {/* Little Star Badge */}
    <polygon points="50,26 52,30 56,31 53,34 54,38 50,36 46,38 47,34 44,31 48,30" fill="#FEF08A" />
  </svg>
);

// 7. Cute Calendar Buddy (for Total Sessions) 📅
export const CuteCalendarBuddy = ({ size = 52, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 80 80"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={{ overflow: 'visible', display: 'inline-block' }}
  >
    {/* Ring Binders */}
    <rect x="22" y="8" width="6" height="12" rx="3" fill="#6366F1" />
    <rect x="52" y="8" width="6" height="12" rx="3" fill="#6366F1" />

    {/* Main Card */}
    <rect x="10" y="16" width="60" height="54" rx="14" fill="#FFFFFF" stroke="#E0E7FF" strokeWidth="2.5" />
    
    {/* Header Top Ribbon */}
    <path d="M10 28 C10 20 16 16 24 16 L56 16 C64 16 70 20 70 28 L70 32 L10 32 Z" fill="#6366F1" />

    {/* Smiling Face in Center */}
    <circle cx="34" cy="46" r="2.8" fill="#312E81" />
    <circle cx="46" cy="46" r="2.8" fill="#312E81" />
    <path d="M37 52 Q40 56 43 52" stroke="#312E81" strokeWidth="2" strokeLinecap="round" fill="none" />
    <ellipse cx="29" cy="49" rx="2.5" ry="1.5" fill="#FDA4AF" />
    <ellipse cx="51" cy="49" rx="2.5" ry="1.5" fill="#FDA4AF" />

    {/* Sparkles / Activity Stars */}
    <polygon points="40,20 41,23 44,24 41,26 42,29 40,27 38,29 39,26 36,24 39,23" fill="#FDE68A" />
    <circle cx="26" cy="60" r="3.5" fill="#10B981" />
    <circle cx="40" cy="60" r="3.5" fill="#3B82F6" />
    <circle cx="54" cy="60" r="3.5" fill="#F59E0B" />
  </svg>
);

// 8. Cute Detective Eye / Magnifying Glass (for Observational Patterns) 🔍
export const CuteMagnifierBuddy = ({ size = 52, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 80 80"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={{ overflow: 'visible', display: 'inline-block' }}
  >
    {/* Handle */}
    <rect x="46" y="46" width="10" height="24" rx="5" transform="rotate(-45 46 46)" fill="#FB923C" stroke="#EA580C" strokeWidth="2" />
    
    {/* Glass Rim */}
    <circle cx="34" cy="34" r="24" fill="#FEF3C7" stroke="#F97316" strokeWidth="4" />
    
    {/* Inner Gentle Smiling Eye */}
    <ellipse cx="34" cy="34" rx="14" ry="11" fill="#FFFFFF" />
    <circle cx="34" cy="34" r="7" fill="#C2410C" />
    <circle cx="36" cy="32" r="2.5" fill="#FFFFFF" />
    <circle cx="32" cy="36" r="1" fill="#FFFFFF" />

    {/* Little Heart Sparkle */}
    <path d="M44 14 C44 11 47 10 48.5 12 C50 10 53 11 53 14 C53 17 48.5 20 48.5 20 C48.5 20 44 17 44 14 Z" fill="#F43F5E" />
  </svg>
);

// 9. Cute Smiling Emotion Buddy (for Recent Expression Trend) 😊
export const CuteEmotionBuddy = ({ size = 52, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 80 80"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={{ overflow: 'visible', display: 'inline-block' }}
  >
    {/* Outer Face Glow */}
    <circle cx="40" cy="40" r="32" fill="#F5F3FF" stroke="#A78BFA" strokeWidth="3" />
    
    {/* Inner Cheerful Face */}
    <circle cx="40" cy="40" r="26" fill="#DDD6FE" />

    {/* Big Happy Arch Eyes */}
    <path d="M29 36 Q34 29 39 36" stroke="#4C1D95" strokeWidth="3" strokeLinecap="round" fill="none" />
    <path d="M41 36 Q46 29 51 36" stroke="#4C1D95" strokeWidth="3" strokeLinecap="round" fill="none" />

    {/* Bright Happy Open Smile */}
    <path d="M31 44 Q40 56 49 44 Z" fill="#7C3AED" />
    <path d="M35 48 Q40 53 45 48" stroke="#F43F5E" strokeWidth="2.5" strokeLinecap="round" fill="#FDA4AF" />

    {/* Rosy Cheeks */}
    <ellipse cx="25" cy="43" rx="4" ry="2.2" fill="#F43F5E" opacity="0.8" />
    <ellipse cx="55" cy="43" rx="4" ry="2.2" fill="#F43F5E" opacity="0.8" />
  </svg>
);

// 10. Floating Balloons Cluster 🎈
export const CuteBalloons = ({ size = 56, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 80 80"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={{ overflow: 'visible', display: 'inline-block' }}
  >
    {/* Strings */}
    <path d="M30 46 Q35 60 40 70" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" fill="none" />
    <path d="M50 46 Q45 60 40 70" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" fill="none" />
    <path d="M40 42 L40 70" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" fill="none" />

    {/* Balloon 1: Pink */}
    <ellipse cx="30" cy="30" rx="14" ry="17" fill="#F472B6" />
    <polygon points="30,46 27,50 33,50" fill="#DB2777" />
    <ellipse cx="25" cy="23" rx="3" ry="6" fill="#FFFFFF" opacity="0.6" transform="rotate(-20 25 23)" />

    {/* Balloon 2: Cyan */}
    <ellipse cx="50" cy="28" rx="14" ry="17" fill="#38BDF8" />
    <polygon points="50,44 47,48 53,48" fill="#0284C7" />
    <ellipse cx="45" cy="21" rx="3" ry="6" fill="#FFFFFF" opacity="0.6" transform="rotate(-20 45 21)" />

    {/* Balloon 3: Yellow Center */}
    <ellipse cx="40" cy="22" rx="13" ry="16" fill="#FBBF24" />
    <polygon points="40,37 37,41 43,41" fill="#D97706" />
    <ellipse cx="36" cy="16" rx="2.5" ry="5" fill="#FFFFFF" opacity="0.7" transform="rotate(-20 36 16)" />
  </svg>
);

// 11. Milo the Cheerful Explorer Mouse 🐭
export const MiloMouse = ({ size = 64, className = '', animate = true }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`${animate ? 'mascot-bounce' : ''} ${className}`}
    style={{ overflow: 'visible', display: 'inline-block' }}
  >
    {/* Big Round Mouse Ears */}
    <circle cx="22" cy="28" r="20" fill="#94A3B8" />
    <circle cx="22" cy="28" r="13" fill="#FDA4AF" />
    <circle cx="78" cy="28" r="20" fill="#94A3B8" />
    <circle cx="78" cy="28" r="13" fill="#FDA4AF" />

    {/* Head */}
    <ellipse cx="50" cy="56" rx="32" ry="28" fill="#CBD5E1" />

    {/* Explorer Scarf */}
    <path d="M34 76 Q50 86 66 76 Q58 84 50 85 Q42 84 34 76 Z" fill="#F59E0B" />
    <circle cx="50" cy="81" r="3.5" fill="#DC2626" />

    {/* Cheerful Eyes with Big Glints */}
    <ellipse cx="38" cy="50" rx="4.5" ry="5.5" fill="#0F172A" />
    <ellipse cx="62" cy="50" rx="4.5" ry="5.5" fill="#0F172A" />
    <circle cx="40" cy="48" r="2" fill="#FFFFFF" />
    <circle cx="64" cy="48" r="2" fill="#FFFFFF" />
    <circle cx="37" cy="52" r="1" fill="#FFFFFF" />
    <circle cx="61" cy="52" r="1" fill="#FFFFFF" />

    {/* Rosy Cheeks */}
    <ellipse cx="28" cy="58" rx="5" ry="3" fill="#FB7185" opacity="0.8" />
    <ellipse cx="72" cy="58" rx="5" ry="3" fill="#FB7185" opacity="0.8" />

    {/* Snout & Whiskers */}
    <polygon points="50,56 45,61 55,61" fill="#F43F5E" />
    <path d="M47 63 Q50 67 53 63" stroke="#0F172A" strokeWidth="2" strokeLinecap="round" fill="none" />
    
    {/* Whiskers */}
    <line x1="22" y1="58" x2="36" y2="60" stroke="#64748B" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="20" y1="64" x2="36" y2="63" stroke="#64748B" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="64" y1="60" x2="78" y2="58" stroke="#64748B" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="64" y1="63" x2="80" y2="64" stroke="#64748B" strokeWidth="1.5" strokeLinecap="round" />

    {/* Sweet Front Tooth */}
    <rect x="48.5" y="64" width="3" height="3" rx="1" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="0.5" />
  </svg>
);

// 12. Maya the Friendly Explorer Girl 🎒👧
export const MayaExplorer = ({ size = 64, className = '', animate = true }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`${animate ? 'mascot-wave' : ''} ${className}`}
    style={{ overflow: 'visible', display: 'inline-block' }}
  >
    {/* Pigtails */}
    <circle cx="18" cy="50" r="12" fill="#78350F" />
    <circle cx="82" cy="50" r="12" fill="#78350F" />
    <circle cx="23" cy="46" r="4" fill="#F59E0B" />
    <circle cx="77" cy="46" r="4" fill="#F59E0B" />

    {/* Face */}
    <ellipse cx="50" cy="54" rx="28" ry="26" fill="#FDE68A" />

    {/* Hair Fringe */}
    <path d="M26 44 Q50 36 74 44 Q66 52 50 48 Q34 52 26 44 Z" fill="#78350F" />

    {/* Explorer Safari Hat */}
    <ellipse cx="50" cy="32" rx="38" ry="12" fill="#D97706" />
    <path d="M26 32 C26 16 36 10 50 10 C64 10 74 16 74 32 Z" fill="#F59E0B" />
    <path d="M26 30 Q50 34 74 30" stroke="#B45309" strokeWidth="3" fill="none" />
    
    {/* Adventure Leaf Badge on Hat */}
    <path d="M48 22 C48 18 52 16 52 20 C52 24 48 24 48 22 Z" fill="#10B981" />

    {/* Cheerful Cartoon Eyes */}
    <circle cx="39" cy="52" r="4.5" fill="#1E1B4B" />
    <circle cx="61" cy="52" r="4.5" fill="#1E1B4B" />
    <circle cx="40.5" cy="50.5" r="1.8" fill="#FFFFFF" />
    <circle cx="62.5" cy="50.5" r="1.8" fill="#FFFFFF" />

    {/* Rosy Cheeks */}
    <ellipse cx="32" cy="59" rx="4" ry="2.5" fill="#F43F5E" opacity="0.8" />
    <ellipse cx="68" cy="59" rx="4" ry="2.5" fill="#F43F5E" opacity="0.8" />

    {/* Happy Smile */}
    <path d="M44 60 Q50 67 56 60" stroke="#78350F" strokeWidth="2.5" strokeLinecap="round" fill="none" />

    {/* Adventurer Scarf Collar */}
    <path d="M38 76 Q50 82 62 76" stroke="#10B981" strokeWidth="4" strokeLinecap="round" fill="none" />

    {/* Cheerful Waving Hand */}
    <circle cx="86" cy="38" r="6" fill="#FDE68A" />
    <path d="M82 44 Q85 39 88 43" stroke="#D97706" strokeWidth="1.5" fill="none" />
  </svg>
);

// 13. Penny the Cheerful Cartoon Piggy 🐷
export const PennyPig = ({ size = 64, className = '', animate = true }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`${animate ? 'mascot-bounce' : ''} ${className}`}
    style={{ overflow: 'visible', display: 'inline-block' }}
  >
    {/* Floppy Pig Ears */}
    <path d="M22 28 C16 16 32 18 36 28 C34 36 26 34 22 28 Z" fill="#F472B6" />
    <path d="M25 26 C21 19 31 20 33 26 Z" fill="#FBCFE8" />
    <path d="M78 28 C84 16 68 18 64 28 C66 36 74 34 78 28 Z" fill="#F472B6" />
    <path d="M75 26 C79 19 69 20 67 26 Z" fill="#FBCFE8" />

    {/* Head */}
    <circle cx="50" cy="54" rx="32" ry="30" fill="#FBCFE8" />

    {/* Piggy Snout */}
    <ellipse cx="50" cy="59" rx="14" ry="10" fill="#F472B6" />
    <ellipse cx="45" cy="59" rx="2.5" ry="4" fill="#BE185D" />
    <ellipse cx="55" cy="59" rx="2.5" ry="4" fill="#BE185D" />

    {/* Friendly Cartoon Eyes */}
    <circle cx="36" cy="46" r="4" fill="#1E1B4B" />
    <circle cx="64" cy="46" r="4" fill="#1E1B4B" />
    <circle cx="37.5" cy="44.5" r="1.5" fill="#FFFFFF" />
    <circle cx="65.5" cy="44.5" r="1.5" fill="#FFFFFF" />

    {/* Big Blushing Rosy Cheeks */}
    <ellipse cx="26" cy="55" rx="5" ry="3" fill="#FDA4AF" opacity="0.85" />
    <ellipse cx="74" cy="55" rx="5" ry="3" fill="#FDA4AF" opacity="0.85" />

    {/* Gentle Smile */}
    <path d="M44 72 Q50 76 56 72" stroke="#9D174D" strokeWidth="2" strokeLinecap="round" fill="none" />

    {/* Cute Daisy Flower on Ear */}
    <circle cx="38" cy="22" r="5" fill="#FFFFFF" />
    <circle cx="38" cy="22" r="2.5" fill="#F59E0B" />
  </svg>
);

// 14. Cleo the Playful Cartoon Kitten 🐱
export const CleoCat = ({ size = 64, className = '', animate = true }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`${animate ? 'mascot-bounce' : ''} ${className}`}
    style={{ overflow: 'visible', display: 'inline-block' }}
  >
    {/* Pointy Cat Ears */}
    <polygon points="20,44 32,16 44,36" fill="#FDBA74" />
    <polygon points="26,38 33,22 40,34" fill="#FDA4AF" />
    <polygon points="80,44 68,16 56,36" fill="#FDBA74" />
    <polygon points="74,38 67,22 60,34" fill="#FDA4AF" />

    {/* Head */}
    <ellipse cx="50" cy="55" rx="32" ry="28" fill="#FED7AA" />

    {/* Large Sparkly Eyes */}
    <circle cx="37" cy="48" r="5" fill="#047857" />
    <circle cx="63" cy="48" r="5" fill="#047857" />
    <circle cx="37" cy="48" r="3" fill="#064E3B" />
    <circle cx="63" cy="48" r="3" fill="#064E3B" />
    <circle cx="38.5" cy="46" r="1.8" fill="#FFFFFF" />
    <circle cx="64.5" cy="46" r="1.8" fill="#FFFFFF" />

    {/* Heart Nose */}
    <polygon points="50,56 46,60 54,60" fill="#F43F5E" />

    {/* Mouth */}
    <path d="M46 62 Q50 65 54 62" stroke="#9A3412" strokeWidth="2" strokeLinecap="round" fill="none" />

    {/* Whiskers */}
    <line x1="20" y1="58" x2="35" y2="60" stroke="#9A3412" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="18" y1="64" x2="35" y2="63" stroke="#9A3412" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="65" y1="60" x2="80" y2="58" stroke="#9A3412" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="65" y1="63" x2="82" y2="64" stroke="#9A3412" strokeWidth="1.5" strokeLinecap="round" />

    {/* Rosy Cheeks */}
    <ellipse cx="28" cy="57" rx="4.5" ry="2.5" fill="#FDA4AF" opacity="0.8" />
    <ellipse cx="72" cy="57" rx="4.5" ry="2.5" fill="#FDA4AF" opacity="0.8" />

    {/* Collar Ribbon with Golden Bell */}
    <path d="M34 76 Q50 84 66 76" stroke="#EF4444" strokeWidth="4" strokeLinecap="round" fill="none" />
    <circle cx="50" cy="82" r="5" fill="#FBBF24" stroke="#D97706" strokeWidth="1" />
  </svg>
);

// 15. Cute Nature Blossom Flower 🌸
export const CuteFlower = ({ size = 42, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 60 60"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={{ overflow: 'visible', display: 'inline-block' }}
  >
    {/* Petals */}
    <circle cx="30" cy="14" r="10" fill="#F472B6" />
    <circle cx="44" cy="22" r="10" fill="#F472B6" />
    <circle cx="44" cy="38" r="10" fill="#F472B6" />
    <circle cx="30" cy="46" r="10" fill="#F472B6" />
    <circle cx="16" cy="38" r="10" fill="#F472B6" />
    <circle cx="16" cy="22" r="10" fill="#F472B6" />
    
    {/* Center Face */}
    <circle cx="30" cy="30" r="12" fill="#FBBF24" />
    <circle cx="26" cy="28" r="1.5" fill="#78350F" />
    <circle cx="34" cy="28" r="1.5" fill="#78350F" />
    <path d="M28 32 Q30 35 32 32" stroke="#78350F" strokeWidth="1.5" strokeLinecap="round" fill="none" />
  </svg>
);

// 16. Smiling Cheerful Sun ☀️
export const CuteSun = ({ size = 56, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 80 80"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`${className}`}
    style={{ overflow: 'visible', display: 'inline-block' }}
  >
    {/* Sun Rays */}
    <g stroke="#F59E0B" strokeWidth="4" strokeLinecap="round">
      <line x1="40" y1="8" x2="40" y2="18" />
      <line x1="40" y1="62" x2="40" y2="72" />
      <line x1="8" y1="40" x2="18" y2="40" />
      <line x1="62" y1="40" x2="72" y2="40" />
      <line x1="17" y1="17" x2="24" y2="24" />
      <line x1="56" y1="56" x2="63" y2="63" />
      <line x1="17" y1="63" x2="24" y2="56" />
      <line x1="56" y1="24" x2="63" y2="17" />
    </g>

    {/* Sun Body */}
    <circle cx="40" cy="40" r="20" fill="#FBBF24" />
    <circle cx="34" cy="37" r="2.5" fill="#78350F" />
    <circle cx="46" cy="37" r="2.5" fill="#78350F" />
    <path d="M36 43 Q40 48 44 43" stroke="#78350F" strokeWidth="2" strokeLinecap="round" fill="none" />
    <ellipse cx="29" cy="41" rx="2.5" ry="1.5" fill="#F43F5E" />
    <ellipse cx="51" cy="41" rx="2.5" ry="1.5" fill="#F43F5E" />
  </svg>
);

// 17. Confetti and Stars Celebration Particle Burst 🎉✨
export const ConfettiCelebration = ({ size = 120, className = '' }) => (
  <svg
    width={size}
    height={size * 0.75}
    viewBox="0 0 160 120"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={{ overflow: 'visible', display: 'inline-block' }}
  >
    {/* Stars */}
    <polygon points="30,20 33,28 42,29 35,35 37,44 30,39 23,44 25,35 18,29 27,28" fill="#FBBF24" />
    <polygon points="130,25 132,31 139,32 134,36 135,43 130,39 125,43 126,36 121,32 128,31" fill="#38BDF8" />
    <polygon points="80,12 82,18 89,19 84,23 85,30 80,26 75,30 76,23 71,19 78,18" fill="#EC4899" />
    <polygon points="50,70 51,74 56,75 52,78 53,83 50,80 47,83 48,78 44,75 49,74" fill="#10B981" />
    <polygon points="115,75 116,79 121,80 117,83 118,88 115,85 112,88 113,83 109,80 114,79" fill="#F59E0B" />

    {/* Ribbons & Confetti */}
    <rect x="20" y="55" width="8" height="14" rx="2" fill="#F43F5E" transform="rotate(25 20 55)" />
    <rect x="65" y="45" width="7" height="16" rx="2" fill="#8B5CF6" transform="rotate(-35 65 45)" />
    <rect x="100" y="40" width="8" height="15" rx="2" fill="#10B981" transform="rotate(40 100 40)" />
    <rect x="140" y="60" width="7" height="13" rx="2" fill="#FBBF24" transform="rotate(-20 140 60)" />

    <circle cx="45" cy="35" r="3.5" fill="#38BDF8" />
    <circle cx="115" cy="20" r="3" fill="#EC4899" />
    <circle cx="95" cy="70" r="3.5" fill="#6366F1" />
    <circle cx="70" cy="85" r="4" fill="#F59E0B" />
  </svg>
);

