function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _jscodeshift2;

function _jscodeshift() {
  return _jscodeshift2 = _interopRequireDefault(require('jscodeshift'));
}

/**
 * This is a hack to force an ObjectPattern node to be printed on one line
 */
function oneLineObjectPattern(node) {
  if (!(_jscodeshift2 || _jscodeshift()).default.ObjectPattern.check(node)) {
    return node;
  }

  var props = node.properties;
  if (!props.every(function (prop) {
    return prop.shorthand && (_jscodeshift2 || _jscodeshift()).default.Identifier.check(prop.key);
  })) {
    return node;
  }

  var mySource = 'var {' + props.map(function (prop) {
    return prop.key.name;
  }).join(', ') + '} = _;';
  var myAst = (0, (_jscodeshift2 || _jscodeshift()).default)(mySource);
  return myAst.find((_jscodeshift2 || _jscodeshift()).default.ObjectPattern).nodes()[0];
}

module.exports = oneLineObjectPattern;