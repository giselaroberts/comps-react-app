import { Link } from 'react-router-dom';
import { BASIC_CHORDS } from '../constants';
import './Home.css';

export default function Home() {
  const getChordType = (chord) => {
    if (chord.includes('7')) return 'seventh';
    if (chord.includes('m')) return 'minor';
    return 'major';
  };

  return (
    <div className="home">
      <div className="chord-buttons">
        {BASIC_CHORDS.map((chord) => (
          <Link 
            key={chord} 
            to={`/chord/${chord}`} 
            className={`chord-button chord-button-${getChordType(chord)}`}
          >
            {chord}
          </Link>
        ))}
      </div>
    </div>
  );
}

