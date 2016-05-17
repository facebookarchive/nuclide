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

/**
 * This translates a scope marker into the appropriate marker based on if the
 * scope was broken or not.
 */
function translateScopeMarker(marker, broken) {
  if (broken) {
    if (marker === (_constantsMarkers2 || _constantsMarkers()).default.openScope) {
      return (_constantsMarkers2 || _constantsMarkers()).default.empty;
    } else if (marker === (_constantsMarkers2 || _constantsMarkers()).default.scopeIndent) {
      return (_constantsMarkers2 || _constantsMarkers()).default.indent;
    } else if (marker === (_constantsMarkers2 || _constantsMarkers()).default.scopeBreak) {
      return (_constantsMarkers2 || _constantsMarkers()).default.hardBreak;
    } else if (marker === (_constantsMarkers2 || _constantsMarkers()).default.scopeSpaceBreak) {
      return (_constantsMarkers2 || _constantsMarkers()).default.hardBreak;
    } else if (marker === (_constantsMarkers2 || _constantsMarkers()).default.scopeComma) {
      return (_constantsMarkers2 || _constantsMarkers()).default.comma;
    } else if (marker === (_constantsMarkers2 || _constantsMarkers()).default.scopeDedent) {
      return (_constantsMarkers2 || _constantsMarkers()).default.dedent;
    } else if (marker === (_constantsMarkers2 || _constantsMarkers()).default.closeScope) {
      return (_constantsMarkers2 || _constantsMarkers()).default.empty;
    }
  } else {
    if (marker === (_constantsMarkers2 || _constantsMarkers()).default.openScope) {
      return (_constantsMarkers2 || _constantsMarkers()).default.empty;
    } else if (marker === (_constantsMarkers2 || _constantsMarkers()).default.scopeIndent) {
      return (_constantsMarkers2 || _constantsMarkers()).default.empty;
    } else if (marker === (_constantsMarkers2 || _constantsMarkers()).default.scopeBreak) {
      return (_constantsMarkers2 || _constantsMarkers()).default.empty;
    } else if (marker === (_constantsMarkers2 || _constantsMarkers()).default.scopeSpaceBreak) {
      return (_constantsMarkers2 || _constantsMarkers()).default.space;
    } else if (marker === (_constantsMarkers2 || _constantsMarkers()).default.scopeComma) {
      return (_constantsMarkers2 || _constantsMarkers()).default.empty;
    } else if (marker === (_constantsMarkers2 || _constantsMarkers()).default.scopeDedent) {
      return (_constantsMarkers2 || _constantsMarkers()).default.empty;
    } else if (marker === (_constantsMarkers2 || _constantsMarkers()).default.closeScope) {
      return (_constantsMarkers2 || _constantsMarkers()).default.empty;
    }
  }

  // Fallback to itself.
  return marker;
}

module.exports = translateScopeMarker;