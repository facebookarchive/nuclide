

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

function printStringLiteralTypeAnnotation(print, node) {
  return [(0, (_utilsEscapeStringLiteral2 || _utilsEscapeStringLiteral()).default)(node.value, { quotes: 'single' })];
}

module.exports = printStringLiteralTypeAnnotation;