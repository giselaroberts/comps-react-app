import { Link, useParams } from 'react-router-dom';
import './LearnPage.css';
import GuitarTab from './GuitarTab';
import ChordOverlay from './ChordOverlay.jsx';
import { CHORD_SHAPES } from '/Users/giselaroberts/comps-react-app/src/constants.js';
import HomeArrow from '/Users/giselaroberts/comps-react-app/src/assets/HomeArrow.png';

export default function LearnPage() {
  const { chordName } = useParams();
  const shape = CHORD_SHAPES[chordName];
  

  return (
    <div className="learn-page">
      <Link to="/" className="back-link"><img src = {HomeArrow} alt = 'Back to Home' className = 'home-arrow'/></Link>

      <h2>Learn: {chordName}</h2>
      
      
      <GuitarTab width={460} height={525}>
        {shape ? (
          <ChordOverlay dots={shape.dots} barre={shape.barre} />
        ) : (
          <text x="20" y="30" fill="red">Unknown chord</text>
        )}
      </GuitarTab>




    </div>
  );
}

