

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var markers = require('../constants/markers');

var SCOPE_BREAK_MARKERS = new Set([markers.scopeBreak, markers.scopeSpaceBreak]);

function isScopeBreakMarker(marker) {
  return SCOPE_BREAK_MARKERS.has(marker);
}

module.exports = isScopeBreakMarker;