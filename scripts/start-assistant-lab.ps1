# Inicia os serviços locais de consulta e o MCP de demonstração. O n8n mantém suas próprias credenciais.
$ErrorActionPreference = 'Stop'
& (Join-Path $PSScriptRoot 'start-local-acervo.ps1')
& (Join-Path $PSScriptRoot 'start-assistant-mcp.ps1')
$assistantRuntime = Join-Path $env:LOCALAPPDATA 'Addlog\n8n-lab'
$assistantEntry = Join-Path $PSScriptRoot 'local-assistant.mjs'
try {
  $assistantReady = Invoke-WebRequest -Uri 'http://127.0.0.1:5681/v1/assistant/attendance' -Method Options -Headers @{ Origin = 'https://dashboard-suporte-controller.jean-johann.workers.dev' } -UseBasicParsing -TimeoutSec 3
  if ($assistantReady.StatusCode -eq 204) { Write-Output 'Assistente local já está disponível.'; exit 0 }
} catch { }
$assistantProcess = Start-Process -FilePath (Get-Command node.exe).Source -ArgumentList @(('"' + $assistantEntry + '"')) -WorkingDirectory (Split-Path $PSScriptRoot) -WindowStyle Hidden -RedirectStandardOutput (Join-Path $assistantRuntime 'assistant.log') -RedirectStandardError (Join-Path $assistantRuntime 'assistant-error.log') -PassThru
@{ processId = $assistantProcess.Id; startedUtcTicks = $assistantProcess.StartTime.ToUniversalTime().Ticks.ToString() } | ConvertTo-Json | Set-Content -LiteralPath (Join-Path $assistantRuntime 'assistant-process.json') -Encoding utf8
Write-Output 'Inicialização do Assistente local solicitada.'
