@echo off
title 🚀 Desplegar Finanzas Personales
color 0B
echo.
echo ==========================================
echo   🚀 DESPLEGAR EN NETLIFY - REACT  🚀
echo ==========================================
echo.

cd /d "%~dp0"

REM Verificar Node.js
echo 🔍 Verificando Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Error: Node.js no está instalado
    echo.
    echo 📥 Por favor instala Node.js desde: https://nodejs.org/
    echo.
    pause
    exit /b 1
)

echo ✅ Node.js encontrado
echo.

REM Limpiar instalaciones anteriores
echo 🧹 Limpiando archivos anteriores...
if exist dist rmdir /s /q dist
if exist .netlify rmdir /s /q .netlify

REM Instalar dependencias
echo 📦 Instalando dependencias...
npm install
if errorlevel 1 (
    echo ❌ Error al instalar dependencias
    pause
    exit /b 1
)

echo ✅ Dependencias instaladas
echo.

REM Construir la aplicación
echo 🔨 Construyendo aplicación para producción...
npm run build
if errorlevel 1 (
    echo ❌ Error al construir la aplicación
    pause
    exit /b 1
)

echo ✅ Aplicación construida exitosamente
echo.

REM Verificar que se creó la carpeta dist
if not exist dist (
    echo ❌ Error: No se creó la carpeta dist
    pause
    exit /b 1
)

echo 📁 Archivos generados en la carpeta 'dist':
dir /b dist
echo.

echo ==========================================
echo   🎉 ¡LISTO PARA DESPLEGAR!  🎉
echo ==========================================
echo.
echo 📋 OPCIONES DE DESPLIEGUE:
echo.
echo 1️⃣  ARRASTRAR Y SOLTAR (Más fácil):
echo    • Ve a https://netlify.com
echo    • Arrastra la carpeta 'dist' a la zona de deploy
echo    • ¡Listo! Tu app estará online
echo.
echo 2️⃣  GITHUB + NETLIFY (Recomendado):
echo    • Sube este proyecto a GitHub
echo    • Conecta GitHub con Netlify
echo    • Deploy automático en cada cambio
echo.
echo 3️⃣  NETLIFY CLI (Avanzado):
echo    • npm install -g netlify-cli
echo    • netlify login
echo    • netlify deploy --prod
echo.
echo 📖 Para más detalles, lee: GUIA-DEPLOY-NETLIFY.md
echo.
echo 🌐 Tu aplicación estará disponible en:
echo    https://tu-app-aleatoria.netlify.app
echo.
echo ==========================================
echo.
echo ¿Quieres abrir la carpeta dist ahora? (S/N)
set /p choice=
if /i "%choice%"=="S" (
    explorer dist
)
echo.
echo ¡Gracias por usar Finanzas Personales! 💰
echo.
pause
