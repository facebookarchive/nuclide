/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow
 * @format
 */

import type {NuclideUri} from './nuclideUri';

import fs from './fsPromise';
import {countOccurrences} from './string';

type Definition = {
  path: NuclideUri,
  position: atom$Point,
};

const MAX_PREVIEW_LINES = 10;

const WHITESPACE_REGEX = /^\s*/;
function getIndentLevel(line: string) {
  return WHITESPACE_REGEX.exec(line)[0].length;
}

export async function getDefinitionPreview(
  definition: Definition,
): Promise<string> {
  const contents = await fs.readFile(definition.path, 'utf8');
  const lines = contents.split('\n');

  const start = definition.position.row;
  const initialIndentLevel = getIndentLevel(lines[start]);

  const buffer = [];
  for (
    let i = start, openParenCount = 0, closedParenCount = 0;
    i < start + MAX_PREVIEW_LINES && i < lines.length;
    i++
  ) {
    const line = lines[i];
    const indentLevel = getIndentLevel(line);
    openParenCount += countOccurrences(line, '(');
    closedParenCount += countOccurrences(line, ')');

    buffer.push(line.substr(Math.min(indentLevel, initialIndentLevel))); // dedent

    // heuristic for the end of a function signature. // we've returned back to the original indentation level
    // and we have balanced pairs of parens
    if (
      indentLevel <= initialIndentLevel &&
      openParenCount === closedParenCount
    ) {
      break;
    }
  }

  return buffer.join('\n');
}
