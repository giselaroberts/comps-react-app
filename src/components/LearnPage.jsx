import { Link, useParams } from 'react-router-dom';
import './LearnPage.css';

export default function LearnPage() {
  const { chordName } = useParams();
  
  return (
    <div className="learn-page">
      <Link to="/" className="back-link">← Back to Home</Link>
      <h2>Learn: {chordName}</h2>
      
      
      <svg xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 343.5 430.5"
          width="458" height="574" aria-hidden="true">

        <line   x1="1" y1="6"   x2="342.5" y2="6"  style={{ stroke:'black', strokeWidth: 12}} />
        <line  x1="7" y1="90"  x2="336.5" y2="90"  style={{ stroke: 'black', strokeWidth: 3 }}/>
        <line  x1="7" y1="174" x2="336.5" y2="174" style={{ stroke: 'black', strokeWidth: 3 }}/>
        <line  x1="7" y1="258" x2="336.5" y2="258" style={{ stroke: 'black', strokeWidth: 3 }}/>
        <line  x1="7" y1="342" x2="336.5" y2="342" style={{ stroke: 'black', strokeWidth: 3 }}/>
        <line  x1="7" y1="426" x2="336.5" y2="426" style={{ stroke: 'black', strokeWidth: 3 }}/>
  
        <line  x1="7"    y1="6"  x2="7"    y2="426" style={{ stroke: 'black', strokeWidth: 3 }}/>
        <line  x1="72.9" y1="6"  x2="72.9" y2="426"style={{ stroke: 'black', strokeWidth: 3 }}/>
        <line  x1="138.8" y1="6" x2="138.8" y2="426"style={{ stroke: 'black', strokeWidth: 3 }}/>
        <line  x1="204.7" y1="6" x2="204.7" y2="426" style={{ stroke: 'black', strokeWidth: 3 }}/>
        <line  x1="270.6" y1="6" x2="270.6" y2="426"style={{ stroke: 'black', strokeWidth: 3 }}/>
        <line  x1="336.5" y1="6" x2="336.5" y2="426" style={{ stroke: 'black', strokeWidth: 3 }}/>
      </svg>


      



    </div>
  );
}

