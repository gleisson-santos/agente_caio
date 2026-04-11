# Script para baixar o conteúdo da pasta "out" do VPS (PainelControll) para a sua máquina local

$remoteHost = "46.62.226.176"
$remoteUser = "root"
$remotePath = "/var/lib/docker/volumes/caio_workspace/_data/out"
$localPath = "./out_remoto"

Write-Host "Iniciando a sincronização de $remoteHost : $remotePath -> $localPath"
if (-not (Test-Path -Path $localPath)) {
    New-Item -ItemType Directory -Path $localPath | Out-Null
}

$tempPath = "./temp_sync_out"
if (-not (Test-Path -Path $tempPath)) {
    New-Item -ItemType Directory -Path $tempPath | Out-Null
}

Write-Host "Baixando arquivos via scp..."
# O scp baixa a pasta inteira para o temp_sync_out
scp -r "${remoteUser}@${remoteHost}:${remotePath}" $tempPath

# Move os arquivos para o destino final
if (Test-Path "$tempPath/out") {
    Copy-Item -Path "$tempPath/out\*" -Destination $localPath -Recurse -Force -ErrorAction SilentlyContinue
    Remove-Item -Path $tempPath -Recurse -Force
}

Write-Host "Sincronização concluída com sucesso! Os arquivos estão na pasta '$localPath'."
