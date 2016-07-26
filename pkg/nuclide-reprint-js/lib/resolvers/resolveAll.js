'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type Options from '../options/Options';
import type {Output} from '../types/common';

import markers from '../constants/markers';

/**
 * This resolves all markers. We are guaranteed to have a single remaining
 * string after this.
 */
function resolveAll(lines_: Array<any>, options: Options): Output {
  let lines = lines_;
  // Resolve everything except for indents and cursor. Note that this expects
  // indentation to already have been taken into account when breaking, just not
  // resolved yet.
  lines = lines
    .map(line => {
      if (line === markers.hardBreak) {
        return '\n';
      } else if (line === markers.multiHardBreak) {
        return '\n';
      } else if (line === markers.noBreak) {
        return '';
      } else if (line === markers.openScope) {
        return '';
      } else if (line === markers.scopeIndent) {
        return '';
      } else if (line === markers.scopeBreak) {
        return '';
      } else if (line === markers.scopeSpaceBreak) {
        return ' ';
      } else if (line === markers.scopeComma) {
        return '';
      } else if (line === markers.scopeDedent) {
        return '';
      } else if (line === markers.closeScope) {
        return '';
      } else if (line === markers.comma) {
        return ',';
      } else if (line === markers.space) {
        return ' ';
      } else if (line === markers.empty) {
        return '';
      } else {
        return line;
      }
    })
    .filter(line => line !== '');

  let indent = 0;
  const tabString = options.useSpaces ? ' '.repeat(options.tabWidth) : '\t';

  const result = [];
  for (let i = 0; i < lines.length; i++) {
    const end = result.length > 0 ? result[result.length - 1] : null;
    if (lines[i] === markers.indent) {
      indent++;
    } else if (lines[i] === markers.dedent) {
      indent--;
    } else if (end && /\n$/.test(end)) {
      result.push(tabString.repeat(indent) + lines[i]);
    } else {
      result.push(lines[i]);
    }
  }

  return {
    source: clean(result.join('')),
  };
}

/**
 * Consistent way to clean up the final source before returning. This removes
 * trailing whitespace and extra new lines.
 */
function clean(source_: string): string {
  let source = source_;
  // Trim and add an extra new line
  source = source.trim() + '\n';

  // Remove any trailing whitespace on lines. I believe this is necessary due
  // to scopeSpaceBreaks or something. TODO: Make this not necessary...
  source = source
    .split('\n')
    .map(line => line.replace(/\s*$/, ''))
    .join('\n');

  return source;
}

module.exports = resolveAll;
