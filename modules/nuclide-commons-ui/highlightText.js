'use strict';Object.defineProperty(exports, "__esModule", { value: true });exports.default =





















highlightText; // intended to be used as a tagged template literal, where the interpolated
// pieces are highlighted in the returned set of matches:
//
// e.g. highlightText`not highlighted ${'but this is'} and this is not`;
/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 *  strict
 * @format
 */function highlightText(unhighlightedStrings, ...highlightedStrings) {let concattenated = '';const highlightedRanges = [];for (let i = 0; i < unhighlightedStrings.length; i++) {concattenated += unhighlightedStrings[i]; // the two lists of strings may be uneven by one
    if (highlightedStrings[i] != null) {const start = concattenated.length;concattenated += highlightedStrings[i];highlightedRanges.push([start, concattenated.length]);}
  }

  return {
    text: concattenated,
    matchRanges: highlightedRanges };

}