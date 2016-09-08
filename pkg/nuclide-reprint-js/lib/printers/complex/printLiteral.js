

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _utilsEscapeStringLiteral2;

function _utilsEscapeStringLiteral() {
  return _utilsEscapeStringLiteral2 = _interopRequireDefault(require('../../utils/escapeStringLiteral'));
}

var _utilsFlatten2;

function _utilsFlatten() {
  return _utilsFlatten2 = _interopRequireDefault(require('../../utils/flatten'));
}

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

var _constantsMarkers2;

function _constantsMarkers() {
  return _constantsMarkers2 = _interopRequireDefault(require('../../constants/markers'));
}

function printLiteral(print, node, context) {
  var last = context.path.last();

  // JSXAttributes should always use double quotes.
  if (last && last.type === 'JSXAttribute') {
    (0, (_assert2 || _assert()).default)(typeof node.value === 'string', 'Literals within a JSXAttribute should always be a string');
    return [(0, (_utilsEscapeStringLiteral2 || _utilsEscapeStringLiteral()).default)(node.value, { quotes: 'double' })];
  }

  // JSXElements don't need quotes, so we need special handling.
  if (last && last.type === 'JSXElement') {
    var _ret = (function () {
      (0, (_assert2 || _assert()).default)(typeof node.value === 'string', 'Literals within a JSXElement should always be a string');
      var lines = node.value.split('\n');
      var spaceNeeded = true;
      return {
        v: (0, (_utilsFlatten2 || _utilsFlatten()).default)(lines.map(function (line, i) {
          // Note: Scope is already opened in the JSXElement.
          // We have to check in order to avoid consecutive spaces when the scope
          // is not broken.
          var breakMarker = spaceNeeded ? (_constantsMarkers2 || _constantsMarkers()).default.scopeSpaceBreak : (_constantsMarkers2 || _constantsMarkers()).default.scopeBreak;
          if (/^\s*$/.test(line)) {
            spaceNeeded = false;
          } else {
            spaceNeeded = true;
          }
          // $FlowFixMe(kad)
          return [i > 0 ? breakMarker : (_constantsMarkers2 || _constantsMarkers()).default.empty, line];
        }))
      };
    })();

    if (typeof _ret === 'object') return _ret.v;
  }

  return [literalToString(node)];
}

function literalToString(node) {
  if (typeof node.value === 'string') {
    return (0, (_utilsEscapeStringLiteral2 || _utilsEscapeStringLiteral()).default)(node.value, { quotes: 'single' });
  }
  // It's not safe to use value for number literals that would lose precision.
  if (node.raw != null) {
    return node.raw;
  }
  return (_constantsMarkers2 || _constantsMarkers()).default.empty;
}

module.exports = printLiteral;