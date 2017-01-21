#!/bin/bash

# Copyright (c) 2015-present, Facebook, Inc.
# All rights reserved.
#
# This source code is licensed under the license found in the LICENSE file in
# the root directory of this source tree.

# This script opens a spec file in the spec window without loading all of Nuclide.
# Example:
#   ./scripts/run-package-specs.sh spec/quick-open-provider-cycle-integration-spec.js
#   ./scripts/run-package-specs.sh pkg/nuclide-quick-open/spec/SearchResultManager-spec.js

THIS_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

ATOM_SCRIPT_PATH="$THIS_DIR/../pkg/nuclide-atom-script/bin/atom-script"
RUN_PACKAGE_SPECS_JS="$THIS_DIR/../pkg/nuclide-atom-script/samples/run-package-specs.js"

"$ATOM_SCRIPT_PATH" "$RUN_PACKAGE_SPECS_JS" "$@"
