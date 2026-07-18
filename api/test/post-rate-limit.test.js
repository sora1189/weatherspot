const test = require("node:test");
const assert = require("node:assert/strict");
const {
  POST_RATE_LIMIT_MAX,
  POST_RATE_LIMIT_WINDOW_SECONDS,
  checkPostRateLimit,
  hashClientId
} = require("../src/lib/postRateLimit");

function mockContainer(resources) {
  return {
    items: {
      query(query) {
        assert.match(query.query, /clientHash/);
        return { fetchAll: async () => ({ resources }) };
      }
    }
  };
}

test("allows fewer than five posts in ten minutes", async () => {
  const now = new Date("2026-07-18T12:00:00.000Z");
  const resources = Array.from({ length: 4 }, (_, index) => ({
    createdAt: new Date(now.getTime() - index * 60_000).toISOString()
  }));
  const result = await checkPostRateLimit(mockContainer(resources), "device-1234567890", now);

  assert.equal(result.allowed, true);
  assert.equal(result.clientHash, hashClientId("device-1234567890"));
  assert.equal(POST_RATE_LIMIT_MAX, 5);
  assert.equal(POST_RATE_LIMIT_WINDOW_SECONDS, 600);
});

test("blocks the sixth post in ten minutes", async () => {
  const now = new Date("2026-07-18T12:00:00.000Z");
  const resources = Array.from({ length: 5 }, (_, index) => ({
    createdAt: new Date(now.getTime() - (index + 1) * 60_000).toISOString()
  }));
  const result = await checkPostRateLimit(mockContainer(resources), "device-1234567890", now);

  assert.equal(result.allowed, false);
  assert.equal(result.retryAfterSeconds, 300);
});
