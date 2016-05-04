function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _utilsBuildScopes = require('../utils/buildScopes');

var _utilsBuildScopes2 = _interopRequireDefault(_utilsBuildScopes);

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _utilsIsMarker = require('../utils/isMarker');

var _utilsIsMarker2 = _interopRequireDefault(_utilsIsMarker);

var _utilsIsScopeMarker = require('../utils/isScopeMarker');

var _utilsIsScopeMarker2 = _interopRequireDefault(_utilsIsScopeMarker);

var _constantsMarkers = require('../constants/markers');

var _constantsMarkers2 = _interopRequireDefault(_constantsMarkers);

var _utilsTranslateScopeMarker = require('../utils/translateScopeMarker');

var _utilsTranslateScopeMarker2 = _interopRequireDefault(_utilsTranslateScopeMarker);

var MIN_RELEVANT_SCOPE_VALUE = 10;

function resolveScopes(lines, options) {
  for (var i = 0; i < 5; i++) {
    lines = resolveScopesOnce(lines, options);
  }
  return lines;
}

/**
 * This breaks all scopes as necessary. There should be no remaining scopes
 * after this method.
 */
function resolveScopesOnce(lines, options) {
  var indent = 0;
  // Screw you if you pick something less than 40...
  var getSpace = function getSpace() {
    return Math.max(options.maxLineLength - indent * options.tabWidth, 40);
  };

  var scopes = (0, _utilsBuildScopes2.default)(lines);

  // Compute a value for each scope. Higher values mean it contains more things.
  var scopeValue = new Map();
  for (var i = 0; i < lines.length; i++) {
    var line = lines[i];
    if (scopes[i] != null) {
      if (!scopeValue.has(scopes[i])) {
        scopeValue.set(scopes[i], 0);
      }
      var value = (0, _utilsIsMarker2.default)(line) || /^\s*$/.test(line) ? 0 : 1;
      scopeValue.set(scopes[i], scopeValue.get(scopes[i]) + value);
    }
  }

  // Compute the depth of each scope. Generally we prefer to break the lowest
  // depth scope.
  var depth = 0;
  var scopeDepth = new Map();
  for (var i = 0; i < lines.length; i++) {
    var line = lines[i];
    if (line === _constantsMarkers2.default.openScope) {
      depth++;
    }
    if (!scopeDepth.has(scopes[i])) {
      scopeDepth.set(scopes[i], depth);
    }
    var thisScopeDepth = scopeDepth.get(scopes[i]);
    if (thisScopeDepth) {
      scopeDepth.set(scopes[i], Math.min(thisScopeDepth, depth));
    }
    if (line === _constantsMarkers2.default.closeScope) {
      depth--;
    }
  }

  var breakScopes = new Set();

  // Figure out what we want to break.

  var start = null;
  var space = null;
  var scopeToBreak = null;
  var len = 0;
  for (var i = 0; i < lines.length; i++) {
    var line = lines[i];

    if (line === _constantsMarkers2.default.indent) {
      indent++;
    } else if (line === _constantsMarkers2.default.dedent) {
      indent--;
    }

    if (start == null) {
      start = i;
      // Compute the space at the start so any indents that don't cause a
      // reset will not mess things up.
      space = getSpace();
    }

    // We want to trim the last line when checking the length in case it
    // causes the break.
    var trimmedLength = len + trimRightLength(line);
    (0, _assert2.default)(space, 'Space must be defined');
    if (trimmedLength > space && start != null && scopeToBreak == null) {
      var bestScope = null;
      for (var j = i; j >= start; j--) {
        if (scopes[j] != null) {
          // There isn't a best yet. Always use the current scope.
          if (bestScope == null) {
            bestScope = scopes[j];
            continue;
          }

          var bestScopeValue = scopeValue.get(bestScope);
          var thisScopeValue = scopeValue.get(scopes[j]);
          var bestScopeDepth = scopeDepth.get(bestScope);
          var thisScopeDepth = scopeDepth.get(scopes[j]);

          if (bestScopeValue != null && thisScopeValue != null && thisScopeValue > MIN_RELEVANT_SCOPE_VALUE && (bestScopeValue <= MIN_RELEVANT_SCOPE_VALUE || bestScopeDepth != null && thisScopeDepth != null && (thisScopeDepth < bestScopeDepth || thisScopeDepth === bestScopeDepth || thisScopeValue > bestScopeValue))) {
            bestScope = scopes[j];
          }
        }
      }
      if (bestScope != null) {
        scopeToBreak = bestScope;
      }
    }

    // But we increment the length without the trimming since the next time
    // we view the length any trailing whitespace will have been important.
    len += getLength(line);
    if (shouldReset(line)) {
      len = 0;
      start = null;
      space = null;
      if (scopeToBreak != null) {
        breakScopes.add(scopeToBreak);
        scopeToBreak = null;
      }
    }
  }

  // Break relevant lines.
  lines = lines.map(function (line, i) {
    if ((0, _utilsIsScopeMarker2.default)(line) && breakScopes.has(scopes[i])) {
      return (0, _utilsTranslateScopeMarker2.default)(line, true);
    }
    return line;
  });

  return lines;
}

function shouldReset(line) {
  var endsInNewLine = line && /\n$/.test(line);
  return endsInNewLine || line === _constantsMarkers2.default.hardBreak || line === _constantsMarkers2.default.multiHardBreak;
}

function trimRightLength(line) {
  if ((0, _utilsIsMarker2.default)(line)) {
    // Only a comma marker retains any length when trimmed from the right.
    if (line === _constantsMarkers2.default.comma) {
      return 1;
    } else {
      return 0;
    }
  } else if (line != null) {
    return line.replace(/\s*$/, '').length;
  } else {
    return 0;
  }
}

function getLength(line) {
  if ((0, _utilsIsMarker2.default)(line)) {
    if (line === _constantsMarkers2.default.scopeSpaceBreak) {
      return 1;
    } else if (line === _constantsMarkers2.default.comma) {
      return 1;
    } else if (line === _constantsMarkers2.default.space) {
      return 1;
    } else {
      return 0;
    }
  } else if (line != null) {
    return line.length;
  } else {
    return 0;
  }
}

module.exports = resolveScopes;