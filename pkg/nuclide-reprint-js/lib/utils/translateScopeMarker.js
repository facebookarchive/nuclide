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

/**
 * This translates a scope marker into the appropriate marker based on if the
 * scope was broken or not.
 */
function translateScopeMarker(marker, broken) {
  if (broken) {
    if (marker === _constantsMarkers2.default.openScope) {
      return _constantsMarkers2.default.empty;
    } else if (marker === _constantsMarkers2.default.scopeIndent) {
      return _constantsMarkers2.default.indent;
    } else if (marker === _constantsMarkers2.default.scopeBreak) {
      return _constantsMarkers2.default.hardBreak;
    } else if (marker === _constantsMarkers2.default.scopeSpaceBreak) {
      return _constantsMarkers2.default.hardBreak;
    } else if (marker === _constantsMarkers2.default.scopeComma) {
      return _constantsMarkers2.default.comma;
    } else if (marker === _constantsMarkers2.default.scopeDedent) {
      return _constantsMarkers2.default.dedent;
    } else if (marker === _constantsMarkers2.default.closeScope) {
      return _constantsMarkers2.default.empty;
    }
  } else {
    if (marker === _constantsMarkers2.default.openScope) {
      return _constantsMarkers2.default.empty;
    } else if (marker === _constantsMarkers2.default.scopeIndent) {
      return _constantsMarkers2.default.empty;
    } else if (marker === _constantsMarkers2.default.scopeBreak) {
      return _constantsMarkers2.default.empty;
    } else if (marker === _constantsMarkers2.default.scopeSpaceBreak) {
      return _constantsMarkers2.default.space;
    } else if (marker === _constantsMarkers2.default.scopeComma) {
      return _constantsMarkers2.default.empty;
    } else if (marker === _constantsMarkers2.default.scopeDedent) {
      return _constantsMarkers2.default.empty;
    } else if (marker === _constantsMarkers2.default.closeScope) {
      return _constantsMarkers2.default.empty;
    }
  }

  // Fallback to itself.
  return marker;
}

module.exports = translateScopeMarker;