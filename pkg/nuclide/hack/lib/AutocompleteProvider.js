'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var {Point, Range} = require('atom');

class AutocompleteProvider {

  async getAutocompleteSuggestions(
      request: {editor: TextEditor; bufferPosition: Point; scopeDescriptor: any; prefix: string}):
      Promise<Array<{snippet: string; rightLabel: string}>> {
    var replacementPrefix = this.findPrefix(request.editor);
    if (!replacementPrefix) {
      return [];
    }

    var {fetchCompletionsForEditor} = require('./hack');
    var completions = await fetchCompletionsForEditor(request.editor, replacementPrefix);

    return completions.map(completion => {
      return {
        snippet: completion.matchSnippet,
        replacementPrefix,
        rightLabel: completion.matchType,
      };
    });
  }

  findPrefix(editor: TextEditor): string {
    var cursor = editor.getLastCursor();
    // We use custom wordRegex to adopt php variables starting with $.
    var currentRange = cursor.getCurrentWordBufferRange({wordRegex:/(\$\w*)|\w+/});
    // Current word might go beyond the cursor, so we cut it.
    var range = new Range(
        currentRange.start,
        new Point(cursor.getBufferRow(), cursor.getBufferColumn()));
    var prefix = editor.getTextInBufferRange(range).trim();
    // Prefix could just be $ or ends with string literal.
    if (prefix === '$' || !/[\W]$/.test(prefix)) {
      return prefix;
    } else {
      return '';
    }
  }
}

module.exports = AutocompleteProvider;
