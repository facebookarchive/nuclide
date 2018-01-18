/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @noflow
 */
'use strict';

/* eslint
  comma-dangle: [1, always-multiline],
  prefer-object-spread/prefer-object-spread: 0,
  rulesdir/no-commonjs: 0,
  */

// Have to make sure to use the transpiler or else we'll crash as soon as we try
// to `import` from within ocamlDebugger.js.
// We can also safely disable this lint because when this executes the cwd will
// be nuclide-debugger-vsps/vscode-ocaml, so the ../.. at the beginning is still
// inside the modules directory.
// eslint-disable-next-line rulesdir/modules-dependencies
const {__DEV__} = require('../../nuclide-node-transpiler/lib/env');
if (__DEV__) {
  require('nuclide-node-transpiler');
}
require('./OCamlDebugger');
