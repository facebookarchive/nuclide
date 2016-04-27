var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var buildRuns = require('../utils/buildRuns');
var buildScopes = require('../utils/buildScopes');
var invariant = require('assert');
var isScopeBreakMarker = require('../utils/isScopeBreakMarker');
var isScopeMarker = require('../utils/isScopeMarker');
var markers = require('../constants/markers');
var translateScopeMarker = require('../utils/translateScopeMarker');

/**
 * Sometimes a scope break may be adjacent to a hard break. If that's the case
 * go ahead and break the scope.
 *
 * This assumes noBreaks have already been removed and will not be encountered.
 */
function resolveForcedScopeBreaks(lines) {
  var scopes = buildScopes(lines);
  var runs = buildRuns(lines);
  var toBreak = new Set();

  for (var run of runs) {
    var _run = _slicedToArray(run, 2);

    var start = _run[0];
    var end = _run[1];

    var broken = false;
    for (var i = start; i < end; i++) {
      if (lines[i] === markers.hardBreak || lines[i] === markers.multiHardBreak) {
        broken = true;
        break;
      }
    }

    if (!broken) {
      continue;
    }

    for (var i = start; i < end; i++) {
      if (isScopeBreakMarker(lines[i])) {
        invariant(scopes[i] != null, 'Scope markers must have a scope.');
        toBreak.add(scopes[i]);
      }
    }
  }

  return lines.map(function (line, i) {
    if (isScopeMarker(line) && scopes[i] != null && toBreak.has(scopes[i])) {
      return translateScopeMarker(line, true);
    }
    return line;
  });
}

module.exports = resolveForcedScopeBreaks;