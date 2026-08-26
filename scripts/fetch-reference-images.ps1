param(
  [string]$WorkspaceRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")),
  [switch]$Force
)

$ErrorActionPreference = "Stop"
$sourceRoot = Join-Path $WorkspaceRoot "design\reference-source"
$publicRoot = Join-Path $WorkspaceRoot "public\images"
$headers = @{ "User-Agent" = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ArcBTI-Research-Prototype/1.0" }

New-Item -ItemType Directory -Force -Path (Join-Path $sourceRoot "buildings"), (Join-Path $sourceRoot "architects"), (Join-Path $publicRoot "buildings"), (Join-Path $publicRoot "architects") | Out-Null

function Resolve-OpenGraphImage([string]$pageUrl) {
  if ($pageUrl -match "\.pdf(?:\?|$)") { return $null }
  $response = Invoke-WebRequest -Uri $pageUrl -Headers $headers -MaximumRedirection 8 -TimeoutSec 35
  $html = $response.Content
  $patterns = @(
    '<meta[^>]+(?:property|name)=["''](?:og:image|twitter:image)["''][^>]+content=["'']([^"'']+)["'']',
    '<meta[^>]+content=["'']([^"'']+)["''][^>]+(?:property|name)=["''](?:og:image|twitter:image)["'']'
  )
  foreach ($pattern in $patterns) {
    $match = [regex]::Match($html, $pattern, [System.Text.RegularExpressions.RegexOptions]::IgnoreCase)
    if ($match.Success) {
      $value = [System.Net.WebUtility]::HtmlDecode($match.Groups[1].Value)
      return [Uri]::new([Uri]$response.BaseResponse.RequestMessage.RequestUri, $value).AbsoluteUri
    }
  }
  return $null
}

function Fetch-Asset([string]$kind, [string]$filename, [string]$pageUrl) {
  $stem = [System.IO.Path]::GetFileNameWithoutExtension($filename)
  $rawPath = Join-Path $sourceRoot "$kind\$stem.source"
  if ((Test-Path -LiteralPath $rawPath) -and -not $Force) {
    Write-Output "SKIP`t$kind`t$filename`tlocal source exists"
    return
  }
  try {
    $imageUrl = Resolve-OpenGraphImage $pageUrl
    if (-not $imageUrl) {
      Write-Output "MISS`t$kind`t$filename`t$pageUrl"
      return
    }
    Invoke-WebRequest -Uri $imageUrl -Headers $headers -OutFile $rawPath -MaximumRedirection 8 -TimeoutSec 60
    Write-Output "OK`t$kind`t$filename`t$imageUrl"
  } catch {
    Write-Output "FAIL`t$kind`t$filename`t$($_.Exception.Message)"
  }
}

$buildingCode = Get-Content -Raw (Join-Path $WorkspaceRoot "src\content\buildings.ts")
$buildingMatches = [regex]::Matches(
  $buildingCode,
  'imageFile:\s*"([^"]+)"[\s\S]*?sourceUrl:\s*"([^"]+)"',
  [System.Text.RegularExpressions.RegexOptions]::IgnoreCase
)
foreach ($match in $buildingMatches) {
  Fetch-Asset "buildings" $match.Groups[1].Value $match.Groups[2].Value
}

$architectCode = Get-Content -Raw (Join-Path $WorkspaceRoot "src\content\architects.ts")
$architectMatches = [regex]::Matches(
  $architectCode,
  'src:\s*"/images/architects/([^"]+)"[\s\S]*?source:\s*\{[\s\S]*?url:\s*"([^"]+)"',
  [System.Text.RegularExpressions.RegexOptions]::IgnoreCase
)
foreach ($match in $architectMatches) {
  Fetch-Asset "architects" $match.Groups[1].Value $match.Groups[2].Value
}
