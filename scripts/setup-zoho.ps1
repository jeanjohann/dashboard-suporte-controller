# Setup interativo local. Credenciais somente na memoria; nunca em argumentos, arquivos ou saida.
$ErrorActionPreference = 'Stop'
$zohoProjectRoot = Split-Path -Parent $PSScriptRoot
$zohoWrangler = Join-Path $zohoProjectRoot 'node_modules\.bin\wrangler.cmd'
$zohoConfig = Join-Path $zohoProjectRoot 'wrangler.jsonc'

function Read-ZohoPrivateValue([string] $Prompt) {
    $secureValue = Read-Host $Prompt -AsSecureString
    $valuePointer = [IntPtr]::Zero
    try {
        $valuePointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secureValue)
        return [Runtime.InteropServices.Marshal]::PtrToStringBSTR($valuePointer).Trim()
    } finally {
        if ($valuePointer -ne [IntPtr]::Zero) {
            [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($valuePointer)
        }
        $secureValue.Dispose()
    }
}

try {
    if (!(Test-Path -LiteralPath $zohoWrangler)) { throw 'SETUP_DEPENDENCIES' }
    & $zohoWrangler whoami *> $null
    if ($LASTEXITCODE -ne 0) { throw 'SETUP_LOGIN' }

    Write-Host 'Preparar token Zoho Desk (organizacao Addlog 57912045).'
    Write-Host 'Use o mesmo Client ID e Client Secret ja cadastrados no Cloudflare.'
    Write-Host 'Os valores digitados/colados ficam ocultos. Nao envie pelo chat.'
    $zohoClientId = Read-ZohoPrivateValue 'Cole o Client ID e pressione Enter'
    $zohoClientSecret = Read-ZohoPrivateValue 'Cole o Client Secret e pressione Enter'
    if (!$zohoClientId -or !$zohoClientSecret) { throw 'SETUP_EMPTY' }

    Write-Host ''
    Write-Host 'No Autocliente do Zoho, abra Generate Code / Gerar codigo.'
    Write-Host 'Escopos: Desk.tickets.READ,Desk.basic.READ'
    Write-Host 'Selecione o portal Addlog e gere um codigo temporario novo.'
    $zohoGrantCode = Read-ZohoPrivateValue 'Cole o codigo temporario e pressione Enter'
    if (!$zohoGrantCode) { throw 'SETUP_EMPTY' }
    $zohoBody = @{
        client_id = $zohoClientId
        client_secret = $zohoClientSecret
        grant_type = 'authorization_code'
        code = $zohoGrantCode
    }
    try {
        $zohoReply = Invoke-RestMethod -Uri 'https://accounts.zoho.com/oauth/v2/token' `
            -Method Post -ContentType 'application/x-www-form-urlencoded' -Body $zohoBody `
            -MaximumRedirection 0 -TimeoutSec 30
    } catch {
        throw 'SETUP_EXCHANGE'
    }
    if ($zohoReply.error -or !$zohoReply.refresh_token) { throw 'SETUP_EXCHANGE' }
    Write-Host 'Token recebido. Cadastrando como segredo no Cloudflare...'
    do {
        $zohoReply.refresh_token | & $zohoWrangler secret put ZOHO_REFRESH_TOKEN --config $zohoConfig
        $zohoSaved = $LASTEXITCODE -eq 0
        if (!$zohoSaved) {
            Write-Host 'Nao foi possivel salvar no Cloudflare. O token continua apenas nesta janela.'
            $zohoRetry = Read-Host 'Pressione Enter para tentar salvar novamente ou digite SAIR'
            if ($zohoRetry -eq 'SAIR') { throw 'SETUP_SAVE' }
        }
    } while (!$zohoSaved)
    Write-Host 'Concluido: ZOHO_REFRESH_TOKEN salvo no Cloudflare. Nenhum token foi exibido ou gravado em arquivo.'
    Write-Host 'A conexao e os indicadores ainda precisam ser implementados e validados no painel.'
} catch {
    # Nunca imprimir a excecao original: erros de HTTP/processo podem conter dados privados.
    switch ($_.Exception.Message) {
        'SETUP_DEPENDENCIES' { Write-Host 'Dependencias locais indisponiveis. Avise no chat.' }
        'SETUP_LOGIN' { Write-Host 'Entre no Cloudflare pela ferramenta local antes de tentar novamente.' }
        'SETUP_EMPTY' { Write-Host 'Um dos campos ficou vazio. Nenhuma credencial foi exibida.' }
        'SETUP_EXCHANGE' { Write-Host 'O Zoho nao retornou o token. Confira cliente/regiao e use um codigo novo, ainda valido.' }
        'SETUP_SAVE' { Write-Host 'Token nao salvo. Gere um novo codigo ao retomar esta etapa.' }
        default { Write-Host 'A configuracao falhou. Avise no chat; nao envie credenciais.' }
    }
} finally {
    if ($zohoBody) { $zohoBody.Clear() }
    $zohoReply = $null
    $zohoClientId = $null
    $zohoClientSecret = $null
    $zohoGrantCode = $null
}
