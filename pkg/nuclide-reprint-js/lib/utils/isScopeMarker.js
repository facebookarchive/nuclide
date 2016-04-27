

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var markers = require('../constants/markers');

var SCOPE_MARKER = new Set([markers.openScope, markers.scopeIndent, markers.scopeBreak, markers.scopeSpaceBreak, markers.scopeComma, markers.scopeDedent, markers.closeScope]);

function isScopeMarker(marker) {
  return SCOPE_MARKER.has(marker);
}

module.exports = isScopeMarker;