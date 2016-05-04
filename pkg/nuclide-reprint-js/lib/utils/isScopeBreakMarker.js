function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _constantsMarkers = require('../constants/markers');

var _constantsMarkers2 = _interopRequireDefault(_constantsMarkers);

var SCOPE_BREAK_MARKERS = new Set([_constantsMarkers2.default.scopeBreak, _constantsMarkers2.default.scopeSpaceBreak]);

function isScopeBreakMarker(marker) {
  return SCOPE_BREAK_MARKERS.has(marker);
}

module.exports = isScopeBreakMarker;