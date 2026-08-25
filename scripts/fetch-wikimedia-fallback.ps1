param(
  [string]$WorkspaceRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")),
  [switch]$Force
)

$ErrorActionPreference = "Stop"
$sourceRoot = Join-Path $WorkspaceRoot "design\reference-source"
$headers = @{ "User-Agent" = "AIBTI-Research-Prototype/1.0 (educational mobile web prototype)" }

$assets = @(
  @{ Kind = "buildings"; File = "farnsworth-house"; Title = "Farnsworth House" },
  @{ Kind = "buildings"; File = "seagram-building"; Title = "Seagram Building" },
  @{ Kind = "buildings"; File = "fallingwater"; Title = "Fallingwater" },
  @{ Kind = "buildings"; File = "chandigarh"; Title = "Chandigarh Capitol Complex" },
  @{ Kind = "buildings"; File = "church-light"; Title = "Church of the Light" },
  @{ Kind = "buildings"; File = "water-temple"; Title = "Honpuku-ji" },
  @{ Kind = "buildings"; File = "hsbc-hong-kong"; Title = "HSBC Building (Hong Kong)" },
  @{ Kind = "buildings"; File = "reichstag"; Title = "Reichstag building" },
  @{ Kind = "buildings"; File = "hearst-tower"; Title = "Hearst Tower (Manhattan)" },
  @{ Kind = "buildings"; File = "heydar-aliyev-centre"; Title = "Heydar Aliyev Center" },
  @{ Kind = "buildings"; File = "maxxi"; Title = "MAXXI" },
  @{ Kind = "buildings"; File = "beijing-daxing"; Title = "Beijing Daxing International Airport" },
  @{ Kind = "buildings"; File = "sagrada-familia"; Title = "Sagrada Família" },
  @{ Kind = "buildings"; File = "ningbo-history-museum"; Title = "Ningbo Museum" },
  @{ Kind = "buildings"; File = "xiangshan-campus"; Title = "Xiangshan Campus, China Academy of Art" },
  @{ Kind = "architects"; File = "mies"; Title = "Ludwig Mies van der Rohe" },
  @{ Kind = "architects"; File = "ando"; Title = "Tadao Ando" },
  @{ Kind = "architects"; File = "foster"; Title = "Norman Foster, Baron Foster of Thames Bank" },
  @{ Kind = "architects"; File = "zaha"; Title = "Zaha Hadid" },
  @{ Kind = "architects"; File = "gaudi"; Title = "Antoni Gaudí" },
  @{ Kind = "architects"; File = "wang-lu"; Title = "Wang Shu" }
)

foreach ($asset in $assets) {
  $directory = Join-Path $sourceRoot $asset.Kind
  New-Item -ItemType Directory -Force -Path $directory | Out-Null
  $rawPath = Join-Path $directory "$($asset.File).source"
  if ((Test-Path -LiteralPath $rawPath) -and -not $Force) {
    Write-Output "SKIP`t$($asset.Kind)`t$($asset.File)`tlocal source exists"
    continue
  }
  try {
    $title = [Uri]::EscapeDataString($asset.Title)
    $apiUrl = "https://en.wikipedia.org/w/api.php?action=query&prop=pageimages&piprop=original%7Cname&titles=$title&format=json&redirects=1"
    $response = Invoke-RestMethod -Uri $apiUrl -Headers $headers -TimeoutSec 30
    $page = $response.query.pages.PSObject.Properties.Value | Select-Object -First 1
    if (-not $page.original.source) {
      Write-Output "MISS`t$($asset.Kind)`t$($asset.File)`t$($asset.Title)"
      continue
    }
    Invoke-WebRequest -Uri $page.original.source -Headers $headers -OutFile $rawPath -TimeoutSec 90
    $pageUrl = "https://en.wikipedia.org/wiki/$($asset.Title.Replace(' ', '_'))"
    Write-Output "OK`t$($asset.Kind)`t$($asset.File)`t$($page.pageimage)`t$pageUrl"
  } catch {
    Write-Output "FAIL`t$($asset.Kind)`t$($asset.File)`t$($_.Exception.Message)"
  }
}
