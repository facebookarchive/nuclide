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

function printComment(node) {
  if (node.type === 'CommentBlock') {
    return (0, _utilsFlatten2.default)([('/*' + node.value + '*/').split('\n').map(function (part) {
      var trimmed = part.trim();
      return [trimmed.startsWith('*') ? ' ' + trimmed : trimmed, _constantsMarkers2.default.hardBreak];
    })]);
  }

  if (node.type === 'CommentLine') {
    return ['//', node.value, _constantsMarkers2.default.hardBreak];
  }

  return [];
}

module.exports = printComment;