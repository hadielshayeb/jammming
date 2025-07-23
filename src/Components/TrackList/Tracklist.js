import React from 'react';
import './Tracklist.css';
import Track from '../Track/Track';

function Tracklist({ tracks, isRemoval }) {
  return (
    <div className="Tracklist">
      {tracks && tracks.map(track => (
        <Track key={track.id} track={track} isRemoval={isRemoval} />
      ))}
    </div>
  );
}

export default Tracklist;
