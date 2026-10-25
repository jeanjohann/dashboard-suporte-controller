# Inicia o MCP de demonstração em loopback, protegido pelo token local do acervo.
$ErrorActionPreference = 'Stop'
$assistantRuntime = Join-Path $env:LOCALAPPDATA 'Addlog\n8n-lab'
$tokenFile = Join-Path $assistantRuntime 'acervo-token.txt'
$entry = Join-Path $PSScriptRoot 'assistant-mcp-server.mjs'
if (!(Test-Path -LiteralPath $tokenFile)) { throw 'Configure a credencial local do acervo antes de iniciar.' }
$token = (Get-Content -LiteralPath $tokenFile -Raw).Trim()
if ($token.Length -lt 32) { throw 'A credencial local do acervo está inválida.' }

try {
  $ready = Invoke-WebRequest -Uri 'http://127.0.0.1:5682/health' -Headers @{ 'x-acervo-token' = $token } -UseBasicParsing -TimeoutSec 3
  if ($ready.StatusCode -eq 200) { Write-Output 'MCP de demonstração já está disponível.'; return }
} catch { }

$env:ACERVO_LOCAL_TOKEN = $token
try {
  $process = Start-Process -FilePath (Get-Command node.exe).Source -ArgumentList @(('"' + $entry + '"'), '--serve') -WorkingDirectory (Split-Path $PSScriptRoot) -WindowStyle Hidden -RedirectStandardOutput (Join-Path $assistantRuntime 'assistant-mcp.log') -RedirectStandardError (Join-Path $assistantRuntime 'assistant-mcp-error.log') -PassThru
  @{ processId = $process.Id; startedUtcTicks = $process.StartTime.ToUniversalTime().Ticks.ToString() } | ConvertTo-Json | Set-Content -LiteralPath (Join-Path $assistantRuntime 'assistant-mcp-process.json') -Encoding utf8
} finally {
  Remove-Item Env:ACERVO_LOCAL_TOKEN -ErrorAction SilentlyContinue
}
Write-Output 'Inicialização do MCP de demonstração solicitada em http://127.0.0.1:5682/mcp.'
