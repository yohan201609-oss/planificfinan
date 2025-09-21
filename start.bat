@echo off
title 💰 Finanzas Personales - React
color 0B
echo.
echo =====================================
echo   💰 FINANZAS PERSONALES - REACT  💰
echo =====================================
echo.
echo 🚀 Iniciando servidor de desarrollo...
echo.
echo 📍 La aplicación se abrirá automáticamente en:
echo    http://localhost:3000 (o puerto disponible)
echo.
echo ⚠️  Para detener el servidor presiona Ctrl+C
echo.
echo =====================================
echo.

cd /d "%~dp0"

REM Verificar si Node.js está instalado
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Error: Node.js no está instalado
    echo.
    echo 📥 Por favor instala Node.js desde: https://nodejs.org/
    echo.
    pause
    exit /b 1
)

REM Verificar si las dependencias están instaladas
if not exist node_modules (
    echo 📦 Instalando dependencias por primera vez...
    echo    Esto puede tomar unos minutos...
    echo.
    npm install
    if errorlevel 1 (
        echo ❌ Error al instalar dependencias
        pause
        exit /b 1
    )
    echo.
    echo ✅ Dependencias instaladas correctamente
    echo.
)

REM Iniciar el servidor de desarrollo
echo 🎯 Iniciando aplicación...
echo.
npm run dev

REM Si llegamos aquí, el servidor se detuvo
echo.
echo 🛑 Servidor detenido
echo.
pause
