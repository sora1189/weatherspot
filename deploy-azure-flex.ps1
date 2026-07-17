param(
  [string]$ResourceGroup = "weatherspot-rg",
  [string]$PreferredLocation = "koreacentral",
  [string]$CosmosAccount = "weatherspot-sora1189-cosmos",
  [string]$StorageAccount = "weatherspotsora1189fx",
  [string]$FunctionApp = "weatherspot-sora1189-api-flex",
  [string]$GitHubPagesOrigin = "https://sora1189.github.io"
)

$ErrorActionPreference = "Stop"
$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$az = Join-Path $projectRoot ".tools\azure-cli\Scripts\az.bat"
$env:AZURE_CONFIG_DIR = Join-Path $projectRoot ".tools\azure-config"

function Invoke-Az {
  param([Parameter(ValueFromRemainingArguments = $true)][string[]]$Arguments)
  $previousErrorActionPreference = $ErrorActionPreference
  $ErrorActionPreference = "Continue"
  & $az @Arguments
  $exitCode = $LASTEXITCODE
  $ErrorActionPreference = $previousErrorActionPreference
  if ($exitCode -ne 0) {
    $commandGroup = ($Arguments | Select-Object -First 3) -join " "
    throw "Azure CLI command failed near: az $commandGroup"
  }
}

function Invoke-AzSilent {
  param([Parameter(ValueFromRemainingArguments = $true)][string[]]$Arguments)
  $previousErrorActionPreference = $ErrorActionPreference
  $ErrorActionPreference = "Continue"
  $commandOutput = & $az @Arguments 2>&1
  $exitCode = $LASTEXITCODE
  $ErrorActionPreference = $previousErrorActionPreference
  if ($exitCode -ne 0) {
    $commandGroup = ($Arguments | Select-Object -First 3) -join " "
    throw "Azure CLI command failed near: az $commandGroup"
  }
}

function Test-Az {
  param([Parameter(ValueFromRemainingArguments = $true)][string[]]$Arguments)
  $previousErrorActionPreference = $ErrorActionPreference
  $ErrorActionPreference = "SilentlyContinue"
  & $az @Arguments 1>$null 2>$null
  $succeeded = $LASTEXITCODE -eq 0
  $ErrorActionPreference = $previousErrorActionPreference
  return $succeeded
}

function Get-AzSecretValue {
  param([Parameter(ValueFromRemainingArguments = $true)][string[]]$Arguments)
  $previousErrorActionPreference = $ErrorActionPreference
  $ErrorActionPreference = "Continue"
  $value = & $az @Arguments 2>$null
  $exitCode = $LASTEXITCODE
  $ErrorActionPreference = $previousErrorActionPreference
  if ($exitCode -ne 0 -or [string]::IsNullOrWhiteSpace([string]$value)) {
    throw "A required Azure value could not be obtained."
  }
  return ([string]$value).Trim()
}

