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

var _constantsMarkers = require('../../constants/markers');

var _constantsMarkers2 = _interopRequireDefault(_constantsMarkers);

var _commonPrintArrayOfStatements = require('../common/printArrayOfStatements');

var _commonPrintArrayOfStatements2 = _interopRequireDefault(_commonPrintArrayOfStatements);

var _commonPrintComments = require('../common/printComments');

var _commonPrintComments2 = _interopRequireDefault(_commonPrintComments);

function printClassBody(print, node) {
  // Can't put extra new lines in here like BlockStatement since it may be
  // used in a ClassExpression.
  return (0, _utilsFlatten2.default)(['{',
  // We want to override the extra space within the first node of a class
  // body, so we do one hard break and then throw in a no break. The empty
  // string is necessary to reset the run of markers.
  _constantsMarkers2.default.hardBreak, _constantsMarkers2.default.indent, '', _constantsMarkers2.default.noBreak, (0, _commonPrintComments2.default)(node.innerComments), (0, _commonPrintArrayOfStatements2.default)(print, node.body), _constantsMarkers2.default.dedent, _constantsMarkers2.default.hardBreak, '}']);
}

module.exports = printClassBody;