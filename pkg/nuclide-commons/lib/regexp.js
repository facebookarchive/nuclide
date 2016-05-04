Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.safeRegExpFromString = safeRegExpFromString;

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

/**
 * Escapes non-RegExp-safe characters such as slashes in the query string.
 */

function safeRegExpFromString(query) {
  // Taken from http://stackoverflow.com/questions/6300183/sanitize-string-of-regex-characters-before-regexp-build/6300266#6300266
  var sanitizedQuery = query.replace(/[#-.]|[[-^]|[?|{}]/g, '\\$&');
  return new RegExp(sanitizedQuery, 'i');
}