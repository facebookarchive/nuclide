function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _isMarker2;

function _isMarker() {
  return _isMarker2 = _interopRequireDefault(require('./isMarker'));
}

/**
 * This returns a list of all the contiguous runs of markers within this set
 * of lines. Runs are [inclusive, exclusive).
 */
function buildRuns(lines) {
  var runs = [];
  var start = null;
  for (var i = 0; i < lines.length; i++) {
    if (!(0, (_isMarker2 || _isMarker()).default)(lines[i])) {
      if (start != null) {
        runs.push([start, i]);
        start = null;
      }
    } else {
      if (start == null) {
        start = i;
      }
    }
  }
  if (start != null) {
    runs.push([start, lines.length]);
  }
  return runs;
}

module.exports = buildRuns;