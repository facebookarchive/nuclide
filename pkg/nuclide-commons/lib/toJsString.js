Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.toJsString = toJsString;

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

/**
 * Serialize a JS object in a way that the result is valid JavaScript. Line separator U+2028 and
 * Paragraph Separator U+2029 are the potential issues here, as they can show up in JSON but must be
 * escaped in JS.
 * See http://timelessrepo.com/json-isnt-a-javascript-subset
 */

function toJsString(str) {
  return JSON.stringify(str).replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
}