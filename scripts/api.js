/* WeatherSpot: Azure Functions API client */

const WEATHERSPOT_API_CONFIG = Object.freeze({
  // Azure Functionsを配置した後、ここを https://<function-app-name>.azurewebsites.net/api に変更します。
  baseUrl: "https://weatherspot-sora1189-api-flex.azurewebsites.net/api"
});

function getWeatherSpotApiBaseUrl() {
  return String(WEATHERSPOT_API_CONFIG.baseUrl || "").trim().replace(/\/$/, "");
}

function isWeatherSpotApiConfigured() {
  return /^https:\/\/[a-z0-9.-]+\/api$/i.test(getWeatherSpotApiBaseUrl());
}

async function requestWeatherSpotApi(path, options = {}) {
  const baseUrl = getWeatherSpotApiBaseUrl();

  if (!isWeatherSpotApiConfigured()) {
    throw new Error("Azure APIのURLがまだ設定されていません");
  }

  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      Accept: "application/json",
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...(options.headers || {})
    }
  });

  const responseBody = await response.json().catch(() => null);

  if (!response.ok) {
    const error = new Error(responseBody?.error || `API request failed (${response.status})`);
    error.status = response.status;
    error.details = responseBody?.details || [];
    throw error;
  }

  return responseBody;
}

function createCloudDiaryPost(draft) {
  return requestWeatherSpotApi("/posts", {
    method: "POST",
    body: JSON.stringify(draft)
  });
}

function loadCloudDiaryPosts(limit = 30) {
  const safeLimit = Math.min(30, Math.max(1, Number(limit) || 30));
  return requestWeatherSpotApi(`/posts?limit=${safeLimit}`);
}

function reportCloudDiaryPost(postId, reason, reporterId) {
  return requestWeatherSpotApi("/reports", {
    method: "POST",
    body: JSON.stringify({ postId, reason, reporterId })
  });
}

function getAdminRequestHeaders(adminToken) {
  return { Authorization: `Bearer ${String(adminToken || "").trim()}` };
}

function loadAdminReports(adminToken) {
  return requestWeatherSpotApi("/moderation/reports", {
    headers: getAdminRequestHeaders(adminToken)
  });
}

function deleteCloudDiaryPostAsAdmin(postId, adminToken) {
  return requestWeatherSpotApi(`/moderation/posts/${encodeURIComponent(postId)}`, {
    method: "DELETE",
    headers: getAdminRequestHeaders(adminToken)
  });
}

function dismissCloudDiaryReportsAsAdmin(postId, adminToken) {
  return requestWeatherSpotApi(`/moderation/reports/${encodeURIComponent(postId)}`, {
    method: "DELETE",
    headers: getAdminRequestHeaders(adminToken)
  });
}









