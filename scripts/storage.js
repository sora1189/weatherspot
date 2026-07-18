/* WeatherSpot: configuration and local storage */

/* ---------------- 1. App Settings ---------------- */

const CONFIG = Object.freeze({
  defaultCityId: "tokyo",

  // Spotify Developer Dashboardで取得したClient ID。
  // Client Secretはブラウザ側に置かないため、このアプリでは使用しません。
  spotifyClientId: "7de2c8340fcc459caacc83f612fcbba7",

  // Client ID未設定チェック用。通常は変更しません。
  spotifyClientIdPlaceholder: "PASTE_YOUR_SPOTIFY_CLIENT_ID_HERE"
});

const DEFAULT_CITY_ID = CONFIG.defaultCityId;
const SPOTIFY_CLIENT_ID = CONFIG.spotifyClientId;
const SPOTIFY_CLIENT_ID_PLACEHOLDER = CONFIG.spotifyClientIdPlaceholder;


/* ---------------- Playlist Settings ---------------- */

function convertSpotifyUrlToSetting(url, fallbackLabel) {
  const trimmed = String(url || "").trim();

  if (!trimmed) return null;

  const openUrlMatch = trimmed.match(/open\.spotify\.com\/(playlist|album|track)\/([a-zA-Z0-9]+)/);
  if (openUrlMatch) {
    const type = openUrlMatch[1];
    const id = openUrlMatch[2];
    return {
      label: fallbackLabel,
      url: trimmed,
      uri: `spotify:${type}:${id}`,
      type
    };
  }

  const uriMatch = trimmed.match(/^spotify:(playlist|album|track):([a-zA-Z0-9]+)$/);
  if (uriMatch) {
    return {
      label: fallbackLabel,
      url: trimmed,
      uri: trimmed,
      type: uriMatch[1]
    };
  }

  return null;
}

function getPlaylistStorageKey(category) {
  return `weather_playlist_${category}`;
}

function getPlaylistSetting(category) {
  const saved = localStorage.getItem(getPlaylistStorageKey(category));
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (parsed?.uri) return parsed;
    } catch {
      // 壊れた保存データは無視します
    }
  }

  return spotifyWeatherPlaylists[category];
}

function loadPlaylistSettingsToInputs() {
  Object.entries(playlistInputMap).forEach(([category, elementId]) => {
    const input = elements[elementId];
    if (!input) return;
    const setting = getPlaylistSetting(category);
    input.value = setting?.url || "";
  });

  if (lastWeatherInfo) updateMusicMode(lastWeatherInfo);
}

function savePlaylistSettings() {
  const messages = ["playlist settings save started"];

  Object.entries(playlistInputMap).forEach(([category, elementId]) => {
    const input = elements[elementId];
    if (!input) return;
    const fallback = spotifyWeatherPlaylists[category];
    const rawValue = String(input.value || "").trim();

    if (!rawValue) {
      localStorage.removeItem(getPlaylistStorageKey(category));
      messages.push(`${category}: empty -> default playlist`);
      return;
    }

    const setting = convertSpotifyUrlToSetting(rawValue, fallback.label);
    if (!setting) {
      messages.push(`${category}: invalid URL, not saved`);
      return;
    }

    localStorage.setItem(getPlaylistStorageKey(category), JSON.stringify(setting));
    messages.push(`${category}: saved ${setting.uri}`);
  });

  loadPlaylistSettingsToInputs();
  writeSpotifyLog(messages);
}

function resetPlaylistSettings() {
  Object.keys(playlistInputMap).forEach((category) => {
    localStorage.removeItem(getPlaylistStorageKey(category));
  });

  loadPlaylistSettingsToInputs();
  writeSpotifyLog(["playlist settings reset", "default playlists loaded"]);
}

/* ---------------- Cloud Weather Diary: Local Drafts ---------------- */

