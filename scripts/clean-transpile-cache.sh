#!/bin/bash

# Copyright (c) 2015-present, Facebook, Inc.
# All rights reserved.
#
# This source code is licensed under the license found in the LICENSE file in
# the root directory of this source tree.

set -e

tmpdir="$(node -p 'require("os").tmpdir()')"

rm -rf "$tmpdir/nuclide-node-transpiler"
rm -rf "$tmpdir/v8-compile-cache"
