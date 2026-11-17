<?php

/*
 * PHP 8.1+ compatibility for this Symfony 3.4 application.
 *
 * A few Symfony 3.4 classes trigger deprecation notices while they are being
 * declared (missing return types on ArrayAccess, Serializable…). When the
 * debug error handler is active, logging such a notice needs the VarDumper
 * classes that are still being declared, which ends in a fatal error.
 * Loading them once, before the debug handler is registered, avoids it.
 * Nothing changes for PHP 7.x.
 */
if (PHP_VERSION_ID >= 80100) {
    $previousLevel = error_reporting(0);
    foreach ([
        'Cloner\Stub',
        'Cloner\Data',
        'Caster\ClassStub',
        'Caster\ConstStub',
        'Caster\EnumStub',
        'Caster\FrameStub',
        'Caster\LinkStub',
        'Caster\TraceStub',
    ] as $class) {
        class_exists('Symfony\Component\VarDumper\\'.$class);
    }
    error_reporting($previousLevel);
    unset($previousLevel, $class);
}
