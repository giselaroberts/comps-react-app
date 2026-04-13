# Paper Outline: Real-Time Guitar Chord Learning Application

## 1. Problem Statement - What problem are you solving? Why is it important?

• **Learning gap**: Traditional guitar learning methods lack real-time feedback on note/chord accuracy
  - Students can't immediately know if they're playing correctly
  - Requires external validation (teacher, tuner, or recording playback)
  - Slows learning progression and reduces confidence

• **Accessibility barriers**: Guitar instruction can be expensive and geographically limited
  - Private lessons are costly
  - Not everyone has access to quality instruction
  - Self-learning resources often lack interactive feedback

• **Technology opportunity**: Web-based solutions can provide accessible, real-time feedback
  - Modern browsers support real-time audio processing
  - No installation required (web-based)
  - Works on any device with a microphone

• **Educational impact**: Immediate feedback improves learning outcomes
  - Real-time correction helps develop muscle memory
  - Reduces frustration from practicing incorrectly
  - Enables independent practice with confidence

---

## 2. Technical Background - What does someone need to know to understand the problem?

• **Web Audio API fundamentals**
  - MediaStream API for microphone access (`getUserMedia()`)
  - AudioContext for audio processing pipeline
  - AnalyserNode for extracting audio data (FFT, time-domain samples)
  - Real-time audio buffer processing (2048-sample frames)

• **Signal processing basics**
  - RMS (Root Mean Square) energy calculation for onset detection
  - Frequency domain analysis (FFT, frequency bins)
  - Pitch detection algorithms (autocorrelation methods like PitchYin)
  - Harmonic analysis (fundamental frequency vs. harmonics)

