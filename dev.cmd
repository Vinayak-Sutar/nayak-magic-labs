@echo off
rem Runs this site's npm scripts on Node 24 without switching the machine's
rem default Node version. Astro 7 needs Node 22.23.4 or newer.
rem
rem   dev.cmd              start the dev server
rem   dev.cmd run build    build the site into dist\
rem   dev.cmd run check    type-check
rem   dev.cmd install      install dependencies
setlocal
set "NODE24=%NVM_HOME%\v24.22.3"
if not exist "%NODE24%\node.exe" set "NODE24=%LOCALAPPDATA%\nvm\v24.22.3"
if exist "%NODE24%\node.exe" set "PATH=%NODE24%;%PATH%"
cd /d "%~dp0"
if "%~1"=="" (
  npm run dev
) else (
  npm %*
)
