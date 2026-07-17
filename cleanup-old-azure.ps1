param(
  [string]$ResourceGroup = "weatherspot-rg",
  [string]$ActiveFunctionApp = "weatherspot-sora1189-api-flex",
  [switch]$Delete
)

$ErrorActionPreference = "Stop"
$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$az = Join-Path $projectRoot ".tools\azure-cli\Scripts\az.bat"
$env:AZURE_CONFIG_DIR = Join-Path $projectRoot ".tools\azure-config"

function Test-AzResource {
  param([string[]]$Arguments)
  & $az @Arguments 1>$null 2>$null
  return $LASTEXITCODE -eq 0
}

function Invoke-AzSafe {
  param([string[]]$Arguments)
  & $az @Arguments
  if ($LASTEXITCODE -ne 0) {
    throw "Azure command failed. No additional resources will be removed."
  }
}

if (-not (Test-Path $az)) { throw "Azure CLI was not found. Run deploy-azure-flex.ps1 first." }
if (-not (Test-AzResource @("account", "show", "--output", "none"))) {
  throw "Azure login was not found. Run az login first."
}

Write-Host "Checking the active WeatherSpot environment..." -ForegroundColor Cyan
if (-not (Test-AzResource @("functionapp", "show", "--resource-group", $ResourceGroup, "--name", $ActiveFunctionApp, "--output", "none"))) {
  throw "The active Flex Function App was not found. Cleanup stopped."
}

$apiUrl = "https://$ActiveFunctionApp.azurewebsites.net/api/posts"
try {
  $response = Invoke-WebRequest -Uri $apiUrl -UseBasicParsing -TimeoutSec 30
} catch {
  throw "The active WeatherSpot API did not respond. Cleanup stopped before deleting anything."
}
if ($null -eq $response -or $response.StatusCode -ne 200) {
  throw "The active WeatherSpot API did not respond. Cleanup stopped before deleting anything."
}

$oldFunctionApps = @("weatherspot-sora1189-api", "weatherspot-sora1189-api-v2")
$oldInsights = @("weatherspot-sora1189-api", "weatherspot-sora1189-api-v2")
$oldStorageAccount = "weatherspotsora1189st"

$targets = New-Object System.Collections.Generic.List[string]
foreach ($name in $oldFunctionApps) {
  if (Test-AzResource @("functionapp", "show", "--resource-group", $ResourceGroup, "--name", $name, "--output", "none")) {
    $targets.Add("Function App: $name")
  }
}
foreach ($name in $oldInsights) {
  if (Test-AzResource @("resource", "show", "--resource-group", $ResourceGroup, "--resource-type", "Microsoft.Insights/components", "--name", $name, "--output", "none")) {
    $targets.Add("Application Insights: $name")
  }
}
if (Test-AzResource @("storage", "account", "show", "--resource-group", $ResourceGroup, "--name", $oldStorageAccount, "--output", "none")) {
  $targets.Add("Storage Account: $oldStorageAccount")
}

if ($targets.Count -eq 0) {
  Write-Host "No obsolete WeatherSpot resources were found." -ForegroundColor Green
  exit 0
}

Write-Host "Obsolete resources found:" -ForegroundColor Yellow
$targets | ForEach-Object { Write-Host "  - $_" }
Write-Host "Protected resources: $ActiveFunctionApp, Cosmos DB, Flex storage" -ForegroundColor Green

if (-not $Delete) {
  Write-Host "This was a preview. Run again with -Delete to remove only the resources listed above." -ForegroundColor Cyan
  exit 0
}

$confirmation = Read-Host "Type DELETE to continue"
if ($confirmation -cne "DELETE") {
  Write-Host "Cleanup cancelled."
  exit 0
}

foreach ($name in $oldFunctionApps) {
  if (Test-AzResource @("functionapp", "show", "--resource-group", $ResourceGroup, "--name", $name, "--output", "none")) {
    Write-Host "Removing Function App: $name"
    Invoke-AzSafe @("functionapp", "delete", "--resource-group", $ResourceGroup, "--name", $name)
  }
}
foreach ($name in $oldInsights) {
  if (Test-AzResource @("resource", "show", "--resource-group", $ResourceGroup, "--resource-type", "Microsoft.Insights/components", "--name", $name, "--output", "none")) {
    Write-Host "Removing Application Insights: $name"
    Invoke-AzSafe @("resource", "delete", "--resource-group", $ResourceGroup, "--resource-type", "Microsoft.Insights/components", "--name", $name)
  }
}
if (Test-AzResource @("storage", "account", "show", "--resource-group", $ResourceGroup, "--name", $oldStorageAccount, "--output", "none")) {
  Write-Host "Removing old Storage Account: $oldStorageAccount"
  Invoke-AzSafe @("storage", "account", "delete", "--resource-group", $ResourceGroup, "--name", $oldStorageAccount, "--yes")
}

Write-Host "Obsolete WeatherSpot resources were removed. The active Flex app and Cosmos DB were preserved." -ForegroundColor Green
