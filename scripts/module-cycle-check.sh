#!/bin/bash

# Copyright (c) 2015-present, Facebook, Inc.
# All rights reserved.
#
# This source code is licensed under the license found in the LICENSE file in
# the root directory of this source tree.

set -e

cd "$(dirname "$0")/.."

BASE_DIR="$(pwd -P)"
SABOR=${SABOR:-"${BASE_DIR}/node_modules/.bin/sabor"}

echo "Checking for cycles in modules ..."
find "$BASE_DIR/lib" "$BASE_DIR/pkg" "$BASE_DIR/modules" \
    -name sample -prune \
    -o -name spec -prune \
    -o -name VendorLib -prune \
    -o -name scripts -prune \
    -o -name nuclide-external-interfaces -prune \
    -o -name '*.js' -print | xargs "${SABOR}" $*
