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

/*
 * This transpiles url-main.js for development use.
 * In production mode, we use the transpiled version of url-main.js directly.
 */

require('../pkg/nuclide-node-transpiler');

module.exports = require('./url-main');
