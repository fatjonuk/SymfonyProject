<?php

/*
 * Router for PHP's built-in web server in the prod environment
 * (web/app.php), e.g. to open the site from a phone through a tunnel:
 *
 *     php bin/console cache:clear --env=prod --no-debug
 *     php -S 127.0.0.1:8000 -t web app/router_prod.php
 *
 * Existing files under web/ (CSS, JavaScript, images, fonts) are served as
 * they are; every other request goes to the Symfony front controller.
 * `php bin/console server:run` remains the command for the dev environment.
 */

if (PHP_SAPI !== 'cli-server') {
    http_response_code(404);
    exit;
}

ini_set('display_errors', '0');
error_reporting(E_ALL & ~E_DEPRECATED & ~E_USER_DEPRECATED & ~E_WARNING);

$web = realpath(__DIR__.'/../web');
$path = rawurldecode(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH));

// web/bundles/* are symlinks (assets:install --symlink), so only ".." is refused
if ($path !== '/' && false === strpos($path, '..') && is_file($web.$path)) {
    return false;
}

$_SERVER['SCRIPT_FILENAME'] = $web.DIRECTORY_SEPARATOR.'app.php';
$_SERVER['SCRIPT_NAME'] = '/app.php';
$_SERVER['PHP_SELF'] = '/app.php';

require $web.DIRECTORY_SEPARATOR.'app.php';
