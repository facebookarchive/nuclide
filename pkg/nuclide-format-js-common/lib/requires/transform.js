function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _addLeadingComments2;

function _addLeadingComments() {
  return _addLeadingComments2 = _interopRequireDefault(require('./addLeadingComments'));
}

var _addMissingRequires2;

function _addMissingRequires() {
  return _addMissingRequires2 = _interopRequireDefault(require('./addMissingRequires'));
}

var _addMissingTypes2;

function _addMissingTypes() {
  return _addMissingTypes2 = _interopRequireDefault(require('./addMissingTypes'));
}

var _formatRequires2;

function _formatRequires() {
  return _formatRequires2 = _interopRequireDefault(require('./formatRequires'));
}

var _removeLeadingComments2;

function _removeLeadingComments() {
  return _removeLeadingComments2 = _interopRequireDefault(require('./removeLeadingComments'));
}

var _removeUnusedRequires2;

function _removeUnusedRequires() {
  return _removeUnusedRequires2 = _interopRequireDefault(require('./removeUnusedRequires'));
}

var _removeUnusedTypes2;

function _removeUnusedTypes() {
  return _removeUnusedTypes2 = _interopRequireDefault(require('./removeUnusedTypes'));
}

/**
 * This is the collection of transforms that affect requires.
 */
function transform(root, options) {
  var blacklist = options.blacklist || new Set();
  var comments = undefined;
  if (!blacklist.has('requires.transferComments')) {
    comments = (0, (_removeLeadingComments2 || _removeLeadingComments()).default)(root);
  }
  if (!blacklist.has('requires.removeUnusedRequires')) {
    (0, (_removeUnusedRequires2 || _removeUnusedRequires()).default)(root, options);
  }
  if (!blacklist.has('requires.addMissingRequires')) {
    (0, (_addMissingRequires2 || _addMissingRequires()).default)(root, options);
  }
  if (!blacklist.has('requires.removeUnusedTypes')) {
    (0, (_removeUnusedTypes2 || _removeUnusedTypes()).default)(root, options);
  }
  if (!blacklist.has('requires.addMissingTypes')) {
    (0, (_addMissingTypes2 || _addMissingTypes()).default)(root, options);
  }
  if (!blacklist.has('requires.formatRequires')) {
    (0, (_formatRequires2 || _formatRequires()).default)(root);
  }
  if (!blacklist.has('requires.transferComments')) {
    (0, (_addLeadingComments2 || _addLeadingComments()).default)(root, comments);
  }
}

module.exports = transform;