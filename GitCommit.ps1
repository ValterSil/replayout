Add-Type -AssemblyName Microsoft.VisualBasic

# Solicita a mensagem do commit
$mensagem = [Microsoft.VisualBasic.Interaction]::InputBox(
    "Digite a descrição das alterações:",
    "Commit para GitHub",
    ""
)

if ([string]::IsNullOrWhiteSpace($mensagem)) {
    Write-Host "Operação cancelada."
    exit
}

# Vai para a pasta onde estÃ¡ o script
Set-Location $PSScriptRoot

# Verifica se Ã© um repositÃ³rio Git
if (!(Test-Path ".git")) {
    Write-Host "Esta pasta nÃ£o Ã© um repositÃ³rio Git."
    Pause
    exit
}

Write-Host ""
Write-Host "Enviando alteraÃ§Ãµes para o GitHub..."
Write-Host ""

$status = git status --porcelain

if ([string]::IsNullOrWhiteSpace($status)) {
    Write-Host ""
    Write-Host "Nenhuma alteração encontrada."
    Read-Host "Pressione Enter para sair"
    exit
}

git add .

if ($LASTEXITCODE -ne 0) {
    Pause
    exit
}

git commit -m "$mensagem"

if ($LASTEXITCODE -ne 0) {
    Pause
    exit
}

git push

Write-Host ""
Write-Host "======================================="
Write-Host "Arquivos enviados com sucesso!"
Write-Host "======================================="
Pause