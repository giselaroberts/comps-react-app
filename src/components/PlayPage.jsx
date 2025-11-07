import { Link, useParams } from 'react-router-dom';
import './PlayPage.css';

export default function PlayPage() {
  const { chordName } = useParams();
  
  return (
    <div className="play-page">
      <Link to="/" className="back-link">← Back to Home</Link>
      <h2>Play: {chordName}</h2>
    </div>
  );
}

