import React, { useState } from 'react';
import './App.css';
import SearchBar from './Components/SearchBar/SearchBar';
import SearchResults from './Components/SearchResults/SearchResults';
import Playlist from './Components/Playlist/Playlist';
import Spotify from './util/Spotify';

function App() {
  // Mock search results
  const [searchResults, setSearchResults] = useState([]);
  const [playlist, setPlaylist] = useState("My Playlist");
  const [playlistTracks, setPlaylistTracks] = useState([]);

  const addTrack = (track) => {
    if (playlistTracks.find(savedTrack => savedTrack.id === track.id)) {
      return;
    }
    setPlaylistTracks((prevTracks) => [...prevTracks, track]);
  };

  const removeTrack = (track) => {
    setPlaylistTracks((prevTracks) => prevTracks.filter(savedTrack => savedTrack.id !== track.id));
  };

  const updatePlaylistName = (name) => {
    setPlaylist(name);
  };

  const savePlaylist = () => {
    const trackUris = playlistTracks.map(track => track.uri);
    Spotify.savePlaylist(playlist, trackUris).then(() => {
      setPlaylist('New Playlist');
      setPlaylistTracks([]);
    });
  };

  const searchSpotify = (term) => {
    Spotify.search(term).then((tracks) => setSearchResults(tracks));
  };

  return (
    <div className="App">
      <h1>Ja<span className="highlight">mmm</span>ing</h1>
      <SearchBar onSearch={searchSpotify} />
      <div className="App-playlist">
        {/* Pass track data down to SearchResults */}
        <SearchResults tracks={searchResults} onAdd={addTrack} />
        <Playlist 
          playlistname={playlist} 
          playlistTracks={playlistTracks} 
          onRemove={removeTrack}
          onNameChange={updatePlaylistName}
          onSave={savePlaylist}
        />
      </div>
    </div>
  );
}

export default App;