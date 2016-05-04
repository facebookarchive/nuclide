function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _optionsOptions = require('./options/Options');

var _optionsOptions2 = _interopRequireDefault(_optionsOptions);

var _jscodeshift = require('jscodeshift');

var _jscodeshift2 = _interopRequireDefault(_jscodeshift);

var _nuclideTransform = require('./nuclide/transform');

var _nuclideTransform2 = _interopRequireDefault(_nuclideTransform);

var _utilsPrintRoot = require('./utils/printRoot');

var _utilsPrintRoot2 = _interopRequireDefault(_utilsPrintRoot);

var _requiresTransform = require('./requires/transform');

var _requiresTransform2 = _interopRequireDefault(_requiresTransform);

function transform(source, options) {
  _optionsOptions2.default.validateSourceOptions(options);

  // Parse the source code once, then reuse the root node
  var root = (0, _jscodeshift2.default)(source);

  // Add use-strict
  // TODO: implement this, make it configurable

  // Requires
  (0, _requiresTransform2.default)(root, options);

  var output = (0, _utilsPrintRoot2.default)(root);

  // Transform that operates on the raw string output.
  output = (0, _nuclideTransform2.default)(output, options);

  return output;
}

module.exports = transform;