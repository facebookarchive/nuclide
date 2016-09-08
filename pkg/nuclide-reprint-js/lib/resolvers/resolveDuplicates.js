var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _utilsBuildRuns2;

function _utilsBuildRuns() {
  return _utilsBuildRuns2 = _interopRequireDefault(require('../utils/buildRuns'));
}

var _constantsMarkers2;

function _constantsMarkers() {
  return _constantsMarkers2 = _interopRequireDefault(require('../constants/markers'));
}

/**
 * This squashes all duplicates that should not be kept.
 */
function resolveDuplicates(lines) {
  var runs = (0, (_utilsBuildRuns2 || _utilsBuildRuns()).default)(lines);
  var kill = new Set();

  for (var run of runs) {
    var _run = _slicedToArray(run, 2);

    var start = _run[0];
    var end = _run[1];

    var hardBreak = 0;
    var multiHardBreak = 0;

    // Count how many of each break we have.
    for (var i = start; i < end; i++) {
      if (lines[i] === (_constantsMarkers2 || _constantsMarkers()).default.hardBreak) {
        hardBreak++;
      } else if (lines[i] === (_constantsMarkers2 || _constantsMarkers()).default.multiHardBreak) {
        multiHardBreak++;
      }
    }

    var hardBreaksRemaining = hardBreak;

    // Then kill the appropriate duplicates in the run.
    for (var i = start; i < end; i++) {
      if (lines[i] === (_constantsMarkers2 || _constantsMarkers()).default.hardBreak) {
        if (hardBreaksRemaining > 1 || multiHardBreak > 0) {
          hardBreaksRemaining--;
          kill.add(i);
        }
      } else if (lines[i] === (_constantsMarkers2 || _constantsMarkers()).default.multiHardBreak) {
        // Never remove a multiHardBreak.
      }
    }
  }

  // We always kill to empty here.
  return lines.map(function (line, i) {
    return kill.has(i) ? (_constantsMarkers2 || _constantsMarkers()).default.empty : line;
  });
}

module.exports = resolveDuplicates;