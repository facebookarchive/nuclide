'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {ExternalOptions} from './types/options';

var jscs = require('jscodeshift');

var buildOptions = require('./utils/buildOptions');
var printRoot = require('./utils/printRoot');
var requiresTransform = require('./requires/transform');

function transform(source: string, externalOptions: ExternalOptions): string {
  // Parse the source code once, then reuse the root node
  var root = jscs(source);

  // Transform the given options into a more usable format
  var options = buildOptions(externalOptions);

  // Add use-strict
  // TODO: implement this, make it configurable

  // Requires
  requiresTransform(root, options);

  return printRoot(root, options);
}

module.exports = transform;
