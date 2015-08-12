'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {Collection} from '../types/ast';
import type {Options} from '../types/options';

var newLine = require('../constants/newLine');

function printRoot(root: Collection, options: Options): string {
  // Print the new source
  var output = root.toSource({quote: 'single', trailingComma: true});

  // This is a hack to easily add new lines within a transform
  output = output.replace(newLine.regex, '\n');

  // Also remove places with more than 2 new lines
  output = output.replace(/\n{3,}/g, '\n\n');

  // Make sure there is a new line at the end
  if (!/^[\w\W]*\n$/.test(output)) {
    output = output + '\n';
  }

  return output;
}

module.exports = printRoot;
