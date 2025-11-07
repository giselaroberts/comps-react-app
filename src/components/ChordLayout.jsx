import { Link, Outlet, useParams, useLocation } from 'react-router-dom';
import './ChordLayout.css';

export default function ChordLayout() {
  const { chordName } = useParams();
  const location = useLocation();
  
  const getChordBackgroundColor = (chord) => {
    if (chord.includes('7')) return '#54ff7b'; // 7th chords - green
    if (chord.includes('m')) return '#ffff6a'; // Minor chords - yellow
    return '#ff86c7'; // Major chords - pink
  };
  
  // Only apply chord color background if NOT on learn or play pages
  const isLearnOrPlayPage = location.pathname.includes('/learn') || location.pathname.includes('/play');
  const backgroundColor = isLearnOrPlayPage ? 'transparent' : getChordBackgroundColor(chordName);
  
  return (
    <div className="chord-layout" style={{ backgroundColor }}>
      {!isLearnOrPlayPage && <Link to="/" className="back-link">← Back to Home</Link>}
      {/* Outlet renders the nested route (Selection, Learn, or Play) */}
      <Outlet />
    </div>
  );
}

