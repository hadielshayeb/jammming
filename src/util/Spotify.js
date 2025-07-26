// Spotify.js

// Load environment variables (for Create React App)
const clientId = process.env.REACT_APP_CLIENT_ID || '<your-default-client-id>';
const redirectUri = process.env.REACT_APP_REDIRECT_URI || 'https://hadielshayeb.github.io/jammming/';
const scope = 'playlist-modify-public';

let accessToken;

const Spotify = {
  getAccessToken() {
    if (accessToken) return accessToken;

    // Debug logs
    console.log("Client ID being used:", clientId);
    console.log("Redirect URI being used:", redirectUri);

    // Check URL hash for token
    const accessTokenMatch = window.location.hash.match(/access_token=([^&]*)/);
    const expiresInMatch = window.location.hash.match(/expires_in=([^&]*)/);

    if (accessTokenMatch && expiresInMatch) {
      accessToken = accessTokenMatch[1];
      const expiresIn = Number(expiresInMatch[1]);

      // Clear token after expiry
      window.setTimeout(() => (accessToken = ''), expiresIn * 1000);
      window.history.pushState('AccessToken', null, '/'); // Remove token from URL

      return accessToken;
    } else {
      // Build authorization URL
      const accessUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=token&scope=${encodeURIComponent(scope)}&redirect_uri=${encodeURIComponent(redirectUri)}&show_dialog=true`;
      console.log("Redirecting user to:", accessUrl);
      window.location.href = accessUrl;
    }
  },

  async search(term) {
    const accessToken = this.getAccessToken();
    if (!accessToken) {
      console.error("No access token found during search.");
      return [];
    }

    try {
      const response = await fetch(`https://api.spotify.com/v1/search?type=track&q=${encodeURIComponent(term)}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!response.ok) {
        console.error("Spotify search API error:", response.status, response.statusText);
        return [];
      }

      const jsonResponse = await response.json();
      if (!jsonResponse.tracks) return [];

      return jsonResponse.tracks.items.map((track) => ({
        id: track.id,
        name: track.name,
        artists: track.artists.map((artist) => artist.name).join(', '),
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
      console.warn('Playlist name or tracks are missing.');
      return;
    }

    const accessToken = this.getAccessToken();
    if (!accessToken) {
      console.error('Access Token is missing.');
      return;
    }

    const headers = { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' };

    try {
      const userResponse = await fetch('https://api.spotify.com/v1/me', { headers });
      if (!userResponse.ok) {
        console.error("Failed to fetch user profile:", userResponse.status);
        return;
      }

      const userData = await userResponse.json();
      const userId = userData.id;

      const createPlaylistResponse = await fetch(`https://api.spotify.com/v1/users/${userId}/playlists`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ name: playlistName }),
      });

      if (!createPlaylistResponse.ok) {
        const errorData = await createPlaylistResponse.json();
        console.error("Failed to create playlist:", errorData);
        return;
      }

      const playlistData = await createPlaylistResponse.json();
      const playlistId = playlistData.id;

      const addTracksResponse = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ uris: trackUris }),
      });

      if (!addTracksResponse.ok) {
        const errorData = await addTracksResponse.json();
        console.error('Failed to add tracks:', errorData);
        return;
      }

      console.log("Playlist saved to Spotify:", playlistName);
    } catch (error) {
      console.error('Error saving playlist:', error);
    }
  }
};

export default Spotify;