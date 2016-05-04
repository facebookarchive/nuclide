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

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _constantsMarkers = require('../../constants/markers');

var _constantsMarkers2 = _interopRequireDefault(_constantsMarkers);

function printImportDeclaration(print, node) {
  var open = false;
  var specifiers = node.specifiers.map(function (specifier, i, arr) {
    var parts = [];

    // Check if we should open.
    if (!open && specifier.type === 'ImportSpecifier') {
      open = true;
      parts = parts.concat(['{']);
    }

    // Print the specifier.
    parts = parts.concat([_constantsMarkers2.default.noBreak, print(specifier), _constantsMarkers2.default.noBreak]);

    // Check if we should close. Note that it's important we be able to open
    // and then close within a single cycle of this loop.
    if (open && i === arr.length - 1) {
      open = false;
      parts = parts.concat(['}']);
    }

    // Check if we should add a comma and space.
    if (i < arr.length - 1) {
      parts = parts.concat([_constantsMarkers2.default.comma, _constantsMarkers2.default.space]);
    }

    return parts;
  });
  (0, _assert2.default)(!open, 'Import declaration left open somehow.');
  return (0, _utilsFlatten2.default)(['import', _constantsMarkers2.default.space,
  // $FlowFixMe(kad): add importKind to ast-types-flow
  node.importKind === 'type' ? ['type', _constantsMarkers2.default.space] : _constantsMarkers2.default.empty, specifiers, _constantsMarkers2.default.space, 'from', _constantsMarkers2.default.noBreak, _constantsMarkers2.default.space, print(node.source), _constantsMarkers2.default.noBreak, ';', _constantsMarkers2.default.hardBreak]);
}

module.exports = printImportDeclaration;