const LOCAL_DIARY_STORAGE_KEY = "weatherspot_local_diary_posts_v1";
const LOCAL_DIARY_RETENTION_MS = 7 * 24 * 60 * 60 * 1000;
const DIARY_REPORTER_STORAGE_KEY = "weatherspot_diary_reporter_v1";
const REPORTED_POSTS_STORAGE_KEY = "weatherspot_reported_posts_v1";

function getOrCreateDiaryReporterId() {
  const saved = String(localStorage.getItem(DIARY_REPORTER_STORAGE_KEY) || "").trim();
  if (/^[a-z0-9-]{16,100}$/i.test(saved)) return saved;

  const generated = globalThis.crypto?.randomUUID
    ? globalThis.crypto.randomUUID()
    : `device-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  localStorage.setItem(DIARY_REPORTER_STORAGE_KEY, generated);
  return generated;
}

function loadReportedPostIds() {
  try {
    const saved = JSON.parse(localStorage.getItem(REPORTED_POSTS_STORAGE_KEY) || "[]");
    return Array.isArray(saved) ? saved.filter((id) => typeof id === "string").slice(0, 100) : [];
  } catch {
    return [];
  }
}

function hasLocallyReportedPost(postId) {
  return loadReportedPostIds().includes(String(postId || ""));
}

function rememberLocallyReportedPost(postId) {
  const id = String(postId || "").trim();
  if (!id) return;

  const ids = loadReportedPostIds().filter((savedId) => savedId !== id);
  ids.unshift(id);
  localStorage.setItem(REPORTED_POSTS_STORAGE_KEY, JSON.stringify(ids.slice(0, 100)));
}

function limitLocalDiaryText(value, maxLength) {
  return Array.from(String(value || "").trim()).slice(0, maxLength).join("");
}

function normalizeLocalDiaryPost(post) {
  if (!post || typeof post !== "object") return null;

  const createdAtMs = Date.parse(post.createdAt);
  const expiresAtMs = Date.parse(post.expiresAt);
  const name = limitLocalDiaryText(post.name, 20);
  const message = limitLocalDiaryText(post.message, 30);
  const city = limitLocalDiaryText(post.city, 80);
  const weather = limitLocalDiaryText(post.weather, 40);
  const trackTitle = limitLocalDiaryText(post.track?.title, 200);
  const trackArtist = limitLocalDiaryText(post.track?.artist, 200);

  if (!post.id || !name || !message || !city || !weather) return null;
  if (post.track && (!trackTitle || !trackArtist)) return null;
  if (!Number.isFinite(createdAtMs) || !Number.isFinite(expiresAtMs)) return null;

  return {
    id: limitLocalDiaryText(post.id, 100),
    name,
    message,
    cityId: limitLocalDiaryText(post.cityId, 40),
    city,
    weather,
    track: post.track
      ? {
          id: limitLocalDiaryText(post.track.id, 100),
          title: trackTitle,
          artist: trackArtist,
          imageUrl: String(post.track.imageUrl || "").slice(0, 1000),
          spotifyUrl: String(post.track.spotifyUrl || "").slice(0, 1000)
        }
      : null,
    createdAt: new Date(createdAtMs).toISOString(),
    expiresAt: new Date(expiresAtMs).toISOString()
  };
}

function writeLocalDiaryPosts(posts) {
  localStorage.setItem(LOCAL_DIARY_STORAGE_KEY, JSON.stringify(posts));
}

function loadLocalDiaryPosts(now = Date.now()) {
  let rawPosts = [];
  let storageNeedsRewrite = false;

  try {
    const saved = JSON.parse(localStorage.getItem(LOCAL_DIARY_STORAGE_KEY) || "[]");
    rawPosts = Array.isArray(saved) ? saved : [];
    storageNeedsRewrite = !Array.isArray(saved);
  } catch {
    rawPosts = [];
    storageNeedsRewrite = true;
  }

  const activePosts = rawPosts
    .map(normalizeLocalDiaryPost)
    .filter((post) => post && Date.parse(post.expiresAt) > now)
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));

  if (storageNeedsRewrite || activePosts.length !== rawPosts.length) {
    writeLocalDiaryPosts(activePosts);
  }

  return activePosts;
}

function saveLocalDiaryPost(draft) {
  const now = Date.now();
  const post = normalizeLocalDiaryPost({
    ...draft,
    id: crypto.randomUUID ? crypto.randomUUID() : `local-${now}-${Math.random().toString(16).slice(2)}`,
    createdAt: new Date(now).toISOString(),
    expiresAt: new Date(now + LOCAL_DIARY_RETENTION_MS).toISOString()
  });

  if (!post) {
    throw new Error("仮投稿データが不完全です");
  }

  const posts = loadLocalDiaryPosts(now);
  posts.unshift(post);
  writeLocalDiaryPosts(posts);
  return post;
}

/* ---------------- Spotify OAuth PKCE ---------------- */

function getDefaultRedirectUri() {
  if (location.protocol === "http:" || location.protocol === "https:") {
    return `${location.origin}${location.pathname}`;
  }
  return "http://localhost:5500/index.html";
}

function loadSpotifyConfig() {
  if (elements.spotifyClientId) {
    elements.spotifyClientId.value = getConfiguredSpotifyClientId();
  }

  if (elements.spotifyRedirectUri) {
    elements.spotifyRedirectUri.value = getDefaultRedirectUri();
  }

  if (elements.autoMusicSwitch) {
    elements.autoMusicSwitch.checked = localStorage.getItem("spotify_auto_switch") === "true";
  }

  const storedRepeat = localStorage.getItem("spotify_repeat_mode") || "off";
  repeatModeIndex = Math.max(0, repeatModes.indexOf(storedRepeat));
  if (elements.repeatModeButton) {
    elements.repeatModeButton.textContent = repeatLabels[repeatModes[repeatModeIndex]];
  }

  shuffleEnabled = localStorage.getItem("spotify_shuffle") === "true";
  if (elements.shuffleButton) {
    elements.shuffleButton.textContent = `シャッフル: ${shuffleEnabled ? "ON" : "OFF"}`;
  }

  if (elements.spotifyStatus) {
    elements.spotifyStatus.textContent = getConfiguredSpotifyClientId() ? "ready for login" : "client id missing";
  }
}

function saveSpotifyConfig() {
  if (elements.autoMusicSwitch) {
    localStorage.setItem("spotify_auto_switch", String(elements.autoMusicSwitch.checked));
  }

  // 旧バージョンの開発者入力欄が残っている場合だけ互換保存します。
  if (elements.spotifyClientId && elements.spotifyClientId.value.trim()) {
    localStorage.setItem("spotify_client_id", elements.spotifyClientId.value.trim());
  }
}

function getConfiguredSpotifyClientId() {
  const fixedClientId = String(SPOTIFY_CLIENT_ID || "").trim();
  if (fixedClientId && fixedClientId !== SPOTIFY_CLIENT_ID_PLACEHOLDER) {
    return fixedClientId;
  }

  // 旧版でlocalStorageに保存済みのClient IDがある場合は、そのまま使えるようにする。
  return String(localStorage.getItem("spotify_client_id") || "").trim();
}

function getSpotifyConfig() {
  return {
    clientId: getConfiguredSpotifyClientId(),
    redirectUri: getDefaultRedirectUri()
  };
}

function getStoredAccessToken() {
  const token = localStorage.getItem("spotify_access_token");
  const expiresAt = Number(localStorage.getItem("spotify_expires_at") || 0);
  if (!token || Date.now() > expiresAt) return null;
  return token;
}


function saveSpotifyTokens(data) {
  localStorage.setItem("spotify_access_token", data.access_token);
  if (data.refresh_token) {
    localStorage.setItem("spotify_refresh_token", data.refresh_token);
  }
  const expiresIn = Number(data.expires_in || 3600);
  localStorage.setItem("spotify_expires_at", String(Date.now() + (expiresIn - 60) * 1000));
}
