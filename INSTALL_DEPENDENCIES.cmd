@echo off
title Collect My Parcel - Install Dependencies
cd /d "%~dp0"
echo.
echo Installing project dependencies...
echo.
npm.cmd install
echo.
echo Done. Press any key to close this window.
pause >nul
