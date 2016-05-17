function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _optionsOptions2;

function _optionsOptions() {
  return _optionsOptions2 = _interopRequireDefault(require('./options/Options'));
}

var _jscodeshift2;

function _jscodeshift() {
  return _jscodeshift2 = _interopRequireDefault(require('jscodeshift'));
}

var _nuclideTransform2;

function _nuclideTransform() {
  return _nuclideTransform2 = _interopRequireDefault(require('./nuclide/transform'));
}

var _utilsPrintRoot2;

function _utilsPrintRoot() {
  return _utilsPrintRoot2 = _interopRequireDefault(require('./utils/printRoot'));
}

var _requiresTransform2;

function _requiresTransform() {
  return _requiresTransform2 = _interopRequireDefault(require('./requires/transform'));
}

function transform(source, options) {
  (_optionsOptions2 || _optionsOptions()).default.validateSourceOptions(options);

  // Parse the source code once, then reuse the root node
  var root = (0, (_jscodeshift2 || _jscodeshift()).default)(source);

  // Add use-strict
  // TODO: implement this, make it configurable

  // Requires
  (0, (_requiresTransform2 || _requiresTransform()).default)(root, options);

  var output = (0, (_utilsPrintRoot2 || _utilsPrintRoot()).default)(root);

  // Transform that operates on the raw string output.
  output = (0, (_nuclideTransform2 || _nuclideTransform()).default)(output, options);

  return output;
}

module.exports = transform;