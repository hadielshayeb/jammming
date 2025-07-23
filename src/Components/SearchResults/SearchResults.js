import React from 'react';
import './SearchResults.css';
import Tracklist from '../Tracklist/Tracklist';

function SearchResults({ tracks }) {
  return (
    <div className="SearchResults">
      <h2>Results</h2>
      <Tracklist tracks={tracks} isRemoval={false} />
    </div>
  );
}

export default SearchResults;
