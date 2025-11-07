import { Link, useParams } from 'react-router-dom';
import './ChordSelectionPage.css';

export default function ChordSelectionPage() {
  const { chordName } = useParams();
  
  return (
    <div className="chord-selection-page">
      <h1>{chordName}</h1>
      <div className="mode-buttons">
        <Link to={`/chord/${chordName}/learn`} className="mode-button">
          Learn
        </Link>
        <Link to={`/chord/${chordName}/play`} className="mode-button">
          Play
        </Link>
      </div>
    </div>
  );
}

