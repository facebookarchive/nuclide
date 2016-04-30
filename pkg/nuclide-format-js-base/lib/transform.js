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

import Options from './options/Options';
import jscs from 'jscodeshift';
import nuclideTransform from './nuclide/transform';
import printRoot from './utils/printRoot';
import requiresTransform from './requires/transform';

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
