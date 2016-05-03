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

import NewLine from './NewLine';

function printRoot(root: Collection): string {
  // Print the new source.
  let output = root.toSource({quote: 'single', trailingComma: true});

  // Remove all new lines between require fences that are not explicitly added
  // by the NewLine module.
  const lines = output.split('\n');
  let first = lines.length - 1;
  let last = 0;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].indexOf(NewLine.literal) !== -1) {
      first = Math.min(first, i);
      last = Math.max(last, i);
    }
  }

  // Filter out the empty lines that are between NewLine markers.
  output = lines
    .filter((line, index) => line || index < first || index > last)
    .join('\n');

  // Remove the NewLine markers.
  output = NewLine.replace(output);

  // Remove new lines at the start.
  output = output.replace(/^\n{1,}/, '');

  // Make sure there is a new line at the end.
  if (!/^[\w\W]*\n$/.test(output)) {
    output += '\n';
  }

  return output;
}

module.exports = printRoot;
