import React from 'react';
import './App.css';
import SearchBar from './Components/SearchBar/SearchBar';
import SearchResults from './Components/SearchResults/SearchResults';
import Playlist from './Components/Playlist/Playlist';

function App() {

  const sampleTracks = [
    {
      id: 1,
      name: "Shape of You",
      artist: "Ed Sheeran",
      album: "Divide"
    },
    {
      id: 2,
      name: "Blinding Lights",
      artist: "The Weeknd",
      album: "After Hours"
    },
    {
      id: 3,
      name: "Levitating",
      artist: "Dua Lipa",
      album: "Future Nostalgia"
    }
  ];
  
  return (
    <div className="App">
      <h1>Ja<span className="highlight">mmm</span>ing</h1>
      <SearchBar />
      <div className="App-playlist">
        {/* Pass track data down to SearchResults */}
        <SearchResults tracks={sampleTracks} />
        <Playlist />
      </div>
    </div>
  );
}

export default App;