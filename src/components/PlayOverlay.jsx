import React from "react";
import {xyFor} from "./GuitarTab";

const STRING_ORDER = ["E_low", "A", "D", "G", "B", "E_high"];


export default function PlayOverlay({ stringResults }) {
    console.log("PlayOverlay rendering with stringResults:", stringResults);
    return (
      <g>
        {STRING_ORDER.map((stringName, idx) => {
          const result = stringResults[stringName];
          if (!result) return null;
  
          const { isOverallCorrect, fret, isValidOnString } = result;
          
          // Get the actual fret number (default to 0 for open string or invalid note)
          const fretNumber = fret !== undefined ? fret : 0;
          
          // Determine color: green if overall correct, red otherwise
          // If note is invalid on string, it should definitely be red
          const circleColor = (isValidOnString === false) ? "red" : (isOverallCorrect ? "green" : "red");
          
          // Get x and y position for this string and fret
          // xyFor uses 1-based string index (1-6) and fret index (0 = open, 1-5 = frets)
          const { x, y: yFromFunction } = xyFor(idx + 1, fretNumber);
          
          // Handle open strings (fret 0) - they might be placed above viewBox
          // For open strings or invalid notes (also at fret 0), place circle just above the nut but still visible
          let y = yFromFunction;
          if (fretNumber === 0 && yFromFunction < 0) {
            // Open string or invalid note placed above viewBox - adjust to visible position
            y = 3; // Just above the nut, still visible
          }
          
          console.log(`Rendering circle for ${stringName} at fret ${fretNumber}, position (${x}, ${y}), color: ${circleColor}, isValidOnString: ${isValidOnString}`);
  
          return (
            <circle
              key={stringName}
              cx={x}
              cy={y}
              r={18}
              fill={circleColor}
              opacity="0.85"
            />
          );
        })}
      </g>
    );
  }