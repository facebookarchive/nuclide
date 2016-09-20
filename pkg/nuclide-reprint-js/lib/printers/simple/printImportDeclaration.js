

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
    parts = parts.concat([(_constantsMarkers2 || _constantsMarkers()).default.noBreak, print(specifier), (_constantsMarkers2 || _constantsMarkers()).default.noBreak]);

    // Check if we should close. Note that it's important we be able to open
    // and then close within a single cycle of this loop.
    if (open && i === arr.length - 1) {
      open = false;
      parts = parts.concat(['}']);
    }

    // Check if we should add a comma and space.
    if (i < arr.length - 1) {
      parts = parts.concat([(_constantsMarkers2 || _constantsMarkers()).default.comma, (_constantsMarkers2 || _constantsMarkers()).default.space]);
    }

    return parts;
  });
  (0, (_assert2 || _assert()).default)(!open, 'Import declaration left open somehow.');
  return (0, (_utilsFlatten2 || _utilsFlatten()).default)(['import', (_constantsMarkers2 || _constantsMarkers()).default.space,
  // $FlowFixMe(kad): add importKind to ast-types-flow
  node.importKind === 'type' ? ['type', (_constantsMarkers2 || _constantsMarkers()).default.space] : (_constantsMarkers2 || _constantsMarkers()).default.empty, specifiers, (_constantsMarkers2 || _constantsMarkers()).default.space, 'from', (_constantsMarkers2 || _constantsMarkers()).default.noBreak, (_constantsMarkers2 || _constantsMarkers()).default.space, print(node.source), (_constantsMarkers2 || _constantsMarkers()).default.noBreak, ';', (_constantsMarkers2 || _constantsMarkers()).default.hardBreak]);
}

module.exports = printImportDeclaration;