• **Music theory essentials**
  - Equal temperament tuning (A4 = 440 Hz reference)
  - Frequency-to-note conversion (semitone calculations)
  - Guitar standard tuning (EADGBE string frequencies)
  - Fretboard mapping (semitone intervals per fret)
  - Chord composition (major, minor, seventh chords)
  - Enharmonic equivalents (F# = Gb, etc.)

• **WebAssembly (WASM) architecture**
  - Performance benefits for computationally intensive audio processing
  - Essentia.js library structure (runtime + algorithms)
  - Memory management between JavaScript and WASM

• **Real-time processing constraints**
  - Latency requirements (<50ms for interactive feedback)
  - Frame-based processing with `requestAnimationFrame()`
  - State management for continuous audio streams

---

## 3. Prior Work - How have other people solved similar problems? What inspirations are you drawing from?

• **Existing guitar learning applications**
  - Yousician, Fretello: Commercial apps with similar goals but proprietary/paid
  - GuitarTuna: Focus on tuning, less on chord learning
  - Gap: Most require app installation, not web-based

• **Web-based audio processing**
  - Web Audio API standardization (2011-present)
  - Essentia.js: Open-source audio analysis library
  - Prior work on browser-based pitch detection

• **Music education technology**
  - Interactive learning platforms (Khan Academy, Duolingo model)
  - Gamification in music education
  - Real-time feedback systems in educational software

• **Technical inspirations**
  - Essentia.js PitchYin algorithm: Robust pitch detection for monophonic signals
  - Web Audio API examples: Real-time audio visualization projects
  - React-based interactive UIs: Modern web application patterns

• **Research gaps addressed**
  - Open-source, web-based solution (no installation barrier)
  - Real-time chord validation (not just individual notes)
  - Sequential string detection for guided learning
  - Free and accessible alternative to commercial solutions

---

## 4. Methods - How did you go about solving the problem? What did you do?

• **System architecture design**
  - React-based frontend with routing (Home → Chord Selection → Learn/Play modes)
  - Custom hook (`useGuitarDetection`) for audio processing logic
  - Component-based UI for chord visualization and feedback

• **Audio capture pipeline**
  - Implemented `getUserMedia()` for microphone access
  - Created AudioContext with AnalyserNode (2048 FFT size)
  - Continuous audio buffer extraction via `requestAnimationFrame()` loop

• **Onset detection**
  - RMS energy calculation from time-domain audio samples
  - Threshold-based detection (RMS > 0.012, empirically tuned)
  - Debouncing mechanism (300ms minimum between detections)

• **Pitch detection implementation**
  - Integrated Essentia.js WASM library (PitchYin algorithm)
  - Data conversion: Float32Array → Essentia VectorFloat
  - Confidence filtering (accept only pitchConfidence > 0.6)
  - Microphone calibration adjustment (freq = rawFreq / 0.915)

• **Note and string identification**
  - Frequency-to-note conversion using equal temperament (A4 = 440 Hz)
  - Harmonic analysis (check fundamental, 2nd, 4th harmonics)
  - String matching algorithm (find closest string within 120 cents tolerance)
  - Sequential detection flow (E_low → A → D → G → B → E_high)

• **Fretboard validation**
  - Fretboard mapping data structure (notes per string, frets 0-5)
  - Note validation against expected string and fret position
  - Enharmonic equivalent handling (F# = Gb, etc.)
  - Octave range validation

• **Chord validation logic**
  - Chord definition data structures (12 chords: major, minor, seventh)
  - Per-string validation: Check if detected note is in chord
  - Overall correctness calculation (string validity + note correctness)
  - Visual feedback system (color-coded strings, success/error indicators)

• **User interface design**
  - Chord selection page with visual chord diagrams
  - Learn mode: Guided sequential string detection with instructions
  - Play mode: Real-time chord validation during playing
  - Visual feedback: String highlighting, note indicators, progress tracking

---

## 5. Evaluation Metrics - How will we know that the problem has been solved?

• **Accuracy metrics**
  - Pitch detection accuracy: Percentage of correctly identified notes vs. ground truth
  - String identification accuracy: Correct string detection rate
  - Chord validation accuracy: True positive/negative rates for chord correctness
  - False positive rate: Incorrect detections when no note is played

• **Performance metrics**
  - Latency: Time from note pluck to visual feedback (<50ms target)
  - Processing time: Pitch detection execution time (~1-2ms per detection)
  - Frame rate: Consistency of `requestAnimationFrame()` loop (~60 fps)
  - CPU usage: Resource consumption during real-time processing

• **Robustness metrics**
  - Noise tolerance: Performance with background noise
  - Microphone variation: Accuracy across different microphone types
  - Tuning variation: Handling of slightly out-of-tune guitars
  - Harmonic handling: Correct identification when pitch detector returns harmonics

• **User experience metrics**
  - Onset detection reliability: Percentage of plucks correctly detected
  - False trigger rate: Onset detections when no note is played
  - Calibration effectiveness: Consistency across different devices
  - Visual feedback clarity: User understanding of validation results

• **Educational effectiveness** (if user testing conducted)
  - Learning curve: Improvement in chord accuracy over time
  - User satisfaction: Subjective feedback on helpfulness
  - Practice session duration: Engagement metrics
  - Error correction rate: How quickly users correct mistakes

---

## 6. Results and Discussion - Did you actually solve the problem? Why/Why not?

• **Successes achieved**
  - Real-time audio processing: Successfully implemented <50ms latency feedback
  - Pitch detection: Essentia.js PitchYin provides reliable monophonic pitch detection
  - Chord validation: Logic correctly identifies valid vs. invalid chord notes
  - Web-based accessibility: Works in modern browsers without installation
  - Sequential learning: Guided string-by-string detection aids learning

• **Technical achievements**
  - WASM integration: Efficient audio processing in browser environment
  - Onset detection: RMS-based method reliably detects note attacks
  - Harmonic handling: Algorithm correctly identifies notes from harmonic frequencies
  - Calibration: Microphone bias adjustment improves accuracy

• **Limitations and challenges**
  - Monophonic constraint: System works best for single notes, not full chord strums
  - Microphone dependency: Accuracy varies with microphone quality
  - Environmental noise: Background noise can affect detection reliability
  - Tuning sensitivity: Requires reasonably in-tune guitar (within ~1 semitone)
  - Browser compatibility: Requires modern browser with Web Audio API support

• **Why the problem is partially solved**
  - ✅ Real-time feedback: Successfully provides immediate validation
  - ✅ Accessibility: Web-based, no installation required
  - ✅ Educational value: Helps users learn correct fingerings
  - ⚠️ Note-by-note limitation: Doesn't handle full chord strums simultaneously
  - ⚠️ Environmental factors: Performance depends on recording conditions

• **Future improvements**
  - Polyphonic pitch detection for full chord analysis
  - Machine learning for improved noise robustness
  - Advanced calibration for different guitar types
  - Extended fretboard range (beyond 5 frets)
  - Progress tracking and learning analytics

---

## 7. Ethical Considerations - Why might people want to be careful about your project? What difficult decisions did you have to make?

• **Privacy and data collection**
  - Microphone access: Requires user permission, potential privacy concerns
  - Audio data handling: No audio is stored or transmitted, processed locally only
  - Decision: Process all audio client-side, no server communication

• **Accessibility and inclusion**
  - Device requirements: Requires microphone and modern browser
  - Digital divide: May exclude users without adequate technology
  - Decision: Prioritize web-based solution for maximum accessibility, document requirements clearly

• **Educational equity**
  - Free vs. paid alternatives: Provides free alternative to commercial apps
  - Open-source approach: Code available for extension and improvement
  - Decision: Make project open-source to promote educational access

• **Accuracy and safety**
  - False positives/negatives: Incorrect feedback could mislead learners
  - Calibration issues: Device-specific variations may cause errors
  - Decision: Implement confidence thresholds and clear error indicators

• **Technical limitations disclosure**
  - Honest communication: Must clearly state system limitations
  - User expectations: Should not overpromise capabilities
  - Decision: Document limitations (monophonic, environmental sensitivity) transparently

• **Intellectual property**
  - Essentia.js licensing: Using open-source library (must respect license)
  - Chord diagrams: Standard music theory knowledge (public domain)
  - Decision: Use open-source libraries, create original implementation

• **User safety**
  - No harmful content: Educational tool with no malicious functionality
  - Browser security: Relies on browser security for microphone access
  - Decision: Follow browser security best practices, request minimal permissions

---

## 8. Replication Instructions - How would someone else use your project?

• **Prerequisites**
  - Node.js and npm installed (for development)
  - Modern web browser with Web Audio API support (Chrome, Firefox, Safari, Edge)
  - Microphone connected to device
  - Git (for cloning repository)

• **Installation steps**
  1. Clone the repository: `git clone [repository-url]`
  2. Navigate to project directory: `cd comps-react-app`
  3. Install dependencies: `npm install`
  4. Start development server: `npm run dev`
  5. Open browser to localhost URL (typically `http://localhost:5173`)

• **Usage instructions**
  1. Grant microphone permissions when prompted by browser
  2. Select a chord from the home page
  3. Choose "Learn" mode for guided practice or "Play" mode for free practice
  4. In Learn mode: Follow sequential string detection (E_low → E_high)
  5. Pluck strings one at a time and observe real-time feedback
  6. Visual indicators show correct (green) or incorrect (red) notes

• **Production deployment**
  - Build for production: `npm run build`
  - Deploy `dist/` folder to static hosting (Vercel, Netlify, GitHub Pages)
  - Ensure HTTPS (required for microphone access in production)

• **Troubleshooting**
  - Microphone not working: Check browser permissions, try different browser
  - No pitch detection: Ensure guitar is reasonably in-tune, reduce background noise
  - Calibration issues: System includes automatic calibration, but may need adjustment for some microphones
  - Performance issues: Close other applications, use modern browser

• **Configuration options**
  - RMS threshold: Adjustable in code (default: 0.012)
  - Confidence threshold: PitchYin confidence filter (default: > 0.6)
  - Debounce time: Minimum time between detections (default: 300ms)
  - Calibration factor: Microphone adjustment (default: 0.915)

---

## 9. Code Architecture Overview - How would someone else extend your project?

• **Project structure**
  ```
  src/
    ├── components/          # React UI components
    │   ├── Home.jsx         # Landing page
    │   ├── ChordSelectionPage.jsx  # Chord selection interface
    │   ├── LearnPage.jsx    # Guided learning mode
    │   ├── PlayPage.jsx     # Free practice mode
    │   └── [other components]
    ├── hooks/
    │   └── useGuitarDetection.jsx  # Core audio processing logic
    ├── constants.js         # Chord definitions, string frequencies, etc.
    └── App.jsx              # Router configuration
  ```

• **Key extension points**

  **Adding new chords:**
  - Edit `src/constants.js`: Add chord definition to `CHORDS` object
  - Format: `{ name: 'ChordName', notes: ['C', 'E', 'G'] }`
  - Automatically appears in chord selection UI

  **Extending fretboard range:**
  - Modify `STRING_NOTES` in `constants.js`
  - Update fretboard mapping data structure
  - Adjust validation logic in `useGuitarDetection.jsx`

  **Improving pitch detection:**
  - Modify `useGuitarDetection.jsx` hook
  - Adjust PitchYin parameters or try alternative Essentia.js algorithms
  - Experiment with different confidence thresholds

  **Adding new learning modes:**
  - Create new component in `src/components/`
  - Reuse `useGuitarDetection` hook for audio processing
  - Add route in `App.jsx` router configuration

  **Polyphonic detection (advanced):**
  - Replace PitchYin with polyphonic pitch detection algorithm
  - Modify audio processing pipeline to handle multiple simultaneous frequencies
  - Update validation logic for multi-note analysis

• **Core modules to understand**

  **`useGuitarDetection.jsx`:**
  - Audio capture and processing
  - Onset detection (RMS calculation)
  - Pitch detection (Essentia.js integration)
  - Note/string/fret validation
  - State management for sequential detection

  **`constants.js`:**
  - Chord definitions
  - String frequency mappings
  - Fretboard note mappings
  - Configuration parameters

  **Component architecture:**
  - LearnPage: Uses hook for guided learning
  - PlayPage: Uses hook for free practice
  - ChordLayout: Shared layout with routing

• **Integration opportunities**
  - Progress tracking: Add database/localStorage for user progress
  - Analytics: Track learning metrics and improvement over time
  - Social features: Share progress, compare with others
  - Advanced exercises: Scales, arpeggios, chord progressions
  - Different instruments: Extend to bass, ukulele, etc.
  - Machine learning: Train model for improved noise robustness

• **Testing and debugging**
  - Add unit tests for music theory calculations (frequency-to-note conversion)
  - Integration tests for audio processing pipeline
  - Mock audio streams for testing without microphone
  - Performance profiling for optimization opportunities

