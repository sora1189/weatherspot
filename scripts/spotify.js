/* WeatherSpot: Spotify OAuth and playback */

// 初期プレイリスト。初回アクセス時はこの設定を使用します。
// 後から画面のURL入力欄でユーザー設定に上書きできます。
const spotifyWeatherPlaylists = {
  clear: {
    label: "晴れ用BGM",
    url: "https://open.spotify.com/playlist/181CZKWLf8ij9BXVDKtQKz",
    uri: "spotify:playlist:181CZKWLf8ij9BXVDKtQKz"
  },
  cloudy: {
    label: "曇り用BGM",
    url: "https://open.spotify.com/playlist/1kUllQ59dGwBfFxyi3WHJo",
    uri: "spotify:playlist:1kUllQ59dGwBfFxyi3WHJo"
  },
  rain: {
    label: "雨用BGM",
    url: "https://open.spotify.com/playlist/4U2LYHcPxh79XbPNxgG9I0",
    uri: "spotify:playlist:4U2LYHcPxh79XbPNxgG9I0"
  },
  snow: {
    label: "雪用BGM",
    url: "https://open.spotify.com/playlist/0zbwvQq3zFfbeGsc5j0FD0",
    uri: "spotify:playlist:0zbwvQq3zFfbeGsc5j0FD0"
  },
  storm: {
    label: "雷雨用BGM",
    url: "https://open.spotify.com/playlist/7ENr9UIN61c17NUvpz0H3K",
    uri: "spotify:playlist:7ENr9UIN61c17NUvpz0H3K"
  }
};


const repeatModes = ["off", "context", "track"];
const repeatLabels = {
  off: "ループ: OFF",
  context: "ループ: プレイリスト",
  track: "ループ: 1曲"
};


let spotifyPlayer = null;
let spotifyDeviceId = null;
let spotifySdkReady = false;
let repeatModeIndex = 0;
let shuffleEnabled = false;

window.onSpotifyWebPlaybackSDKReady = () => {
  spotifySdkReady = true;
  writeSpotifyLog(["Spotify Web Playback SDK ready", "メニュー内の「準備」を押してください"]);
};

function updateMusicMode(weatherInfo) {
  lastWeatherInfo = weatherInfo;
  lastMusicCategory = weatherInfo.music || "cloudy";
  const setting = getPlaylistSetting(lastMusicCategory);
  const label = setting ? `${setting.label}` : "NO PLAYLIST";
  elements.musicModeText.textContent = label;
  elements.drawerMusicModeText.textContent = label;
}


async function getValidAccessToken() {
  const token = getStoredAccessToken();
  if (token) return token;
  const refreshed = await refreshSpotifyToken();
  return refreshed;
}

function generateRandomString(length) {
  const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~";
  const values = crypto.getRandomValues(new Uint8Array(length));
  return values.reduce((acc, x) => acc + possible[x % possible.length], "");
}

async function sha256(plain) {
  const encoder = new TextEncoder();
  const data = encoder.encode(plain);
  return await crypto.subtle.digest("SHA-256", data);
}

function base64UrlEncode(arrayBuffer) {
  return btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

/* ---------------- 7. Spotify Playback ---------------- */

async function startSpotifyLogin() {
  saveSpotifyConfig();
  const { clientId, redirectUri } = getSpotifyConfig();

  if (!clientId || !redirectUri) {
    writeSpotifyLog([
      "Spotify Client ID is not configured",
      "app.js の SPOTIFY_CLIENT_ID にClient IDを固定してください",
      "一般ユーザーにはClient ID入力欄を表示しない設計です"
    ]);
    return;
  }

  const verifier = generateRandomString(64);
  const challenge = base64UrlEncode(await sha256(verifier));
  localStorage.setItem("spotify_code_verifier", verifier);

  const scope = [
    "streaming",
    "user-read-email",
    "user-read-private",
    "user-read-playback-state",
    "user-modify-playback-state"
  ].join(" ");

  const params = new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    scope,
    code_challenge_method: "S256",
    code_challenge: challenge,
    redirect_uri: redirectUri
  });

  location.href = `https://accounts.spotify.com/authorize?${params.toString()}`;
}

