import React from 'react';
import './Track.css';

function Track({ track, isRemoval, onAdd, onRemove }) {
  const addTrack = () => {
    onAdd(track);
  };

  const removeTrack = () => {
    onRemove(track);
  };

  // Handle both old format (artist) and new format (artists array)
  const artistDisplay = track.artists ? track.artists.join(', ') : track.artist;

  return (
    <div className="Track">
      <div className="Track-information">
        <h3>{track.name}</h3>
        <p>{artistDisplay} | {track.album}</p>
      </div>
      {isRemoval ? (
        <button className="Track-action" onClick={removeTrack}>-</button>
      ) : (
        <button className="Track-action" onClick={addTrack}>+</button>
      )}
    </div>
  );
}

export default Track;