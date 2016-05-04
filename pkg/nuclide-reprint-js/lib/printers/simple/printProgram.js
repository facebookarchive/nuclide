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

var _commonPrintArrayOfStatements = require('../common/printArrayOfStatements');

var _commonPrintArrayOfStatements2 = _interopRequireDefault(_commonPrintArrayOfStatements);

var _commonPrintComments = require('../common/printComments');

var _commonPrintComments2 = _interopRequireDefault(_commonPrintComments);

function printProgram(print, node) {
  return (0, _utilsFlatten2.default)([(0, _commonPrintComments2.default)(node.innerComments), (0, _commonPrintArrayOfStatements2.default)(print, node.body)]);
}

module.exports = printProgram;