"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.search = search;

var _RxMin = require("rxjs/bundles/Rx.min.js");

function _process() {
  const data = require("../nuclide-commons/process");

  _process = function () {
    return data;
  };

  return data;
}

function _observable() {
  const data = require("../nuclide-commons/observable");

  _observable = function () {
    return data;
  };

  return data;
}

/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * 
 * @format
 */

/* eslint-disable no-control-regex */
// Just the file on a line
const RG_HEADER_REGEX = /^\u001b\[0?m(.+)\u001b\[0?m\n$/; // Line number, ':', line-text

const RG_ENTRY_REGEX = /^\u001b\[0?m(\d+)\u001b\[0?m:(.*)\r?\n$/; // Separates groups of file-matches

const RG_END_REGEX = /^\s*$/; // We'll tell ripgrep to color the matching text so we can regexp it using the color-escape-codes.

const RG_MATCH_START = /\u001b\[0?m\u001b\[31m/g;
const RG_MATCH_END = /\u001b\[0?m/g; // Don't bother searching lines that are longer than this:

const MAX_LINE_LENGTH = 1000000;

/**
 * Searches the subtree at `basePath` for lines matching `query` using ripgrep.
 * The order of results is determined by ripgrep.
 */
function search(query, basePath, options) {
  // Implementation note: we direct ripgrep to output ANSI color codes to help
  // us find the matched text. See `findMarkedMatch()` for more detail.
  // TODO(siegebell): use libripgrep once
  // https://github.com/BurntSushi/ripgrep/issues/162 is resolved.
  const args = ['--line-number', '--with-filename', '--hidden', '--heading', '--color', 'ansi', '--colors', 'path:none', '--colors', 'line:none', '--colors', 'match:fg:red', '--colors', 'match:style:nobold', ...(options.isWordMatch ? ['--word-regexp'] : []), options.isCaseSensitive ? '--case-sensitive' : '--ignore-case', ...Array.prototype.concat(...options.includes.map(x => ['-g', x])), ...Array.prototype.concat(...options.excludes.map(x => ['-g', '!' + x])), options.isRegExp ? '--regexp' : '--fixed-strings', query.replace('\\/', '/'), basePath];
  return observeGrepLikeProcess('rg', args, basePath) // Take only stdout messages
  .map(event => event.kind === 'stdout' ? event.data : null).pipe(_observable().compact) // State machine to identify file-headers vs line-matches
  .scan(parseRgLines, null) // Extract the line-matches from the state machine
  .map(selectRgMatches).pipe(_observable().compact) // Search each line for matches
  .mergeMap(parseRgLineMatches);
}

/**
 * Uses ANSI escape codes to find the next "matched text" from the given start offset.
 * This assumes that ripgrep was run with `--color ansi` and other settings to highlight each
 * matched text on the line.
 * 1. Find the first "start marker", '\u001b\[m\u001b\[31m', which is prefixed to the match
 * 2. From there, find the next "end marker", '\u001b\[m', which is postfixed to the match
 * 3. Return the matched-text, offsets to the beginnings & ends of the markers, and combined length
 *    of the markers. (The combined length is used by the caller to accurately calculate the column
 *    because the presence of markers in the string means string-offsets will be a little off.)
 * @param startIndex offset to begin searching for the next start-marker.
 * @returns `null` if valid start and end markers are not found.
 */
function findMarkedMatch(text, startIndex) {
  RG_MATCH_START.lastIndex = startIndex;
  const startMatch = RG_MATCH_START.exec(text);

  if (startMatch == null || RG_MATCH_START.lastIndex === 0) {
    return null;
  }

  RG_MATCH_END.lastIndex = RG_MATCH_START.lastIndex;
  const endMatch = RG_MATCH_END.exec(text);

  if (endMatch == null) {
    return null;
  }

  return {
    matchText: text.slice(RG_MATCH_START.lastIndex, endMatch.index),
    start: startMatch.index,
    end: RG_MATCH_END.lastIndex,
    markersLength: startMatch[0].length + endMatch[0].length
  };
}
/**
 * Parses a line of matched text (output from ripgrep) for matches.
 */


function parseRgLineMatches(rgMatch) {
  const {
    path,
    line,
    text
  } = rgMatch;

  if (text.length >= MAX_LINE_LENGTH) {
    // TODO(siegebell): we won't need this if vscode changes the api to
    // accept abbreviated leading/trailing/matching texts.
    return _RxMin.Observable.of({
      path,
      line,
      error: 'line-too-long'
    });
  }

  const matches = []; // Counts the ANSI escape-sequence bytes from start & end markers so we
  // can convert from ripgrep-output offsets (e.g. `searchOffset`) to columns.

  let columnAdjust = 0;
  let searchOffset = 0;

  while (true) {
    const markedMatch = findMarkedMatch(text, searchOffset);

    if (markedMatch == null) {
      break;
    }

    const {
      matchText,
      start,
      end,
      markersLength
    } = markedMatch;
    const pre = leadingText(text, start);
    const post = trailingText(text, end);
    const column = start - columnAdjust;
    columnAdjust += markersLength;
    matches.push({
      path,
      line,
      column,
      pre,
      text: matchText,
      post
    });
    searchOffset = end;
  }

  return _RxMin.Observable.from(matches);
}
/**
 * Returns the text leading up to `offset`; removes any ANSI characters that
 * were output by ripgrep to aid in finding matches.
 */


function leadingText(text, offset) {
  return text.slice(0, offset).replace(/\u001b\[\d*m/g, '');
}
/**
 * Returns the text after `offset`; removes any ANSI characters that were output
 * by ripgrep to aid in finding matches.
 */


function trailingText(text, offset) {
  return text.slice(offset, text.length).replace(/\u001b\[\d*m/g, '');
}
/**
 * Ripgrep output will have the format: ((filename\n)(line:text\n)+\n)*
 * I.e. it will output
 * 1. filename
 * 2. then the line [number] and text of each line that matches in the file
 * 3. a blank line
 * This function determines which of the three states a line of output is in.
 */


function parseRgLines(acc, lineText) {
  if (RG_END_REGEX.test(lineText)) {
    return null;
  } else if (acc != null && acc.path != null) {
    const path = acc.path;
    const match = lineText.match(RG_ENTRY_REGEX);

    if (!(match != null)) {
      throw new Error('cannot parse ripgrep');
    }

    const [line, text] = match.slice(1);
    return {
      path,
      line: parseInt(line, 10) - 1,
      text
    };
  } else {
    const match = lineText.match(RG_HEADER_REGEX);

    if (!(match != null)) {
      throw new Error('cannot parse ripgrep');
    }

    return {
      path: match[1]
    };
  }
}
/**
 * Keeps only the parse-states that have matches.
 */


function selectRgMatches(x) {
  if (x != null && typeof x.line === 'number' && typeof x.text === 'string') {
    return {
      path: x.path,
      line: x.line,
      text: x.text
    };
  } else {
    return null;
  }
} // Copied from pkg/nuclide-code-search-rpc/lib/handlerCommon.js
// Grep and related tools (ag, ack, rg) have exit code 1 with no results.


function observeGrepLikeProcess(command, args, cwd) {
  return (0, _process().observeProcess)(command, args, {
    cwd,
    // An exit code of 0 or 1 is normal for grep-like tools.
    isExitError: ({
      exitCode,
      signal
    }) => {
      return (// flowlint-next-line sketchy-null-string:off
        !signal && (exitCode == null || exitCode > 1)
      );
    }
  });
}