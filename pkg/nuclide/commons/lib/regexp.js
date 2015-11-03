'use babel';
/* @flow */

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
export function safeRegExpFromString(query: string): RegExp {
  // Taken from http://stackoverflow.com/questions/6300183/sanitize-string-of-regex-characters-before-regexp-build/6300266#6300266
  const sanitizedQuery = query.replace(/[#-.]|[[-^]|[?|{}]/g, '\\$&');
  return new RegExp(sanitizedQuery, 'i');
}
