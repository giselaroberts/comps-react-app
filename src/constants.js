// The 12 basic guitar chords
export const BASIC_CHORDS = [
  'C', 'D', 'E', 'F', 'G', 'A',
  'Am', 'Dm', 'Em', 'Fm', 'C7', 'G7'
];

// Chord definitions: notes that should be in each chord (without octave)
export const CHORD_NOTES = {
  'C': ['C', 'E', 'G'],
  'D': ['D', 'F#', 'A'],
  'E': ['E', 'G#', 'B'],
  'F': ['F', 'A', 'C'],
  'G': ['G', 'B', 'D'],
  'A': ['A', 'C#', 'E'],
  'Am': ['A', 'C', 'E'],
  'Dm': ['D', 'F', 'A'],
  'Em': ['E', 'G', 'B'],
  'Fm': ['F', 'G#', 'C'],
  'C7': ['C', 'E', 'G', 'Bb'],
  'G7': ['G', 'B', 'D', 'F']
};

// data/chordShapes.js
export const CHORD_SHAPES = {
  C: {
    dots: [
      { string: 2, fret: 1},
      { string: 4, fret: 2},
      { string: 5, fret: 3},
      { string: 1, open: true },
      { string: 3, open: true },
      { string: 6, muted: true },
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
      { string: 3, fret: 2},
      { string: 4, fret: 3},
    ],
    barre: { fret: 1, fromString: 1, toString: 6 },
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
