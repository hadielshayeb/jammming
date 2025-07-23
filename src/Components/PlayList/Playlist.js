import React from 'react';
import './Playlist.css';
import Tracklist from '../Tracklist/Tracklist';

function Playlist() {
  // Placeholder playlist tracks
  const playlistTracks = [
    { id: 3, name: 'Playlist Track 1', artist: 'Artist 3', album: 'Album 3' },
    { id: 4, name: 'Playlist Track 2', artist: 'Artist 4', album: 'Album 4' },
  ];

  return (
    <div className="Playlist">
      <input defaultValue="New Playlist" />
      <Tracklist tracks={playlistTracks} isRemoval={true} />
      <button className="Playlist-save">Save To Spotify</button>
    </div>
  );
}

export default Playlist;
