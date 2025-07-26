const CLIENT_ID = '36a164d40a9c4c128c60e1015c193db4';
const REDIRECT_URI = 'https://hadielshayeb.github.io/jammming/';
let accessToken;
let userId;

const Spotify = {
  // Redirect user to Spotify Auth page
  getAuth() {
    const tokenURL = `https://accounts.spotify.com/authorize?client_id=${CLIENT_ID}&response_type=token&scope=playlist-modify-public&redirect_uri=${encodeURIComponent(REDIRECT_URI)}`;
    window.location = tokenURL;
  },

  // Checks URL on page load for access_token
  checkAuth() {
    const authenticated = window.location.href.match(/access_token=([^&]*)/);
    if (authenticated) {
      accessToken = authenticated[1];

      // Optional: Clean the URL
      window.history.pushState('AccessToken', null, REDIRECT_URI);
      return true;
    } else {
      return false;
    }
  },

  getUserName() {
    if (!accessToken) return Promise.reject(new Error('Access token is missing'));

    return fetch('https://api.spotify.com/v1/me', {
      headers: { Authorization: `Bearer ${accessToken}` }
    })
      .then(response => {
        if (!response.ok) throw new Error('Failed to fetch user data');
        return response.json();
      })
      .then(data => {
        userId = data.id;
        return data.display_name;
      });
  },

  searchTracks(searchInput) {
    if (!accessToken) return Promise.reject(new Error('Access token is missing'));

    return fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(searchInput)}&type=track`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    })
      .then(response => response.json())
      .then(data => {
        if (!data.tracks) return [];
        return data.tracks.items.map(track => ({
          id: track.id,
          name: track.name,
          artist: track.artists[0].name,
          album: track.album.name,
          image: track.album.images[0]?.url,
          uri: track.uri
        }));
      });
  },

  createPlaylist(listName, urisArray) {
    if (!accessToken) return Promise.reject(new Error('Access token is missing'));
    if (!userId) return Promise.reject(new Error('User ID is missing'));

    return fetch(`https://api.spotify.com/v1/users/${userId}/playlists`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name: listName })
    })
      .then(response => {
        if (!response.ok) throw new Error('Failed to create playlist');
        return response.json();
      })
      .then(data => {
        const playlistId = data.id;
        return fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ uris: urisArray })
        });
      })
      .then(res => res.ok);
  }
};

export default Spotify;