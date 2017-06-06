'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.compareHackCompletions = compareHackCompletions;
exports.sortAndFilterCompletions = sortAndFilterCompletions;
exports.getResultPrefix = getResultPrefix;
exports.getReplacementPrefix = getReplacementPrefix;
exports.findHackPrefix = findHackPrefix;

var _simpleTextBuffer;

function _load_simpleTextBuffer() {
  return _simpleTextBuffer = require('simple-text-buffer');
}

var _range;

function _load_range() {
  return _range = require('nuclide-commons/range');
}

var _constants;

function _load_constants() {
  return _constants = require('./constants');
}

const MATCH_PREFIX_CASE_SENSITIVE_SCORE = 6; /**
                                              * Copyright (c) 2015-present, Facebook, Inc.
                                              * All rights reserved.
                                              *
                                              * This source code is licensed under the license found in the LICENSE file in
                                              * the root directory of this source tree.
                                              *
                                              * 
                                              * @format
                                              */

const MATCH_PREFIX_CASE_INSENSITIVE_SCORE = 4;
const MATCH_TOKEN_CASE_SENSITIVE_SCORE = 2;
const MATCH_TOKEN_CASE_INSENSITIVE_SCORE = 0;
const MATCH_PRIVATE_FUNCTION_PENALTY = -4;
const MATCH_APLHABETICAL_SCORE = 1;

function compareHackCompletions(token) {
  const tokenLowerCase = token.toLowerCase();

  return (completion1, completion2) => {
    // Prefer completions with larger prefixes.
    if (!(completion1.replacementPrefix != null)) {
      throw new Error('Invariant violation: "completion1.replacementPrefix != null"');
    }

    if (!(completion2.replacementPrefix != null)) {
      throw new Error('Invariant violation: "completion2.replacementPrefix != null"');
    }

    const prefixComparison = completion2.replacementPrefix.length - completion1.replacementPrefix.length;
    if (prefixComparison !== 0) {
      return prefixComparison;
    }

    if (!(completion1.displayText != null)) {
      throw new Error('Invariant violation: "completion1.displayText != null"');
    }

    if (!(completion2.displayText != null)) {
      throw new Error('Invariant violation: "completion2.displayText != null"');
    }

    const texts = [completion1.displayText, completion2.displayText];
    const scores = texts.map((text, i) => {
      if (text.startsWith(token)) {
        // Matches starting with the prefix gets the highest score.
        return MATCH_PREFIX_CASE_SENSITIVE_SCORE;
      } else if (text.toLowerCase().startsWith(tokenLowerCase)) {
        // Ignore case score matches gets a good score.
        return MATCH_PREFIX_CASE_INSENSITIVE_SCORE;
      }

      let score;
      if (text.indexOf(token) !== -1) {
        // Small score for a match that contains the token case-sensitive.
        score = MATCH_TOKEN_CASE_SENSITIVE_SCORE;
      } else {
        // Zero score for a match that contains the token without case-sensitive matching.
        score = MATCH_TOKEN_CASE_INSENSITIVE_SCORE;
      }

      // Private functions gets negative score.
      if (text.startsWith('_')) {
        score += MATCH_PRIVATE_FUNCTION_PENALTY;
      }
      return score;
    });
    // Finally, consider the alphabetical order, but not higher than any other score.
    if (texts[0] < texts[1]) {
      scores[0] += MATCH_APLHABETICAL_SCORE;
    } else {
      scores[1] += MATCH_APLHABETICAL_SCORE;
    }
    return scores[1] - scores[0];
  };
}

// Returns the length of the largest match between a suffix of contents
// and a prefix of match.
function matchLength(contents, match) {
  for (let i = match.length; i > 0; i--) {
    const toMatch = match.substring(0, i);
    if (contents.endsWith(toMatch)) {
      return i;
    }
  }
  return 0;
}

function sortAndFilterCompletions(completions, prefix) {
  // Filter out the completions that do not contain the prefix as a token in the match text case
  // insentively.
  const tokenLowerCase = prefix.toLowerCase();

  const hackCompletionsComparator = compareHackCompletions(prefix);
  return completions
  // The returned completions may have unrelated results, even though the offset
  // is set on the end of the prefix.
  .filter(completion => {
    if (!(completion.displayText != null)) {
      throw new Error('Invariant violation: "completion.displayText != null"');
    }

    return completion.displayText.toLowerCase().indexOf(tokenLowerCase) >= 0;
  })
  // Sort the auto-completions based on a scoring function considering:
  // case sensitivity, position in the completion, private functions and alphabetical order.
  .sort((completion1, completion2) => hackCompletionsComparator(completion1, completion2));
}

function getResultPrefix(contents, offset, name) {
  const contentsLine = contents.substring(contents.lastIndexOf('\n', offset - 1) + 1, offset).toLowerCase();

  return contents.substring(offset - matchLength(contentsLine, name.toLowerCase()), offset);
}

function getReplacementPrefix(resultPrefix, defaultPrefix) {
  return resultPrefix === '' ? defaultPrefix : resultPrefix;
}

function findHackPrefix(buffer, position) {
  // We use custom wordRegex to adopt php variables starting with $.
  const currentRange = (0, (_range || _load_range()).wordAtPositionFromBuffer)(buffer, new (_simpleTextBuffer || _load_simpleTextBuffer()).Point(position.row, Math.max(0, position.column - 1)), (_constants || _load_constants()).HACK_WORD_REGEX);
  if (currentRange == null) {
    return '';
  }
  // Current word might go beyond the cursor, so we cut it.
  const range = new (_simpleTextBuffer || _load_simpleTextBuffer()).Range(currentRange.range.start, position);
  const prefix = buffer.getTextInRange(range).trim();
  // Prefix could just be $ or ends with string literal.
  if (prefix === '$' || !/[\W]$/.test(prefix)) {
    return prefix;
  } else {
    return '';
  }
}