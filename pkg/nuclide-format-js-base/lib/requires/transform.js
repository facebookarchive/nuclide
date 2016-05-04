function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _addLeadingComments = require('./addLeadingComments');

var _addLeadingComments2 = _interopRequireDefault(_addLeadingComments);

var _addMissingRequires = require('./addMissingRequires');

var _addMissingRequires2 = _interopRequireDefault(_addMissingRequires);

var _addMissingTypes = require('./addMissingTypes');

var _addMissingTypes2 = _interopRequireDefault(_addMissingTypes);

var _formatRequires = require('./formatRequires');

var _formatRequires2 = _interopRequireDefault(_formatRequires);

var _removeLeadingComments = require('./removeLeadingComments');

var _removeLeadingComments2 = _interopRequireDefault(_removeLeadingComments);

var _removeUnusedRequires = require('./removeUnusedRequires');

var _removeUnusedRequires2 = _interopRequireDefault(_removeUnusedRequires);

var _removeUnusedTypes = require('./removeUnusedTypes');

var _removeUnusedTypes2 = _interopRequireDefault(_removeUnusedTypes);

/**
 * This is the collection of transforms that affect requires.
 */
function transform(root, options) {
  var blacklist = options.blacklist || new Set();
  var comments = undefined;
  if (!blacklist.has('requires.transferComments')) {
    comments = (0, _removeLeadingComments2.default)(root);
  }
  if (!blacklist.has('requires.removeUnusedRequires')) {
    (0, _removeUnusedRequires2.default)(root, options);
  }
  if (!blacklist.has('requires.addMissingRequires')) {
    (0, _addMissingRequires2.default)(root, options);
  }
  if (!blacklist.has('requires.removeUnusedTypes')) {
    (0, _removeUnusedTypes2.default)(root, options);
  }
  if (!blacklist.has('requires.addMissingTypes')) {
    (0, _addMissingTypes2.default)(root, options);
  }
  if (!blacklist.has('requires.formatRequires')) {
    (0, _formatRequires2.default)(root);
  }
  if (!blacklist.has('requires.transferComments')) {
    (0, _addLeadingComments2.default)(root, comments);
  }
}

module.exports = transform;