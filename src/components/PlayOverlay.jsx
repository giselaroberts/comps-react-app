import React from "react";
import {xyFor} from "./GuitarTab";

const STRING_ORDER = ["E_low", "A", "D", "G", "B", "E_high"];


export default function PlayOverlay({ stringResults }) {
    return (
      <g>
        {STRING_ORDER.map((stringName, idx) => {
          const result = stringResults[stringName];
          if (!result) return null;
  
          const { isOverallCorrect } = result;
  
          // Open string circle → fret index 0
          const { x, y } = xyFor(idx + 1, 0);
  
          return (
            <circle
              key={stringName}
              cx={x}
              cy={y}
              r={18}
              fill={isOverallCorrect ? "green" : "red"}
              opacity="0.85"
            />
          );
        })}
      </g>
    );
  }