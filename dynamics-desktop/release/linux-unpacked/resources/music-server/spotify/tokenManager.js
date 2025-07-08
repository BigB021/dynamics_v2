const fetch = require("node-fetch");
const dotenv = require('dotenv');
dotenv.config();

const clientId = process.env.SPOTIFY_CLIENT_ID;
const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

let accessToken = null;
let tokenExpiresAt = 0;

async function refreshAccessToken() {
  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error("Failed to fetch Spotify token: " + JSON.stringify(errorData));
  }

  const data = await response.json();
  accessToken = data.access_token;
  tokenExpiresAt = Date.now() + data.expires_in * 1000;

  console.log("🔐 Spotify token refreshed");
  console.log("Token will expire at: " + new Date(tokenExpiresAt).toISOString());
}

async function getSpotifyAccessToken() {
  if (!accessToken || Date.now() >= tokenExpiresAt) {
    await refreshAccessToken();
  }
  return accessToken;
}

module.exports = {
  getSpotifyAccessToken
};
