const test = require("node:test");
const assert = require("node:assert/strict");
const { isAdminRequest } = require("../src/lib/adminAuth");

function requestWithAuthorization(value) {
  return { headers: new Headers(value ? { Authorization: value } : {}) };
}

test("accepts the configured bearer token", () => {
  process.env.WEATHERSPOT_ADMIN_TOKEN = "a".repeat(64);
  assert.equal(isAdminRequest(requestWithAuthorization(`Bearer ${"a".repeat(64)}`)), true);
});

test("rejects a wrong bearer token", () => {
  process.env.WEATHERSPOT_ADMIN_TOKEN = "a".repeat(64);
  assert.equal(isAdminRequest(requestWithAuthorization(`Bearer ${"b".repeat(64)}`)), false);
});

test("rejects an insecure server configuration", () => {
  process.env.WEATHERSPOT_ADMIN_TOKEN = "short";
  assert.equal(isAdminRequest(requestWithAuthorization("Bearer short")), false);
});
