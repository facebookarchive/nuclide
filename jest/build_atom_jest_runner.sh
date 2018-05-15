#!/bin/bash

# Copyright (c) 2015-present, Facebook, Inc.
# All rights reserved.
#
# This source code is licensed under the license found in the LICENSE file in
# the root directory of this source tree.

THIS_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
FBSOURCE_ROOT=$(realpath "$THIS_DIR""/../../..")


"$FBSOURCE_ROOT"/xplat/nuclide/modules/jest-atom-runner/node_modules/.bin/babel \
  "$FBSOURCE_ROOT"/xplat/nuclide/modules/jest-atom-runner/src \
  --out-dir "$FBSOURCE_ROOT"/xplat/nuclide/modules/jest-atom-runner/build
