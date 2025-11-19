import { useState, useEffect, useRef } from 'react';
import { CHORD_NOTES, STRING_NOTES } from '../constants';

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

// Convert frequency to note name and octave
// Finds the closest note by comparing to actual frequencies
function frequencyToNote(freq) {
    if(!freq) return null;
    const A4 = 440;
    const names = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    
    // Find the closest note by comparing to actual frequencies
    let minDiff = Infinity;
    let bestNote = null;
    let bestOctave = null;
    
    // Check a reasonable range of octaves (0-8 covers most musical instruments)
    for (let octave = 0; octave <= 8; octave++) {
        for (let noteIdx = 0; noteIdx < 12; noteIdx++) {
            // Calculate frequency for this note
            // A4 is at index 9, octave 4
            const semisFromA4 = (octave - 4) * 12 + (noteIdx - 9);
            const noteFreq = A4 * Math.pow(2, semisFromA4 / 12);
            const diff = Math.abs(freq - noteFreq);
            
            if (diff < minDiff) {
                minDiff = diff;
                bestNote = names[noteIdx];
                bestOctave = octave;
            }
        }
    }
    
    return { note: bestNote, octave: bestOctave };
}

// Convert frequency to note name (without octave) - kept for backward compatibility
function frequencyToNoteName(freq) {
    const result = frequencyToNote(freq);
    return result ? result.note : null;
}

// Get which string position a frequency matches
function detectString(rawFreq) {
    if (!rawFreq) return null;
    
    //correct for my microphone bias (about -9%)
    const freq = rawFreq / 0.915;
    // Try raw frequency and harmonics
    const candidates = [freq, freq / 2, freq / 4];

    for (const f of candidates) {
      let best = null;
      let minDiff = Infinity;

      for (const [stringName, baseFreq] of Object.entries(GUITAR_STRING_FREQS)) {
        const diff = Math.abs(f - baseFreq);
        if (diff < minDiff) {
          minDiff = diff;
          best = stringName;
        }
      }
      
      // Only return if within reasonable range (within 120 cents = 1 semitone)
      const cents = 1200 * Math.log2(f / GUITAR_STRING_FREQS[best]);
      if (Math.abs(cents) < 120) {
        return best;
      }
    }
    
    return null;
  }

// Validate detected note against expected string and find matching fret
// Returns { fret: number, isValid: boolean, errorMessage: string | null }
function validateNoteOnString(detectedNote, detectedOctave, expectedString) {
  if (!detectedNote || !expectedString || !STRING_NOTES[expectedString]) {
    return { fret: 0, isValid: false, errorMessage: 'Invalid detection' };
  }
  
  const possibleNotes = STRING_NOTES[expectedString];
  
  // Check if the detected note (with octave) matches any possible note on this string
  // Also check enharmonic equivalents
  for (const stringNote of possibleNotes) {
    // Check if note name matches (including enharmonics) and octave matches
    const noteMatches = stringNote.enharmonics.some(enh => 
      enh.toLowerCase() === detectedNote.toLowerCase()
    );
    const octaveMatches = stringNote.octave === detectedOctave;
    
    if (noteMatches && octaveMatches) {
      return { 
        fret: stringNote.fret, 
        isValid: true, 
        errorMessage: null 
      };
    }
  }
  
  // Note not found on this string - return error
  return { 
    fret: 0, 
    isValid: false, 
    errorMessage: `Note ${detectedNote}${detectedOctave} is not possible on ${expectedString} string (frets 0-5)` 
  };
}


