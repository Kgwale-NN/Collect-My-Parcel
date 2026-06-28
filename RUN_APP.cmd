@echo off
title Collect My Parcel - Local Dev Server
cd /d "%~dp0"
echo.
echo Starting Collect My Parcel...
echo.
echo If dependencies are missing, run INSTALL_DEPENDENCIES.cmd first.
echo.
npm.cmd run dev
echo.
echo Server stopped. Press any key to close this window.
pause >nul
