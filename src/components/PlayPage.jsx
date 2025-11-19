import { Link, useParams } from 'react-router-dom';
import { useGuitarDetection } from '../hooks/useGuitarDetection';
import './PlayPage.css';
import GuitarTab from './GuitarTab';
import HomeArrow from '/Users/giselaroberts/comps-react-app/src/assets/HomeArrow.png';
import PlayArrow from '/Users/giselaroberts/comps-react-app/src/assets/PlayArrow.png';
import LearnArrow from '/Users/giselaroberts/comps-react-app/src/assets/LearnArrow.png';
import PlayOverlay from './PlayOverlay';
import { useState, useEffect, useCallback } from "react";


export default function PlayPage() {
  const { chordName } = useParams();

  // ⭐ NEW CODE START — per-string visual results
  const [stringResults, setStringResults] = useState({
    E_low: null,
    A: null,
    D: null,
    G: null,
    B: null,
    E_high: null
  });

  const [stringErrors, setStringErrors] = useState({});

  const handleStringDetected = useCallback((result) => {
    console.log("handleStringDetected called with:", result);
    const { 
      stringName, 
      detectedFreq, 
      noteName, 
      isCorrectString, 
      isCorrectNote, 
      fret, 
      detectedString,
      isValidOnString,
      errorMessage,
      isOverallCorrect
    } = result;

    setStringResults(prev => {
      const newResults = {
        ...prev,
        [stringName]: {
          detectedFreq,
          noteName,
          isCorrectString,
          isCorrectNote,
          isOverallCorrect: isOverallCorrect !== undefined ? isOverallCorrect : (isCorrectString && isCorrectNote),
          fret: fret || 0, // Store the fret number (0 = open string, or nut if invalid)
          detectedString, // Store which string was actually detected
          isValidOnString: isValidOnString !== undefined ? isValidOnString : true
        }
      };
      console.log("Updated stringResults:", newResults);
      return newResults;
    });

    // Store error message if present
    if (errorMessage) {
      setStringErrors(prev => ({
        ...prev,
        [stringName]: errorMessage
      }));
    } else {
      // Clear error if note is valid
      setStringErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[stringName];
        return newErrors;
      });
    }
  }, []);
  // ⭐ NEW CODE END



  // NOTE: We now pass the callback into the hook
  const {
    isRecording,
    currentStringIndex,
    currentString,
    recordedNotes,
    isChordCorrect,
    error,
    startRecording,
    stopRecording,
    reset
  } = useGuitarDetection(chordName, handleStringDetected); 
  // ⭐ ← The NEW second argument

  // Reset stringResults and errors when starting recording
  useEffect(() => {
    if (isRecording) {
      setStringResults({
        E_low: null,
        A: null,
        D: null,
        G: null,
        B: null,
        E_high: null
      });
      setStringErrors({});
    }
  }, [isRecording]);



  const stringLabels = {
    'E_low': 'Low E (6th)',
    'A': 'A (5th)',
    'D': 'D (4th)',
    'G': 'G (3rd)',
    'B': 'B (2nd)',
    'E_high': 'High E (1st)'
  };
 
  return (
    <div className="play-page">
      <h2>Play: {chordName}</h2>

      <Link to="/" className="back-link"><img src={HomeArrow} alt="Back" className="home-arrow"/></Link>
      <Link to={`/chord/${chordName}/learn`} className="learn-link"><img src={LearnArrow} alt="to Learn" className="learn-arrow"/></Link>


      <GuitarTab width={460} height={525}>
        <PlayOverlay stringResults={stringResults} />
      </GuitarTab>
 


      <div className="recording-controls">
        {!isRecording ? (
          <button onClick={startRecording} className="record-button">
            Start Recording
          </button>
        ) : (
          <button onClick={stopRecording} className="stop-button">
            Stop Recording
          </button>
        )}
        {!isRecording && Object.keys(recordedNotes).length > 0 && (
          <button onClick={() => {
            reset();
            setStringResults({
              E_low: null,
              A: null,
              D: null,
              G: null,
              B: null,
              E_high: null
            });
            setStringErrors({});
          }} className="reset-button">
            Reset
          </button>
        )}
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      {isRecording && (
        <div className="string-progress">
          <h3>Play each string (low to high):</h3>
          <div className="strings-display">
            {['E_low', 'A', 'D', 'G', 'B', 'E_high'].map((str, idx) => (
              <div 
                key={str} 
                className={`string-item ${
                  idx < currentStringIndex ? 'completed' : 
                  idx === currentStringIndex ? 'current' : 
                  'pending'
                }`}
              >
                <span className="string-label">{stringLabels[str]}</span>
                {recordedNotes[str] && (
                  <span className="detected-note">{recordedNotes[str]}</span>
                )}
                {stringErrors[str] && (
                  <span className="error-note" style={{ color: 'red', fontSize: '0.9em', marginLeft: '10px' }}>
                    {stringErrors[str]}
                  </span>
                )}
                {idx === currentStringIndex && (
                  <span className="play-indicator">← Play this string</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      
      {isChordCorrect !== null && (
        <div className={`chord-result ${isChordCorrect ? 'correct' : 'incorrect'}`}>
          {isChordCorrect ? (
            <h3>✓ Correct! You played {chordName} correctly!</h3>
          ) : (
            <h3>✗ Not quite right. Try again!</h3>
          )}
          <div className="recorded-notes">
            <p>Recorded notes: {Object.values(recordedNotes).join(', ')}</p>
          </div>
        </div>
      )}
    </div>
  );
}
