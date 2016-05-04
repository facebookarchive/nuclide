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
 * This removes all but the first cursor. Since cursors are added at the end of
 * nodes this will keep the most valid cursor that appears deepest in the tree.
 */
function resolveDuplicateCursors(lines) {
  var seenCursor = false;
  return lines.map(function (line) {
    // $FlowFixMe(kad, t9954160)
    if (line === _constantsMarkers2.default.cursor) {
      if (seenCursor) {
        return _constantsMarkers2.default.empty;
      }
      seenCursor = true;
    }
    return line;
  });
}

module.exports = resolveDuplicateCursors;