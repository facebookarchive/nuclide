function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _utilsFirstNode = require('../utils/FirstNode');

var _utilsFirstNode2 = _interopRequireDefault(_utilsFirstNode);

var _utilsReprintComment = require('../utils/reprintComment');

var _utilsReprintComment2 = _interopRequireDefault(_utilsReprintComment);

function addLeadingComments(root, comments) {
  if (!comments || comments.length === 0) {
    return;
  }

  var firstPath = _utilsFirstNode2.default.get(root);
  if (!firstPath) {
    return;
  }
  var first = firstPath.node;
  first.comments = first.comments ? comments.concat(first.comments) : comments;
  first.comments = first.comments.map(function (comment) {
    return (0, _utilsReprintComment2.default)(comment);
  });
  firstPath.replace(first);
}

module.exports = addLeadingComments;