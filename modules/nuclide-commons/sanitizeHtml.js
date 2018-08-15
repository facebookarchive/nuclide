"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = sanitizeHtml;

function _dompurify() {
  const data = _interopRequireDefault(require("dompurify"));

  _dompurify = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 *  strict-local
 * @format
 */
// flowlint-line untyped-import:off
_dompurify().default.addHook('beforeSanitizeElements', node => {
  // Add newlines where we see `<p>` and `<br />` tags.
  if (node && node.nodeName === 'BR') {
    const parent = node.parentNode;

    if (parent != null) {
      parent.insertBefore(document.createTextNode('\n'), node);
    }
  }

  if (node && node.nodeName === 'P') {
    node.textContent = '\n' + node.textContent;
  }
});
/**
 * Sanitize a message for display in a notification. This removes HTML but also tries to be smart
 * about whitespace.
 */


function sanitizeHtml(message, options) {
  // Remove the HTML.
  let withoutTags = _dompurify().default.sanitize(message, {
    ALLOWED_TAGS: []
  }); // Compress the whitespace.


  if (options === null || options === void 0 ? void 0 : options.condenseWhitespaces) {
    withoutTags = withoutTags.replace(/(?:\s*\n\s*)+/g, '\n').replace(/[ \t]+/g, ' ');
  }

  return withoutTags.trim();
}