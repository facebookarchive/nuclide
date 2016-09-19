function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _utilsFlatten2;

function _utilsFlatten() {
  return _utilsFlatten2 = _interopRequireDefault(require('../../utils/flatten'));
}

var _constantsMarkers2;

function _constantsMarkers() {
  return _constantsMarkers2 = _interopRequireDefault(require('../../constants/markers'));
}

function printComment(node) {
  if (node.type === 'CommentBlock') {
    return (0, (_utilsFlatten2 || _utilsFlatten()).default)([('/*' + node.value + '*/').split('\n').map(function (part) {
      var trimmed = part.trim();
      return [trimmed.startsWith('*') ? ' ' + trimmed : trimmed, (_constantsMarkers2 || _constantsMarkers()).default.hardBreak];
    })]);
  }

  if (node.type === 'CommentLine') {
    return ['//', node.value, (_constantsMarkers2 || _constantsMarkers()).default.hardBreak];
  }

  return [];
}

module.exports = printComment;