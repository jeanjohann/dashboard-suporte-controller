# Exportação manual do banco de negócio; não acessa USERS_DB e não restaura produção.
$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
$backupDirectory = Join-Path $projectRoot '.backups/business'
New-Item -ItemType Directory -Path $backupDirectory -Force | Out-Null
$stamp = Get-Date -Format 'yyyyMMdd-HHmmss-fff'
$partial = Join-Path $backupDirectory "business-$stamp.partial.sql"
$destination = Join-Path $backupDirectory "business-$stamp.sql"
Push-Location $projectRoot
try {
  $exportOutput = & npx.cmd wrangler d1 export dashboard-suporte-negocio --remote --output $partial --skip-confirmation 2>&1
  $exportResult = $LASTEXITCODE
  $exportOutput | Where-Object { $_ -notmatch 'https?://' } | Write-Output
  if ($exportResult -ne 0 -or !(Test-Path -LiteralPath $partial) -or (Get-Item -LiteralPath $partial).Length -eq 0) {
    throw 'Exportação não confirmada. Um arquivo parcial não é um backup válido.'
  }
  Move-Item -LiteralPath $partial -Destination $destination
  $digest = (Get-FileHash -LiteralPath $destination -Algorithm SHA256).Hash.ToLowerInvariant()
  [IO.File]::WriteAllText("$destination.sha256", "$digest  $([IO.Path]::GetFileName($destination))`n")
  Write-Output "Backup confirmado: $destination"
} finally { Pop-Location }
