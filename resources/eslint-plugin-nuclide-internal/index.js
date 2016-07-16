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
/* eslint-disable babel/func-params-comma-dangle, prefer-object-spread/prefer-object-spread */

module.exports = {
  rules: {
    'command-menu-items': require('./command-menu-items'),
    'consistent-import-name': require('./consistent-import-name'),
    'import-type-style': require('./import-type-style'),
    'license-header': require('./license-header'),
    'no-cross-atom-imports': require('./no-cross-atom-imports'),
    'no-re-export-type': require('./no-re-export-type'),
    'prefer-nuclide-uri': require('./prefer-nuclide-uri'),
    'type-alias-semi': require('./type-alias-semi'),
  },
  rulesConfig: {
    'command-menu-items': 0,
    'consistent-import-name': 0,
    'import-type-style': 0,
    'license-header': 0,
    'no-cross-atom-imports': 0,
    'no-re-export-type': 0,
    'prefer-nuclide-uri': 0,
    'type-alias-semi': 0,
  },
};