export function useGuitarDetection(expectedChord, onStringDetected) {
    const [isRecording, setIsRecording] = useState(false);
    const [currentStringIndex, setCurrentStringIndex] = useState(0);  // Which string to play next (0-5)
    const [recordedNotes, setRecordedNotes] = useState({});  // { E_low: 'E', A: 'A', ... }
    const [isChordCorrect, setIsChordCorrect] = useState(null);  // null, true, or false
    const [essentia, setEssentia] = useState(null);
    const [error, setError] = useState(null);
    const [timeRemaining, setTimeRemaining] = useState(5);  // Countdown timer for current string
    
    const audioContextRef = useRef(null);
    const analyserRef = useRef(null);
    const microphoneRef = useRef(null);
    const streamRef = useRef(null);  // Add ref for stream cleanup
    const animationFrameRef = useRef(null);
    const essentiaRef = useRef(null);
    const lastOnsetRef = useRef(0);
    const rafRef = useRef(null);
    const silenceStartTimeRef = useRef(null);
    const currentStringIndexRef = useRef(0);  // Add ref to track current string index
    const countdownIntervalRef = useRef(null);  // Ref for countdown interval
    const canAdvanceRef = useRef(false);  // Whether we can advance to next string
    const countdownStartTimeRef = useRef(null);  // When the current countdown started
  
    // Initialize Essentia.js
    useEffect(() => {
        let mounted = true;
        
        async function load() {
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
        
        load();
        
        return () => {
          mounted = false;
        };
      }, []);

      // ANALYZE LOOP
      const analyze = () => {
        const analyser = analyserRef.current;
        const essentia = essentiaRef.current;
        const currentIndex = currentStringIndexRef.current; // Use ref to get latest value

        if (!analyser || !essentia || currentIndex >= 6) {
          // If we've finished all strings, check the chord
          if (currentIndex >= 6) {
            setRecordedNotes((prev) => {
              const expectedNotes = CHORD_NOTES[expectedChord];
              if (expectedNotes) {
                const allCorrect = Object.values(prev).every((n) =>
                  expectedNotes.includes(n)
                );
                setIsChordCorrect(allCorrect);
              }
              return prev;
            });
          }
          return;
        }

        const buffer = new Float32Array(analyser.frequencyBinCount);
        analyser.getFloatTimeDomainData(buffer);


          // Onset detection (simple RMS)
    let sum = 0;
    buffer.forEach((v) => (sum += v * v));
    const rms = Math.sqrt(sum / buffer.length);
    const now = performance.now();

    if (rms > 0.012 && now - lastOnsetRef.current > 300) {
      //debigging:
      //console.log("RMS:", rms); checked, rms is always > .012 so this is not the issue
      lastOnsetRef.current = now;

      const vector = essentia.arrayToVector(buffer);
      const pitchResult = essentia.PitchYin(vector);
      const { pitch, pitchConfidence } = pitchResult;
      
      // Debug: log pitch detection results
      console.log("=== PITCH DETECTION ===");
      console.log("Raw pitch (Hz):", pitch);
      console.log("Pitch confidence:", pitchConfidence);
      console.log("RMS:", rms);

      if (pitch > 0 && pitchConfidence > 0.6) {
        // Apply microphone bias correction (about -9%, so divide by 0.915)
        const correctedPitch = pitch / 0.915;
        
        // Get note with octave using corrected pitch
        const detectedNoteObj = frequencyToNote(correctedPitch);
        if (!detectedNoteObj) {
          console.log("Could not convert frequency to note");
          return;
        }
        
        const { note: detectedNote, octave: detectedOctave } = detectedNoteObj;
        const noteName = detectedNote; // For backward compatibility
        const closestString = detectString(pitch); // detectString applies correction internally
        
        // Debug: log detected note information
        console.log("Corrected pitch (Hz):", correctedPitch);
        console.log("Detected note:", detectedNote);
        console.log("Detected octave:", detectedOctave);
        console.log("Full note:", detectedNote + detectedOctave);
        console.log("Closest string:", closestString);
        console.log("Current expected string index:", currentIndex);
        console.log("======================");

        const expectedString = GUITAR_STRINGS[currentIndex];
        const expectedNotes = CHORD_NOTES[expectedChord];

        // Validate note against expected string
        const validation = validateNoteOnString(detectedNote, detectedOctave, expectedString);
        const fret = validation.fret;
        const isValidOnString = validation.isValid;
        const errorMessage = validation.errorMessage;

        // Check if note is correct for the chord (note name only, no octave)
        const isCorrectNote = expectedNotes && expectedNotes.some(expectedNote => {
          // Check if detected note matches expected note (including enharmonics)
          // For example, Bb should match A# in chord notes
          const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
          const enharmonicMap = {
            'Db': 'C#', 'Eb': 'D#', 'Gb': 'F#', 'Ab': 'G#', 'Bb': 'A#',
            'Cb': 'B', 'E#': 'F', 'Fb': 'E', 'B#': 'C'
          };
          
          const normalizedDetected = enharmonicMap[detectedNote] || detectedNote;
          const normalizedExpected = enharmonicMap[expectedNote] || expectedNote;
          
          return normalizedDetected === normalizedExpected || detectedNote === expectedNote;
        });

        const isCorrectString = closestString === expectedString;
        const isOverallCorrect = isValidOnString && isCorrectNote;

        // ➜ Send result back to PlayPage
        if (onStringDetected && typeof onStringDetected === 'function') {
          console.log("Calling onStringDetected with:", {
            stringName: expectedString,
            noteName: noteName,
            detectedFreq: pitch,
            isCorrectString,
            isCorrectNote,
            fret,
            detectedString: closestString,
            isValidOnString,
            errorMessage,
            isOverallCorrect,
          });
          onStringDetected({
            stringName: expectedString,
            noteName: noteName,
            detectedFreq: correctedPitch, // Use corrected frequency
            isCorrectString,
            isCorrectNote,
            fret,
            detectedString: closestString,
            isValidOnString,
            errorMessage,
            isOverallCorrect,
          });
        } else {
          console.warn("onStringDetected is not a function:", onStringDetected);
        }

        // Save for summary text
        setRecordedNotes((prev) => ({
          ...prev,
          [expectedString]: noteName,
        }));

        // Don't advance automatically - wait for countdown timer
        // The countdown timer will handle advancement
      }
    }

    rafRef.current = requestAnimationFrame(analyze);
  };

  // Effect to start countdown when string index changes (and we're recording)
  useEffect(() => {
    // Clear any existing countdown first
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    
    // Only start countdown if we're recording and haven't finished all strings
    if (isRecording && currentStringIndex < 6) {
      // Make sure ref is in sync with state
      currentStringIndexRef.current = currentStringIndex;
      console.log("Starting countdown for string index:", currentStringIndex, "string:", GUITAR_STRINGS[currentStringIndex]);
      
      // Reset countdown to 5 seconds
      setTimeRemaining(5);
      canAdvanceRef.current = false;
      countdownStartTimeRef.current = Date.now();
      
      // Start countdown interval - update every 100ms for smoother display
      countdownIntervalRef.current = setInterval(() => {
        const elapsed = (Date.now() - countdownStartTimeRef.current) / 1000;
        const remaining = Math.max(0, Math.ceil(5 - elapsed));
        
        setTimeRemaining(remaining);
        
        if (remaining <= 0) {
          // Countdown finished - allow advancement
          clearInterval(countdownIntervalRef.current);
          countdownIntervalRef.current = null;
          canAdvanceRef.current = true;
          
          // Advance to next string - use the ref to get the most current value
          const currentIndex = currentStringIndexRef.current;
          console.log("Countdown finished for string index:", currentIndex, "string:", GUITAR_STRINGS[currentIndex]);
          if (currentIndex < 6) {
            const nextIndex = currentIndex + 1;
            console.log("Advancing to string index:", nextIndex, "string:", GUITAR_STRINGS[nextIndex]);
            currentStringIndexRef.current = nextIndex;
            setCurrentStringIndex(nextIndex);
            // The useEffect will trigger again with the new currentStringIndex
          }
        }
      }, 100); // Update every 100ms for smoother countdown
    }
    
    // Cleanup on unmount or when recording stops or string changes
    return () => {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
      }
    };
  }, [isRecording, currentStringIndex]);

  const startRecording = async () => {
    try {
      setError(null);
      setRecordedNotes({});
      setIsChordCorrect(null);
      setCurrentStringIndex(0);
      currentStringIndexRef.current = 0; // Initialize ref
      setTimeRemaining(5);
      canAdvanceRef.current = false;
      countdownStartTimeRef.current = null;

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const ctx = new AudioContext();
      audioContextRef.current = ctx;

      const analyser = ctx.createAnalyser();
      analyser.fftSize = 2048;
      analyserRef.current = analyser;

      const src = ctx.createMediaStreamSource(stream);
      src.connect(analyser);

      setIsRecording(true);
      
      // Countdown will start automatically via useEffect when isRecording becomes true
      
      analyze();

    } catch (err) {
      setError("Microphone access denied.");
    }
  };

  const stopRecording = () => {
    cancelAnimationFrame(rafRef.current);

    // Clear countdown interval
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }

    setIsRecording(false);
    setTimeRemaining(5);
    canAdvanceRef.current = false;
  };

  useEffect(() => stopRecording, []);

  return {
    isRecording,
    currentStringIndex,
    currentString: GUITAR_STRINGS[currentStringIndex] || null,
    recordedNotes,
    isChordCorrect,
    error,
    timeRemaining,
    startRecording,
    stopRecording,
    reset: () => {
      // Clear countdown interval
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
      }
      setCurrentStringIndex(0);
      currentStringIndexRef.current = 0;
      setRecordedNotes({});
      setIsChordCorrect(null);
      setTimeRemaining(5);
      canAdvanceRef.current = false;
    }
  };
}
/*
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
        
        // Detect pitch using PitchYinFFT - pass as regular array
        const audioVector = essentiaRef.current.arrayToVector(dataArray);
        const pitchDetection = essentiaRef.current.PitchYinFFT(audioVector);
        //TODO: delete below two lines
        console.log("Running PitchYinFFT...");
        console.log("PitchYinFFT result:", pitchDetection);
        
        if (pitchDetection && pitchDetection.pitch > 0) {
          const detectedFreq = pitchDetection.pitch;
          const noteName = frequencyToNoteName(detectedFreq);
          const stringPosition = getStringPosition(detectedFreq);
          
          // Check if this matches the current string we're waiting for
          const expectedString = GUITAR_STRINGS[currentIndex];
          
          
          
          /*if (stringPosition === expectedString && noteName) {
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
          }*/
            /*if (noteName) {
              const expectedNote = CHORD_NOTES[expectedChord]; // e.g. ['C', 'E', 'G']
          
              const isNoteInChord = expectedNote.includes(noteName);
              const isCorrectString = stringPosition === expectedString;
          
              // Emit detection to UI
              onStringDetected({
                  stringName: expectedString,
                  detectedFreq,
                  noteName,
                  stringPosition,
                  isCorrectString,
                  isCorrectNote: isNoteInChord
              });
          
              // Now advance even if wrong
              const nextIndex = currentIndex + 1;
              currentStringIndexRef.current = nextIndex;
              setCurrentStringIndex(nextIndex);
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
}*/
