@echo off
echo Budowanie aplikacji...
npm run build
if %errorlevel% neq 0 (
    echo Błąd podczas budowania aplikacji!
    pause
    exit /b 1
)

echo Uruchamianie aplikacji...
npm run electron
pause 