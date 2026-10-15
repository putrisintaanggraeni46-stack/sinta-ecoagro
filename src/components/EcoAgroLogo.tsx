import React from 'react';

interface EcoAgroLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  onClick?: () => void;
  title?: string;
  dark?: boolean;
}

export const EcoAgroLogo: React.FC<EcoAgroLogoProps> = ({
  className = '',
  size = 'md',
  showText = true,
  onClick,
  title = 'EcoAgro - Toko Pertanian',
  dark = false,
}) => {
  // Dimension presets for emblem
  const sizeMap = {
    sm: { emblem: 'w-8 h-8', title: 'text-lg', subtitle: 'text-[9px]' },
    md: { emblem: 'w-10 h-10 sm:w-11 sm:h-11', title: 'text-xl sm:text-2xl', subtitle: 'text-[11px]' },
    lg: { emblem: 'w-14 h-14 sm:w-16 sm:h-16', title: 'text-2xl sm:text-3xl', subtitle: 'text-xs' },
    xl: { emblem: 'w-20 h-20 sm:w-24 sm:h-24', title: 'text-4xl', subtitle: 'text-sm' },
  };

  const currentSize = sizeMap[size];

  return (
    <div
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(e) => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick();
        }
      }}
      title={title}
      className={`inline-flex items-center gap-3 select-none transition-transform duration-150 ${
        onClick ? 'cursor-pointer active:scale-95' : ''
      } ${className}`}
    >
      {/* Exact Circular Emblem matching uploaded EcoAgro Logo */}
      <div className={`relative shrink-0 ${currentSize.emblem}`}>
        <svg
          viewBox="0 0 300 300"
          className="w-full h-full drop-shadow-xs"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <clipPath id="innerCircleClip">
              <circle cx="150" cy="150" r="130" />
            </clipPath>
          </defs>

          {/* Background circular subtle glow if needed */}
          <circle cx="150" cy="150" r="140" fill="#FFFFFF" />

          {/* Outer Top-Left-to-Top-Right Green Crescent Arc */}
          <path
            d="M 52,185 C 40,140 50,85 90,52 C 130,20 185,20 225,52 C 248,70 262,95 265,125 C 265,128 260,132 255,131 C 240,128 227,118 217,106 C 190,73 140,68 107,95 C 87,112 77,138 79,165 C 79,174 74,182 65,185 C 60,186 54,187 52,185 Z"
            fill="#38A149"
          />

          {/* Terraced Agricultural Field Furrows (Bottom Half of Circle) */}
          <g clipPath="url(#innerCircleClip)">
            {/* 1. Topmost Dark Forest Ridge */}
            <path
              d="M 20,185 Q 150,150 280,175 L 280,205 Q 160,185 20,215 Z"
              fill="#184E28"
            />

            {/* Separator Line 1 */}
            <path
              d="M 20,215 Q 160,185 280,205"
              stroke="#FFFFFF"
              strokeWidth="5"
              strokeLinecap="round"
            />

            {/* 2. Second Ridge (Medium Forest Green) */}
            <path
              d="M 20,215 Q 160,185 280,205 L 280,235 Q 170,215 20,245 Z"
              fill="#267336"
            />

            {/* Separator Line 2 */}
            <path
              d="M 20,245 Q 170,215 280,235"
              stroke="#FFFFFF"
              strokeWidth="5"
              strokeLinecap="round"
            />

            {/* 3. Third Ridge (Lush Leaf Green) */}
            <path
              d="M 20,245 Q 170,215 280,235 L 280,265 Q 180,245 20,275 Z"
              fill="#3A9348"
            />

            {/* Separator Line 3 */}
            <path
              d="M 20,275 Q 180,245 280,265"
              stroke="#FFFFFF"
              strokeWidth="5"
              strokeLinecap="round"
            />

            {/* 4. Fourth Bottom Ridge (Bright Fresh Green) */}
            <path
              d="M 20,275 Q 180,245 280,265 L 280,300 L 20,300 Z"
              fill="#5DB351"
            />
          </g>

          {/* Center Sprout */}
          {/* Stem */}
          <path
            d="M 146,180 Q 148,150 150,135 Q 152,150 154,180 Z"
            fill="#267336"
          />

          {/* Right Shadow Leaf (Deep Forest Green) */}
          <path
            d="M 150,152 C 175,148 215,150 245,158 C 230,182 185,192 150,172 Z"
            fill="#184E28"
          />

          {/* Left Top Leaf (Vibrant Green) */}
          <path
            d="M 148,142 C 135,115 100,98 84,93 C 92,126 122,149 148,142 Z"
            fill="#43A047"
          />

          {/* Right Top Leaf (Vibrant Green) */}
          <path
            d="M 151,142 C 165,110 205,78 232,78 C 230,111 195,144 151,142 Z"
            fill="#43A047"
          />
        </svg>
      </div>

      {/* Typography: ECOAGRO and — Toko Pertanian — */}
      {showText && (
        <div className="flex flex-col leading-none">
          <span
            className={`${currentSize.title} font-black tracking-tight uppercase font-sans ${
              dark ? 'text-white' : 'text-[#1B4332]'
            }`}
          >
            EcoAgro
          </span>
          <div
            className={`flex items-center gap-1.5 mt-0.5 ${
              dark ? 'text-[#D8F3DC]' : 'text-[#1B4332]/85'
            }`}
          >
            <span
              className={`w-2.5 h-[1.5px] rounded-full inline-block ${
                dark ? 'bg-[#74C69D]' : 'bg-[#1B4332]/60'
              }`}
            />
            <span className={`${currentSize.subtitle} font-bold tracking-wider capitalize`}>
              Toko Pertanian
            </span>
            <span
              className={`w-2.5 h-[1.5px] rounded-full inline-block ${
                dark ? 'bg-[#74C69D]' : 'bg-[#1B4332]/60'
              }`}
            />
          </div>
        </div>
      )}
    </div>
  );
};
