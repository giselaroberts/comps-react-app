import { Link, useParams } from 'react-router-dom';
import './LearnPage.css';
import GuitarTab from './GuitarTab';
import ChordOverlay from './ChordOverlay.jsx';
import { CHORD_SHAPES } from '/Users/giselaroberts/comps-react-app/src/constants.js';
import HomeArrow from '/Users/giselaroberts/comps-react-app/src/assets/HomeArrow.png';
import PlayArrow from '/Users/giselaroberts/comps-react-app/src/assets/PlayArrow.png';
import LearnArrow from '/Users/giselaroberts/comps-react-app/src/assets/LearnArrow.png';


export default function LearnPage() {
  const { chordName } = useParams();
  const shape = CHORD_SHAPES[chordName];
  

  return (
    <div className="learn-page">
      <h2>Learn: {chordName}</h2>
      <Link to="/" className="back-link"><img src = {HomeArrow} alt = 'Back to Home' className = 'home-arrow'/></Link>      
      <Link to={`/chord/${chordName}/play`} className="play-link"><img src = {PlayArrow} alt = 'to Play' className = 'play-arrow'/></Link>      

      
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

