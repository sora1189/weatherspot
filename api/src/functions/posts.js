const { app } = require("@azure/functions");
const crypto = require("node:crypto");
const { getPostsContainer } = require("../lib/cosmos");
const { validateDiaryPost } = require("../lib/validation");

const RETENTION_SECONDS = 7 * 24 * 60 * 60;

function json(status, body) {
  return {
    status,
    jsonBody: body,
    headers: {
      "Cache-Control": "no-store",
      "Content-Type": "application/json; charset=utf-8",
      "X-Content-Type-Options": "nosniff"
    }
  };
}

async function listPosts(request, context) {
  const requestedLimit = Number(request.query.get("limit") || 30);
  const limit = Math.min(30, Math.max(1, Number.isFinite(requestedLimit) ? Math.floor(requestedLimit) : 30));

  try {
    const container = getPostsContainer();
    const query = {
      query: "SELECT TOP @limit * FROM c WHERE (NOT IS_DEFINED(c.documentType)) OR c.documentType = 'post' ORDER BY c.createdAt DESC",
      parameters: [{ name: "@limit", value: limit }]
    };
    const { resources } = await container.items.query(query, { maxItemCount: limit }).fetchAll();
    return json(200, { posts: resources, count: resources.length });
  } catch (error) {
    context.error("Failed to list diary posts", error);
    return json(503, { error: "投稿一覧を取得できませんでした" });
  }
}

async function createPost(request, context) {
  let body;

  try {
    body = await request.json();
  } catch {
    return json(400, { error: "JSONの形式が正しくありません" });
  }

  const validation = validateDiaryPost(body);
  if (!validation.valid) {
    return json(400, { error: "投稿内容を確認してください", details: validation.errors });
  }

  const createdAt = new Date();
  const post = {
    id: crypto.randomUUID(),
    documentType: "post",
    ...validation.value,
    createdAt: createdAt.toISOString(),
    expiresAt: new Date(createdAt.getTime() + RETENTION_SECONDS * 1000).toISOString(),
    ttl: RETENTION_SECONDS
  };

  try {
    const container = getPostsContainer();
    const { resource } = await container.items.create(post);
    return json(201, resource || post);
  } catch (error) {
    context.error("Failed to create diary post", error);
    return json(503, { error: "投稿を保存できませんでした" });
  }
}

app.http("listPosts", {
  route: "posts",
  methods: ["GET"],
  authLevel: "anonymous",
  handler: listPosts
});

app.http("createPost", {
  route: "posts",
  methods: ["POST"],
  authLevel: "anonymous",
  handler: createPost
});

module.exports = { RETENTION_SECONDS, createPost, listPosts };
