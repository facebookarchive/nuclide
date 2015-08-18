#!/bin/bash


pushd "$( dirname "${BASH_SOURCE[0]}" )"

HHVM=~/fbcode/_bin/hphp/hhvm/hhvm
echo $HHVM -c xdebug.ini test-client.php
$HHVM -c xdebug.ini test-client.php

popd > /dev/null
