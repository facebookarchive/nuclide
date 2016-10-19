Object.defineProperty(exports, '__esModule', {
  value: true
});

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

exports.getOutline = getOutline;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _assert;

function _load_assert() {
  return _assert = _interopRequireDefault(require('assert'));
}

var _parsing;

function _load_parsing() {
  return _parsing = require('./parsing');
}

function getOutline(text) {
  var expression = (0, (_parsing || _load_parsing()).parseJSON)(text);
  if (expression == null) {
    return null;
  }
  if (expression.type === 'ObjectExpression') {
    var outlineTrees = expression.properties
    // Filter out property keys that aren't string literals, such as computed properties. They
    // aren't valid JSON but nothing actually enforces that we are getting valid JSON and we are
    // using a full JS parser so we have to handle cases like this.
    .filter(function (prop) {
      return prop.type === 'Property' && prop.key.type === 'Literal' && typeof prop.key.value === 'string';
    }).map(function (prop) {
      (0, (_assert || _load_assert()).default)(prop.type === 'Property');
      (0, (_assert || _load_assert()).default)(prop.key.type === 'Literal');
      return {
        plainText: String(prop.key.value),
        startPosition: (0, (_parsing || _load_parsing()).babelPosToPoint)(prop.loc.start),
        endPosition: (0, (_parsing || _load_parsing()).babelPosToPoint)(prop.loc.end),
        children: []
      };
    });
    return { outlineTrees: outlineTrees };
  }
  return null;
}