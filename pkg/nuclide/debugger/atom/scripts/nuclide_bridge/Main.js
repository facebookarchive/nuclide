/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

// Relative to nuclide-debugger/scripts, where html page is loaded.
require('./nuclide_bridge/NuclideBridge');

window.WebInspector.NuclideAppProvider = require('./nuclide_bridge/NuclideAppProvider');
