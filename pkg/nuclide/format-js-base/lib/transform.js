'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {AbsolutePath} from './types/common';

var jscs = require('jscodeshift');
var path = require('path');
var printRoot = require('./utils/printRoot');
var requiresTransform = require('./requires/transform');

function transform(source: string, sourcePath: AbsolutePath): string {
  // Parse the source code once, then reuse the root node
  var root = jscs(source);
  var absoluteSourcePath = path.resolve(sourcePath);

  // Add use-strict
  // TODO: implement this, make it configurable

  // Requires
  requiresTransform(root, absoluteSourcePath);

  return printRoot(root);
}

module.exports = transform;
