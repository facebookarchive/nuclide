'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import getPosition from './getPosition';
import getRawPosition from './getRawPosition';

// Accuracy determines how many tokens we look for to guess the position.
const ACCURACIES = [15, 4, 1];
const WHITESPACE = '\\s*';

/**
 * Given the starting source, starting position, and the ending source this
 * function guesses where the cursor should move to.
 */
function updateCursor(
  startSource: string,
  startPosition: {row: number, column: number},
  endSource: string,
): {row: number, column: number} {
  for (const accuracy of ACCURACIES) {
    const result = maybeUpdateCursorWithAccuracy(
      startSource,
      startPosition,
      endSource,
      accuracy,
    );
    if (result) {
      return result;
    }
  }
  // TODO: Guess a little better, perhaps detect line difference or something?
  return startPosition;
}

function maybeUpdateCursorWithAccuracy(
  startSource: string,
  startPosition: {row: number, column: number},
  endSource: string,
  accuracy: number,
): ?{row: number, column: number} {
  const rawStartPosition = getRawPosition(startSource, startPosition);
  const regexParts = [];
  let inWord = false;
  for (
    let i = rawStartPosition - 1, found = 0;
    i >= 0 && found < accuracy;
    i--
  ) {
    const char = startSource.charAt(i);
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
        const escapedChar = char.replace(/[[{()*+?.\\^$|]/g, '\\$&');
        regexParts.unshift(escapedChar + '?');
      }
    }
  }
  const regex = new RegExp(regexParts.join(''));
  const result = regex.exec(endSource);
  if (!result) {
    return null;
  }
  const rawEndPosition = result[0].length + result.index;
  return getPosition(endSource, rawEndPosition);
}

module.exports = updateCursor;
