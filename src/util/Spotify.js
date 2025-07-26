let accessToken = "";
const clientID = "36a164d40a9c4c128c60e1015c193db4";
const redirectUrl = "https://hadielshayeb.github.io/jammming/";

const scope = 'playlist-modify-public';

// PKCE: Generate Code Verifier
const generateRandomString = (length) => {
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const values = window.crypto.getRandomValues(new Uint8Array(length));
  return values.reduce((acc, x) => acc + possible[x % possible.length], "");
};

const codeVerifier = generateRandomString(64);
localStorage.setItem("code_verifier", codeVerifier);

const sha256 = async (plain) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(plain);
  return await window.crypto.subtle.digest("SHA-256", data);
};

const base64encode = (input) => {
  return btoa(String.fromCharCode(...new Uint8Array(input)))
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
};

const Spotify = {
  async getAccessToken() {
    if (accessToken) {
      return accessToken;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");

    if (code) {
      return Spotify.getToken(code);
    }

    // Generate code challenge
    const hashed = await sha256(codeVerifier);
    const codeChallenge = base64encode(hashed);
    
    // Redirect to authorization
    const authURL = `https://accounts.spotify.com/authorize?client_id=${clientID}&response_type=code&redirect_uri=${encodeURIComponent(redirectUrl)}&scope=${encodeURIComponent(scope)}&code_challenge_method=S256&code_challenge=${codeChallenge}`;
    window.location = authURL;
  },

  async getToken(code) {
    const code_verifier = localStorage.getItem("code_verifier");
    
    const response = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: clientID,
        grant_type: "authorization_code",
        code: code,
        redirect_uri: redirectUrl,
        code_verifier: code_verifier
      }),
    });
    
    const tokenData = await response.json();
    accessToken = tokenData.access_token;
    
    if (tokenData.expires_in) {
      window.setTimeout(() => accessToken = "", tokenData.expires_in * 1000);
    }
    
    window.history.pushState({}, document.title, "/");
    return accessToken;
  },

  async search(term) {
    const token = await Spotify.getAccessToken();
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

    const token = await Spotify.getAccessToken();
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