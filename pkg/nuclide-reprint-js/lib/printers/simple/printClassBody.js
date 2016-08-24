

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

var _constantsMarkers2;

function _constantsMarkers() {
  return _constantsMarkers2 = _interopRequireDefault(require('../../constants/markers'));
}

var _commonPrintArrayOfStatements2;

function _commonPrintArrayOfStatements() {
  return _commonPrintArrayOfStatements2 = _interopRequireDefault(require('../common/printArrayOfStatements'));
}

var _commonPrintComments2;

function _commonPrintComments() {
  return _commonPrintComments2 = _interopRequireDefault(require('../common/printComments'));
}

function printClassBody(print, node) {
  // Can't put extra new lines in here like BlockStatement since it may be
  // used in a ClassExpression.
  return (0, (_utilsFlatten2 || _utilsFlatten()).default)(['{',
  // We want to override the extra space within the first node of a class
  // body, so we do one hard break and then throw in a no break. The empty
  // string is necessary to reset the run of markers.
  (_constantsMarkers2 || _constantsMarkers()).default.hardBreak, (_constantsMarkers2 || _constantsMarkers()).default.indent, '', (_constantsMarkers2 || _constantsMarkers()).default.noBreak, (0, (_commonPrintComments2 || _commonPrintComments()).default)(node.innerComments), (0, (_commonPrintArrayOfStatements2 || _commonPrintArrayOfStatements()).default)(print, node.body), (_constantsMarkers2 || _constantsMarkers()).default.dedent, (_constantsMarkers2 || _constantsMarkers()).default.hardBreak, '}']);
}

module.exports = printClassBody;