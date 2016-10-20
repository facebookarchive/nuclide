'use strict';
/* @noflow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

/* NON-TRANSPILED FILE */
/* eslint comma-dangle: [1, always-multiline], prefer-object-spread/prefer-object-spread: 0 */

module.exports = {
  rules: {
    'atom-commands': require('./atom-commands'),
    'consistent-import-name': require('./consistent-import-name'),
    'import-type-style': require('./import-type-style'),
    'license-header': require('./license-header'),
    'no-cross-atom-imports': require('./no-cross-atom-imports'),
    'no-re-export-type': require('./no-re-export-type'),
    'no-unnecessary-disposable-wrapping': require('./no-unnecessary-disposable-wrapping'),
    'prefer-nuclide-uri': require('./prefer-nuclide-uri'),
    'prefer-types-only-header': require('./prefer-types-only-header'),
  },
  rulesConfig: {
    'atom-commands': 0,
    'consistent-import-name': 0,
    'import-type-style': 0,
    'license-header': 0,
    'no-cross-atom-imports': 0,
    'no-re-export-type': 0,
    'no-unnecessary-disposable-wrapping': 0,
    'prefer-nuclide-uri': 0,
    'prefer-types-only-header': 0,
  },
};