async function handleSpotifyCallback() {
  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get("code");
  const error = urlParams.get("error");

  if (error) {
    writeSpotifyLog(["Spotify login error", error]);
    return;
  }

  if (!code) return;

  const { clientId, redirectUri } = getSpotifyConfig();
  const verifier = localStorage.getItem("spotify_code_verifier");

  if (!clientId || !redirectUri || !verifier) {
    writeSpotifyLog(["callback received, but config/verifier is missing", "retry login"]);
    return;
  }

  const body = new URLSearchParams({
    client_id: clientId,
    grant_type: "authorization_code",
    code,
    redirect_uri: redirectUri,
    code_verifier: verifier
  });

  try {
    const response = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body
    });

    if (!response.ok) {
      throw new Error(`token exchange failed: ${response.status}`);
    }

    const data = await response.json();
    saveSpotifyTokens(data);

    window.history.replaceState({}, document.title, window.location.pathname);
    elements.spotifyStatus.textContent = "logged in";
    writeSpotifyLog(["Spotify login completed", "access token saved", "天気BGMを再生できます"]);
  } catch (err) {
    writeSpotifyLog(["Spotify token exchange failed", String(err.message || err)]);
  }
}


async function refreshSpotifyToken() {
  const { clientId } = getSpotifyConfig();
  const refreshToken = localStorage.getItem("spotify_refresh_token");

  if (!clientId || !refreshToken) {
    return null;
  }

  const body = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: refreshToken,
    client_id: clientId
  });

  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body
  });

  if (!response.ok) {
    writeSpotifyLog(["refresh token failed", `status: ${response.status}`, "please login again"]);
    return null;
  }

  const data = await response.json();
  saveSpotifyTokens(data);
  return data.access_token;
}

function logoutSpotify() {
  ["spotify_access_token", "spotify_refresh_token", "spotify_expires_at", "spotify_code_verifier"].forEach((key) => {
    localStorage.removeItem(key);
  });

  if (spotifyPlayer) {
    spotifyPlayer.disconnect();
    spotifyPlayer = null;
    spotifyDeviceId = null;
  }

  elements.spotifyStatus.textContent = "not connected";
  writeSpotifyLog(["logged out", "tokens removed"]);
}

async function initSpotifyPlayer() {
  const token = await getValidAccessToken();

  if (!token) {
    writeSpotifyLog(["Spotify access token is missing", "login first"]);
    return;
  }

  if (!spotifySdkReady || !window.Spotify) {
    writeSpotifyLog(["Spotify SDK is not ready", "wait a moment and retry"]);
    return;
  }

  if (spotifyPlayer) {
    writeSpotifyLog(["browser player already initialized", `device id: ${spotifyDeviceId || "waiting..."}`]);
    return;
  }

  spotifyPlayer = new Spotify.Player({
    name: "WeatherSpot Terminal Player",
    getOAuthToken: async (callback) => {
      const validToken = await getValidAccessToken();
      callback(validToken);
    },
    volume: 0.5
  });

  spotifyPlayer.addListener("ready", ({ device_id }) => {
    spotifyDeviceId = device_id;
    elements.spotifyStatus.textContent = "browser player ready";
    writeSpotifyLog(["browser player ready", `device id: ${device_id}`, "天気BGMを再生します"]);
  });

  spotifyPlayer.addListener("not_ready", ({ device_id }) => {
    writeSpotifyLog(["browser player not ready", `device id: ${device_id}`]);
  });

  spotifyPlayer.addListener("initialization_error", ({ message }) => writeSpotifyLog(["initialization error", message]));
  spotifyPlayer.addListener("authentication_error", ({ message }) => writeSpotifyLog(["authentication error", message]));
  spotifyPlayer.addListener("account_error", ({ message }) => writeSpotifyLog(["account error", message, "Spotify Premium may be required"]));
  spotifyPlayer.addListener("playback_error", ({ message }) => writeSpotifyLog(["playback error", message]));

  const connected = await spotifyPlayer.connect();

  if (!connected) {
    writeSpotifyLog(["browser player connection failed"]);
  }
}

async function spotifyApi(path, options = {}) {
  const token = await getValidAccessToken();

  if (!token) {
    throw new Error("Spotify access token is missing");
  }

  const response = await fetch(`https://api.spotify.com/v1${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(options.headers || {})
    }
  });

  if (response.status === 204) {
    return null;
  }

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Spotify API ${response.status}: ${text}`);
  }

  return await response.json();
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function ensureSpotifyPlaybackTarget() {
  const token = await getValidAccessToken();

  if (!token) {
    writeSpotifyLog(["Spotify access token is missing", "Spotifyでログインしてください"]);
    return false;
  }

  if (!spotifyDeviceId) {
    await initSpotifyPlayer();
  }

  for (let i = 0; i < 12 && !spotifyDeviceId; i += 1) {
    await wait(250);
  }

  if (!spotifyDeviceId) {
    writeSpotifyLog([
      "browser player is not ready yet",
      "Spotifyアプリなどの有効な再生デバイスがあれば再生を試します",
      "ブラウザで聞きたい場合は少し待ってからもう一度再生してください"
    ]);
  }

  return true;
}

