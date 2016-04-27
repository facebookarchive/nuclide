

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var flatten = require('../../utils/flatten');
var invariant = require('assert');
var markers = require('../../constants/markers');

function printExportNamedDeclaration(print, node) {
  var parts = ['export', markers.noBreak, markers.space];

  if (node.declaration) {
    parts = parts.concat([print(node.declaration)]);
    // $FlowFixMe(kad): add exportKind to ast-types-flow
  } else if (node.exportKind === 'type') {
      // If there is a declaration and the kind is 'type', the declaration must
      // be a type alias of some sort which already includes the word 'type'.
      parts = parts.concat(['type', markers.noBreak, markers.space]);
    }

  if (node.specifiers.length > 0) {
    (function () {
      invariant(!node.declaration, 'Cannot have both declaration and specifiers');
      var open = false;
      var specifiers = node.specifiers.map(function (specifier, i, arr) {
        var subParts = [];

        // Check if we should open.
        if (!open && specifier.type === 'ExportSpecifier') {
          open = true;
          subParts = subParts.concat(['{']);
        }

        // Print the specifier.
        subParts = subParts.concat([markers.noBreak, print(specifier), markers.noBreak]);

        // Check if we should close. Note that it's important we be able to open
        // and then close within a single cycle of this loop.
        if (open && i === arr.length - 1) {
          open = false;
          subParts = subParts.concat(['}']);
        }

        // Check if we should add a comma and space.
        if (i < arr.length - 1) {
          subParts = subParts.concat([markers.comma, markers.space]);
        }

        return subParts;
      });
      invariant(!open, 'Export specifiers somehow left open');
      parts = parts.concat(specifiers);
    })();
  }

  if (node.source) {
    invariant(!node.declaration, 'Declarations cannot have a source');
    parts = parts.concat([markers.noBreak, markers.space, 'from', markers.noBreak, markers.space, print(node.source)]);
  }

  if (!node.declaration) {
    parts = parts.concat([markers.noBreak, ';']);
  }

  parts = parts.concat([markers.hardBreak]);

  return flatten(parts);
}

module.exports = printExportNamedDeclaration;