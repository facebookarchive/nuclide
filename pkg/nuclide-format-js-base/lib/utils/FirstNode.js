function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _NewLine = require('./NewLine');

var _NewLine2 = _interopRequireDefault(_NewLine);

var _getRootIdentifierInExpression = require('./getRootIdentifierInExpression');

var _getRootIdentifierInExpression2 = _interopRequireDefault(_getRootIdentifierInExpression);

var _isGlobal = require('./isGlobal');

var _isGlobal2 = _interopRequireDefault(_isGlobal);

var _jscodeshift = require('jscodeshift');

var _jscodeshift2 = _interopRequireDefault(_jscodeshift);

var match = _jscodeshift2.default.match;

var FirstNode = {
  /**
   * Gets the first node that it's safe to insert before on.
   *
   * Note: We never need to add a first node. If a first node doesn't exist
   * then there isn't ever code that would result in a require being changed.
   */
  get: function get(root) {
    var first = undefined;
    root.find(_jscodeshift2.default.Node).filter(function (path) {
      return (0, _isGlobal2.default)(path);
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
    if (match(path, { expression: { value: _NewLine2.default.literal } })) {
      return true;
    }
    // Any other literal is not.
    if (match(path, { expression: { type: 'Literal' } })) {
      return false;
    }
    var firstObject = (0, _getRootIdentifierInExpression2.default)(path.node);
    if (firstObject && match(firstObject, { name: 'jest' })) {
      return false;
    }
    return true;
  }
};

module.exports = FirstNode;