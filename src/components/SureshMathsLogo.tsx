import React from 'react';

interface SureshMathsLogoProps {
  size?: number;
  className?: string;
}

export default function SureshMathsLogo({ size = 44, className = '' }: SureshMathsLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      className={`select-none shrink-0 ${className}`}
      aria-label="Suresh Maths Material Logo"
    >
      <defs>
        {/* Shiny gold metallic gradient */}
        <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFF2B2" />
          <stop offset="20%" stopColor="#F1C232" />
          <stop offset="50%" stopColor="#BF9000" />
          <stop offset="80%" stopColor="#F1C232" />
          <stop offset="100%" stopColor="#9E7800" />
        </linearGradient>

        {/* Shiny gold light highlights */}
        <linearGradient id="goldLight" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#AA7C11" />
          <stop offset="50%" stopColor="#F1C232" />
          <stop offset="100%" stopColor="#FFF7D6" />
        </linearGradient>

        {/* Glossy royal purple gradient */}
        <linearGradient id="purpleRing" x1="0%" y1="0%" x2="100%" y2="50%">
          <stop offset="0%" stopColor="#7F53D0" />
          <stop offset="50%" stopColor="#5B33A9" />
          <stop offset="100%" stopColor="#412182" />
        </linearGradient>

        {/* Center core background: orange-gold radial gradient */}
        <radialGradient id="centerCore" cx="50%" cy="50%" r="50%" fx="50%" fy="53%">
          <stop offset="0%" stopColor="#FF9F38" />
          <stop offset="45%" stopColor="#7E4717" />
          <stop offset="80%" stopColor="#2E2116" />
          <stop offset="100%" stopColor="#1B1C1D" />
        </radialGradient>

        {/* Left-to-right Top path for text (Clockwise, top arch) */}
        <path
          id="textPathTop"
          d="M 30,100 A 70,70 0 0,1 170,100"
          fill="none"
        />

        {/* Right-to-left Bottom path for text (Clockwise, bottom arch) - results in upright letters flowing left-to-right but tops pointing inside */}
        <path
          id="textPathBottom"
          d="M 170,100 A 70,70 0 0,1 30,100"
          fill="none"
        />

        {/* Drop shadow for 3D depth */}
        <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.4" />
        </filter>
        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* 1. Outer Gold Ring Frame */}
      <circle cx="100" cy="100" r="95" fill="none" stroke="url(#goldGradient)" strokeWidth="4" filter="url(#shadow)" />
      
      {/* Outer black accent line */}
      <circle cx="100" cy="100" r="92.5" fill="none" stroke="#121213" strokeWidth="1" />

      {/* 2. Split Outer Band */}
      {/* Top half band (White/Silver metallic) */}
      <path
        d="M 14,100 A 86,86 0 0,1 186,100 L 170,100 A 70,70 0 0,0 30,100 Z"
        fill="#EEEEEE"
        stroke="url(#goldGradient)"
        strokeWidth="1"
      />
      {/* Bottom half band (Glossy Purple) */}
      <path
        d="M 186,100 A 86,86 0 0,1 14,100 L 30,100 A 70,70 0 0,0 170,100 Z"
        fill="url(#purpleRing)"
        stroke="url(#goldGradient)"
        strokeWidth="1"
      />

      {/* 3. Outer Ring Text */}
      {/* Top Text: "SURESH MATHS MATERIAL" */}
      <text fontFamily="Inter, system-ui, sans-serif" fontWeight="900" fontSize="10.8" letterSpacing="0.6" fill="#1E3A8A">
        <textPath href="#textPathTop" startOffset="50%" textAnchor="middle">
          SURESH MATHS MATERIAL
        </textPath>
      </text>

      {/* Bottom Text: "LEARN MATHS EASY WAY" */}
      <text fontFamily="Inter, system-ui, sans-serif" fontWeight="900" fontSize="10.5" letterSpacing="0.8" fill="#FFFFFF">
        <textPath href="#textPathBottom" startOffset="50%" textAnchor="middle">
          LEARN MATHS EASY WAY
        </textPath>
      </text>

      {/* 4. Division Green Stars */}
      {/* Left Star (Centered at X=22, Y=100) */}
      <polygon
        points="22,93.5 24.5,98.5 29.8,98.5 25.5,101.5 27.2,106.8 22,103.8 16.8,106.8 18.5,101.5 14.2,98.5 19.5,98.5"
        fill="#22C55E"
        stroke="url(#goldGradient)"
        strokeWidth="0.8"
        filter="url(#glow)"
      />
      {/* Right Star (Centered at X=178, Y=100) */}
      <polygon
        points="178,93.5 180.5,98.5 185.8,98.5 181.5,101.5 183.2,106.8 178,103.8 172.8,106.8 174.5,101.5 170.2,98.5 175.5,98.5"
        fill="#22C55E"
        stroke="url(#goldGradient)"
        strokeWidth="0.8"
        filter="url(#glow)"
      />

      {/* 5. Central Inner Shield */}
      {/* Dark and gold core background */}
      <circle cx="100" cy="100" r="69.5" fill="url(#centerCore)" stroke="url(#goldGradient)" strokeWidth="2.5" />
      <circle cx="100" cy="100" r="67.5" fill="none" stroke="#121213" strokeWidth="0.8" />

      {/* 6. Gold laurel wreaths on both sides */}
      {/* Left branch leaves */}
      <g filter="url(#shadow)">
        <path d="M 53,124 C 45,121 44,113 50,113 C 54,113 55,119 53,124 Z" fill="url(#goldGradient)" />
        <path d="M 48,112 C 40,108 40,100 46,98 C 50,98 52,104 48,112 Z" fill="url(#goldGradient)" />
        <path d="M 47,98 C 39,92 41,84 47,83 C 51,83 52,90 47,98 Z" fill="url(#goldGradient)" />
        <path d="M 49,83 C 43,76 47,68 53,69 C 56,69 56,76 49,83 Z" fill="url(#goldGradient)" />
        <path d="M 57,71 C 52,64 58,57 64,60 C 66,60 65,67 57,71 Z" fill="url(#goldGradient)" />
      </g>

      {/* Right branch leaves */}
      <g filter="url(#shadow)">
        <path d="M 147,124 C 155,121 156,113 150,113 C 146,113 145,119 147,124 Z" fill="url(#goldGradient)" />
        <path d="M 152,112 C 160,108 160,100 154,98 C 150,98 148,104 152,112 Z" fill="url(#goldGradient)" />
        <path d="M 153,98 C 161,92 159,84 153,83 C 149,83 148,90 153,98 Z" fill="url(#goldGradient)" />
        <path d="M 151,83 C 157,76 153,68 147,69 C 144,69 144,76 151,83 Z" fill="url(#goldGradient)" />
        <path d="M 143,71 C 148,64 142,57 136,60 C 134,60 135,67 143,71 Z" fill="url(#goldGradient)" />
      </g>

      {/* 7. Open Mathematics Book */}
      <g filter="url(#shadow)">
        {/* Book pages 3D shadow depth/underlay */}
        <path d="M 64,124 C 74,120 85,118 100,121 C 115,118 126,120 136,124 L 136,127 Q 100,125 64,127 Z" fill="#785906" />
        <path d="M 65,122 C 75,118 85,116 100,119 C 115,116 125,118 135,122 L 135,125 Q 100,123 65,125 Z" fill="url(#goldGradient)" />

        {/* Left page white background */}
        <path d="M 100,119 C 85,115 75,118 64,122 L 64,96 C 75,92 85,89 100,93 Z" fill="#FFFFFF" stroke="url(#goldLight)" strokeWidth="1" />
        
        {/* Right page white background */}
        <path d="M 100,119 C 115,115 125,118 136,122 L 136,96 C 125,92 115,89 100,93 Z" fill="#FFFFFF" stroke="url(#goldLight)" strokeWidth="1" />

        {/* Pi Symbol on Left Page */}
        <path
          d="M 76,101 Q 82,99 87,101 M 79.5,101 Q 78.5,107 76,113 M 84.5,101 Q 85,107 85,110 Q 85,112.5 87,112.5"
          stroke="#3B82F6"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />

        {/* Infinity Symbol on Right Page */}
        <path
          d="M 118,107 C 114,102 108,102 108,107 C 108,112 114,112 118,107 C 122,102 128,102 128,107 C 128,112 122,112 118,107 Z"
          stroke="#3B82F6"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </g>

      {/* 8. Golden Graduation Cap (Mortarboard) */}
      <g filter="url(#shadow)">
        {/* Diamond top plate */}
        <polygon
          points="100,50 136,64 100,78 64,64"
          fill="url(#goldGradient)"
          stroke="#8A6704"
          strokeWidth="1"
        />
        {/* Shiny highlights for mortarboard edges */}
        <polygon
          points="100,51.5 133.5,64 100,76.5 66.5,64"
          fill="none"
          stroke="url(#goldLight)"
          strokeWidth="1"
          opacity="0.6"
        />
        
        {/* Cap base structure (skull cap shape under diamond) */}
        <path
          d="M 81,72 L 81,81 C 81,86 100,88.5 100,88.5 C 100,88.5 119,86 119,81 L 119,72 Q 100,76 81,72 Z"
          fill="url(#goldGradient)"
          stroke="#8A6704"
          strokeWidth="1"
        />
        {/* Cap interior deep line */}
        <path d="M 83,73 C 89,76 111,76 117,73" stroke="#4A3402" strokeWidth="1" fill="none" />

        {/* Hanging Tassel */}
        {/* Tassel cord */}
        <path d="M 100,64 Q 115,66 123,74" stroke="#FFFFFF" strokeWidth="1" fill="none" strokeLinecap="round" />
        {/* Tassel button */}
        <circle cx="123" cy="74" r="1.5" fill="url(#goldLight)" />
        {/* Tassel hairs / fringe */}
        <path d="M 123,75 L 125,85 M 123,75 L 123,86 M 123,75 L 121,85" stroke="url(#goldGradient)" strokeWidth="1.2" strokeLinecap="round" />
      </g>
    </svg>
  );
}
