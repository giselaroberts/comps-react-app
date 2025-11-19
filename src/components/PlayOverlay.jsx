import React from "react";
import {xyFor} from "./GuitarTab";
import { CHORD_SHAPES } from "../constants";

const STRING_ORDER = ["E_low", "A", "D", "G", "B", "E_high"];


export default function PlayOverlay({ stringResults, chordName, isChordCorrect }) {
    console.log("PlayOverlay rendering with stringResults:", stringResults);
    
    // Get the correct chord shape if chord is incorrect
    const correctChordShape = (isChordCorrect === false && chordName) ? CHORD_SHAPES[chordName] : null;
    
    return (
      <g>
        {/* Render user's played notes (red/green circles) */}
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
        
        {/* Render empty circles for correct chord shape when user got it wrong */}
        {correctChordShape && correctChordShape.dots && correctChordShape.dots
          .filter(dot => dot.fret > 0) // Only show dots for fretted notes (not open/muted)
          .map((dot, i) => {
            const { x, y } = xyFor(dot.string, dot.fret);
            return (
              <circle
                key={`correct-${dot.string}-${dot.fret}-${i}`}
                cx={x}
                cy={y}
                r={18}
                fill="none"
                stroke="black"
                strokeWidth="2"
                opacity="0.6"
              />
            );
          })}
      </g>
    );
  }