export default async function handler(req, res) {
  // Support both standard env vars (Vercel) and VITE_ prefixed vars (local .env)
  const client_id = process.env.SPOTIFY_CLIENT_ID || process.env.VITE_SPOTIFY_CLIENT_ID;
  const client_secret = process.env.SPOTIFY_CLIENT_SECRET || process.env.VITE_SPOTIFY_CLIENT_SECRET;

  if (!client_id || !client_secret) {
    return res.status(500).json({ error: 'Server missing Spotify credentials' });
  }

  try {
    const authOptions = {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + (Buffer.from(client_id + ':' + client_secret).toString('base64')),
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: 'grant_type=client_credentials'
    };

    const response = await fetch('https://accounts.spotify.com/api/token', authOptions);
    const data = await response.json();

    if (!response.ok) {
        return res.status(response.status).json(data);
    }

    // Cache the response to reduce load (Spotify tokens last 1 hour)
    // s-maxage=3500 leaves a buffer before the 3600s expiry
    res.setHeader('Cache-Control', 's-maxage=3500, stale-while-revalidate');
    return res.status(200).json(data);
  } catch (error) {
    console.error("Token generation error:", error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}