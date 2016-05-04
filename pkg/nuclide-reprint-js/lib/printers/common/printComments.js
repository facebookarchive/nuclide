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

var _printComment = require('./printComment');

var _printComment2 = _interopRequireDefault(_printComment);

function printComments(nodes) {
  if (!Array.isArray(nodes)) {
    return [];
  }
  return (0, _utilsFlatten2.default)(nodes.map(function (n) {
    return (0, _printComment2.default)(n);
  }));
}

module.exports = printComments;