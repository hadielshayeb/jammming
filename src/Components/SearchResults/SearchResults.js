import React from 'react';
import './SearchResults.css';
import Tracklist from '../Tracklist/Tracklist';

function SearchResults() {
  // Placeholder tracks
  const tracks = [
    { id: 1, name: 'Track 1', artist: 'Artist 1', album: 'Album 1' },
    { id: 2, name: 'Track 2', artist: 'Artist 2', album: 'Album 2' },
  ];

  return (
    <div className="SearchResults">
      <h2>Results</h2>
      <Tracklist tracks={tracks} isRemoval={false} />
    </div>
  );
}

export default SearchResults;
