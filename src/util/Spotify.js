const CLIENT_ID = '36a164d40a9c4c128c60e1015c193db4';
const REDIRECT_URI = 'https://hadielshayeb.github.io/jammming'; // EXACT URI
let accessToken;
let userId;

const Spotify = {
  // Redirect user to Spotify Auth page
  getAuth() {
    const tokenURL = `https://accounts.spotify.com/authorize?client_id=${CLIENT_ID}&response_type=token&scope=playlist-modify-public&redirect_uri=${encodeURIComponent(REDIRECT_URI)}`;
    window.location = tokenURL;
  },

  // Check if token exists in the URL after login
  checkAuth() {
    const tokenMatch = window.location.href.match(/access_token=([^&]*)/);
    const expiresInMatch = window.location.href.match(/expires_in=([^&]*)/);

    if (tokenMatch && expiresInMatch) {
      accessToken = tokenMatch[1];
      const expiresIn = Number(expiresInMatch[1]);

      console.log('Access token retrieved:', accessToken);

      // Clear token when it expires
      window.setTimeout(() => (accessToken = ''), expiresIn * 1000);

      // Clean URL (remove token hash)
      window.history.pushState('AccessToken', null, REDIRECT_URI);

      return true;
    }
    return false;
  },

  // Check authentication status
  isAuthenticated() {
    return !!accessToken;
  },

  // Fetch the Spotify user's profile info
  getUserName() {
    if (!accessToken) {
      return Promise.reject(new Error('Access token is missing. Please log in.'));
    }

    return fetch('https://api.spotify.com/v1/me', {
      headers: { Authorization: `Bearer ${accessToken}` }
    })
      .then((response) => {
        if (!response.ok) throw new Error('Failed to fetch user data');
        return response.json();
      })
      .then((data) => {
        userId = data.id;
        return data.display_name;
      });
  },

  // Search for tracks
  searchTracks(searchInput) {
    if (!accessToken) {
      console.error('No access token! Please authenticate first.');
      return Promise.resolve([]);
    }

    const searchEndpoint = `https://api.spotify.com/v1/search?q=${encodeURIComponent(searchInput)}&type=track`;

    return fetch(searchEndpoint, {
      headers: { Authorization: `Bearer ${accessToken}` }
    })
      .then((response) => {
        if (!response.ok) {
          console.error('Spotify API error:', response.status, response.statusText);
          return { tracks: { items: [] } };
        }
        return response.json();
      })
      .then((data) => {
        if (!data.tracks || !data.tracks.items) return [];
        return data.tracks.items.map((track) => ({
          id: track.id,
          name: track.name,
          artist: track.artists[0].name,
          album: track.album.name,
          image: track.album.images[0]?.url,
          uri: track.uri
        }));
      });
  },

  // Create playlist and add tracks
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
      .then((response) => {
        if (!response.ok) throw new Error('Failed to create playlist');
        return response.json();
      })
      .then((data) => {
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
      .then((res) => res.ok);
  }
};

export default Spotify;