

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var flatten = require('../../utils/flatten');
var markers = require('../../constants/markers');

function printProperty(print, node) {
  var parts = [];

  if (node.kind === 'get') {
    parts = parts.concat(['get', markers.noBreak, markers.space]);
  } else if (node.kind === 'set') {
    parts = parts.concat(['set', markers.noBreak, markers.space]);
  }

  if (node.value && node.value.async) {
    parts = parts.concat(['async', markers.noBreak, markers.space]);
  }

  if (node.value && node.value.generator) {
    parts = parts.concat(['*', markers.noBreak]);
  }

  if (node.computed) {
    parts = parts.concat(['[', markers.noBreak, print(node.key), markers.noBreak, ']', markers.noBreak]);
  } else {
    parts = parts.concat([print(node.key), markers.noBreak]);
  }

  // TODO: Force the scope to break when a property is a method. Or if the
  // value is a function expression.
  if (node.method) {
    parts = parts.concat([markers.noBreak, print(node.value)]);
  } else if (!node.shorthand) {
    parts = parts.concat([':', markers.noBreak, markers.space, print(node.value)]);
  } else if (node.key.type !== node.value.type) {
    // This is a very strange case in the AST where we are in a shorthand
    // property but key and value do not have the same type. This can happen
    // when using defaults in an object pattern. E.g:
    //
    //   var {x = 4} = a;
    //
    // x is shorthand but its value is an assignment expression. In this case
    // we will just print the value.
    parts = [print(node.value)];
  }

  return flatten(parts);
}

module.exports = printProperty;