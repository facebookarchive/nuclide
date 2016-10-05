Object.defineProperty(exports, '__esModule', {
  value: true
});

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.convertCompletions = convertCompletions;
exports.compareHackCompletions = compareHackCompletions;
exports.hasPrefix = hasPrefix;
exports.findHackPrefix = findHackPrefix;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _simpleTextBuffer2;

function _simpleTextBuffer() {
  return _simpleTextBuffer2 = require('simple-text-buffer');
}

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

var _commonsNodeRange2;

function _commonsNodeRange() {
  return _commonsNodeRange2 = require('../../commons-node/range');
}

var _HackHelpers2;

function _HackHelpers() {
  return _HackHelpers2 = require('./HackHelpers');
}

function convertCompletions(contents, offset, prefix, hackCompletions) {
  if (hackCompletions == null) {
    return [];
  }

  // Filter out the completions that do not contain the prefix as a token in the match text case
  // insentively.
  var tokenLowerCase = prefix.toLowerCase();

  var hackCompletionsComparator = compareHackCompletions(prefix);
  return processCompletions(hackCompletions, contents, offset, prefix)
  // The returned completions may have unrelated results, even though the offset
  // is set on the end of the prefix.
  .filter(function (completion) {
    (0, (_assert2 || _assert()).default)(completion.displayText != null);
    return completion.displayText.toLowerCase().indexOf(tokenLowerCase) >= 0;
  })
  // Sort the auto-completions based on a scoring function considering:
  // case sensitivity, position in the completion, private functions and alphabetical order.
  .sort(function (completion1, completion2) {
    return hackCompletionsComparator(completion1, completion2);
  });
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
  var paramStrings = params.map(function (param) {
    return param.type + ' ' + param.name;
  });
  return '(' + paramStrings.join(', ') + ')';
}

function matchSnippet(name, params) {
  var escapedName = escapeName(name);
  if (params != null) {
    // Construct the snippet: e.g. myFunction(${1:$arg1}, ${2:$arg2});
    var paramsString = params.map(function (param, index) {
      return '${' + (index + 1) + ':' + param.name + '}';
    }).join(', ');
    return escapedName + '(' + paramsString + ')';
  } else {
    return escapedName;
  }
}

// Returns the length of the largest match between a suffix of contents
// and a prefix of match.
function matchLength(contents, match) {
  for (var i = match.length; i > 0; i--) {
    var toMatch = match.substring(0, i);
    if (contents.endsWith(toMatch)) {
      return i;
    }
  }
  return 0;
}

function processCompletions(completionsResponse, contents, offset, defaultPrefix) {
  var contentsLine = contents.substring(contents.lastIndexOf('\n', offset - 1) + 1, offset).toLowerCase();
  return completionsResponse.map(function (completion) {
    var name = completion.name;
    var type = completion.type;
    var func_details = completion.func_details;

    var resultPrefix = contents.substring(offset - matchLength(contentsLine, name.toLowerCase()), offset);
    var commonResult = {
      displayText: name,
      replacementPrefix: resultPrefix === '' ? defaultPrefix : resultPrefix,
      description: matchTypeOfType(type)
    };
    if (func_details != null) {
      return _extends({}, commonResult, {
        snippet: matchSnippet(name, func_details.params),
        leftLabel: func_details.return_type,
        rightLabel: paramSignature(func_details.params),
        type: 'function'
      });
    } else {
      return _extends({}, commonResult, {
        snippet: matchSnippet(name),
        rightLabel: matchTypeOfType(type)
      });
    }
  });
}

var MATCH_PREFIX_CASE_SENSITIVE_SCORE = 6;
var MATCH_PREFIX_CASE_INSENSITIVE_SCORE = 4;
var MATCH_TOKEN_CASE_SENSITIVE_SCORE = 2;
var MATCH_TOKEN_CASE_INSENSITIVE_SCORE = 0;
var MATCH_PRIVATE_FUNCTION_PENALTY = -4;
var MATCH_APLHABETICAL_SCORE = 1;

function compareHackCompletions(token) {
  var tokenLowerCase = token.toLowerCase();

  return function (completion1, completion2) {
    // Prefer completions with larger prefixes.
    (0, (_assert2 || _assert()).default)(completion1.replacementPrefix != null);
    (0, (_assert2 || _assert()).default)(completion2.replacementPrefix != null);
    var prefixComparison = completion2.replacementPrefix.length - completion1.replacementPrefix.length;
    if (prefixComparison !== 0) {
      return prefixComparison;
    }

    (0, (_assert2 || _assert()).default)(completion1.displayText != null);
    (0, (_assert2 || _assert()).default)(completion2.displayText != null);
    var texts = [completion1.displayText, completion2.displayText];
    var scores = texts.map(function (text, i) {
      if (text.startsWith(token)) {
        // Matches starting with the prefix gets the highest score.
        return MATCH_PREFIX_CASE_SENSITIVE_SCORE;
      } else if (text.toLowerCase().startsWith(tokenLowerCase)) {
        // Ignore case score matches gets a good score.
        return MATCH_PREFIX_CASE_INSENSITIVE_SCORE;
      }

      var score = undefined;
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

var FIELD_ACCESSORS = ['->', '::'];
var PREFIX_LOOKBACK = Math.max.apply(null, FIELD_ACCESSORS.map(function (prefix) {
  return prefix.length;
}));

/**
 * Returns true if `bufferPosition` is prefixed with any of the passed `checkPrefixes`.
 */

function hasPrefix(buffer, bufferPosition) {
  var priorChars = buffer.getTextInRange(new (_simpleTextBuffer2 || _simpleTextBuffer()).Range(new (_simpleTextBuffer2 || _simpleTextBuffer()).Point(bufferPosition.row, bufferPosition.column - PREFIX_LOOKBACK), bufferPosition));
  return FIELD_ACCESSORS.some(function (prefix) {
    return priorChars.endsWith(prefix);
  });
}

function findHackPrefix(buffer, position) {
  // We use custom wordRegex to adopt php variables starting with $.
  var currentRange = (0, (_commonsNodeRange2 || _commonsNodeRange()).wordAtPositionFromBuffer)(buffer, position, (_HackHelpers2 || _HackHelpers()).HACK_WORD_REGEX);
  if (currentRange == null) {
    return '';
  }
  // Current word might go beyond the cursor, so we cut it.
  var range = new (_simpleTextBuffer2 || _simpleTextBuffer()).Range(currentRange.range.start, position);
  var prefix = buffer.getTextInRange(range).trim();
  // Prefix could just be $ or ends with string literal.
  if (prefix === '$' || !/[\W]$/.test(prefix)) {
    return prefix;
  } else {
    return '';
  }
}