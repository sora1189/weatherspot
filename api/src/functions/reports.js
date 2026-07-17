const { app } = require("@azure/functions");
const crypto = require("node:crypto");
const { getPostsContainer } = require("../lib/cosmos");
const { validateReport } = require("../lib/validation");

const REPORT_RETENTION_SECONDS = 7 * 24 * 60 * 60;

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

async function createReport(request, context) {
  let body;

  try {
    body = await request.json();
  } catch {
    return json(400, { error: "JSONの形式が正しくありません" });
  }

  const validation = validateReport(body);
  if (!validation.valid) {
    return json(400, { error: "通報内容を確認してください", details: validation.errors });
  }

  const { postId, reporterId, reason } = validation.value;
  const container = getPostsContainer();

  try {
    const { resource: targetPost } = await container.item(postId, postId).read();
    if (!targetPost || targetPost.documentType === "report") {
      return json(404, { error: "対象の投稿が見つかりません" });
    }

    const createdAt = new Date();
    const id = crypto.createHash("sha256").update(`${postId}:${reporterId}`).digest("hex");
    const report = {
      id,
      documentType: "report",
      postId,
      reason,
      status: "open",
      createdAt: createdAt.toISOString(),
      expiresAt: new Date(createdAt.getTime() + REPORT_RETENTION_SECONDS * 1000).toISOString(),
      ttl: REPORT_RETENTION_SECONDS
    };

    await container.items.upsert(report);
    return json(201, { accepted: true, postId, reason });
  } catch (error) {
    if (error?.code === 404 || error?.statusCode === 404) {
      return json(404, { error: "対象の投稿が見つかりません" });
    }

    context.error("Failed to create report", error);
    return json(503, { error: "通報を保存できませんでした" });
  }
}

app.http("createReport", {
  route: "reports",
  methods: ["POST"],
  authLevel: "anonymous",
  handler: createReport
});

module.exports = { REPORT_RETENTION_SECONDS, createReport };
