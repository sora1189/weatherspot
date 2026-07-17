const { app } = require("@azure/functions");
const { getPostsContainer } = require("../lib/cosmos");
const { isAdminRequest } = require("../lib/adminAuth");

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

function isPostId(value) {
  return /^[0-9a-f-]{36}$/i.test(String(value || ""));
}

function unauthorized() {
  return json(401, { error: "管理者認証が必要です" });
}

async function findReportsForPost(container, postId) {
  const query = {
    query: "SELECT * FROM c WHERE c.documentType = 'report' AND c.postId = @postId",
    parameters: [{ name: "@postId", value: postId }]
  };
  const { resources } = await container.items.query(query).fetchAll();
  return resources;
}

async function removeReports(container, reports) {
  await Promise.all(reports.map((report) => container.item(report.id, report.id).delete()));
}

async function listAdminReports(request, context) {
  if (!isAdminRequest(request)) return unauthorized();

  try {
    const container = getPostsContainer();
    const query = {
      query: "SELECT TOP 100 * FROM c WHERE c.documentType = 'report' ORDER BY c.createdAt DESC"
    };
    const { resources: reports } = await container.items.query(query, { maxItemCount: 100 }).fetchAll();
    const grouped = new Map();

    for (const report of reports) {
      const current = grouped.get(report.postId) || {
        postId: report.postId,
        count: 0,
        reasons: new Set(),
        latestReportedAt: report.createdAt
      };
      current.count += 1;
      current.reasons.add(report.reason);
      if (String(report.createdAt) > String(current.latestReportedAt)) current.latestReportedAt = report.createdAt;
      grouped.set(report.postId, current);
    }

    const items = await Promise.all(Array.from(grouped.values()).map(async (group) => {
      let post = null;
      try {
        const response = await container.item(group.postId, group.postId).read();
        post = response.resource || null;
      } catch (error) {
        if (error?.code !== 404 && error?.statusCode !== 404) throw error;
      }

      return {
        postId: group.postId,
        reportCount: group.count,
        reasons: Array.from(group.reasons),
        latestReportedAt: group.latestReportedAt,
        post
      };
    }));

    items.sort((a, b) => String(b.latestReportedAt).localeCompare(String(a.latestReportedAt)));
    return json(200, { reports: items, count: items.length });
  } catch (error) {
    context.error("Failed to list admin reports", error);
    return json(503, { error: "通報一覧を取得できませんでした" });
  }
}

async function deleteReportedPost(request, context) {
  if (!isAdminRequest(request)) return unauthorized();
  const postId = request.params.postId;
  if (!isPostId(postId)) return json(400, { error: "投稿IDが正しくありません" });

  try {
    const container = getPostsContainer();
    try {
      await container.item(postId, postId).delete();
    } catch (error) {
      if (error?.code !== 404 && error?.statusCode !== 404) throw error;
    }
    const reports = await findReportsForPost(container, postId);
    await removeReports(container, reports);
    return json(200, { deleted: true, postId });
  } catch (error) {
    context.error("Failed to delete reported post", error);
    return json(503, { error: "投稿を削除できませんでした" });
  }
}

async function dismissPostReports(request, context) {
  if (!isAdminRequest(request)) return unauthorized();
  const postId = request.params.postId;
  if (!isPostId(postId)) return json(400, { error: "投稿IDが正しくありません" });

  try {
    const container = getPostsContainer();
    const reports = await findReportsForPost(container, postId);
    await removeReports(container, reports);
    return json(200, { dismissed: true, postId });
  } catch (error) {
    context.error("Failed to dismiss reports", error);
    return json(503, { error: "通報を処理できませんでした" });
  }
}

app.http("listAdminReports", {
  route: "moderation/reports",
  methods: ["GET"],
  authLevel: "anonymous",
  handler: listAdminReports
});

app.http("deleteReportedPost", {
  route: "moderation/posts/{postId}",
  methods: ["DELETE"],
  authLevel: "anonymous",
  handler: deleteReportedPost
});

app.http("dismissPostReports", {
  route: "moderation/reports/{postId}",
  methods: ["DELETE"],
  authLevel: "anonymous",
  handler: dismissPostReports
});

module.exports = { deleteReportedPost, dismissPostReports, listAdminReports };
