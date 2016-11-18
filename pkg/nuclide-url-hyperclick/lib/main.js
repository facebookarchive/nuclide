'use strict';
'use babel';

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getHyperclickProvider = getHyperclickProvider;

var _HyperclickProviderHelpers;

function _load_HyperclickProviderHelpers() {
  return _HyperclickProviderHelpers = _interopRequireDefault(require('./HyperclickProviderHelpers'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function getHyperclickProvider() {
  return {
    providerName: 'url-hyperclick',
    // Allow all language-specific providers to take priority.
    priority: 5,
    wordRegExp: /[^\s]+/g,
    getSuggestionForWord: function (textEditor, text, range) {
      return (_HyperclickProviderHelpers || _load_HyperclickProviderHelpers()).default.getSuggestionForWord(textEditor, text, range);
    }
  };
}