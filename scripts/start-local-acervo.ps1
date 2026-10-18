# Serviço de consulta do laboratório. Não modifica planilhas nem cria serviço do Windows.
$ErrorActionPreference = 'Stop'
$acervoRuntime = Join-Path $env:LOCALAPPDATA 'Addlog\n8n-lab'
$acervoTokenFile = Join-Path $acervoRuntime 'acervo-token.txt'
$acervoEntry = Join-Path $PSScriptRoot 'local-acervo.mjs'
if (!(Test-Path -LiteralPath $acervoTokenFile)) { throw 'Configure a credencial local do acervo antes de iniciar.' }
$env:ACERVO_LOCAL_TOKEN = (Get-Content -LiteralPath $acervoTokenFile -Raw).Trim()
try {
  $acervoReply = Invoke-WebRequest -Uri 'http://127.0.0.1:5680/v1/acervo/atendimentos' -Headers @{ 'x-acervo-token' = $env:ACERVO_LOCAL_TOKEN } -UseBasicParsing -TimeoutSec 20
  if ($acervoReply.StatusCode -eq 200) { Write-Output 'Acervo já está disponível.'; exit 0 }
} catch { }
$acervoProcess = Start-Process -FilePath (Get-Command node.exe).Source -ArgumentList @(('"' + $acervoEntry + '"'), '--serve') -WorkingDirectory (Split-Path $PSScriptRoot) -WindowStyle Hidden -RedirectStandardOutput (Join-Path $acervoRuntime 'acervo.log') -RedirectStandardError (Join-Path $acervoRuntime 'acervo-error.log') -PassThru
@{ processId = $acervoProcess.Id; startedUtcTicks = $acervoProcess.StartTime.ToUniversalTime().Ticks.ToString() } | ConvertTo-Json | Set-Content -LiteralPath (Join-Path $acervoRuntime 'acervo-process.json') -Encoding utf8
Remove-Item Env:ACERVO_LOCAL_TOKEN
Write-Output 'Inicialização do acervo solicitada.'
