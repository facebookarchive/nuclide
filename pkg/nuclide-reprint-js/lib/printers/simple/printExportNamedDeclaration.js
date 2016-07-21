

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

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

var _constantsMarkers2;

function _constantsMarkers() {
  return _constantsMarkers2 = _interopRequireDefault(require('../../constants/markers'));
}

function printExportNamedDeclaration(print, node) {
  var parts = ['export', (_constantsMarkers2 || _constantsMarkers()).default.noBreak, (_constantsMarkers2 || _constantsMarkers()).default.space];

  if (node.declaration) {
    parts = parts.concat([print(node.declaration)]);
    // $FlowFixMe(kad): add exportKind to ast-types-flow
  } else if (node.exportKind === 'type') {
      // If there is a declaration and the kind is 'type', the declaration must
      // be a type alias of some sort which already includes the word 'type'.
      parts = parts.concat(['type', (_constantsMarkers2 || _constantsMarkers()).default.noBreak, (_constantsMarkers2 || _constantsMarkers()).default.space]);
    }

  if (node.specifiers.length > 0) {
    (function () {
      (0, (_assert2 || _assert()).default)(!node.declaration, 'Cannot have both declaration and specifiers');
      var open = false;
      var specifiers = node.specifiers.map(function (specifier, i, arr) {
        var subParts = [];

        // Check if we should open.
        if (!open && specifier.type === 'ExportSpecifier') {
          open = true;
          subParts = subParts.concat(['{']);
        }

        // Print the specifier.
        subParts = subParts.concat([(_constantsMarkers2 || _constantsMarkers()).default.noBreak, print(specifier), (_constantsMarkers2 || _constantsMarkers()).default.noBreak]);

        // Check if we should close. Note that it's important we be able to open
        // and then close within a single cycle of this loop.
        if (open && i === arr.length - 1) {
          open = false;
          subParts = subParts.concat(['}']);
        }

        // Check if we should add a comma and space.
        if (i < arr.length - 1) {
          subParts = subParts.concat([(_constantsMarkers2 || _constantsMarkers()).default.comma, (_constantsMarkers2 || _constantsMarkers()).default.space]);
        }

        return subParts;
      });
      (0, (_assert2 || _assert()).default)(!open, 'Export specifiers somehow left open');
      parts = parts.concat(specifiers);
    })();
  }

  if (node.source) {
    (0, (_assert2 || _assert()).default)(!node.declaration, 'Declarations cannot have a source');
    parts = parts.concat([(_constantsMarkers2 || _constantsMarkers()).default.noBreak, (_constantsMarkers2 || _constantsMarkers()).default.space, 'from', (_constantsMarkers2 || _constantsMarkers()).default.noBreak, (_constantsMarkers2 || _constantsMarkers()).default.space, print(node.source)]);
  }

  if (!node.declaration) {
    parts = parts.concat([(_constantsMarkers2 || _constantsMarkers()).default.noBreak, ';']);
  }

  parts = parts.concat([(_constantsMarkers2 || _constantsMarkers()).default.hardBreak]);

  return (0, (_utilsFlatten2 || _utilsFlatten()).default)(parts);
}

module.exports = printExportNamedDeclaration;