

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var markers = require('../constants/markers');

/**
 * This translates a scope marker into the appropriate marker based on if the
 * scope was broken or not.
 */
function translateScopeMarker(marker, broken) {
  if (broken) {
    if (marker === markers.openScope) {
      return markers.empty;
    } else if (marker === markers.scopeIndent) {
      return markers.indent;
    } else if (marker === markers.scopeBreak) {
      return markers.hardBreak;
    } else if (marker === markers.scopeSpaceBreak) {
      return markers.hardBreak;
    } else if (marker === markers.scopeComma) {
      return markers.comma;
    } else if (marker === markers.scopeDedent) {
      return markers.dedent;
    } else if (marker === markers.closeScope) {
      return markers.empty;
    }
  } else {
    if (marker === markers.openScope) {
      return markers.empty;
    } else if (marker === markers.scopeIndent) {
      return markers.empty;
    } else if (marker === markers.scopeBreak) {
      return markers.empty;
    } else if (marker === markers.scopeSpaceBreak) {
      return markers.space;
    } else if (marker === markers.scopeComma) {
      return markers.empty;
    } else if (marker === markers.scopeDedent) {
      return markers.empty;
    } else if (marker === markers.closeScope) {
      return markers.empty;
    }
  }

  // Fallback to itself.
  return marker;
}

module.exports = translateScopeMarker;