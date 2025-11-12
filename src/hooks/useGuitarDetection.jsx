import { useState, useEffect, useRef } from 'react';
import { CHORD_NOTES } from '../constants';

// Dynamic import for Essentia to handle WASM properly
let Essentia = null;
let EssentiaWASM = null;


// Standard guitar string frequencies (in Hz) - low to high: E, A, D, G, B, E
const GUITAR_STRINGS = ['E_low', 'A', 'D', 'G', 'B', 'E_high'];
const GUITAR_STRING_FREQS = {
    E_low: 82.41,    // E2
    A: 110.00,       // A2
    D: 146.83,       // D3
    G: 196.00,       // G3
    B: 246.94,       // B3
    E_high: 329.63   // E4
  };

// Convert frequency to note name (without octave)
function frequencyToNoteName(freq) {
    const A4 = 440;
    const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    
    if (freq === 0) return null;
    
    const semitones = Math.round(12 * Math.log2(freq / A4));
    const noteIndex = ((semitones % 12) + 12) % 12;
  
  return noteNames[noteIndex];  // Returns just "C", "E", "G#", etc. (no octave)
}

// Get which string position a frequency matches
function getStringPosition(freq) {
    if (!freq || freq === 0) return null;
    
    let closestString = null;
    let minDiff = Infinity;
    
    for (const [stringName, stringFreq] of Object.entries(GUITAR_STRING_FREQS)) {
      const diff = Math.abs(freq - stringFreq);
      if (diff < minDiff) {
        minDiff = diff;
        closestString = stringName;
      }
    }
    
    // Only return if within reasonable range (within 50 cents)
    const cents = 1200 * Math.log2(freq / GUITAR_STRING_FREQS[closestString]);
    if (Math.abs(cents) < 50) {
      return closestString;
    }
    
    return null;
  }


  export function useGuitarDetection(expectedChord) {
    const [isRecording, setIsRecording] = useState(false);
    const [currentStringIndex, setCurrentStringIndex] = useState(0);  // Which string to play next (0-5)
    const [recordedNotes, setRecordedNotes] = useState({});  // { E_low: 'E', A: 'A', ... }
    const [isChordCorrect, setIsChordCorrect] = useState(null);  // null, true, or false
    const [essentia, setEssentia] = useState(null);
    const [error, setError] = useState(null);
    
    const audioContextRef = useRef(null);
    const analyserRef = useRef(null);
    const microphoneRef = useRef(null);
    const streamRef = useRef(null);  // Add ref for stream cleanup
    const animationFrameRef = useRef(null);
    const essentiaRef = useRef(null);
    const lastOnsetTimeRef = useRef(0);
    const silenceStartTimeRef = useRef(null);
    const currentStringIndexRef = useRef(0);  // Add ref to track current string index
  
    // Initialize Essentia.js
    useEffect(() => {
        let mounted = true;
        
        async function initEssentia() {
          try {
            // Dynamically import Essentia modules
            if (!Essentia || !EssentiaWASM) {
              // Import WASM module first - it exports { EssentiaWASM } which is the Module
              const wasmModule = await import('essentia.js/dist/essentia-wasm.es.js');
              EssentiaWASM = wasmModule.EssentiaWASM || wasmModule.default || wasmModule;
              
              // Import core Essentia - it exports Essentia as default
              const essentiaCoreModule = await import('essentia.js/dist/essentia.js-core.es.js');
              Essentia = essentiaCoreModule.default || essentiaCoreModule.Essentia;
            }
            
            if (!Essentia || !EssentiaWASM) {
              throw new Error('Failed to load Essentia modules');
            }
            
            // Wait for WASM module to be fully initialized
            // The WASM module might need to be ready before use
            if (EssentiaWASM && typeof EssentiaWASM.ready === 'object' && EssentiaWASM.ready.then) {
              await EssentiaWASM.ready;
            } else if (EssentiaWASM && typeof EssentiaWASM.ready === 'function') {
              await EssentiaWASM.ready();
            }
            
            // Ensure the Module is fully initialized
            if (!EssentiaWASM || !EssentiaWASM.HEAP8) {
              throw new Error('WASM module not properly initialized');
            }
            
            // Pass the WASM Module directly to Essentia constructor
            const essentiaInstance = new Essentia(EssentiaWASM);
            if (mounted) {
              setEssentia(essentiaInstance);
              essentiaRef.current = essentiaInstance;
            }
          } catch (err) {
            console.error('Failed to initialize Essentia:', err);
            console.error('Essentia:', Essentia);
            console.error('EssentiaWASM:', EssentiaWASM);
            if (mounted) {
              setError('Failed to initialize audio analysis library: ' + err.message);
            }
          }
        }
        
        initEssentia();
        
        return () => {
          mounted = false;
        };
      }, []);

  // Check if recorded notes match expected chord (moved inside component)
  const checkChord = () => {
    if (!expectedChord || !CHORD_NOTES[expectedChord]) {
      setIsChordCorrect(false);
      return;
    }
    
    const expectedNotes = CHORD_NOTES[expectedChord];
    const recordedNoteNames = Object.values(recordedNotes);
    
    // Check if all recorded notes are in the expected chord
    const allNotesMatch = recordedNoteNames.every(note => 
      expectedNotes.includes(note)
    );
    
    // Check if we have at least the core notes of the chord
    const hasCoreNotes = expectedNotes.every(expectedNote =>
      recordedNoteNames.includes(expectedNote)
    );
    
    setIsChordCorrect(allNotesMatch && hasCoreNotes && recordedNoteNames.length > 0);
  };

  // Analyze audio - detect onsets and record notes
  const analyzeAudio = () => {
    //dubugging.... this shows up in console, meaning requestAnimationFrame(analyzeAudio) call is happening :):check
    //console.log("Analyzing frame...");
    const currentIndex = currentStringIndexRef.current;  // Use ref value
    
    if (!analyserRef.current || !essentiaRef.current || currentIndex >= 6) {
      if (currentIndex >= 6) {
        // All strings recorded, check chord
        checkChord();
      }
      return;
    }
    
    const analyser = analyserRef.current;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Float32Array(bufferLength);
    
    analyser.getFloatTimeDomainData(dataArray);
    
    // Convert to a regular JavaScript array for Essentia
    // Essentia expects VectorFloat which is a regular array, not a typed array
    const audioFrame = Array.from(dataArray);
    
    // Calculate RMS (root mean square) for energy-based onset detection
    const currentTime = Date.now();
    let sumSquares = 0;
    for (let i = 0; i < audioFrame.length; i++) {
      sumSquares += audioFrame[i] * audioFrame[i];
    }
    const rms = Math.sqrt(sumSquares / audioFrame.length);
    //debugging thresholdd
    //TODO: delete below two lines, experiment with different thresholds
    //console.log("RMS:", rms);
    const energyThreshold = 0.002;
    //const energyThreshold = 0.01; // Adjust this threshold as needed
    
    // Check if there's significant energy (note being played)
    if (rms > energyThreshold) {
      // Wait a bit after onset to get stable pitch
      if (currentTime - lastOnsetTimeRef.current > 300) {
        lastOnsetTimeRef.current = currentTime;
        silenceStartTimeRef.current = null;
        
        // Detect pitch using PitchYin - pass as regular array
        const audioVector = essentiaRef.current.arrayToVector(dataArray);
        const pitchDetection = essentiaRef.current.PitchYin(audioVector);
        //TODO: delete below two lines
        console.log("Running PitchYin...");
        console.log("PitchYin result:", pitchDetection);
        
        if (pitchDetection && pitchDetection.pitch > 0) {
          const detectedFreq = pitchDetection.pitch;
          const noteName = frequencyToNoteName(detectedFreq);
          const stringPosition = getStringPosition(detectedFreq);
          
          // Check if this matches the current string we're waiting for
          const expectedString = GUITAR_STRINGS[currentIndex];
          
          if (stringPosition === expectedString && noteName) {
            // Record the note for this string
            setRecordedNotes(prev => ({
              ...prev,
              [expectedString]: noteName
            }));
            
            // Move to next string
            const nextIndex = currentIndex + 1;
            currentStringIndexRef.current = nextIndex;  // Update ref
            
            setCurrentStringIndex(nextIndex);
            
            if (nextIndex >= 6) {
              // All strings recorded, check chord
              setTimeout(() => checkChord(), 500);
            }
            
            // Reset silence timer
            silenceStartTimeRef.current = null;
          }
        }
      }
    } else {
      // No sound detected - track silence
      if (silenceStartTimeRef.current === null) {
        silenceStartTimeRef.current = currentTime;
      }
    }
    
    animationFrameRef.current = requestAnimationFrame(analyzeAudio);
  };

  // Start recording
  const startRecording = async () => {
    try {
      setError(null);
      setCurrentStringIndex(0);
      currentStringIndexRef.current = 0;  // Reset ref
      setRecordedNotes({});
      setIsChordCorrect(null);
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          channelCount: 1,
          sampleRate: 44100,
          echoCancellation: true,
          noiseSuppression: true
        } 
      });
      
      streamRef.current = stream;  // Store stream reference
      
      const audioContext = new (window.AudioContext || window.webkitAudioContext)({
        sampleRate: 44100
      });
      
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 2048;
      analyser.smoothingTimeConstant = 0.3;  // Less smoothing for better onset detection
      
      const microphone = audioContext.createMediaStreamSource(stream);
      microphone.connect(analyser);
      
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      microphoneRef.current = microphone;
      
      setIsRecording(true);
      
      // Start the analysis loop
      analyzeAudio();
      
    } catch (err) {
      console.error('Failed to start recording:', err);
      setError('Failed to access microphone. Please check your browser permissions.');
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    
    // Stop all tracks in the stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (microphoneRef.current) {
      microphoneRef.current.disconnect();
      microphoneRef.current = null;
    }
    
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    
    setIsRecording(false);
    setCurrentStringIndex(0);
    currentStringIndexRef.current = 0;
    setRecordedNotes({});
    setIsChordCorrect(null);
  };

  // Cleanup
  useEffect(() => {
    return () => {
      stopRecording();
    };
  }, []);
  return {
    isRecording,
    currentStringIndex,
    currentString: GUITAR_STRINGS[currentStringIndex] || null,
    recordedNotes,
    isChordCorrect,
    error,
    essentia,
    startRecording,
    stopRecording,
    reset: () => {
      setCurrentStringIndex(0);
      currentStringIndexRef.current = 0;
      setRecordedNotes({});
      setIsChordCorrect(null);
    }
  };
}