function New-LinuxCompatibleZip {
  param([string]$SourceDirectory, [string]$DestinationPath)
  Add-Type -AssemblyName System.IO.Compression
  Add-Type -AssemblyName System.IO.Compression.FileSystem
  $sourceRoot = (Get-Item -LiteralPath $SourceDirectory).FullName.TrimEnd([char[]]"\/")
  $archive = [System.IO.Compression.ZipFile]::Open($DestinationPath, [System.IO.Compression.ZipArchiveMode]::Create)
  try {
    foreach ($file in Get-ChildItem -LiteralPath $sourceRoot -Recurse -File -Force) {
      $relativePath = $file.FullName.Substring($sourceRoot.Length).TrimStart([char[]]"\/")
      $entry = $archive.CreateEntry($relativePath.Replace("\", "/"), [System.IO.Compression.CompressionLevel]::Optimal)
      $entryStream = $entry.Open()
      $fileStream = [System.IO.File]::OpenRead($file.FullName)
      try { $fileStream.CopyTo($entryStream) } finally { $fileStream.Dispose(); $entryStream.Dispose() }
    }
  } finally {
    $archive.Dispose()
  }
}

function Set-FunctionSettingsSecurely {
  param([hashtable]$Settings)
  $settingsPath = Join-Path $env:TEMP "weatherspot-flex-settings-$([Guid]::NewGuid().ToString('N')).json"
  $utf8WithoutBom = New-Object System.Text.UTF8Encoding($false)
  [IO.File]::WriteAllText($settingsPath, ($Settings | ConvertTo-Json), $utf8WithoutBom)
  try {
    $settingsArgument = "@$settingsPath"
    Invoke-AzSilent functionapp config appsettings set `
      --resource-group $ResourceGroup `
      --name $FunctionApp `
      --settings $settingsArgument `
      --output none
  } finally {
    if (Test-Path $settingsPath) { Remove-Item -LiteralPath $settingsPath -Force }
  }
}

if (-not (Test-Path $az)) { throw "Azure CLI was not found in .tools/azure-cli." }

Write-Host "[1/8] Checking Azure account and providers..." -ForegroundColor Cyan
if (-not (Test-Az account show --output none)) {
  Invoke-Az login --use-device-code --output none
}
Invoke-Az provider register --namespace Microsoft.Web --wait --output none
Invoke-Az provider register --namespace Microsoft.Storage --wait --output none
Invoke-Az provider register --namespace Microsoft.Insights --wait --output none
Invoke-Az provider register --namespace Microsoft.OperationalInsights --wait --output none

Write-Host "[2/8] Selecting a supported Flex Consumption region..." -ForegroundColor Cyan
$locationsJson = & $az functionapp list-flexconsumption-locations --output json
if ($LASTEXITCODE -ne 0) { throw "Flex Consumption locations could not be listed." }
$locationRecords = $locationsJson | ConvertFrom-Json
$availableLocations = @()
foreach ($record in $locationRecords) {
  if ($record -is [string]) {
    $availableLocations += $record.ToLowerInvariant()
  } elseif ($record.name) {
    $availableLocations += ([string]$record.name).ToLowerInvariant()
  }
}

$locationCandidates = @($PreferredLocation, "koreacentral", "japaneast", "eastasia", "southeastasia", "australiaeast")
$Location = $null
foreach ($candidate in $locationCandidates) {
  if ($availableLocations -contains $candidate.ToLowerInvariant()) {
    $Location = $candidate.ToLowerInvariant()
    break
  }
}
if (-not $Location) { throw "None of the preferred nearby regions currently support Flex Consumption." }
Write-Host "Flex region: $Location" -ForegroundColor Green

Write-Host "[3/8] Preparing isolated Flex storage..." -ForegroundColor Cyan
if (-not (Test-Az storage account show --resource-group $ResourceGroup --name $StorageAccount --output none)) {
  Invoke-Az storage account create `
    --resource-group $ResourceGroup `
    --name $StorageAccount `
    --location $Location `
    --sku Standard_LRS `
    --kind StorageV2 `
    --min-tls-version TLS1_2 `
    --output none
}

Write-Host "[4/8] Creating the Flex Consumption Function App with Node.js 22..." -ForegroundColor Cyan
if (-not (Test-Az functionapp show --resource-group $ResourceGroup --name $FunctionApp --output none)) {
  Invoke-Az functionapp create `
    --resource-group $ResourceGroup `
    --name $FunctionApp `
    --storage-account $StorageAccount `
    --flexconsumption-location $Location `
    --runtime node `
    --runtime-version 22 `
    --functions-version 4 `
    --instance-memory 2048 `
    --maximum-instance-count 40 `
    --https-only true `
    --output none
}

Invoke-AzSilent functionapp update `
  --resource-group $ResourceGroup `
  --name $FunctionApp `
  --set httpsOnly=true `
  --output none
Invoke-AzSilent functionapp config set `
  --resource-group $ResourceGroup `
  --name $FunctionApp `
  --min-tls-version 1.2 `
  --output none

Write-Host "[5/8] Connecting Cosmos DB and configuring CORS..." -ForegroundColor Cyan
$adminKeyPath = Join-Path $projectRoot "weatherspot-admin-key.local"
$adminToken = ""
if (Test-Path $adminKeyPath) {
  $adminToken = ([string](Get-Content -LiteralPath $adminKeyPath -Raw -Encoding UTF8)).Trim()
}

if ($adminToken -notmatch '^[a-f0-9]{64}$') {
  $tokenBytes = New-Object byte[] 32
  $randomNumberGenerator = [Security.Cryptography.RandomNumberGenerator]::Create()
  try { $randomNumberGenerator.GetBytes($tokenBytes) } finally { $randomNumberGenerator.Dispose() }
  $adminToken = -join ($tokenBytes | ForEach-Object { $_.ToString("x2") })
}

$utf8WithoutBom = New-Object System.Text.UTF8Encoding($false)
[IO.File]::WriteAllText($adminKeyPath, $adminToken, $utf8WithoutBom)

$cosmosEndpoint = Get-AzSecretValue cosmosdb show `
  --resource-group $ResourceGroup `
  --name $CosmosAccount `
  --query documentEndpoint `
  --output tsv
$cosmosKey = Get-AzSecretValue cosmosdb keys list `
  --resource-group $ResourceGroup `
  --name $CosmosAccount `
  --type keys `
  --query primaryMasterKey `
  --output tsv

Set-FunctionSettingsSecurely @{
  COSMOS_ENDPOINT = $cosmosEndpoint
  COSMOS_KEY = $cosmosKey
  COSMOS_DATABASE = "weatherspot"
  COSMOS_CONTAINER = "posts"
  WEATHERSPOT_ADMIN_TOKEN = $adminToken
  AzureWebJobsFeatureFlags = "EnableWorkerIndexing"
  FUNCTIONS_NODE_BLOCK_ON_ENTRY_POINT_ERROR = "true"
}
$cosmosKey = $null

Invoke-AzSilent functionapp cors add --resource-group $ResourceGroup --name $FunctionApp --allowed-origins $GitHubPagesOrigin --output none
Invoke-AzSilent functionapp cors add --resource-group $ResourceGroup --name $FunctionApp --allowed-origins "http://127.0.0.1:5510" --output none

Write-Host "[6/8] Building a ready-to-run Node.js package..." -ForegroundColor Cyan
$packageDir = Join-Path $env:TEMP "weatherspot-flex-api-package"
$packageZip = Join-Path $env:TEMP "weatherspot-flex-api.zip"
$nodeBin = Join-Path $env:USERPROFILE ".cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin"
$pnpm = Join-Path $env:USERPROFILE ".cache\codex-runtimes\codex-primary-runtime\dependencies\bin\fallback\pnpm.cmd"
if (-not (Test-Path $pnpm)) { throw "The bundled pnpm command was not found." }
if (Test-Path $nodeBin) { $env:Path = "$nodeBin;$env:Path" }
if (Test-Path $packageDir) { Remove-Item -LiteralPath $packageDir -Recurse -Force }
if (Test-Path $packageZip) { Remove-Item -LiteralPath $packageZip -Force }
New-Item -ItemType Directory -Path $packageDir | Out-Null
Copy-Item (Join-Path $projectRoot "api\host.json") $packageDir
Copy-Item (Join-Path $projectRoot "api\package.json") $packageDir
Copy-Item (Join-Path $projectRoot "api\src") $packageDir -Recurse
Push-Location $packageDir
try {
  & $pnpm install --prod --no-frozen-lockfile --node-linker=hoisted --package-import-method=copy
  if ($LASTEXITCODE -ne 0) { throw "Installing API dependencies failed." }
} finally {
  Pop-Location
}
New-LinuxCompatibleZip -SourceDirectory $packageDir -DestinationPath $packageZip

Write-Host "[7/8] Deploying through the Flex deployment service..." -ForegroundColor Cyan
Invoke-Az functionapp deployment source config-zip `
  --resource-group $ResourceGroup `
  --name $FunctionApp `
  --src $packageZip `
  --timeout 600 `
  --output none

Write-Host "[8/8] Checking the API and updating the frontend..." -ForegroundColor Cyan
$apiBaseUrl = "https://$FunctionApp.azurewebsites.net/api"
$apiReady = $false
for ($attempt = 1; $attempt -le 8; $attempt++) {
  try {
    $response = Invoke-WebRequest -Uri "$apiBaseUrl/posts" -UseBasicParsing -TimeoutSec 20
    if ($response.StatusCode -eq 200) { $apiReady = $true; break }
  } catch {
    if ($attempt -lt 8) { Start-Sleep -Seconds 10 }
  }
}
if (-not $apiReady) { throw "Flex deployment completed, but the public API did not respond." }

$adminApiReady = $false
$adminHeaders = @{ Authorization = "Bearer $adminToken" }
for ($attempt = 1; $attempt -le 8; $attempt++) {
  try {
    $response = Invoke-WebRequest -Uri "$apiBaseUrl/moderation/reports" -Headers $adminHeaders -UseBasicParsing -TimeoutSec 20
    if ($response.StatusCode -eq 200) { $adminApiReady = $true; break }
  } catch {
    if ($attempt -lt 8) { Start-Sleep -Seconds 5 }
  }
}
if (-not $adminApiReady) { throw "The moderation API or administrator key could not be verified." }
$adminHeaders = $null
$adminToken = $null

$apiConfigPath = Join-Path $projectRoot "scripts\api.js"
$apiConfig = Get-Content -LiteralPath $apiConfigPath -Raw -Encoding UTF8
$apiConfig = [regex]::Replace($apiConfig, 'baseUrl:\s*"[^"]*"', "baseUrl: `"$apiBaseUrl`"", 1)
Set-Content -LiteralPath $apiConfigPath -Value $apiConfig -Encoding UTF8

Write-Host ""
Write-Host "Flex Consumption deployment completed." -ForegroundColor Green
Write-Host "API: $apiBaseUrl"
Write-Host "Admin key file: $adminKeyPath"
Write-Host "The two failed Linux Consumption apps can be removed after final verification."
