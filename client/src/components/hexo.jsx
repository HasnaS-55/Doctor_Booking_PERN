import React, { useMemo } from "react";
import { Hexagon } from "lucide-react";


export default function HexGridOverlayFilled({
  rows = 5,
  cols = 7,
  size = 140,
  gapX = 24,
  gapY = 20,
  color = "#ffffff",
  fillOpacity = 0.08,
  strokeOpacity = 0.22,
  className = "",
}) {
  const cells = useMemo(
    () =>
      Array.from({ length: rows * cols }, (_, i) => ({
        r: Math.floor(i / cols),
        c: i % cols,
      })),
    [rows, cols]
  );

  
  const cellW = size + gapX;
  const cellH = size * 0.75 + gapY; 

  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 ${className}`}
    >
      {cells.map(({ r, c }, i) => {
        const x = c * cellW + (r % 2 ? cellW / 2 : 0);
        const y = r * cellH;
        return (
          <div
            key={i}
            className="absolute"
            style={{ left: x, top: y, width: size, height: size }}
          >
            {/* Filled hexagon */}
            <div
              className="absolute inset-0"
              style={{
                backgroundColor: color,
                opacity: fillOpacity,
                // Flat-top hex
                clipPath:
                  "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)",
                borderRadius: 8, 
                filter: "blur(0.2px)", 
              }}
            />
            {/* Outline for subtle definition */}
            <Hexagon
              className="absolute inset-0"
              size={size}
              strokeWidth={1.5}
              style={{ color, opacity: strokeOpacity }}
            />
          </div>
        );
      })}

      {/* Gentle fade so pattern doesn’t overpower content */}
      <div className="absolute inset-0 [mask-image:linear-gradient(to_bottom,black,black_70%,transparent)]" />
    </div>
  );
}
