Object.defineProperty(exports, '__esModule', {
  value: true
});

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

exports.getHyperclickProvider = getHyperclickProvider;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _getSuggestionForWord2 = require('./getSuggestionForWord');

var _getSuggestionForWord3 = _interopRequireDefault(_getSuggestionForWord2);

function getHyperclickProvider() {
  return {
    providerName: 'url-hyperclick',
    // Allow all language-specific providers to take priority.
    priority: 5,
    wordRegExp: /[^\s]+/g,
    getSuggestionForWord: function getSuggestionForWord(textEditor, text, range) {
      return (0, _getSuggestionForWord3.default)(textEditor, text, range);
    }
  };
}