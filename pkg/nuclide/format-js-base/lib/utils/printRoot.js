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

var NewLine = require('./NewLine');

function printRoot(root: Collection): string {
  // Print the new source.
  var output = root.toSource({quote: 'single', trailingComma: true});

  // This is a hack to easily add new lines within a transform.
  output = NewLine.replace(output);

  // Remove new lines at the start.
  output = output.replace(/^\n{1,}/, '');

  // Make sure there is a new line at the end.
  if (!/^[\w\W]*\n$/.test(output)) {
    output = output + '\n';
  }

  return output;
}

module.exports = printRoot;
