import React from 'react';

/**
 * CartoonNatureBackground
 * Responsive, high-performance cartoon nature landscape background.
 * Visual feeling: Bright blue sky, white clouds, green hills, green trees, grass,
 * colorful cartoon environment, children's storybook adventure style.
 * Uses SVG with preserveAspectRatio="xMidYMid slice" so it covers every screen without stretching or distortion.
 */
export const CartoonNatureBackground = () => {
  return (
    <div
      aria-hidden="true"
      className="nature-background-layer"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: -1,
        pointerEvents: 'none',
        overflow: 'hidden'
      }}
    >
      <svg
        viewBox="0 0 1920 1080"
        preserveAspectRatio="xMidYMid slice"
        style={{
          width: '100%',
          height: '100%',
          display: 'block'
        }}
      >
        <defs>
          {/* Sky Gradient */}
          <linearGradient id="natureSkyGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#38BDF8" />
            <stop offset="35%" stopColor="#7DD3FC" />
            <stop offset="65%" stopColor="#BAE6FD" />
            <stop offset="100%" stopColor="#E0F2FE" />
          </linearGradient>

          {/* Distant Hills Gradient */}
          <linearGradient id="hillBackGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#86EFAC" />
            <stop offset="100%" stopColor="#4ADE80" />
          </linearGradient>

          {/* Mid Hills Gradient */}
          <linearGradient id="hillMidGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#4ADE80" />
            <stop offset="100%" stopColor="#22C55E" />
          </linearGradient>

          {/* Foreground Hills Gradient */}
          <linearGradient id="hillFrontGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#22C55E" />
            <stop offset="100%" stopColor="#15803D" />
          </linearGradient>

          {/* Tree Leaf Gradient */}
          <linearGradient id="treeLeafGrad1" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#4ADE80" />
            <stop offset="100%" stopColor="#16A34A" />
          </linearGradient>
          <linearGradient id="treeLeafGrad2" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#22C55E" />
            <stop offset="100%" stopColor="#15803D" />
          </linearGradient>

          {/* Soft Cloud Shadow */}
          <filter id="softCloudGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#38BDF8" floodOpacity="0.15" />
          </filter>
        </defs>

        {/* 1. SKY */}
        <rect width="1920" height="1080" fill="url(#natureSkyGrad)" />

        {/* 2. CHEERFUL SUN WITH SUNBEAMS (Top Right) */}
        <g transform="translate(1720, 140)">
          {/* Subtle Sun Aura */}
          <circle cx="0" cy="0" r="110" fill="#FEF08A" opacity="0.35" />
          <circle cx="0" cy="0" r="80" fill="#FDE047" opacity="0.5" />
          
          {/* Sunbeams */}
          <g stroke="#F59E0B" strokeWidth="6" strokeLinecap="round" opacity="0.75">
            <line x1="0" y1="-85" x2="0" y2="-105" />
            <line x1="60" y1="-60" x2="75" y2="-75" />
            <line x1="85" y1="0" x2="105" y2="0" />
            <line x1="60" y1="60" x2="75" y2="75" />
            <line x1="0" y1="85" x2="0" y2="105" />
            <line x1="-60" y1="60" x2="-75" y2="75" />
            <line x1="-85" y1="0" x2="-105" y2="0" />
            <line x1="-60" y1="-60" x2="-75" y2="-75" />
          </g>

          {/* Sun Core */}
          <circle cx="0" cy="0" r="62" fill="#FBBF24" stroke="#F59E0B" strokeWidth="4" />
          
          {/* Cheerful Sun Face */}
          <circle cx="-16" cy="-8" r="5" fill="#78350F" />
          <circle cx="16" cy="-8" r="5" fill="#78350F" />
          <circle cx="-14" cy="-10" r="1.8" fill="#FFFFFF" />
          <circle cx="18" cy="-10" r="1.8" fill="#FFFFFF" />
          <path d="M-12 10 Q0 24 12 10" stroke="#78350F" strokeWidth="4" strokeLinecap="round" fill="none" />
          <ellipse cx="-24" cy="4" rx="6" ry="3.5" fill="#F43F5E" opacity="0.7" />
          <ellipse cx="24" cy="4" rx="6" ry="3.5" fill="#F43F5E" opacity="0.7" />
        </g>

        {/* 3. FAINT DISTANT STORYBOOK RAINBOW */}
        <g opacity="0.25">
          <path d="M200 800 A600 600 0 0 1 1400 800" stroke="#F43F5E" strokeWidth="18" fill="none" strokeLinecap="round" />
          <path d="M214 800 A586 586 0 0 1 1386 800" stroke="#FB923C" strokeWidth="18" fill="none" strokeLinecap="round" />
          <path d="M228 800 A572 572 0 0 1 1372 800" stroke="#FBBF24" strokeWidth="18" fill="none" strokeLinecap="round" />
          <path d="M242 800 A558 558 0 0 1 1358 800" stroke="#34D399" strokeWidth="18" fill="none" strokeLinecap="round" />
          <path d="M256 800 A544 544 0 0 1 1344 800" stroke="#60A5FA" strokeWidth="18" fill="none" strokeLinecap="round" />
          <path d="M270 800 A530 530 0 0 1 1330 800" stroke="#A78BFA" strokeWidth="18" fill="none" strokeLinecap="round" />
        </g>

        {/* 4. SOFT FLUFFY CARTOON CLOUDS */}
        {/* Cloud 1 (Top Left) */}
        <g transform="translate(180, 110)" filter="url(#softCloudGlow)">
          <ellipse cx="90" cy="50" rx="70" ry="34" fill="#FFFFFF" />
          <circle cx="55" cy="36" r="32" fill="#FFFFFF" />
          <circle cx="95" cy="24" r="36" fill="#FFFFFF" />
          <circle cx="130" cy="38" r="28" fill="#FFFFFF" />
          {/* Faint happy cloud face */}
          <circle cx="82" cy="48" r="2.5" fill="#94A3B8" />
          <circle cx="106" cy="48" r="2.5" fill="#94A3B8" />
          <path d="M90 54 Q94 58 98 54" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" fill="none" />
          <ellipse cx="74" cy="52" rx="3.5" ry="2" fill="#FDA4AF" opacity="0.8" />
          <ellipse cx="114" cy="52" rx="3.5" ry="2" fill="#FDA4AF" opacity="0.8" />
        </g>

        {/* Cloud 2 (Top Center) */}
        <g transform="translate(760, 80)" filter="url(#softCloudGlow)">
          <ellipse cx="110" cy="55" rx="85" ry="40" fill="#FFFFFF" opacity="0.95" />
          <circle cx="70" cy="40" r="38" fill="#FFFFFF" opacity="0.95" />
          <circle cx="115" cy="28" r="44" fill="#FFFFFF" opacity="0.95" />
          <circle cx="155" cy="44" r="34" fill="#FFFFFF" opacity="0.95" />
        </g>

        {/* Cloud 3 (Mid Right) */}
        <g transform="translate(1380, 210)" filter="url(#softCloudGlow)" opacity="0.9">
          <ellipse cx="80" cy="42" rx="65" ry="30" fill="#FFFFFF" />
          <circle cx="50" cy="30" r="26" fill="#FFFFFF" />
          <circle cx="85" cy="20" r="30" fill="#FFFFFF" />
          <circle cx="115" cy="32" r="24" fill="#FFFFFF" />
        </g>

        {/* Cloud 4 (Far Left) */}
        <g transform="translate(-40, 260)" filter="url(#softCloudGlow)" opacity="0.85">
          <ellipse cx="100" cy="45" rx="80" ry="35" fill="#FFFFFF" />
          <circle cx="60" cy="32" r="32" fill="#FFFFFF" />
          <circle cx="105" cy="22" r="36" fill="#FFFFFF" />
          <circle cx="140" cy="36" r="28" fill="#FFFFFF" />
        </g>

        {/* 5. DISTANT ROLLING GREEN HILLS (Back Layer) */}
        <path
          d="M-100 780 
             Q 280 620, 680 710 
             T 1420 680 
             Q 1720 650, 2020 720 
             L 2020 1080 
             L -100 1080 Z"
          fill="url(#hillBackGrad)"
          opacity="0.9"
        />

        {/* Distant Trees on Back Hill */}
        <g fill="#16A34A" opacity="0.85">
          {/* Tree cluster 1 */}
          <circle cx="340" cy="655" r="22" />
          <circle cx="360" cy="648" r="26" />
          <circle cx="385" cy="658" r="20" />
          {/* Tree cluster 2 */}
          <circle cx="1200" cy="690" r="24" />
          <circle cx="1225" cy="680" r="30" />
          <circle cx="1255" cy="692" r="22" />
        </g>

        {/* 6. MIDGROUND VIBRANT MEADOW HILLS */}
        <path
          d="M-100 850 
             Q 340 730, 820 810 
             T 1640 770 
             Q 1860 760, 2020 820 
             L 2020 1080 
             L -100 1080 Z"
          fill="url(#hillMidGrad)"
        />

        {/* Cute Storybook Trees on Mid Hill */}
        {/* Tree 1 (Left Ridge) */}
        <g transform="translate(180, 690)">
          {/* Trunk */}
          <rect x="24" y="60" width="14" height="48" rx="6" fill="#92400E" />
          <path d="M18 108 Q31 98 44 108" fill="#78350F" />
          {/* Crown */}
          <circle cx="16" cy="46" r="28" fill="url(#treeLeafGrad1)" />
          <circle cx="46" cy="46" r="28" fill="url(#treeLeafGrad1)" />
          <circle cx="31" cy="24" r="32" fill="url(#treeLeafGrad1)" />
          {/* Tiny apples */}
          <circle cx="22" cy="34" r="4" fill="#EF4444" />
          <circle cx="40" cy="38" r="4" fill="#EF4444" />
          <circle cx="30" cy="52" r="4" fill="#EF4444" />
        </g>

        {/* Tree 2 (Center-Right Ridge) */}
        <g transform="translate(1540, 680)">
          {/* Trunk */}
          <rect x="22" y="64" width="16" height="52" rx="6" fill="#92400E" />
          {/* Crown */}
          <circle cx="14" cy="48" r="30" fill="url(#treeLeafGrad2)" />
          <circle cx="46" cy="48" r="30" fill="url(#treeLeafGrad2)" />
          <circle cx="30" cy="22" r="34" fill="url(#treeLeafGrad2)" />
          {/* Little apples */}
          <circle cx="20" cy="36" r="4" fill="#F59E0B" />
          <circle cx="42" cy="34" r="4" fill="#F59E0B" />
        </g>

        {/* 7. FOREGROUND ROLLING LAWN HILLS */}
        <path
          d="M-100 930 
             Q 480 840, 1020 920 
             T 1820 880 
             Q 1960 880, 2020 910 
             L 2020 1080 
             L -100 1080 Z"
          fill="url(#hillFrontGrad)"
        />

        {/* 8. CUTE WILDFLOWERS & GRASS TUFTS ON FOREGROUND HILL */}
        {/* Daisy Flower 1 */}
        <g transform="translate(260, 890)">
          <path d="M12 24 Q12 12 14 0" stroke="#15803D" strokeWidth="3" fill="none" />
          <circle cx="14" cy="0" r="10" fill="#FFFFFF" />
          <circle cx="14" cy="0" r="5" fill="#FBBF24" />
        </g>
        {/* Pink Flower 2 */}
        <g transform="translate(380, 915)">
          <path d="M10 20 Q10 10 12 0" stroke="#15803D" strokeWidth="3" fill="none" />
          <circle cx="12" cy="0" r="9" fill="#F472B6" />
          <circle cx="12" cy="0" r="4.5" fill="#FDE047" />
        </g>
        {/* Yellow Buttercup 3 */}
        <g transform="translate(740, 930)">
          <circle cx="10" cy="0" r="8" fill="#FBBF24" />
          <circle cx="10" cy="0" r="4" fill="#D97706" />
        </g>
        {/* Daisy 4 */}
        <g transform="translate(1220, 920)">
          <circle cx="12" cy="0" r="10" fill="#FFFFFF" />
          <circle cx="12" cy="0" r="5" fill="#F59E0B" />
        </g>
        {/* Blossom 5 */}
        <g transform="translate(1680, 900)">
          <circle cx="12" cy="0" r="9" fill="#FB7185" />
          <circle cx="12" cy="0" r="4.5" fill="#FEF08A" />
        </g>

        {/* Grass Tuft details */}
        <g stroke="#166534" strokeWidth="2.5" strokeLinecap="round" opacity="0.6">
          <path d="M120 980 L115 965 M120 980 L123 962 M120 980 L130 968" />
          <path d="M520 990 L515 975 M520 990 L522 970 M520 990 L530 976" />
          <path d="M960 995 L955 980 M960 995 L964 976 M960 995 L970 982" />
          <path d="M1440 980 L1435 965 M1440 980 L1443 962 M1440 980 L1450 968" />
          <path d="M1840 990 L1835 975 M1840 990 L1844 972 M1840 990 L1850 978" />
        </g>
      </svg>
    </div>
  );
};

export default CartoonNatureBackground;
