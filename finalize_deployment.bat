





@echo off
echo ==========================================
echo      HOMELAND EVENT - DEPLOYMENT
echo ==========================================

REM Set paths to Node.js and Git manually
set "PATH=%PATH%;C:\Program Files\nodejs;C:\Program Files\Git\bin;C:\Program Files\Git\cmd"

echo [1/4] Checking environment...
where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo [WARNING] NPM not found in standard paths. Trying absolute path...
    set "NPM_CMD=""C:\Program Files\nodejs\npm.cmd"""
) else (
    set "NPM_CMD=npm"
)

where git >nul 2>nul
if %errorlevel% neq 0 (
     echo [WARNING] Git not found in standard paths. Trying absolute path...
     set "GIT_CMD=""C:\Program Files\Git\bin\git.exe"""
) else (
    set "GIT_CMD=git"
)

echo [2/4] Building Project for Production...
call %NPM_CMD% run build
if %errorlevel% neq 0 (
    echo Build failed! Please check errors above.
    pause
    exit /b %errorlevel%
)

echo [3/4] Staging and Committing changes...

rem Check if git user is configured
%GIT_CMD% config user.email >nul 2>nul
if %errorlevel% neq 0 (
    echo [INFO] Git user identity not set. Setting default identity...
    %GIT_CMD% config user.email "deploy@homeland-event.local"
    %GIT_CMD% config user.name "Homeland Deploy Bot"
)

%GIT_CMD% add .
%GIT_CMD% commit -m "Final Release: Complete project setup"

echo [4/4] Pushing to remote repository...
rem Check if remote origin exists
%GIT_CMD% remote get-url origin >nul 2>nul
if %errorlevel% neq 0 (
    echo [WARNING] No remote repository configured.
    set /p REMOTE_URL="Enter Git Remote URL (leave empty to skip push): "
    if defined REMOTE_URL (
        %GIT_CMD% remote add origin %REMOTE_URL%
        %GIT_CMD% push -u origin main
    ) else (
        echo Skipping push. Changes are committed locally.
    )
) else (
    echo [INFO] Pushing to origin/main...
    %GIT_CMD% push --set-upstream origin main
)

echo ==========================================
echo      DEPLOYMENT SUCCESSFUL
echo ==========================================
pause
