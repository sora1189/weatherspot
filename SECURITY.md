# Security notes

WeatherSpot is a public static frontend connected to Azure Functions.

## Never commit these files or values

- `weatherspot-admin-key.local`
- `api/local.settings.json`
- `.env` and `.env.*`
- Cosmos DB keys, Azure Storage keys, Spotify Client Secret, access tokens

The Spotify Client ID is a public identifier and may appear in browser code. A Spotify Client Secret must never be added to this project.

## Moderation

- Public posts are retained for seven days by Cosmos DB TTL.
- Reports are retained for seven days.
- Moderation endpoints require a 64-character administrator key.
- The key is stored only in an Azure Function App setting and the ignored local file `weatherspot-admin-key.local`.
- The browser keeps the key in memory only while the moderation screen is open.

If the administrator key is exposed, delete `weatherspot-admin-key.local` and run `deploy-azure-flex.ps1` again to generate and apply a replacement.
