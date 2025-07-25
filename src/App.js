import React, { useState } from 'react';
import './App.css';
import SearchBar from './Components/SearchBar/SearchBar';
import SearchResults from './Components/SearchResults/SearchResults';
import Playlist from './Components/Playlist/Playlist';

function App() {
  // Mock search results
  const [searchResults, setSearchResults] = useState([
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
  ]);

  const [playlist, setPlaylist] = useState("My Playlist");
  const [playlistTracks, setPlaylistTracks] = useState([
    { 
      id: 4, 
      name: 'Save Your Tears', 
      artist: 'The Weeknd', 
      album: 'After Hours' 
    },
    { id: 5, 
      name: 'Blinding Lights', 
      artist: 'The Weeknd', 
      album: 'After Hours' 
    },
    { id: 6, 
      name: 'Levitating', 
      artist: 'Dua Lipa', 
      album: 'Future Nostalgia' 
    }
  ]);

  const addTrack = (track) => {
    if (playlistTracks.find(savedTrack => savedTrack.id === track.id)) {
      return;
    }
    setPlaylistTracks((prevTracks) => [...prevTracks, track]);
  };

  return (
    <div className="App">
      <h1>Ja<span className="highlight">mmm</span>ing</h1>
      <SearchBar />
      <div className="App-playlist">
        {/* Pass track data down to SearchResults */}
        <SearchResults tracks={searchResults} onAdd={addTrack} />
        <Playlist playlistname={playlist} playlistTracks={playlistTracks} />
      </div>
    </div>
  );
}

export default App;