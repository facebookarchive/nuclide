

var jscs = require('jscodeshift');

/**
 * This is a hack to force an ObjectPattern node to be printed on one line
 */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

function oneLineObjectPattern(node) {
  if (!jscs.ObjectPattern.check(node)) {
    return node;
  }

  var props = node.properties;
  if (!props.every(function (prop) {
    return prop.shorthand && jscs.Identifier.check(prop.key);
  })) {
    return node;
  }

  var mySource = 'var {' + props.map(function (prop) {
    return prop.key.name;
  }).join(', ') + '} = _;';
  var myAst = jscs(mySource);
  return myAst.find(jscs.ObjectPattern).nodes()[0];
}

module.exports = oneLineObjectPattern;