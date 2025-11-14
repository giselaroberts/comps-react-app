import { Link, useParams } from 'react-router-dom';
import './ChordSelectionPage.css';
import HomeArrow from '/Users/giselaroberts/comps-react-app/src/assets/HomeArrow.png';


export default function ChordSelectionPage() {
  const { chordName } = useParams();
  //get chord color 
  const getChordBackgroundColor = (chord) => {
    if (chord.includes('7')) return '#54ff7b'; // 7th chords - green
    if (chord.includes('m')) return '#ffff6a'; // Minor chords - yellow
    return '#ff86c7'; // Major chords - pink
  };
  const textColor = getChordBackgroundColor(chordName);


  return (
    <div className="chord-selection-page">
      <div className="mode-buttons">
        <Link to={`/chord/${chordName}/learn`} className="mode-button" style={{ color: textColor }}>
          Learn
        </Link>
        <Link to={`/chord/${chordName}/play`} className="mode-button" style={{ color: textColor }}>
          Play
        </Link>
        <h1>{chordName}</h1>
      </div>
    </div>
  );
}

