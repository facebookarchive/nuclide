function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _NewLine2;

function _NewLine() {
  return _NewLine2 = _interopRequireDefault(require('./NewLine'));
}

var _getRootIdentifierInExpression2;

function _getRootIdentifierInExpression() {
  return _getRootIdentifierInExpression2 = _interopRequireDefault(require('./getRootIdentifierInExpression'));
}

var _isGlobal2;

function _isGlobal() {
  return _isGlobal2 = _interopRequireDefault(require('./isGlobal'));
}

var _jscodeshift2;

function _jscodeshift() {
  return _jscodeshift2 = _interopRequireDefault(require('jscodeshift'));
}

var match = (_jscodeshift2 || _jscodeshift()).default.match;

var FirstNode = {
  /**
   * Gets the first node that it's safe to insert before on.
   *
   * Note: We never need to add a first node. If a first node doesn't exist
   * then there isn't ever code that would result in a require being changed.
   */
  get: function get(root) {
    var first = undefined;
    root.find((_jscodeshift2 || _jscodeshift()).default.Node).filter(function (path) {
      return (0, (_isGlobal2 || _isGlobal()).default)(path);
    }).forEach(function (path) {
      if (!first && FirstNode.isValidFirstNode(path)) {
        first = path;
      }
    });
    return first;
  },

  /**
   * Filter to see if a node is a valid first node.
   */
  isValidFirstNode: function isValidFirstNode(path) {
    // A new line literal is okay.
    if (match(path, { expression: { value: (_NewLine2 || _NewLine()).default.literal } })) {
      return true;
    }
    // Any other literal is not.
    if (match(path, { expression: { type: 'Literal' } })) {
      return false;
    }
    var firstObject = (0, (_getRootIdentifierInExpression2 || _getRootIdentifierInExpression()).default)(path.node);
    if (firstObject && match(firstObject, { name: 'jest' })) {
      return false;
    }
    return true;
  }
};

module.exports = FirstNode;