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

function getNamesFromID(node) {
  var ids = new Set();
  if ((_jscodeshift2 || _jscodeshift()).default.Identifier.check(node)) {
    ids.add(node.name);
  } else if ((_jscodeshift2 || _jscodeshift()).default.RestElement.check(node) || (_jscodeshift2 || _jscodeshift()).default.SpreadElement.check(node) || (_jscodeshift2 || _jscodeshift()).default.SpreadProperty.check(node)) {
    for (var id of getNamesFromID(node.argument)) {
      ids.add(id);
    }
  } else if ((_jscodeshift2 || _jscodeshift()).default.ObjectPattern.check(node)) {
    node.properties.forEach(function (prop) {
      // Generally props have a value, if it is a spread property it doesn't.
      for (var id of getNamesFromID(prop.value || prop)) {
        ids.add(id);
      }
    });
  } else if ((_jscodeshift2 || _jscodeshift()).default.ArrayPattern.check(node)) {
    node.elements.forEach(function (element) {
      for (var id of getNamesFromID(element)) {
        ids.add(id);
      }
    });
  }
  return ids;
}

module.exports = getNamesFromID;