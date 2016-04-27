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

/**
 * This squashes all no break markers and any nearby breaks.
 */
function resolveNoBreaks(lines) {
  var scopes = buildScopes(lines);
  var runs = buildRuns(lines);

  var kill = new Set();
  var killScopes = new Set();

  for (var run of runs) {
    var _run = _slicedToArray(run, 2);

    var start = _run[0];
    var end = _run[1];

    var hasNoBreak = false;

    // Check for the noBreak.
    for (var i = start; i < end; i++) {
      if (lines[i] === markers.noBreak) {
        hasNoBreak = true;
        break;
      }
    }

    if (!hasNoBreak) {
      continue;
    }

    // Then test what we need to kill.
    for (var i = start; i < end; i++) {
      if (isScopeBreakMarker(lines[i])) {
        invariant(scopes[i] != null, 'Scope markers must have a scope.');
        killScopes.add(scopes[i]);
      } else if (lines[i] === markers.noBreak || lines[i] === markers.hardBreak || lines[i] === markers.multiHardBreak) {
        kill.add(i);
      }
    }
  }

  // Kill the appropriate scope markers.
  for (var i = 0; i < lines.length; i++) {
    if (isScopeMarker(lines[i]) && killScopes.has(scopes[i])) {
      kill.add(i);
    }
  }

  // Now do the killing.
  return lines.map(function (line, i) {
    if (kill.has(i)) {
      if (line === markers.hardBreak) {
        return markers.empty;
      } else if (line === markers.multiHardBreak) {
        return markers.empty;
      } else if (line === markers.noBreak) {
        return markers.empty;
      } else if (line === markers.openScope) {
        return markers.empty;
      } else if (line === markers.scopeIndent) {
        return markers.empty;
      } else if (line === markers.scopeBreak) {
        return markers.empty;
      } else if (line === markers.scopeSpaceBreak) {
        return markers.space;
      } else if (line === markers.scopeComma) {
        return markers.empty;
      } else if (line === markers.scopeDedent) {
        return markers.empty;
      } else if (line === markers.closeScope) {
        return markers.empty;
      }
    }
    return line;
  });
}

module.exports = resolveNoBreaks;