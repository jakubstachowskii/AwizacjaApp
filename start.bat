@echo off
cd /d "%~dp0"
title Grain Logistics
echo.
echo === Grain Logistics — start ===
echo.
call npm start
echo.
echo Aplikacja zamknieta. Kod: %ERRORLEVEL%
pause
