'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {Point} from 'atom';
import type LibClangProcess from './LibClangProcess';

const MAX_LINE_LENGTH = 120;
const TAB_LENGTH = 2;

function getCompletionBody(
  completion: Completion,
  columnOffset: number,
  indentation: number
): string {
  var inlineBody = getCompletionBodyInline(completion);
  var multiLineBody =
    getCompletionBodyMultiLine(completion, columnOffset, indentation);

  if (columnOffset + inlineBody.length > MAX_LINE_LENGTH && multiLineBody) {
    return multiLineBody;
  }
  return inlineBody;
}

function getCompletionBodyMultiLine(
  completion: Completion,
  columnOffset: number,
  indentation: number
): ?string {
  // Filter out whitespace chunks.
  var chunks = completion.chunks.filter((chunk) => chunk.spelling.trim());

  // We only handle completions in which non-placeholder and placeholder
  // chunks alternate, starting with non-placeholder chunk.
  if (chunks.length % 2) {
    return null;
  }

  // Group non-placeholders and placeholders into groups of two.
  // One of each.
  var args = [];
  for (var i = 0, n = chunks.length / 2; i < n; ++i) {
    var firstChunk = chunks[i * 2];
    var secondChunk = chunks[i * 2 + 1];

    if (firstChunk.isPlaceHolder || !secondChunk.isPlaceHolder) {
      return null;
    }

    // If firstChunk ends with colon remove it because we add it manually later.
    var text = firstChunk.spelling;
    var placeholder = secondChunk.spelling;
    if (text.endsWith(':')) {
      text = text.substring(0, text.length - 1);
    }

    // All rows but the first one should be indented at least 2 extra levels.
    // To get that we add dummy leading spaces to those rows.
    if (i > 0) {
      text = ' '.repeat(2 * TAB_LENGTH) + text;
    }

    args.push({
      text,
      placeholder,
      offset: (i === 0) ? columnOffset : indentation * TAB_LENGTH,
    });
  }

  return _convertArgsToMultiLineSnippet(args);
}

function _convertArgsToMultiLineSnippet(
  args: Array<{
    text: string;
    placeholder: string;
    offset: number;
  }>
): string {
  // We have two types of multine line method calls.
  //
  // 1. Here first argument is the longest, so everything can be
  //    aligned nicely:
  // [self ArgumentOne:arg1
  //              arg2:arg2
  //         Argument3:arg3]
  //
  // 2. Here first argument is not the longest, but we still don't move it.
  //    Only rule here is that colons in remaining rows are aligned:
  // [self Arg1:arg1
  //          arg2:arg2
  //     Argument3:arg3]
  //

  var colonPosition = Math.max.apply(null,
    args.map((arg) => arg.offset + arg.text.length)
  );

  return args.reduce((body, arg, index) => {
    var spacesCnt = index === 0 ? 0 : colonPosition - arg.offset - arg.text.length;
    if (spacesCnt < 0) {
      throw Error('This is a bug! Spaces count is negative.');
    }

    var line = `${' '.repeat(spacesCnt)}${arg.text}:\${${index + 1}:${arg.placeholder}}\n`;
    if (index > 0 && line[colonPosition - arg.offset] !== ':') {
      throw Error('This is a bug! Colons are not aligned!');
    }
    return body + line;
  }, '');
}

function getCompletionBodyInline(completion: Completion): string {
  var body = '';
  var placeHolderCnt = 0;
  completion.chunks.forEach((chunk) => {
    if (chunk.isPlaceHolder) {
      placeHolderCnt++;
      body += '${' + placeHolderCnt + ':' + chunk.spelling + '}';
    } else {
      body += chunk.spelling;
    }
  });
  return body;
}


class AutocompleteProvider {
  _libClangProcess: LibClangProcess;

  constructor(libClangProcess: LibClangProcess) {
    this._libClangProcess = libClangProcess;
  }

  async getAutocompleteSuggestions(
      request: {editor: TextEditor; bufferPosition: Point; scopeDescriptor: any; prefix: string}):
      Promise<Array<{snippet: string; rightLabel: string}>> {
    var {editor, bufferPosition: cursorPosition, prefix} = request;
    var indentation = editor.indentationForBufferRow(cursorPosition.row);
    var column = cursorPosition.column;
    var data = await this._libClangProcess.getCompletions(editor);
    return data.completions.map((completion) => {
      var snippet = getCompletionBody(completion, column, indentation);
      var replacementPrefix = /^\s*$/.test(prefix) ? '' : prefix;
      return {
        snippet,
        replacementPrefix,
        rightLabel: completion.first_token,
      };
    });
  }

}

module.exports = {
  AutocompleteProvider,
  __test__: {
    getCompletionBodyMultiLine,
    getCompletionBodyInline,
  },
};
