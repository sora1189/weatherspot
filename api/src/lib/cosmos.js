const { CosmosClient } = require("@azure/cosmos");

let cachedContainer = null;

function requireEnvironment(name) {
  const value = String(process.env[name] || "").trim();
  if (!value) throw new Error(`${name} is not configured`);
  return value;
}

function getPostsContainer() {
  if (cachedContainer) return cachedContainer;

  const client = new CosmosClient({
    endpoint: requireEnvironment("COSMOS_ENDPOINT"),
    key: requireEnvironment("COSMOS_KEY")
  });

  const databaseId = process.env.COSMOS_DATABASE || "weatherspot";
  const containerId = process.env.COSMOS_CONTAINER || "posts";
  cachedContainer = client.database(databaseId).container(containerId);
  return cachedContainer;
}

module.exports = { getPostsContainer };
