function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _utilsFlatten = require('../../utils/flatten');

var _utilsFlatten2 = _interopRequireDefault(_utilsFlatten);

var _constantsMarkers = require('../../constants/markers');

var _constantsMarkers2 = _interopRequireDefault(_constantsMarkers);

/**
 * Note: A self closing tag gets its own scope, but a non-self closing tag will
 * use the scope opened up in the parent JSXElement.
 */
function printJSXOpeningElement(print, node) {
  // Easier to completely branch on self closing to handle slightly different
  // styles involved with scope breaks.
  if (node.selfClosing) {
    return (0, _utilsFlatten2.default)(['<', _constantsMarkers2.default.openScope, _constantsMarkers2.default.scopeIndent, _constantsMarkers2.default.noBreak, print(node.name), _constantsMarkers2.default.scopeSpaceBreak, node.attributes.map(function (a) {
      return [print(a), _constantsMarkers2.default.scopeSpaceBreak];
    }), _constantsMarkers2.default.scopeDedent, _constantsMarkers2.default.closeScope, '/>']);
  } else {
    return (0, _utilsFlatten2.default)(['<', _constantsMarkers2.default.noBreak, print(node.name), node.attributes.map(function (a, i, arr) {
      return [i === 0 ? _constantsMarkers2.default.scopeSpaceBreak : _constantsMarkers2.default.empty, print(a), i < arr.length - 1 ? _constantsMarkers2.default.scopeSpaceBreak : _constantsMarkers2.default.empty];
    }), '>']);
  }
}

module.exports = printJSXOpeningElement;