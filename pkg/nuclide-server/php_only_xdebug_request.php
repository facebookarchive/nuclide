<?php
// Copyright 2004-present Facebook. All Rights Reserved.

/**
 * Fallback php script provides php REPL experience from debugger console window.
 * This script is used by php debugger to initiate a php-only dummy connection
 * to itself so that it can perform global php evaluation from console window.
 */
xdebug_break();