async function transferPlaybackToBrowser() {
  if (!spotifyDeviceId) return;

  await spotifyApi("/me/player", {
    method: "PUT",
    body: JSON.stringify({
      device_ids: [spotifyDeviceId],
      play: false
    })
  });
}

function getPlaybackQuery() {
  return spotifyDeviceId ? `?device_id=${encodeURIComponent(spotifyDeviceId)}` : "";
}

function buildPlaybackBody(setting) {
  if (!setting?.uri) throw new Error("playlist setting is empty");

  if (setting.uri.startsWith("spotify:track:")) {
    return { uris: [setting.uri] };
  }

  return { context_uri: setting.uri };
}

async function playWeatherBgm(manual = true) {
  const setting = getPlaylistSetting(lastMusicCategory);

  if (!setting) {
    writeSpotifyLog(["playlist setting was not found", `category: ${lastMusicCategory}`]);
    return;
  }

  try {
    const targetReady = await ensureSpotifyPlaybackTarget();
    if (!targetReady) return;

    elements.spotifyStatus.textContent = "starting playback";

    if (spotifyDeviceId) {
      await transferPlaybackToBrowser();
    }

    await spotifyApi(`/me/player/play${getPlaybackQuery()}`, {
      method: "PUT",
      body: JSON.stringify(buildPlaybackBody(setting))
    });

    elements.spotifyStatus.textContent = "playing";
    writeSpotifyLog([
      manual ? "manual weather BGM start" : "auto weather BGM switch",
      `weather: ${lastWeatherInfo?.name || "--"}`,
      `category: ${lastMusicCategory}`,
      `source: ${setting.label}`,
      `uri: ${setting.uri}`,
      spotifyDeviceId ? "output: browser player" : "output: active Spotify device"
    ]);
  } catch (err) {
    elements.spotifyStatus.textContent = "playback error";
    writeSpotifyLog([
      "playback failed",
      String(err.message || err),
      "Premium account / active device / browser player statusを確認してください"
    ]);
  }
}

async function resumeSpotify() {
  try {
    await spotifyApi(`/me/player/play${getPlaybackQuery()}`, { method: "PUT" });
    elements.spotifyStatus.textContent = "playing";
    writeSpotifyLog(["playback resumed"]);
  } catch (err) {
    writeSpotifyLog(["resume failed", String(err.message || err)]);
  }
}

async function pauseSpotify() {
  try {
    await spotifyApi(`/me/player/pause${getPlaybackQuery()}`, { method: "PUT" });
    elements.spotifyStatus.textContent = "paused";
    writeSpotifyLog(["playback paused"]);
  } catch (err) {
    writeSpotifyLog(["pause failed", String(err.message || err)]);
  }
}

async function nextTrack() {
  try {
    await spotifyApi(`/me/player/next${getPlaybackQuery()}`, { method: "POST" });
    writeSpotifyLog(["skipped to next track"]);
  } catch (err) {
    writeSpotifyLog(["next track failed", String(err.message || err)]);
  }
}

async function previousTrack() {
  try {
    await spotifyApi(`/me/player/previous${getPlaybackQuery()}`, { method: "POST" });
    writeSpotifyLog(["returned to previous track"]);
  } catch (err) {
    writeSpotifyLog(["previous track failed", String(err.message || err)]);
  }
}

async function cycleRepeatMode() {
  repeatModeIndex = (repeatModeIndex + 1) % repeatModes.length;
  const mode = repeatModes[repeatModeIndex];

  elements.repeatModeButton.textContent = repeatLabels[mode];
  localStorage.setItem("spotify_repeat_mode", mode);

  try {
    await spotifyApi(`/me/player/repeat?state=${mode}${spotifyDeviceId ? `&device_id=${encodeURIComponent(spotifyDeviceId)}` : ""}`, {
      method: "PUT"
    });
    writeSpotifyLog(["repeat mode updated", `mode: ${mode}`]);
  } catch (err) {
    writeSpotifyLog(["repeat mode update failed", String(err.message || err)]);
  }
}

async function toggleShuffle() {
  shuffleEnabled = !shuffleEnabled;
  elements.shuffleButton.textContent = `シャッフル: ${shuffleEnabled ? "ON" : "OFF"}`;
  localStorage.setItem("spotify_shuffle", String(shuffleEnabled));

  try {
    await spotifyApi(`/me/player/shuffle?state=${shuffleEnabled}${spotifyDeviceId ? `&device_id=${encodeURIComponent(spotifyDeviceId)}` : ""}`, {
      method: "PUT"
    });
    writeSpotifyLog(["shuffle updated", `shuffle: ${shuffleEnabled ? "ON" : "OFF"}`]);
  } catch (err) {
    writeSpotifyLog(["shuffle update failed", String(err.message || err)]);
  }
}

