# Configura credenciais KORE por entrada oculta e stdin; nenhum valor privado e gravado em arquivo ou argumento.
$ErrorActionPreference = 'Stop'
$koreRoot = Split-Path -Parent $PSScriptRoot
$koreWrangler = Join-Path $koreRoot 'node_modules\.bin\wrangler.cmd'
$koreConfig = Join-Path $koreRoot 'wrangler.jsonc'
function Read-KorePrivate([string] $Prompt) {
    $secure = Read-Host $Prompt -AsSecureString
    $pointer = [IntPtr]::Zero
    try { $pointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure); return [Runtime.InteropServices.Marshal]::PtrToStringBSTR($pointer).Trim() }
    finally { if ($pointer -ne [IntPtr]::Zero) { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($pointer) }; $secure.Dispose() }
}
try {
    & $koreWrangler whoami *> $null
    if ($LASTEXITCODE -ne 0) { throw 'LOGIN' }
    $koreLogin = Read-KorePrivate 'KORE API login'
    $korePassword = Read-KorePrivate 'KORE API password'
    if (!$koreLogin -or !$korePassword) { throw 'EMPTY' }
    $koreSecrets = @{ KORE_API_USERNAME = $koreLogin; KORE_API_PASSWORD = $korePassword }
    $koreSecrets | ConvertTo-Json -Compress | & $koreWrangler secret bulk --config $koreConfig
    if ($LASTEXITCODE -ne 0) { throw 'SAVE' }
    Write-Host 'Concluido: credenciais KORE salvas como segredos no Cloudflare.'
} catch { Write-Host 'Configuracao nao concluida. Nenhuma credencial foi exibida ou salva em arquivo.'; exit 1 }
finally { if ($koreSecrets) { $koreSecrets.Clear() }; $koreLogin = $null; $korePassword = $null }
