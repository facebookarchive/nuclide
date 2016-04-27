

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var escapeStringLiteral = require('../../utils/escapeStringLiteral');

function printStringLiteralTypeAnnotation(print, node) {
  return [escapeStringLiteral(node.value, { quotes: 'single' })];
}

module.exports = printStringLiteralTypeAnnotation;