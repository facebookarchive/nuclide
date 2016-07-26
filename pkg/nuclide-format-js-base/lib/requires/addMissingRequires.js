

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _utilsFirstNode2;

function _utilsFirstNode() {
  return _utilsFirstNode2 = _interopRequireDefault(require('../utils/FirstNode'));
}

var _utilsGetUndeclaredIdentifiers2;

function _utilsGetUndeclaredIdentifiers() {
  return _utilsGetUndeclaredIdentifiers2 = _interopRequireDefault(require('../utils/getUndeclaredIdentifiers'));
}

var _utilsGetUndeclaredJSXIdentifiers2;

function _utilsGetUndeclaredJSXIdentifiers() {
  return _utilsGetUndeclaredJSXIdentifiers2 = _interopRequireDefault(require('../utils/getUndeclaredJSXIdentifiers'));
}

function addMissingRequires(root, options) {
  var first = (_utilsFirstNode2 || _utilsFirstNode()).default.get(root);
  if (!first) {
    return;
  }
  var _first = first; // For flow.

  var moduleMap = options.moduleMap;

  // Add the missing requires.
  (0, (_utilsGetUndeclaredIdentifiers2 || _utilsGetUndeclaredIdentifiers()).default)(root, options).forEach(function (name) {
    var node = moduleMap.getRequire(name, { sourcePath: options.sourcePath });
    _first.insertBefore(node);
  });

  // Add missing JSX requires.
  (0, (_utilsGetUndeclaredJSXIdentifiers2 || _utilsGetUndeclaredJSXIdentifiers()).default)(root, options).forEach(function (name) {
    var node = moduleMap.getRequire(name, {
      sourcePath: options.sourcePath,
      jsxIdentifier: true
    });
    _first.insertBefore(node);
  });
}

module.exports = addMissingRequires;