import { Link, useParams } from 'react-router-dom';
import './LearnPage.css';

export default function LearnPage() {
  const { chordName } = useParams();
  
  return (
    <div className="learn-page">
      <Link to="/" className="back-link">← Back to Home</Link>
      <h2>Learn: {chordName}</h2>
    </div>
  );
}

