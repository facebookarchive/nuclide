'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

const {Point, Range} = require('atom');
import {trackTiming} from 'nuclide-analytics';

const FIELD_ACCESSORS = ['->', '::'];
const PREFIX_LOOKBACK = Math.max.apply(null, FIELD_ACCESSORS.map(prefix => prefix.length));

class AutocompleteProvider {

  @trackTiming('hack.getAutocompleteSuggestions')
  async getAutocompleteSuggestions(
      request: {editor: TextEditor; bufferPosition: Point; scopeDescriptor: any; prefix: string}):
      Promise<Array<{snippet: string; rightLabel: string}>> {
    const {editor, bufferPosition} = request;
    const replacementPrefix = findHackPrefix(editor);

    if (!replacementPrefix && !hasPrefix(editor, bufferPosition, FIELD_ACCESSORS, PREFIX_LOOKBACK)) {
      return [];
    }

    const {fetchCompletionsForEditor} = require('./hack');
    const completions = await fetchCompletionsForEditor(editor, replacementPrefix);

    return completions.map(completion => {
      return {
        snippet: completion.matchSnippet,
        replacementPrefix,
        rightLabel: completion.matchType,
      };
    });
  }
}

/**
 * Returns true if `bufferPosition` is prefixed with any of the passed `checkPrefixes`.
 */
function hasPrefix(
    editor: TextEditor,
    bufferPosition: Point,
    checkPrefixes: Array<string>,
    prefixLookback: number
  ): boolean {
  const priorChars = editor.getTextInBufferRange(
      new Range(new Point(bufferPosition.row, bufferPosition.column - prefixLookback), bufferPosition));
  return checkPrefixes.some(prefix => priorChars.endsWith(prefix));
}

function findHackPrefix(editor: TextEditor): ?string {
  const cursor = editor.getLastCursor();
  // We use custom wordRegex to adopt php variables starting with $.
  const currentRange = cursor.getCurrentWordBufferRange({wordRegex:/(\$\w*)|\w+/});
  // Current word might go beyond the cursor, so we cut it.
  const range = new Range(
      currentRange.start,
      new Point(cursor.getBufferRow(), cursor.getBufferColumn()));
  const prefix = editor.getTextInBufferRange(range).trim();
  // Prefix could just be $ or ends with string literal.
  if (prefix === '$' || !/[\W]$/.test(prefix)) {
    return prefix;
  } else {
    return null;
  }
}

module.exports = AutocompleteProvider;
