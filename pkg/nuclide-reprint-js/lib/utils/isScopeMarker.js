function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _constantsMarkers2;

function _constantsMarkers() {
  return _constantsMarkers2 = _interopRequireDefault(require('../constants/markers'));
}

var SCOPE_MARKER = new Set([(_constantsMarkers2 || _constantsMarkers()).default.openScope, (_constantsMarkers2 || _constantsMarkers()).default.scopeIndent, (_constantsMarkers2 || _constantsMarkers()).default.scopeBreak, (_constantsMarkers2 || _constantsMarkers()).default.scopeSpaceBreak, (_constantsMarkers2 || _constantsMarkers()).default.scopeComma, (_constantsMarkers2 || _constantsMarkers()).default.scopeDedent, (_constantsMarkers2 || _constantsMarkers()).default.closeScope]);

function isScopeMarker(marker) {
  return SCOPE_MARKER.has(marker);
}

module.exports = isScopeMarker;