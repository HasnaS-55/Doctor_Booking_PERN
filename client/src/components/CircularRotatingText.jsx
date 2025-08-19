/* eslint-disable react-hooks/rules-of-hooks */
import React, { useId, useRef } from "react";

export default function CircularText({
  segments = ["Book", "Checkups", "Follow-ups", "Visits"],
  separator = "   •   ",
  repeat = 10,
  size = 240,
  radius, // default is size * 0.38
  className = "text-white",
  fontSize = 16,
  fontWeight = 600,
  letterSpacingEm = 0,
  speedClass = "animate-[spin_12s_linear_infinite]",
  clockwise = true,
}) {
  // If you're on React 18+, useId works. If not, fallback to a stable ref id.
  const rid = (() => {
    try {
      return useId();
    } catch {
      return null;
    }
  })();
  const fallbackId = useRef(
    `ct-${Math.random().toString(36).slice(2)}`
  ).current;
  const pathId = rid || fallbackId;

  const R = radius ?? Math.round(size * 0.38);
  const cx = size / 2,
    cy = size / 2;

  const base = segments.join(separator) + separator;
  const content = base.repeat(repeat);

  return (
    <div
      className={`relative ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox={`0 0 ${size} ${size}`}
        width="100%"
        height="100%"
        className={`${speedClass} ${
          clockwise ? "" : "[animation-direction:reverse]"
        } absolute inset-0 ${className}`}
        aria-hidden="true"
      >
        {/* 🔑 This path is what the text rides on */}
        <defs>
          <path
            id={pathId}
            d={`M ${cx},${cy} m -${R},0 a ${R},${R} 0 1,1 ${
              R * 2
            },0 a ${R},${R} 0 1,1 -${R * 2},0`}
            fill="none"
          />
        </defs>

        {/* Start at top (-90deg). Keep natural spacing (no textLength). */}
        <g transform={`rotate(-90 ${cx} ${cy})`}>
          <text
            xmlSpace="preserve"
            fontSize={fontSize}
            fontWeight={fontWeight}
            letterSpacing={`${letterSpacingEm}em`}
            fill="currentColor" /* makes Tailwind text-* control color */
            style={{ textTransform: "uppercase" }}
          >
            <textPath href={`#${pathId}`} startOffset="0%">
              {content}
            </textPath>
          </text>
        </g>
      </svg>
    </div>
  );
}
