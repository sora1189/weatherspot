const LIMITS = Object.freeze({
  name: 20,
  message: 30,
  cityId: 40,
  city: 80,
  weather: 40,
  clientId: 100,
  trackId: 100,
  trackTitle: 200,
  trackArtist: 200
});

const REPORT_REASONS = Object.freeze(["abuse", "sexual", "spam", "other"]);

function countCharacters(value) {
  return Array.from(String(value || "")).length;
}

function normalizeText(value) {
  return String(value || "")
    .normalize("NFKC")
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function readRequiredText(body, field, maxLength, errors) {
  const value = normalizeText(body?.[field]);

  if (!value) {
    errors.push(`${field}は必須です`);
  } else if (countCharacters(value) > maxLength) {
    errors.push(`${field}は${maxLength}文字以内にしてください`);
  }

  return value;
}

function readSafeUrl(value, allowedHosts) {
  if (!value) return "";

  try {
    const parsed = new URL(String(value));
    return parsed.protocol === "https:" && allowedHosts.has(parsed.hostname)
      ? parsed.toString()
      : "";
  } catch {
    return "";
  }
}

function validateDiaryPost(body) {
  const errors = [];
  const name = readRequiredText(body, "name", LIMITS.name, errors);
  const message = readRequiredText(body, "message", LIMITS.message, errors);
  const cityId = readRequiredText(body, "cityId", LIMITS.cityId, errors);
  const city = readRequiredText(body, "city", LIMITS.city, errors);
  const weather = readRequiredText(body, "weather", LIMITS.weather, errors);
  const clientId = readRequiredText(body, "clientId", LIMITS.clientId, errors);
  let track = null;

  if (body?.track != null) {
    if (typeof body.track !== "object" || Array.isArray(body.track)) {
      errors.push("trackの形式が正しくありません");
    } else {
      const trackTitle = readRequiredText(body.track, "title", LIMITS.trackTitle, errors);
      const trackArtist = readRequiredText(body.track, "artist", LIMITS.trackArtist, errors);

      track = {
        id: normalizeText(body.track.id).slice(0, LIMITS.trackId),
        title: trackTitle,
        artist: trackArtist,
        imageUrl: readSafeUrl(body.track.imageUrl, new Set(["i.scdn.co"])),
        spotifyUrl: readSafeUrl(body.track.spotifyUrl, new Set(["open.spotify.com"]))
      };
    }
  }

  if (cityId && !/^[a-z0-9-]+$/i.test(cityId)) {
    errors.push("cityIdの形式が正しくありません");
  }

  if (clientId && !/^[a-z0-9-]{16,100}$/i.test(clientId)) {
    errors.push("clientIdの形式が正しくありません");
  }

  return {
    valid: errors.length === 0,
    errors,
    value: {
      name,
      message,
      cityId,
      city,
      weather,
      clientId,
      track
    }
  };
}

function validateReport(body) {
  const errors = [];
  const postId = normalizeText(body?.postId);
  const reporterId = normalizeText(body?.reporterId);
  const reason = normalizeText(body?.reason).toLowerCase();

  if (!/^[0-9a-f-]{36}$/i.test(postId)) {
    errors.push("postIdの形式が正しくありません");
  }

  if (!/^[a-z0-9-]{16,100}$/i.test(reporterId)) {
    errors.push("reporterIdの形式が正しくありません");
  }

  if (!REPORT_REASONS.includes(reason)) {
    errors.push("通報理由を選択してください");
  }

  return {
    valid: errors.length === 0,
    errors,
    value: { postId, reporterId, reason }
  };
}

module.exports = { LIMITS, REPORT_REASONS, normalizeText, validateDiaryPost, validateReport };
