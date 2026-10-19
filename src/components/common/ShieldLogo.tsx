import React from 'react'

interface ShieldLogoProps {
  size?: number
  showText?: boolean
  className?: string
  variant?: 'svg' | 'image'
}

export const ShieldLogo: React.FC<ShieldLogoProps> = ({
  size = 32,
  showText = true,
  className = '',
  variant = 'image',
}) => {
  return (
    <div
      className={`flex items-center gap-2.5 select-none whitespace-nowrap flex-shrink-0 ${className}`}
    >
      {variant === 'image' ? (
        <img
          src="/logo-48.png"
          alt="Voltrex Cosmos Shield"
          width={size}
          height={size}
          className="rounded-lg flex-shrink-0 border border-cyan-500/30 object-cover"
        />
      ) : (
        <svg
          width={size}
          height={size}
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
          className="flex-shrink-0"
        >
          <defs>
            <linearGradient
              id="shieldGrad"
              x1="6"
              y1="4"
              x2="42"
              y2="44"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#4338CA" />
              <stop offset="0.5" stopColor="#1E1B4B" />
              <stop offset="1" stopColor="#0B132B" />
            </linearGradient>
            <linearGradient
              id="cyanStroke"
              x1="12"
              y1="8"
              x2="36"
              y2="40"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#22D3EE" />
              <stop offset="1" stopColor="#06B6D4" stopOpacity="0.4" />
            </linearGradient>
          </defs>

          {/* Shield Outer Path */}
          <path
            d="M24 4L8 10V22C8 32.5 14.8 42.2 24 44C33.2 42.2 40 32.5 40 22V10L24 4Z"
            fill="url(#shieldGrad)"
            stroke="url(#cyanStroke)"
            strokeWidth="2.2"
            strokeLinejoin="round"
          />

          {/* Inner Cosmos Orbit / Crest */}
          <ellipse
            cx="24"
            cy="23"
            rx="11"
            ry="4"
            transform="rotate(-25 24 23)"
            stroke="#06B6D4"
            strokeWidth="1.5"
            strokeDasharray="2 3"
          />
          <circle cx="24" cy="23" r="3.5" fill="#22D3EE" />

          {/* Subtle North Star Spark */}
          <path
            d="M24 13V17M24 29V33M19 23H15M33 23H29"
            stroke="#818CF8"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      )}

      {showText && (
        <div className="flex flex-col leading-tight whitespace-nowrap">
          <span className="font-bold text-sm tracking-wide text-white uppercase font-sans whitespace-nowrap">
            Voltrex <span className="text-cyan-400 font-semibold">Cosmos</span>
          </span>
          <span className="text-[10px] tracking-wider text-slate-400 font-mono whitespace-nowrap">
            PHISHING SHIELD
          </span>
        </div>
      )}
    </div>
  )
}
