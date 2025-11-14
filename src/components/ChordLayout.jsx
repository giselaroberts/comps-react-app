import { Link, Outlet, useParams, useLocation } from 'react-router-dom';
import './ChordLayout.css';
import HomeArrow from '/Users/giselaroberts/comps-react-app/src/assets/HomeArrow.png';
import PlayArrow from '/Users/giselaroberts/comps-react-app/src/assets/PlayArrow.png';
import LearnArrow from '/Users/giselaroberts/comps-react-app/src/assets/LearnArrow.png';

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
 // const isNotHomePage = location.pathname.includes('/learn') || location.pathname.includes('/play')||location.pathname.includes('/chord');
  const backgroundColor = isLearnOrPlayPage ? 'transparent' : getChordBackgroundColor(chordName);
  
  return (
    <div className="chord-layout" style={{ backgroundColor }}>
      {!isLearnOrPlayPage && (
              <Link to="/" className="back-link"><img src = {HomeArrow} alt = 'Back to Home' className = 'home-arrow'/></Link>

      )}
      {/* Outlet renders the nested route (Selection, Learn, or Play) */}
      <Outlet />
    </div>
  );
}

