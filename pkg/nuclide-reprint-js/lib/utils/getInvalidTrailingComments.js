function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _immutable2;

function _immutable() {
  return _immutable2 = _interopRequireDefault(require('immutable'));
}

/**
 * This traverses an entire ast and determines which trailing comments are
 * duplicates of other leading comments. Comments are invalidated based on
 * their starting position.
 */
function getInvalidTrailingComments(node) {
  var result = [];
  traverse(node, result);
  return (_immutable2 || _immutable()).default.Set(result);
}

/**
 * A dumb traversal method. It will break if node contains any sort of
 * circular structure.
 */
function traverse(node, result) {
  if (!node) {
    return;
  }

  if (Object.prototype.toString.call(node) === '[object Object]') {
    if (typeof node.type === 'string') {
      Object.keys(node).forEach(function (key) {
        var value = node[key];

        // Leading comments are invalid trailing comments.
        if (key === 'leadingComments' && value) {
          value.forEach(function (comment) {
            // Some sanity checks on the comments.
            if (comment && typeof comment.type === 'string' && comment.start != null) {
              result.push(comment.start);
            }
          });
        }

        traverse(value, result);
      });
    }
  }

  if (Array.isArray(node)) {
    node.forEach(function (value) {
      traverse(value, result);
    });
  }
}

module.exports = getInvalidTrailingComments;