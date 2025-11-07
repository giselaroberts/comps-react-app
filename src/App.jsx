import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import ChordLayout from './components/ChordLayout';
import ChordSelectionPage from './components/ChordSelectionPage';
import LearnPage from './components/LearnPage';
import PlayPage from './components/PlayPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        {/* Nested routes: parent route with child routes */}
        <Route path="/chord/:chordName" element={<ChordLayout />}>
          {/* Index route: shows chord name and Learn/Play buttons */}
          <Route index element={<ChordSelectionPage />} />
          <Route path="learn" element={<LearnPage />} />
          <Route path="play" element={<PlayPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
