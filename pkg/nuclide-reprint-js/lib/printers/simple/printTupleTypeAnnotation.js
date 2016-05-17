

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

var _commonPrintCommaSeparatedNodes2;

function _commonPrintCommaSeparatedNodes() {
  return _commonPrintCommaSeparatedNodes2 = _interopRequireDefault(require('../common/printCommaSeparatedNodes'));
}

function printTupleTypeAnnotation(print, node) {
  return (0, (_utilsFlatten2 || _utilsFlatten()).default)(['[', (0, (_commonPrintCommaSeparatedNodes2 || _commonPrintCommaSeparatedNodes()).default)(print, node.types), ']']);
}

module.exports = printTupleTypeAnnotation;