import { NextResponse } from 'next/server';

const SPOTIFY_AUTH_URL = 'https://accounts.spotify.com/authorize';


export async function GET() {
    console.log('Spotify login route accessed');

  const clientId = process.env.SPOTIFY_CLIENT_ID!;
  const redirectUri = process.env.SPOTIFY_REDIRECT_URI!;
  const scope = 'playlist-read-private playlist-read-collaborative';
  
  const authUrl = `${SPOTIFY_AUTH_URL}?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(
    redirectUri
  )}&scope=${encodeURIComponent(scope)}`;

  return NextResponse.redirect(authUrl);
}
