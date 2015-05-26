'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

function isAlphanumeric(character): boolean {
  return /[\w]/.test(character);
}

type QueryScore = {
  value: string;
  score: number;
  matchIndexes: Array<number>;
}

var DEFAULT_PATH_SEPARATOR = require('path').sep;

class QueryItem {
  _lastPathSeparatorIndex: number;
  _skipLocations: Array<number>;
  _string: string;
  _uppercaseString: string;

  constructor(string: string, pathSeparator = DEFAULT_PATH_SEPARATOR: ?string) {
    // If the thing we're querying is a path, assume the filename from the path is more important.
    this._lastPathSeparatorIndex = pathSeparator == null ? -1 : string.lastIndexOf(pathSeparator);
    this._string = string;
    this._uppercaseString = string.toUpperCase();

    /*
     * Caches locations in the string that should yield higher scores if a match overlaps with them.
     *
     * Specifically:
     *   1. Uppercase characters
     *   2. Characters following a non-alphanumeric character (path separators/dashes/spaces)
     */
    this._skipLocations = [];
    for (var i = this._lastPathSeparatorIndex + 1; i < string.length; i++) {
      var char = string.charAt(i);
      var isUppercase = (char === this._uppercaseString.charAt(i));
      if (isUppercase || (isAlphanumeric(char) && !isAlphanumeric(string.charAt(i - 1)))) {
        this._skipLocations.push(i);
      }
    }
  }

  /**
   * Scores this object's string against the query given.
   *
   * Essentally a quick interpretation of:
   * https://github.com/makoConstruct/CleverMatcher
   *
   * The main (minor) changes are adjustments preferring clustered letters,
   * preferring characters appearing in filenames, and making the code less insane to read.
   *
   * No attempt was made to move away from cargo-culting Sublime's
   * nonsense score values or be smarter about recovering in skipMatch.
   *
   * Returns `null` on no match.
   */
  score(query: string): ?QueryScore {
    var uppercaseQuery = query.toUpperCase();
    var matches = this._findSkipMatches(uppercaseQuery) || this._findSubstringMatches(uppercaseQuery);

    if (matches == null || matches[matches.length - 1] < this._lastPathSeparatorIndex) {
      return null;
    }

    var score = 1;
    var lastMatch = -1;
    for (var i = 0; i < matches.length; i++) {
      var match = matches[i];

      var matchScore = 0;
      var skipLocation = this._skipLocations.indexOf(match);
      if (skipLocation !== -1) {
        if (skipLocation === 0) {
          matchScore += 22;
        } else {
          matchScore += 15;
        }
      } else {
        matchScore = 1;
      }

      // Apply a bonus based on how close this match was to the last match.
      matchScore += 15 / (match - lastMatch);

      if (match > this._lastPathSeparatorIndex) {
        matchScore *= 2;
      }

      score += matchScore;
      lastMatch = match;
    }

    return {score, value: this._string, matchIndexes: matches};
  }

  /**
   * Attempts to match using _skipLocations as a shortcut to quickly
   * match locations in the string that should score well.
   *
   * Currently fails if it ever doesn't find a match after skipping and makes no attempt to recover.
   *
   * Returns the indexes of each charater matched in the string.
   */
   _findSkipMatches(query: string): ?Array<number> {
    var matches = [];
    var lastHit = -1;

    /*
     * This seems like an ideal place for a for..of loop.  -It is not-, because
     * V8 will bail on optimizing this code, making its performace excruciating.
     */
    for (var i = 0; i < query.length; i++) {
      var queryChar = query.charAt(i);
      var foundSkip = false;
      for (var j = 0; j < this._skipLocations.length; j++) {
        var skipLocation = this._skipLocations[j];
        if (skipLocation > lastHit && this._uppercaseString.charAt(skipLocation) == queryChar) {
          matches.push(skipLocation);
          lastHit = skipLocation;
          foundSkip = true;
          break;
        }
      }

      if (foundSkip === false) {
        var startIndex = Math.max(lastHit + 1, this._lastPathSeparatorIndex);
        lastHit = this._uppercaseString.indexOf(queryChar, startIndex);
        if (lastHit === -1) {
          return null;
        }
        matches.push(lastHit);
      }
    }

    return matches;
  }

  /**
   * Dumb matching that just checks that all characters are present in the string.
   *
   * Goes in reverse to attempt to get as many characters in the filename as possible.
   *
   * Returns the indexes of each charater matched in the string.
   */
  _findSubstringMatches(query: string): ?Array<number> {
    var matches = new Array(query.length);
    var lastHit = this._uppercaseString.length;

    /*
     * This seems like an ideal place for a for..of loop.  -It is not-, because
     * V8 will bail on optimizing this code, making its performace excruciating.
     */
    for (var i = query.length - 1; i >= 0; i--) {
      var queryChar = query.charAt(i);
      lastHit = this._uppercaseString.lastIndexOf(queryChar, lastHit - 1);
      if (lastHit === -1) {
        return null;
      }
      matches[i] = lastHit;
    }

    return matches;
  }
}

module.exports = QueryItem;
