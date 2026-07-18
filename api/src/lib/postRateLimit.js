const crypto = require("node:crypto");

const POST_RATE_LIMIT_MAX = 5;
const POST_RATE_LIMIT_WINDOW_SECONDS = 10 * 60;

function hashClientId(clientId) {
  return crypto.createHash("sha256").update(String(clientId)).digest("hex");
}

async function checkPostRateLimit(container, clientId, now = new Date()) {
  const clientHash = hashClientId(clientId);
  const windowStart = new Date(now.getTime() - POST_RATE_LIMIT_WINDOW_SECONDS * 1000);
  const query = {
    query: "SELECT TOP 5 c.createdAt FROM c WHERE c.documentType = 'post' AND c.clientHash = @clientHash AND c.createdAt >= @windowStart",
    parameters: [
      { name: "@clientHash", value: clientHash },
      { name: "@windowStart", value: windowStart.toISOString() }
    ]
  };
  const { resources } = await container.items.query(query, { maxItemCount: POST_RATE_LIMIT_MAX }).fetchAll();
  const recentPosts = Array.isArray(resources) ? resources : [];

  if (recentPosts.length < POST_RATE_LIMIT_MAX) {
    return { allowed: true, clientHash, retryAfterSeconds: 0 };
  }

  const oldestTimestamp = Math.min(
    ...recentPosts
      .map((post) => Date.parse(post.createdAt))
      .filter(Number.isFinite)
  );
  const retryAt = Number.isFinite(oldestTimestamp)
    ? oldestTimestamp + POST_RATE_LIMIT_WINDOW_SECONDS * 1000
    : now.getTime() + POST_RATE_LIMIT_WINDOW_SECONDS * 1000;

  return {
    allowed: false,
    clientHash,
    retryAfterSeconds: Math.max(1, Math.ceil((retryAt - now.getTime()) / 1000))
  };
}

module.exports = {
  POST_RATE_LIMIT_MAX,
  POST_RATE_LIMIT_WINDOW_SECONDS,
  checkPostRateLimit,
  hashClientId
};
