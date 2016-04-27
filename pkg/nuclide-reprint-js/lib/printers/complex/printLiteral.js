

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var escapeStringLiteral = require('../../utils/escapeStringLiteral');
var flatten = require('../../utils/flatten');
var invariant = require('assert');
var markers = require('../../constants/markers');

function printLiteral(print, node, context) {
  var last = context.path.last();

  // JSXAttributes should always use double quotes.
  if (last && last.type === 'JSXAttribute') {
    invariant(typeof node.value === 'string', 'Literals within a JSXAttribute should always be a string');
    return [escapeStringLiteral(node.value, { quotes: 'double' })];
  }

  // JSXElements don't need quotes, so we need special handling.
  if (last && last.type === 'JSXElement') {
    var _ret = (function () {
      invariant(typeof node.value === 'string', 'Literals within a JSXElement should always be a string');
      var lines = node.value.split('\n');
      var spaceNeeded = true;
      return {
        v: flatten(lines.map(function (line, i) {
          // Note: Scope is already opened in the JSXElement.
          // We have to check in order to avoid consecutive spaces when the scope
          // is not broken.
          var breakMarker = spaceNeeded ? markers.scopeSpaceBreak : markers.scopeBreak;
          if (/^\s*$/.test(line)) {
            spaceNeeded = false;
          } else {
            spaceNeeded = true;
          }
          return [i > 0 ? breakMarker : markers.empty, line];
        }))
      };
    })();

    if (typeof _ret === 'object') return _ret.v;
  }

  return [literalToString(node)];
}

function literalToString(node) {
  if (typeof node.value === 'string') {
    return escapeStringLiteral(node.value, { quotes: 'single' });
  }
  // It's not safe to use value for number literals that would lose precision.
  if (node.raw != null) {
    return node.raw;
  }
  return markers.empty;
}

module.exports = printLiteral;