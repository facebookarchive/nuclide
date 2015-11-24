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

const Options = require('./options/Options');

const jscs = require('jscodeshift');
const nuclideTransform = require('./nuclide/transform');
const printRoot = require('./utils/printRoot');
const requiresTransform = require('./requires/transform');

function transform(source: string, options: SourceOptions): string {
  Options.validateSourceOptions(options);

  // Parse the source code once, then reuse the root node
  const root = jscs(source);

  // Add use-strict
  // TODO: implement this, make it configurable

  // Requires
  requiresTransform(root, options);

  let output = printRoot(root);

  // Transform that operates on the raw string output.
  output = nuclideTransform(output, options);

  return output;
}

module.exports = transform;
