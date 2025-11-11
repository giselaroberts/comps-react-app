// components/ChordOverlay.jsx
import React from "react";
import { xyFor } from "./GuitarTab";

// dot: { string: 1..6, fret?: 1..5, finger?: 1..4, open?: bool, muted?: bool }
export default function ChordOverlay({
  dots = [],
  barre, // { fret: 1..5, fromString: 1..6, toString: 1..6 }
  color = 'black',
  dotR = 23,
  fontSize = 16,
  showXO = true,
}) {
  // collect O/X marks per string
  const xoByString = new Map();
  if (showXO) {
    for (const d of dots) {
      if (d.open)  xoByString.set(d.string, "O");
      if (d.muted) xoByString.set(d.string, "X");
    }
  }

  return (
    <g stroke={color} fill={color}>
      {/* 1) Barre: sits ON the fret line */}
      {barre && <Barre {...barre} color={color} thickness={dotR * 1.5} />}

      {/* 2) Dots: between frets (handled by your xyFor with -0.5) */}
      {dots.filter(d => d.fret > 0).map((d, i) => {
        const { x, y } = xyFor(d.string, d.fret);
        return (
          <g key={i} transform={`translate(${x}, ${y})`}>
            <circle r={dotR} />
            {d.finger && (
              <text
                x="0"
                y={fontSize * 0.35}
                textAnchor="middle"
                fontSize={fontSize}
                fill="#fff"
              >
                {d.finger}
              </text>
            )}
          </g>
        );
      })}

      {/* 3) X/O above nut */}
      {showXO &&
        Array.from({ length: 6 }).map((_, idx) => {
          const string = idx + 1;
          const mark = xoByString.get(string);
          if (!mark) return null;
          const { x, y } = xyFor(string, 0); // fret 0 = nut line
          const labelOffset = 20;            // adjust to taste
          return (
            <text
              key={`xo-${string}`}
              x={x}
              y={y - labelOffset}
              textAnchor="middle"
              fontSize={fontSize}
              fill={color}
            >
              {mark}
            </text>
          );
        })}
    </g>
  );
}

// Barre is ON the fret line (no -0.5 offset)
function Barre({ fret, fromString, toString, color, thickness }) {
  const a = xyFor(fromString, fret);
  const b = xyFor(toString, fret);
  const x1 = Math.min(a.x, b.x);
  const x2 = Math.max(a.x, b.x);
  const y = a.y;
  return (
    <line
      x1={x1}
      y1={y}
      x2={x2}
      y2={y}
      stroke={color}
      strokeWidth={thickness}
      strokeLinecap="round"
      fill="none"
      vectorEffect="non-scaling-stroke"
    />
  );
}
