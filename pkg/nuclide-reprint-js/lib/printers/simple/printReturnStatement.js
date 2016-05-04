function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _constantsMarkers = require('../../constants/markers');

var _constantsMarkers2 = _interopRequireDefault(_constantsMarkers);

var _wrappersSimpleWrapStatement = require('../../wrappers/simple/wrapStatement');

var _wrappersSimpleWrapStatement2 = _interopRequireDefault(_wrappersSimpleWrapStatement);

function printReturnStatement(print, node) {
  var wrap = function wrap(x) {
    return (0, _wrappersSimpleWrapStatement2.default)(print, node, x);
  };

  var parts = ['return'];
  if (node.argument) {
    var argument = node.argument;
    parts = parts.concat([_constantsMarkers2.default.space, print(argument)]);
  }
  return wrap([parts, _constantsMarkers2.default.noBreak, ';']);
}

module.exports = printReturnStatement;