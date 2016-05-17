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

var _utilsBuildScopes2;

function _utilsBuildScopes() {
  return _utilsBuildScopes2 = _interopRequireDefault(require('../utils/buildScopes'));
}

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

var _utilsIsScopeBreakMarker2;

function _utilsIsScopeBreakMarker() {
  return _utilsIsScopeBreakMarker2 = _interopRequireDefault(require('../utils/isScopeBreakMarker'));
}

var _utilsIsScopeMarker2;

function _utilsIsScopeMarker() {
  return _utilsIsScopeMarker2 = _interopRequireDefault(require('../utils/isScopeMarker'));
}

var _constantsMarkers2;

function _constantsMarkers() {
  return _constantsMarkers2 = _interopRequireDefault(require('../constants/markers'));
}

/**
 * This squashes all no break markers and any nearby breaks.
 */
function resolveNoBreaks(lines) {
  var scopes = (0, (_utilsBuildScopes2 || _utilsBuildScopes()).default)(lines);
  var runs = (0, (_utilsBuildRuns2 || _utilsBuildRuns()).default)(lines);

  var kill = new Set();
  var killScopes = new Set();

  for (var run of runs) {
    var _run = _slicedToArray(run, 2);

    var start = _run[0];
    var end = _run[1];

    var hasNoBreak = false;

    // Check for the noBreak.
    for (var i = start; i < end; i++) {
      if (lines[i] === (_constantsMarkers2 || _constantsMarkers()).default.noBreak) {
        hasNoBreak = true;
        break;
      }
    }

    if (!hasNoBreak) {
      continue;
    }

    // Then test what we need to kill.
    for (var i = start; i < end; i++) {
      if ((0, (_utilsIsScopeBreakMarker2 || _utilsIsScopeBreakMarker()).default)(lines[i])) {
        (0, (_assert2 || _assert()).default)(scopes[i] != null, 'Scope markers must have a scope.');
        killScopes.add(scopes[i]);
      } else if (lines[i] === (_constantsMarkers2 || _constantsMarkers()).default.noBreak || lines[i] === (_constantsMarkers2 || _constantsMarkers()).default.hardBreak || lines[i] === (_constantsMarkers2 || _constantsMarkers()).default.multiHardBreak) {
        kill.add(i);
      }
    }
  }

  // Kill the appropriate scope markers.
  for (var i = 0; i < lines.length; i++) {
    if ((0, (_utilsIsScopeMarker2 || _utilsIsScopeMarker()).default)(lines[i]) && killScopes.has(scopes[i])) {
      kill.add(i);
    }
  }

  // Now do the killing.
  return lines.map(function (line, i) {
    if (kill.has(i)) {
      if (line === (_constantsMarkers2 || _constantsMarkers()).default.hardBreak) {
        return (_constantsMarkers2 || _constantsMarkers()).default.empty;
      } else if (line === (_constantsMarkers2 || _constantsMarkers()).default.multiHardBreak) {
        return (_constantsMarkers2 || _constantsMarkers()).default.empty;
      } else if (line === (_constantsMarkers2 || _constantsMarkers()).default.noBreak) {
        return (_constantsMarkers2 || _constantsMarkers()).default.empty;
      } else if (line === (_constantsMarkers2 || _constantsMarkers()).default.openScope) {
        return (_constantsMarkers2 || _constantsMarkers()).default.empty;
      } else if (line === (_constantsMarkers2 || _constantsMarkers()).default.scopeIndent) {
        return (_constantsMarkers2 || _constantsMarkers()).default.empty;
      } else if (line === (_constantsMarkers2 || _constantsMarkers()).default.scopeBreak) {
        return (_constantsMarkers2 || _constantsMarkers()).default.empty;
      } else if (line === (_constantsMarkers2 || _constantsMarkers()).default.scopeSpaceBreak) {
        return (_constantsMarkers2 || _constantsMarkers()).default.space;
      } else if (line === (_constantsMarkers2 || _constantsMarkers()).default.scopeComma) {
        return (_constantsMarkers2 || _constantsMarkers()).default.empty;
      } else if (line === (_constantsMarkers2 || _constantsMarkers()).default.scopeDedent) {
        return (_constantsMarkers2 || _constantsMarkers()).default.empty;
      } else if (line === (_constantsMarkers2 || _constantsMarkers()).default.closeScope) {
        return (_constantsMarkers2 || _constantsMarkers()).default.empty;
      }
    }
    return line;
  });
}

module.exports = resolveNoBreaks;