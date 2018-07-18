"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getHyperclickProvider = getHyperclickProvider;

function _HyperclickProviderHelpers() {
  const data = _interopRequireDefault(require("./HyperclickProviderHelpers"));

  _HyperclickProviderHelpers = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 *  strict-local
 * @format
 */
function getHyperclickProvider() {
  return {
    providerName: 'url-hyperclick',
    // Allow all language-specific providers to take priority.
    priority: 5,
    wordRegExp: /[^\s]+/g,

    getSuggestionForWord(textEditor, text, range) {
      return _HyperclickProviderHelpers().default.getSuggestionForWord(textEditor, text, range);
    }

  };
}