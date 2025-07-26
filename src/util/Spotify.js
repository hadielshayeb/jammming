let accessToken = "";
const clientID = "36a164d40a9c4c128c60e1015c193db4";

// Test different redirect URIs to see which one works
const redirectUrls = [
  "https://hadielshayeb.github.io/jammming",
  "https://hadielshayeb.github.io/jammming/",
  "http://localhost:3000",
  "http://localhost:3000/"
];

const scope = 'playlist-modify-public';

const Spotify = {
  getAccessToken() {
    if (accessToken) {
      return accessToken;
    }

    // Check for access token in URL fragment (Implicit Grant)
    const accessTokenMatch = window.location.hash.match(/access_token=([^&]*)/);
    const expiresInMatch = window.location.hash.match(/expires_in=([^&]*)/);

    if (accessTokenMatch && expiresInMatch) {
      accessToken = accessTokenMatch[1];
      const expiresIn = Number(expiresInMatch[1]);
      window.setTimeout(() => accessToken = '', expiresIn * 1000);
      window.history.pushState('AccessToken', null, '/');
      return accessToken;
    }

    // Check for authorization code in URL (Authorization Code Flow)
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");

    if (code) {
      // We have a code, but let's try Implicit Grant first since that's simpler
      console.log("Found authorization code, but trying Implicit Grant first");
    }

    // Try Implicit Grant Flow first (most common for client-side apps)
    console.log("Trying Implicit Grant Flow...");
    const redirectUrl = redirectUrls[0]; // Try without trailing slash first
    const accessUrl = `https://accounts.spotify.com/authorize?client_id=${clientID}&response_type=token&scope=${encodeURIComponent(scope)}&redirect_uri=${encodeURIComponent(redirectUrl)}&show_dialog=true`;
    console.log("Redirecting to:", accessUrl);
    window.location.href = accessUrl;
  },

  async search(term) {
    const token = Spotify.getAccessToken();
    if (!token) {
      console.error('No access token available');
      return [];
    }

    try {
      const response = await fetch(`https://api.spotify.com/v1/search?type=track&q=${encodeURIComponent(term)}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        console.error('Search request failed:', response.status);
        return [];
      }
      
      const jsonResponse = await response.json();
      
      if (!jsonResponse.tracks || !jsonResponse.tracks.items) {
        return [];
      }
      
      return jsonResponse.tracks.items.map(track => ({
        id: track.id,
        name: track.name,
        artist: track.artists[0].name,
        album: track.album.name,
        uri: track.uri,
      }));
    } catch (error) {
      console.error('Error searching tracks:', error);
      return [];
    }
  },

  async savePlaylist(playlistName, trackUris) {
    if (!playlistName || !trackUris.length) {
      console.log('Playlist name or tracks are missing.');
      return;
    }

    const token = Spotify.getAccessToken();
    if (!token) {
      console.log('Access Token is missing.');
      return;
    }

    const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

    try {
      const userResponse = await fetch('https://api.spotify.com/v1/me', { headers });
      const userData = await userResponse.json();
      const userId = userData.id;

      const createPlaylistResponse = await fetch(`https://api.spotify.com/v1/users/${userId}/playlists`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ name: playlistName })
      });
      const playlistData = await createPlaylistResponse.json();
      const playlistId = playlistData.id;

      const addTracksResponse = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ uris: trackUris })
      });

      if (!addTracksResponse.ok) {
        const errorData = await addTracksResponse.json();
        console.error('Failed to add tracks:', errorData);
        return;
      }

      console.log("Playlist saved to Spotify");
    } catch (error) {
      console.error('Error saving playlist:', error);
    }
  }
};

export default Spotify;