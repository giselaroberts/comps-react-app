// components/GuitarTab.jsx
export const STRINGS = 6;
export const FRETS = 6; // nut + 5
export const TAB_VIEWBOX = { w: 343.5, h: 430.5 };
export const MARGINS = { left: 7, right: 7, top: 6, bottom: 4 };

export function xyFor(stringIndex, fretIndex) {
    // 1..6 for string (left→right)
    // 0 = open string (above nut), 1..5 = frets
    const innerW = TAB_VIEWBOX.w - (MARGINS.left + MARGINS.right);
    const innerH = TAB_VIEWBOX.h - (MARGINS.top + MARGINS.bottom);
    const stringGap = innerW / (STRINGS - 1);
    const fretGap = innerH / (FRETS - 1);
  
    const x = MARGINS.left + stringGap * (stringIndex - 1);
  
    // place circles halfway between this fret and the one above
    // (so fret 1’s dot is halfway between nut (0) and fret line 1)
    const y = MARGINS.top + fretGap * (fretIndex - 0.5);
  
    return { x, y };
  }
  


export default function GuitarTab({ width=458, height=574, thin=3, nut=15, children }) {
  const innerW = TAB_VIEWBOX.w - (MARGINS.left + MARGINS.right);
  const innerH = TAB_VIEWBOX.h - (MARGINS.top + MARGINS.bottom);
  const x0 = MARGINS.left, x1 = MARGINS.left + innerW;
  const y0 = MARGINS.top,  y1 = MARGINS.top + innerH;

  const stringGap = innerW / (STRINGS - 1);
  const fretGap = innerH / (FRETS - 1);

  const line = (p) => <line {...p} stroke="black" fill="none" vectorEffect="non-scaling-stroke" />;

  return (
    <svg xmlns="http://www.w3.org/2000/svg"
         viewBox={`0 0 ${TAB_VIEWBOX.w} ${TAB_VIEWBOX.h}`}
         width={width} height={height} aria-hidden="true">
      {/* nut */}
      {line({ x1: x0-5, y1: y0, x2: x1+5, y2: y0, strokeWidth: nut })}
      {/* remaining horizontal frets */}
      {Array.from({length: FRETS-1}, (_, i) => {
        const y = y0 + fretGap * (i+1);
        return line({ key:`f${i}`, x1:x0, y1:y, x2:x1, y2:y, strokeWidth: thin });
      })}
      {/* vertical strings */}
      {Array.from({length: STRINGS}, (_, s) => {
        const x = x0 + stringGap * s;
        return line({ key:`s${s}`, x1:x, y1:y0, x2:x, y2:y1, strokeWidth: thin });
      })}

      {children}
    </svg>
  );
}
