function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _getPosition2;

function _getPosition() {
  return _getPosition2 = _interopRequireDefault(require('./getPosition'));
}

var _getRawPosition2;

function _getRawPosition() {
  return _getRawPosition2 = _interopRequireDefault(require('./getRawPosition'));
}

// Accuracy determines how many tokens we look for to guess the position.
var ACCURACIES = [15, 4, 1];
var WHITESPACE = '\\s*';

/**
 * Given the starting source, starting position, and the ending source this
 * function guesses where the cursor should move to.
 */
function updateCursor(startSource, startPosition, endSource) {
  for (var accuracy of ACCURACIES) {
    var result = maybeUpdateCursorWithAccuracy(startSource, startPosition, endSource, accuracy);
    if (result) {
      return result;
    }
  }
  // TODO: Guess a little better, perhaps detect line difference or something?
  return startPosition;
}

function maybeUpdateCursorWithAccuracy(startSource, startPosition, endSource, accuracy) {
  var rawStartPosition = (0, (_getRawPosition2 || _getRawPosition()).default)(startSource, startPosition);
  var regexParts = [];
  var inWord = false;
  for (var i = rawStartPosition - 1, found = 0; i >= 0 && found < accuracy; i--) {
    var char = startSource.charAt(i);
    if (/\s/.test(char)) {
      if (regexParts[0] !== WHITESPACE) {
        regexParts.unshift(WHITESPACE);
      }
      if (inWord) {
        found++;
        inWord = false;
      }
    } else {
      // TODO: Add optional catch all at word boundaries to account for adding
      // commas in a transform. Is this even necessary?
      if (/\w/.test(char)) {
        // We are starting a word so there can be whitespace.
        if (!inWord) {
          // We don't need to add it if it's already there, or this is the
          // very first regex part.
          if (regexParts[0] !== WHITESPACE && regexParts.length > 0) {
            regexParts.unshift(WHITESPACE);
          }
        }
        inWord = true;
        regexParts.unshift(char);
      } else {
        // We are ending a word so there can be whitespace.
        if (inWord) {
          regexParts.unshift(WHITESPACE);
          found++;
          inWord = false;
        }
        var escapedChar = char.replace(/[[{()*+?.\\^$|]/g, '\\$&');
        regexParts.unshift(escapedChar + '?');
      }
    }
  }
  var regex = new RegExp(regexParts.join(''));
  var result = regex.exec(endSource);
  if (!result) {
    return null;
  }
  var rawEndPosition = result[0].length + result.index;
  return (0, (_getPosition2 || _getPosition()).default)(endSource, rawEndPosition);
}

module.exports = updateCursor;