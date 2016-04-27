

var Options = require('./options/Options');

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var jscs = require('jscodeshift');
var nuclideTransform = require('./nuclide/transform');
var printRoot = require('./utils/printRoot');
var requiresTransform = require('./requires/transform');

function transform(source, options) {
  Options.validateSourceOptions(options);

  // Parse the source code once, then reuse the root node
  var root = jscs(source);

  // Add use-strict
  // TODO: implement this, make it configurable

  // Requires
  requiresTransform(root, options);

  var output = printRoot(root);

  // Transform that operates on the raw string output.
  output = nuclideTransform(output, options);

  return output;
}

module.exports = transform;