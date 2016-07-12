

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

var _commonPrintArrayOfStatements2;

function _commonPrintArrayOfStatements() {
  return _commonPrintArrayOfStatements2 = _interopRequireDefault(require('../common/printArrayOfStatements'));
}

var _commonPrintComments2;

function _commonPrintComments() {
  return _commonPrintComments2 = _interopRequireDefault(require('../common/printComments'));
}

function printProgram(print, node) {
  return (0, (_utilsFlatten2 || _utilsFlatten()).default)([(0, (_commonPrintComments2 || _commonPrintComments()).default)(node.innerComments), (0, (_commonPrintArrayOfStatements2 || _commonPrintArrayOfStatements()).default)(print, node.body)]);
}

module.exports = printProgram;