// The 12 basic guitar chords
export const BASIC_CHORDS = [
  'C', 'D', 'E', 'F', 'G', 'A',
  'Am', 'Dm', 'Em', 'Fm', 'C7', 'G7'
];

// Chord definitions: notes that should be in each chord (without octave)
export const CHORD_NOTES = {
  'Em': ['E', 'G', 'B'],
  'E': ['E', 'G#', 'B'],
  'Am': ['A', 'C', 'E'],
  'C': ['C', 'E', 'G'],
  'A': ['A', 'C#', 'E'],
  'G': ['G', 'B', 'D'],
  'D': ['D', 'F#', 'A'],
  'Dm': ['D', 'F', 'A'],
  'F': ['F', 'A', 'C'],
  'Fm': ['F', 'G#', 'C'],
  'C7': ['C', 'E', 'G', 'Bb'],
  'G7': ['G', 'B', 'D', 'F']
};

// Possible notes for each string at frets 0-5 (with octaves)
// Format: { fret: number, note: string, octave: number }
// Also includes enharmonic equivalents (e.g., F# = Gb, Bb = A#)
export const STRING_NOTES = {
  'E_low': [
    { fret: 0, note: 'E', octave: 2, enharmonics: ['E'] },
    { fret: 1, note: 'F', octave: 2, enharmonics: ['F', 'E#'] },
    { fret: 2, note: 'F#', octave: 2, enharmonics: ['F#', 'Gb'] },
    { fret: 3, note: 'G', octave: 2, enharmonics: ['G'] },
    { fret: 4, note: 'G#', octave: 2, enharmonics: ['G#', 'Ab'] },
    { fret: 5, note: 'A', octave: 2, enharmonics: ['A'] }
  ],
  'A': [
    { fret: 0, note: 'A', octave: 2, enharmonics: ['A'] },
    { fret: 1, note: 'A#', octave: 2, enharmonics: ['A#', 'Bb'] },
    { fret: 2, note: 'B', octave: 2, enharmonics: ['B', 'Cb'] },
    { fret: 3, note: 'C', octave: 3, enharmonics: ['C', 'B#'] },
    { fret: 4, note: 'C#', octave: 3, enharmonics: ['C#', 'Db'] },
    { fret: 5, note: 'D', octave: 3, enharmonics: ['D'] }
  ],
  'D': [
    { fret: 0, note: 'D', octave: 3, enharmonics: ['D'] },
    { fret: 1, note: 'D#', octave: 3, enharmonics: ['D#', 'Eb'] },
    { fret: 2, note: 'E', octave: 3, enharmonics: ['E', 'Fb'] },
    { fret: 3, note: 'F', octave: 3, enharmonics: ['F', 'E#'] },
    { fret: 4, note: 'F#', octave: 3, enharmonics: ['F#', 'Gb'] },
    { fret: 5, note: 'G', octave: 3, enharmonics: ['G'] }
  ],
  'G': [
    { fret: 0, note: 'G', octave: 3, enharmonics: ['G'] },
    { fret: 1, note: 'G#', octave: 3, enharmonics: ['G#', 'Ab'] },
    { fret: 2, note: 'A', octave: 3, enharmonics: ['A'] },
    { fret: 3, note: 'A#', octave: 3, enharmonics: ['A#', 'Bb'] },
    { fret: 4, note: 'B', octave: 3, enharmonics: ['B', 'Cb'] },
    { fret: 5, note: 'C', octave: 4, enharmonics: ['C', 'B#'] }
  ],
  'B': [
    { fret: 0, note: 'B', octave: 3, enharmonics: ['B', 'Cb'] },
    { fret: 1, note: 'C', octave: 4, enharmonics: ['C', 'B#'] },
    { fret: 2, note: 'C#', octave: 4, enharmonics: ['C#', 'Db'] },
    { fret: 3, note: 'D', octave: 4, enharmonics: ['D'] },
    { fret: 4, note: 'D#', octave: 4, enharmonics: ['D#', 'Eb'] },
    { fret: 5, note: 'E', octave: 4, enharmonics: ['E', 'Fb'] }
  ],
  'E_high': [
    { fret: 0, note: 'E', octave: 4, enharmonics: ['E', 'Fb'] },
    { fret: 1, note: 'F', octave: 4, enharmonics: ['F', 'E#'] },
    { fret: 2, note: 'F#', octave: 4, enharmonics: ['F#', 'Gb'] },
    { fret: 3, note: 'G', octave: 4, enharmonics: ['G'] },
    { fret: 4, note: 'G#', octave: 4, enharmonics: ['G#', 'Ab'] },
    { fret: 5, note: 'A', octave: 4, enharmonics: ['A'] }
  ]
};

export const CHORD_SHAPES = {
  C: {
    dots: [
      { string: 1, muted: true},
      { string: 2, fret: 3},
      { string: 3, fret: 2},
      { string: 4, open: true },
      { string: 5, fret: 1 },
      { string: 6, open: true },
    ],
  },
  D: {
    dots: [
      { string: 4, fret: 2},
      { string: 5, fret: 3},
      { string: 6, fret: 2},
      { string: 1, muted: true},
      { string: 2, muted: true },
      { string: 3, open: true },
    ],
  },
  E: {
    dots: [
      { string: 1, open: true},
      { string: 2, fret: 2},
      { string: 3, fret: 2},
      { string: 4, fret: 1},
      { string: 5, open: true },
      { string: 6, open: true },
    ],
  },
  G: {
    dots: [
      { string: 6, fret: 3},
      { string: 5, fret: 2},
      { string: 1, fret: 3},
      { string: 2, fret: 3},
      { string: 3, open: true },
      { string: 4, open: true },
    ],
  },
  A: {
    dots: [
      { string: 1, muted: true},
      { string: 2, open: true},
      { string: 3, fret: 2},
      { string: 4, fret: 2},
      { string: 5, fret: 2 },
      { string: 6, open: true },
    ],
  },
  F: {
    dots: [
      { string: 1, muted: true},
      { string: 2, muted: true},
      { string: 3, fret: 3},
      { string: 4, fret: 2},
    ],
    barre: { fret: 1, fromString: 5, toString: 6 },
  },
  Am: {
    dots: [
      { string: 1, muted: true},
      { string: 2, open: true},
      { string: 3, fret: 2},
      { string: 4, fret: 2},
      { string: 5, fret: 1 },
      { string: 6, open: true },
    ],
  },
  Dm: {
    dots: [
      { string: 1, muted: true},
      { string: 2, muted: true},
      { string: 3, open: true},
      { string: 4, fret: 2},
      { string: 5, fret: 3 },
      { string: 6, fret: 1 },
    ],
  },
  Em: {
    dots: [
      { string: 1, open: true},
      { string: 2, fret: 2},
      { string: 3, fret: 2},
      { string: 4, open: true},
      { string: 5, open: true },
      { string: 6, open: true },
    ],
  },
  Fm: {
    dots: [
      { string: 2, fret: 3},
      { string: 3, fret: 3},
    ],
    barre: { fret: 1, fromString: 1, toString: 6 },
  },
  C7: {
    dots: [
      { string: 1, muted: true},
      { string: 2, fret: 3},
      { string: 3, fret: 2},
      { string: 4, fret: 3},
      { string: 5, fret: 1 },
      { string: 6, open: true },
    ],
  },
  G7: {
    dots: [
      { string: 1, fret: 3},
      { string: 2, fret: 2},
      { string: 3, open: true},
      { string: 4, open: true},
      { string: 5, open: true },
      { string: 6, fret: 1 },
    ],
  },
};
