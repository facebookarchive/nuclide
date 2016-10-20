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

// Relative to nuclide-debugger/scripts, where html page is loaded.
require('./nuclide_bridge/NuclideBridge');

window.WebInspector.NuclideAppProvider = require('./nuclide_bridge/NuclideAppProvider');
