@echo off
REM Double-cliquez sur ce fichier pour lancer le site sur http://127.0.0.1:8000
cd /d "%~dp0"
where php >nul 2>nul || (echo [ERREUR] PHP introuvable. Installez PHP 8.1+ : https://windows.php.net/download & pause & exit /b 1)
if not exist vendor\autoload.php (
  where composer >nul 2>nul || (echo [ERREUR] Composer introuvable : https://getcomposer.org/Composer-Setup.exe & pause & exit /b 1)
  call composer install -n || (pause & exit /b 1)
)
set SYMFONY_ENV=prod
php -d display_errors=0 -d log_errors=0 bin/console cache:clear --env=prod --no-debug || (pause & exit /b 1)
start "" http://127.0.0.1:8000
echo Site lance sur http://127.0.0.1:8000  (fermez cette fenetre pour l'arreter)
php -d display_errors=0 -d log_errors=0 -S 127.0.0.1:8000 -t web app/router_prod.php
pause
