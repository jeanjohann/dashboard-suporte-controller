# Configura o diagnostico legado com entrada oculta; nenhum token e gravado em arquivo ou argumento de processo.
$ErrorActionPreference = 'Stop'
$monitoringRoot = Split-Path -Parent $PSScriptRoot
$monitoringWrangler = Join-Path $monitoringRoot 'node_modules\.bin\wrangler.cmd'
$monitoringConfig = Join-Path $monitoringRoot 'wrangler.jsonc'
$monitoringStatus = Join-Path $monitoringRoot '.worker-build\monitoring-setup-status.json'
$monitoringToken = $null
$monitoringSecure = $null
$monitoringPointer = [IntPtr]::Zero
try {
    if (!(Test-Path -LiteralPath $monitoringWrangler)) { throw 'DEPENDENCIES' }
    & $monitoringWrangler whoami *> $null
    if ($LASTEXITCODE -ne 0) { throw 'LOGIN' }
    Write-Host 'Configurar Monitoramento Ativo - sistema legado Addlog.'
    $monitoringEndpoint = Read-Host 'Endereco HTTPS completo do diagnostico (sem token)'
    $monitoringUrl = [Uri] $monitoringEndpoint
    if ($monitoringUrl.Scheme -ne 'https' -or $monitoringUrl.Host -ne 'sistema.addlog.com.br' -or
        !$monitoringUrl.IsDefaultPort -or $monitoringUrl.UserInfo -or $monitoringUrl.Query -or $monitoringUrl.Fragment -or
        $monitoringUrl.AbsolutePath -notmatch '^/api/[a-z0-9-]+/diagnostic$') { throw 'URL' }
    Write-Host 'Cole apenas o token. A entrada fica oculta. Nao envie pelo chat.'
    $monitoringSecure = Read-Host 'Token da API (pressione Enter depois de colar)' -AsSecureString
    $monitoringPointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($monitoringSecure)
    $monitoringToken = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($monitoringPointer).Trim()
    if (!$monitoringToken -or $monitoringToken -match '[\r\n]') { throw 'EMPTY' }
    Write-Host 'Salvando no Cloudflare como segredo...'
    $monitoringToken | & $monitoringWrangler secret put MONITORING_DIAGNOSTIC_TOKEN --config $monitoringConfig
    if ($LASTEXITCODE -ne 0) { throw 'SAVE' }
    $monitoringUrl.AbsoluteUri | & $monitoringWrangler secret put MONITORING_DIAGNOSTIC_URL --config $monitoringConfig
    if ($LASTEXITCODE -ne 0) { throw 'SAVE' }
    New-Item -ItemType Directory -Path (Split-Path -Parent $monitoringStatus) -Force | Out-Null
    @{ configured = $true; at = [DateTime]::UtcNow.ToString('o') } | ConvertTo-Json | Set-Content -LiteralPath $monitoringStatus
    Write-Host 'Concluido. Token salvo no Cloudflare sem exibicao ou copia em arquivo. Avise no chat.'
} catch {
    # Nao imprimir excecoes originais, que podem conter dados privados.
    switch ($_.Exception.Message) {
        'LOGIN' { Write-Host 'Login local do Cloudflare indisponivel. Avise no chat.' }
        'EMPTY' { Write-Host 'O token ficou vazio ou tem quebra de linha. Execute novamente.' }
        default { Write-Host 'Nao foi possivel concluir a configuracao. Avise no chat; nao envie o token.' }
    }
} finally {
    if ($monitoringPointer -ne [IntPtr]::Zero) { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($monitoringPointer) }
    if ($monitoringSecure) { $monitoringSecure.Dispose() }
    $monitoringToken = $null
}
