# WeatherSpot Azure配置手順

## 使用中の構成

| 種類 | 名前 |
|---|---|
| Resource Group | `weatherspot-rg` |
| Function App | `weatherspot-sora1189-api-flex` |
| Storage Account | `weatherspotsora1189fx` |
| Cosmos DB | `weatherspot-sora1189-cosmos` |
| Database / Container | `weatherspot` / `posts` |
| Region | Korea Central |

API URL:

```text
https://weatherspot-sora1189-api-flex.azurewebsites.net/api
```

## APIを更新する

PowerShellでプロジェクトフォルダーを開き、次を実行します。

```powershell
powershell -ExecutionPolicy Bypass -File .\deploy-azure-flex.ps1
```

正常終了すると次が表示されます。

```text
Flex Consumption deployment completed.
API: https://weatherspot-sora1189-api-flex.azurewebsites.net/api
Admin key file: ...\weatherspot-admin-key.local
```

配置処理は次を自動で確認します。

- Flex Consumption Function Appが起動していること
- 投稿APIが応答すること
- 管理者キーで通報管理APIへ接続できること
- HTTPSのみを使用し、TLS 1.2以上であること
- GitHub Pagesとローカル確認URLがCORSに登録されていること

## 管理者キー

`weatherspot-admin-key.local` は管理者用の秘密情報です。GitHubの対象外になっています。ファイルを削除してから再配置すると、新しいキーへ交換されます。

## 古い失敗済みリソースを削除する

最初に削除対象だけを確認します。

```powershell
powershell -ExecutionPolicy Bypass -File .\cleanup-old-azure.ps1
```

表示された対象に問題がなければ、削除を実行します。

```powershell
powershell -ExecutionPolicy Bypass -File .\cleanup-old-azure.ps1 -Delete
```

確認欄へ `DELETE` と入力します。稼働中のFlex Function App、Flex用Storage、Cosmos DBは削除されません。

## 費用を抑えるための方針

- Cosmos DBはFree Tierを1アカウントだけ使用
- Function AppはFlex Consumptionを使用
- 投稿と通報はTTLにより7日で自動削除
- 古いLinux Consumption Function AppとStorageを残さない
- Azure PortalのCost Managementで定期的に費用を確認
