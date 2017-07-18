'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.convertCompletions = convertCompletions;
exports.hasPrefix = hasPrefix;

var _simpleTextBuffer;

function _load_simpleTextBuffer() {
  return _simpleTextBuffer = require('simple-text-buffer');
}

var _autocomplete;

function _load_autocomplete() {
  return _autocomplete = require('../../nuclide-hack-common/lib/autocomplete');
}

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 */

function convertCompletions(contents, offset, prefix, hackCompletions) {
  const completions = processCompletions(hackCompletions, contents, offset, prefix);
  return (0, (_autocomplete || _load_autocomplete()).sortAndFilterCompletions)(completions, prefix);
}

function matchTypeOfType(type) {
  // strip parens if present
  if (type[0] === '(' && type[type.length - 1] === ')') {
    return type.substring(1, type.length - 1);
  }
  return type;
}

function escapeName(name) {
  return name.replace(/\\/g, '\\\\');
}

function paramSignature(params) {
  const paramStrings = params.map(param => `${param.type} ${param.name}`);
  return `(${paramStrings.join(', ')})`;
}

function matchSnippet(name, params) {
  const escapedName = escapeName(name);
  if (params != null) {
    // Construct the snippet: e.g. myFunction(${1:$arg1}, ${2:$arg2});
    const paramsString = params.map((param, index) => `\${${index + 1}:${param.name}}`).join(', ');
    return `${escapedName}(${paramsString})`;
  } else {
    return escapedName;
  }
}

function processCompletions(completionsResponse, contents, offset, defaultPrefix) {
  const lineEndOrNotFound = contents.indexOf('\n', offset);
  const lineEnd = lineEndOrNotFound !== -1 ? lineEndOrNotFound : contents.length;
  const contentsRestOfLine = contents.substring(offset, lineEnd);
  const nextCharIndex = contentsRestOfLine.search(/\S/);
  const alreadyHasParams = nextCharIndex !== -1 && contentsRestOfLine[nextCharIndex] === '(';

  return completionsResponse.map(completion => {
    const { name, type, func_details } = completion;
    const resultPrefix = (0, (_autocomplete || _load_autocomplete()).getResultPrefix)(contents, offset, name);
    const commonResult = {
      displayText: name,
      replacementPrefix: (0, (_autocomplete || _load_autocomplete()).getReplacementPrefix)(resultPrefix, defaultPrefix),
      description: matchTypeOfType(type)
    };
    // The typechecker only gives us suggestions that are valid in the
    // current scope - so, if what the user typed didn't start with the
    // namespace (which would lead to us having a resultPrefix), we don't
    // want to put the namespace in the replacement.
    const scopedName = resultPrefix === '' ? name.split('\\').pop() : name;
    if (func_details != null) {
      const completionParams = alreadyHasParams ? null : func_details.params;
      return Object.assign({}, commonResult, {
        snippet: matchSnippet(scopedName, completionParams),
        leftLabel: func_details.return_type,
        rightLabel: paramSignature(func_details.params),
        type: 'function'
      });
    } else {
      return Object.assign({}, commonResult, {
        snippet: matchSnippet(scopedName),
        rightLabel: matchTypeOfType(type)
      });
    }
  });
}

const FIELD_ACCESSORS = ['->', '::'];
const PREFIX_LOOKBACK = Math.max.apply(null, FIELD_ACCESSORS.map(prefix => prefix.length));

/**
 * Returns true if `bufferPosition` is prefixed with any of the passed `checkPrefixes`.
 */
function hasPrefix(buffer, bufferPosition) {
  const priorChars = buffer.getTextInRange(new (_simpleTextBuffer || _load_simpleTextBuffer()).Range(new (_simpleTextBuffer || _load_simpleTextBuffer()).Point(bufferPosition.row, bufferPosition.column - PREFIX_LOOKBACK), bufferPosition));
  return FIELD_ACCESSORS.some(prefix => priorChars.endsWith(prefix));
}