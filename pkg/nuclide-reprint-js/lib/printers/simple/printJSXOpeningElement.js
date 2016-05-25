

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _utilsFlatten2;

function _utilsFlatten() {
  return _utilsFlatten2 = _interopRequireDefault(require('../../utils/flatten'));
}

var _constantsMarkers2;

function _constantsMarkers() {
  return _constantsMarkers2 = _interopRequireDefault(require('../../constants/markers'));
}

/**
 * Note: A self closing tag gets its own scope, but a non-self closing tag will
 * use the scope opened up in the parent JSXElement.
 */
function printJSXOpeningElement(print, node) {
  // Easier to completely branch on self closing to handle slightly different
  // styles involved with scope breaks.
  if (node.selfClosing) {
    return (0, (_utilsFlatten2 || _utilsFlatten()).default)(['<', (_constantsMarkers2 || _constantsMarkers()).default.openScope, (_constantsMarkers2 || _constantsMarkers()).default.scopeIndent, (_constantsMarkers2 || _constantsMarkers()).default.noBreak, print(node.name), (_constantsMarkers2 || _constantsMarkers()).default.scopeSpaceBreak, node.attributes.map(function (a) {
      return [print(a), (_constantsMarkers2 || _constantsMarkers()).default.scopeSpaceBreak];
    }), (_constantsMarkers2 || _constantsMarkers()).default.scopeDedent, (_constantsMarkers2 || _constantsMarkers()).default.closeScope, '/>']);
  } else {
    return (0, (_utilsFlatten2 || _utilsFlatten()).default)(['<', (_constantsMarkers2 || _constantsMarkers()).default.noBreak, print(node.name), node.attributes.map(function (a, i, arr) {
      return [i === 0 ? (_constantsMarkers2 || _constantsMarkers()).default.scopeSpaceBreak : (_constantsMarkers2 || _constantsMarkers()).default.empty, print(a), i < arr.length - 1 ? (_constantsMarkers2 || _constantsMarkers()).default.scopeSpaceBreak : (_constantsMarkers2 || _constantsMarkers()).default.empty];
    }), '>']);
  }
}

module.exports = printJSXOpeningElement;