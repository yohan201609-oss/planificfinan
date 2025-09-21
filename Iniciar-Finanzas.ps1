# Script PowerShell para iniciar la aplicación de Finanzas Personales
# Autor: Asistente IA
# Fecha: $(Get-Date -Format "yyyy-MM-dd")

param(
    [switch]$AbrirNavegador,
    [string]$Puerto = "auto"
)

# Configuración
$AppName = "💰 Finanzas Personales - React"
$AppDescription = "Aplicación moderna para gestión de finanzas personales"

# Función para escribir mensajes con colores
function Write-ColorMessage {
    param(
        [string]$Message,
        [string]$Color = "White"
    )
    Write-Host $Message -ForegroundColor $Color
}

# Función para verificar si un puerto está en uso
function Test-Port {
    param([int]$Port)
    try {
        $connection = New-Object System.Net.Sockets.TcpClient
        $connection.Connect("localhost", $Port)
        $connection.Close()
        return $true
    }
    catch {
        return $false
    }
}

# Banner de inicio
Clear-Host
Write-Host "=" * 50 -ForegroundColor Cyan
Write-Host "  $AppName" -ForegroundColor Yellow
Write-Host "  $AppDescription" -ForegroundColor Gray
Write-Host "=" * 50 -ForegroundColor Cyan
Write-Host ""
Write-ColorMessage "🚀 Iniciando servidor de desarrollo..." "Green"
Write-Host ""

# Cambiar al directorio del script
$ScriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $ScriptPath

# Verificar Node.js
Write-ColorMessage "🔍 Verificando Node.js..." "Yellow"
try {
    $nodeVersion = node --version 2>$null
    Write-ColorMessage "✅ Node.js encontrado: $nodeVersion" "Green"
}
catch {
    Write-ColorMessage "❌ Error: Node.js no está instalado" "Red"
    Write-Host ""
    Write-ColorMessage "📥 Por favor instala Node.js desde: https://nodejs.org/" "Yellow"
    Write-Host ""
    Read-Host "Presiona Enter para salir"
    exit 1
}

# Verificar dependencias
Write-ColorMessage "📦 Verificando dependencias..." "Yellow"
if (-not (Test-Path "node_modules")) {
    Write-ColorMessage "📥 Instalando dependencias por primera vez..." "Yellow"
    Write-ColorMessage "    Esto puede tomar unos minutos..." "Gray"
    
    try {
        npm install
        Write-ColorMessage "✅ Dependencias instaladas correctamente" "Green"
    }
    catch {
        Write-ColorMessage "❌ Error al instalar dependencias" "Red"
        Read-Host "Presiona Enter para salir"
        exit 1
    }
}
else {
    Write-ColorMessage "✅ Dependencias ya instaladas" "Green"
}

Write-Host ""

# Buscar puerto disponible
$PortsToTry = @(3000, 3001, 3002, 3003, 3004, 3005)
$AvailablePort = $null

Write-ColorMessage "🔍 Buscando puerto disponible..." "Yellow"
foreach ($port in $PortsToTry) {
    if (-not (Test-Port $port)) {
        $AvailablePort = $port
        break
    }
}

if ($AvailablePort) {
    Write-ColorMessage "✅ Puerto disponible encontrado: $AvailablePort" "Green"
}

Write-Host ""
Write-ColorMessage "📍 La aplicación se abrirá en:" "Cyan"
Write-ColorMessage "    http://localhost:$AvailablePort" "White"
Write-Host ""
Write-ColorMessage "⚠️  Para detener el servidor presiona Ctrl+C" "Yellow"
Write-Host ""
Write-Host "=" * 50 -ForegroundColor Cyan

# Abrir navegador automáticamente después de un momento
# Por defecto, abrir el navegador si no se especifica lo contrario
if ($AbrirNavegador -or (-not $PSBoundParameters.ContainsKey('AbrirNavegador'))) {
    Start-Job -ScriptBlock {
        Start-Sleep 3
        Start-Process "http://localhost:3000"
    } | Out-Null
}

# Iniciar servidor
try {
    npm run dev
}
catch {
    Write-ColorMessage "❌ Error al iniciar el servidor" "Red"
    Read-Host "Presiona Enter para salir"
    exit 1
}

Write-Host ""
Write-ColorMessage "🛑 Servidor detenido" "Yellow"
Read-Host "Presiona Enter para salir"



