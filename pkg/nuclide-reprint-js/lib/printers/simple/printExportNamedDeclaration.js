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

function printExportNamedDeclaration(print, node) {
  var parts = ['export', _constantsMarkers2.default.noBreak, _constantsMarkers2.default.space];

  if (node.declaration) {
    parts = parts.concat([print(node.declaration)]);
    // $FlowFixMe(kad): add exportKind to ast-types-flow
  } else if (node.exportKind === 'type') {
      // If there is a declaration and the kind is 'type', the declaration must
      // be a type alias of some sort which already includes the word 'type'.
      parts = parts.concat(['type', _constantsMarkers2.default.noBreak, _constantsMarkers2.default.space]);
    }

  if (node.specifiers.length > 0) {
    (function () {
      (0, _assert2.default)(!node.declaration, 'Cannot have both declaration and specifiers');
      var open = false;
      var specifiers = node.specifiers.map(function (specifier, i, arr) {
        var subParts = [];

        // Check if we should open.
        if (!open && specifier.type === 'ExportSpecifier') {
          open = true;
          subParts = subParts.concat(['{']);
        }

        // Print the specifier.
        subParts = subParts.concat([_constantsMarkers2.default.noBreak, print(specifier), _constantsMarkers2.default.noBreak]);

        // Check if we should close. Note that it's important we be able to open
        // and then close within a single cycle of this loop.
        if (open && i === arr.length - 1) {
          open = false;
          subParts = subParts.concat(['}']);
        }

        // Check if we should add a comma and space.
        if (i < arr.length - 1) {
          subParts = subParts.concat([_constantsMarkers2.default.comma, _constantsMarkers2.default.space]);
        }

        return subParts;
      });
      (0, _assert2.default)(!open, 'Export specifiers somehow left open');
      parts = parts.concat(specifiers);
    })();
  }

  if (node.source) {
    (0, _assert2.default)(!node.declaration, 'Declarations cannot have a source');
    parts = parts.concat([_constantsMarkers2.default.noBreak, _constantsMarkers2.default.space, 'from', _constantsMarkers2.default.noBreak, _constantsMarkers2.default.space, print(node.source)]);
  }

  if (!node.declaration) {
    parts = parts.concat([_constantsMarkers2.default.noBreak, ';']);
  }

  parts = parts.concat([_constantsMarkers2.default.hardBreak]);

  return (0, _utilsFlatten2.default)(parts);
}

module.exports = printExportNamedDeclaration;