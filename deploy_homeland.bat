@echo off
echo Installing dependencies...
call npm install
echo.
echo Building project...
call npm run build
echo.
echo Deploying to Firebase...
call firebase deploy
echo.
pause
