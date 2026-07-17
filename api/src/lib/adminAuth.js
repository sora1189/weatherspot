const crypto = require("node:crypto");

function getConfiguredAdminToken() {
  return String(process.env.WEATHERSPOT_ADMIN_TOKEN || "").trim();
}

function isAdminRequest(request) {
  const configuredToken = getConfiguredAdminToken();
  if (configuredToken.length < 32) return false;

  const authorization = String(request.headers.get("authorization") || "");
  const match = authorization.match(/^Bearer\s+(.+)$/i);
  if (!match) return false;

  const supplied = Buffer.from(match[1], "utf8");
  const expected = Buffer.from(configuredToken, "utf8");
  return supplied.length === expected.length && crypto.timingSafeEqual(supplied, expected);
}

module.exports = { isAdminRequest };
