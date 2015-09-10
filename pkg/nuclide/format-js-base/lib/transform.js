'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {SourceOptions} from './options/SourceOptions';

var Options = require('./options/Options');

var jscs = require('jscodeshift');
var printRoot = require('./utils/printRoot');
var requiresTransform = require('./requires/transform');

function transform(source: string, options: SourceOptions): string {
  Options.validateSourceOptions(options);

  // Parse the source code once, then reuse the root node
  var root = jscs(source);

  // Add use-strict
  // TODO: implement this, make it configurable

  // Requires
  requiresTransform(root, options);

  return printRoot(root);
}

module.exports = transform;
