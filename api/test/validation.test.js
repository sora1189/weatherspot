const test = require("node:test");
const assert = require("node:assert/strict");
const { validateDiaryPost, validateReport } = require("../src/lib/validation");

function validDraft() {
  return {
    name: "sora",
    message: "雨の日も音楽と一緒なら楽しい",
    cityId: "tokyo",
    city: "東京 / 日本",
    weather: "霧雨",
    clientId: "123e4567-e89b-12d3-a456-426614174001",
    track: {
      id: "track-1",
      title: "確認画面テスト曲",
      artist: "WeatherSpot Test",
      imageUrl: "https://i.scdn.co/image/test",
      spotifyUrl: "https://open.spotify.com/track/test"
    }
  };
}

test("valid post is normalized", () => {
  const result = validateDiaryPost(validDraft());
  assert.equal(result.valid, true);
  assert.equal(result.value.name, "sora");
  assert.equal(result.value.track.spotifyUrl, "https://open.spotify.com/track/test");
});

test("accepts a post without a track", () => {
  const draft = validDraft();
  draft.track = null;
  const result = validateDiaryPost(draft);

  assert.equal(result.valid, true);
  assert.equal(result.value.track, null);
});

test("rejects an incomplete track when track data is supplied", () => {
  const draft = validDraft();
  draft.track = { title: "曲名だけ" };
  const result = validateDiaryPost(draft);

  assert.equal(result.valid, false);
  assert.match(result.errors.join(" "), /artistは必須/);
});

test("rejects a post without a client id", () => {
  const draft = validDraft();
  delete draft.clientId;
  const result = validateDiaryPost(draft);

  assert.equal(result.valid, false);
  assert.match(result.errors.join(" "), /clientIdは必須/);
});

test("rejects an over-30-character message", () => {
  const draft = validDraft();
  draft.message = "あ".repeat(31);
  const result = validateDiaryPost(draft);
  assert.equal(result.valid, false);
  assert.match(result.errors.join(" "), /30文字以内/);
});

test("drops untrusted external URLs", () => {
  const draft = validDraft();
  draft.track.imageUrl = "https://example.com/image.png";
  const result = validateDiaryPost(draft);
  assert.equal(result.valid, true);
  assert.equal(result.value.track.imageUrl, "");
});

test("accepts a valid report", () => {
  const result = validateReport({
    postId: "123e4567-e89b-12d3-a456-426614174000",
    reporterId: "123e4567-e89b-12d3-a456-426614174001",
    reason: "spam"
  });

  assert.equal(result.valid, true);
  assert.equal(result.value.reason, "spam");
});

test("rejects an unknown report reason", () => {
  const result = validateReport({
    postId: "123e4567-e89b-12d3-a456-426614174000",
    reporterId: "123e4567-e89b-12d3-a456-426614174001",
    reason: "unknown"
  });

  assert.equal(result.valid, false);
});
