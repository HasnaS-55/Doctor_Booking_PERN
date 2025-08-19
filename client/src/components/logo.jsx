import React from "react";

export default function BookDoctorLogo({
  className = "h-12 w-auto", // overall size
  ariaLabel = "Book Doctor logo",
  showTagline = false,
  tagline = "Book an appointment with a doctor",
  textClassName = "text-neutral-900 dark:text-white", // “B” and “k”
  accentClassName = "text-blue-600 dark:text-blue-400", // blue “oo”, cross, dot
  strokeClassName = "text-neutral-900 dark:text-white", // stethoscope tube
}) {
  return (
    <svg
      viewBox="0 0 1000 280"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={ariaLabel}
      className={className}
    >
      {/* Wordmark */}
      <text
        x="40"
        y="175"
        fontSize="176"
        fontWeight="800"
        letterSpacing="0.5"
        className={textClassName}
        fill="currentColor"
      >
        B
      </text>

      {/* The two "o" letters as blue rings */}
      <g
        className={accentClassName}
        stroke="currentColor"
        strokeWidth="24"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="280" cy="140" r="54" />
        <circle cx="400" cy="140" r="54" />
      </g>

      {/* The 'k' */}
      <text
        x="510"
        y="175"
        fontSize="176"
        fontWeight="800"
        letterSpacing="0.5"
        className={textClassName}
        fill="currentColor"
      >
        k
      </text>

      {/* Stethoscope */}
      <g
        className={strokeClassName}
        stroke="currentColor"
        strokeWidth="10"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      >
        <path d="M 400 194 C 420 230, 500 232, 540 200 S 620 164, 650 186" />
        <circle cx="670" cy="196" r="20" />
      </g>

      {/* Blue dot in the chest piece */}
      <circle
        cx="670"
        cy="196"
        r="6"
        className={accentClassName}
        fill="currentColor"
      />

      {/* Medical cross accent */}
      <g
        transform="translate(610,64)"
        className={accentClassName}
        fill="currentColor"
      >
        <rect x="20" y="0" width="20" height="60" rx="4" />
        <rect x="0" y="20" width="60" height="20" rx="4" />
      </g>

      {/* Optional tagline */}
      {showTagline && (
        <text
          x="40"
          y="240"
          fontSize="44"
          fontWeight="500"
          opacity="0.6"
          className="text-neutral-700 dark:text-neutral-300"
          fill="currentColor"
        >
          {tagline}
        </text>
      )}
    </svg>
  );
}
