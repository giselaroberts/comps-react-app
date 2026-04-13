# Technical Background

## 2.1 Web Audio API

**Real-time audio capture and processing**

• **MediaStream API**: `getUserMedia()` requests microphone access, returns audio stream
• **AudioContext**: Creates processing graph for routing and analysis
• **AnalyserNode**: 
  - FFT size: 2048 samples (1024 frequency bins)
  - Extracts time-domain data via `getFloatTimeDomainData()`
  - Provides raw waveform for RMS energy calculation
• **MediaStreamSource**: Connects microphone stream to audio processing pipeline

**Processing Flow:**
```
Microphone → MediaStream → AudioContext → AnalyserNode → Float32Array
```

**Implementation:**
- Continuous analysis via `requestAnimationFrame()` (~60 fps)
- Frame-based processing (2048 samples per frame)
- Automatic resource cleanup on stop

---

## 2.2 Essentia.js

**WASM-based audio analysis library for pitch detection**

• **WebAssembly Architecture**:
  - Compiled to WASM for near-native performance
  - Two-module system: `essentia-wasm.es.js` (runtime) + `essentia.js-core.es.js` (algorithms)
  - Dynamic loading with initialization verification (`HEAP8` memory check)

• **PitchYin Algorithm**:
  - Autocorrelation-based fundamental frequency (F0) detection
  - Returns: `{ pitch: Hz, pitchConfidence: 0.0-1.0 }`
  - Confidence threshold: **> 0.6** (filters unreliable detections)
  - Robust to noise, optimized for monophonic signals

• **Data Conversion**:
  - `arrayToVector()`: Converts `Float32Array` → Essentia `VectorFloat`
  - Handles memory transfer between JavaScript and WASM

**Pitch Detection Pipeline:**
```
Audio Buffer → arrayToVector() → PitchYin() → { pitch, confidence }
```

---

## 2.3 Music Theory & Signal Processing

### Frequency-to-Note Conversion

**Equal Temperament Tuning:**
- Reference: **A4 = 440 Hz**
- Semitone ratio: **2^(1/12)**
- Formula: `f = 440 × 2^((n - 69) / 12)` where n = MIDI note number

**Implementation:**
- Calculates semitones from A4: `semis = 12 × log₂(freq / 440)`
- Maps to 12-note chromatic scale: `['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']`
- Returns note name + octave (e.g., `{ note: 'E', octave: 2 }`)

**Alternative Method (used):**
- Iterates octaves 0-8, finds closest frequency match
- More robust to tuning variations and calibration errors

---

### Guitar String Frequencies & Detection

**Standard Tuning (EADGBE):**
| String | Frequency | Note |
|--------|-----------|------|
| E_low (6th) | 82.41 Hz | E2 |
| A (5th) | 110.00 Hz | A2 |
| D (4th) | 146.83 Hz | D3 |
| G (3rd) | 196.00 Hz | G3 |
| B (2nd) | 246.94 Hz | B3 |
| E_high (1st) | 329.63 Hz | E4 |

**String Detection Algorithm:**
1. **Microphone calibration**: `freq = rawFreq / 0.915` (accounts for ~9% bias)
2. **Harmonic analysis**: Checks fundamental, 2nd harmonic (f/2), 4th harmonic (f/4)
3. **Distance calculation**: Finds closest string match via absolute frequency difference
4. **Tolerance check**: Accepts matches within **120 cents** (1 semitone)
   - Cents formula: `cents = 1200 × log₂(freq / baseFreq)`

**Why harmonics?** Pitch detectors may return harmonics; checking multiple candidates improves robustness.

---

### Fretboard Mapping & Note Validation

**Fretboard Structure:**
- Each string: frets 0-5 (open + 5 frets)
- Each fret: +1 semitone
- Example (E_low): Fret 0=E2, 1=F2, 2=F#2, 3=G2, 4=G#2, 5=A2

**Validation Algorithm:**
1. **Expected string lookup**: Sequential detection (E_low → E_high)
2. **Possible notes lookup**: Retrieves valid notes for string from `STRING_NOTES`
3. **Note matching**:
   - Checks detected note name + octave
   - Handles enharmonic equivalents (F# = Gb, Bb = A#)
   - Validates octave matches expected range
4. **Fret determination**: Returns fret number if valid, else 0 (invalid) with error

**Enharmonic Handling:**
- Each note includes `enharmonics` array (e.g., F#2: `['F#', 'Gb']`)
- Ensures correct validation regardless of pitch detector naming

---

### Chord Theory

**Chord Composition:**
- Chords defined by constituent notes (without octave)
- Example: C major = `['C', 'E', 'G']`
- Supports: Major, Minor, Seventh chords (12 total)

**Validation Logic:**
- **Per-string validation**: Each detected note checked against chord notes
- **Note matching**: Compares note names with enharmonic handling
- **Overall correctness**: `isOverallCorrect = isValidOnString && isCorrectNote`
  - Requires: (1) Note playable on expected string, (2) Note in chord

---

### Onset Detection

**RMS (Root Mean Square) Energy:**
```
RMS = √(Σ(sample²) / N)
```

**Purpose:** Detect note attacks (when string is plucked)

**Parameters:**
- **Threshold**: RMS > **0.012** (empirically tuned)
- **Debouncing**: Minimum 300ms between detections
- Prevents multiple triggers from single pluck

**Why RMS?**
- Measures overall signal energy
- Computationally efficient
- Robust to noise compared to peak detection

---

## 2.4 Real-Time Processing Architecture

**RequestAnimationFrame Loop:**
- Runs at display refresh rate (~60 fps)
- Each frame:
  1. Extract audio buffer (2048 samples)
  2. Calculate RMS → detect onset
  3. If onset → PitchYin pitch detection
  4. Process pitch → validate note & string
  5. Update UI with visual feedback
  6. Schedule next frame

**State Management:**
- React refs for high-frequency updates (avoid re-renders)
- Sequential string detection: guides user E_low → E_high
- Advances after each detection (even if incorrect) for continuous feedback

**Performance:**
- WASM execution: ~1-2ms per pitch detection
- Total latency: <50ms from pluck to visual feedback
- Suitable for real-time interactive learning

