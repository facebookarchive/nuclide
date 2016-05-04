var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _utilsBuildRuns = require('../utils/buildRuns');

var _utilsBuildRuns2 = _interopRequireDefault(_utilsBuildRuns);

var _utilsBuildScopes = require('../utils/buildScopes');

var _utilsBuildScopes2 = _interopRequireDefault(_utilsBuildScopes);

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _utilsIsScopeBreakMarker = require('../utils/isScopeBreakMarker');

var _utilsIsScopeBreakMarker2 = _interopRequireDefault(_utilsIsScopeBreakMarker);

var _utilsIsScopeMarker = require('../utils/isScopeMarker');

var _utilsIsScopeMarker2 = _interopRequireDefault(_utilsIsScopeMarker);

var _constantsMarkers = require('../constants/markers');

var _constantsMarkers2 = _interopRequireDefault(_constantsMarkers);

/**
 * This squashes all no break markers and any nearby breaks.
 */
function resolveNoBreaks(lines) {
  var scopes = (0, _utilsBuildScopes2.default)(lines);
  var runs = (0, _utilsBuildRuns2.default)(lines);

  var kill = new Set();
  var killScopes = new Set();

  for (var run of runs) {
    var _run = _slicedToArray(run, 2);

    var start = _run[0];
    var end = _run[1];

    var hasNoBreak = false;

    // Check for the noBreak.
    for (var i = start; i < end; i++) {
      if (lines[i] === _constantsMarkers2.default.noBreak) {
        hasNoBreak = true;
        break;
      }
    }

    if (!hasNoBreak) {
      continue;
    }

    // Then test what we need to kill.
    for (var i = start; i < end; i++) {
      if ((0, _utilsIsScopeBreakMarker2.default)(lines[i])) {
        (0, _assert2.default)(scopes[i] != null, 'Scope markers must have a scope.');
        killScopes.add(scopes[i]);
      } else if (lines[i] === _constantsMarkers2.default.noBreak || lines[i] === _constantsMarkers2.default.hardBreak || lines[i] === _constantsMarkers2.default.multiHardBreak) {
        kill.add(i);
      }
    }
  }

  // Kill the appropriate scope markers.
  for (var i = 0; i < lines.length; i++) {
    if ((0, _utilsIsScopeMarker2.default)(lines[i]) && killScopes.has(scopes[i])) {
      kill.add(i);
    }
  }

  // Now do the killing.
  return lines.map(function (line, i) {
    if (kill.has(i)) {
      if (line === _constantsMarkers2.default.hardBreak) {
        return _constantsMarkers2.default.empty;
      } else if (line === _constantsMarkers2.default.multiHardBreak) {
        return _constantsMarkers2.default.empty;
      } else if (line === _constantsMarkers2.default.noBreak) {
        return _constantsMarkers2.default.empty;
      } else if (line === _constantsMarkers2.default.openScope) {
        return _constantsMarkers2.default.empty;
      } else if (line === _constantsMarkers2.default.scopeIndent) {
        return _constantsMarkers2.default.empty;
      } else if (line === _constantsMarkers2.default.scopeBreak) {
        return _constantsMarkers2.default.empty;
      } else if (line === _constantsMarkers2.default.scopeSpaceBreak) {
        return _constantsMarkers2.default.space;
      } else if (line === _constantsMarkers2.default.scopeComma) {
        return _constantsMarkers2.default.empty;
      } else if (line === _constantsMarkers2.default.scopeDedent) {
        return _constantsMarkers2.default.empty;
      } else if (line === _constantsMarkers2.default.closeScope) {
        return _constantsMarkers2.default.empty;
      }
    }
    return line;
  });
}

module.exports = resolveNoBreaks;