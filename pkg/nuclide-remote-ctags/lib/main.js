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

exports.activate = activate;
exports.getHyperclickProvider = getHyperclickProvider;
exports.getQuickOpenProvider = getQuickOpenProvider;
exports.deactivate = deactivate;

function activate(state) {}

function getHyperclickProvider() {
  var _require = require('./HyperclickProvider');

  var HyperclickProvider = _require.HyperclickProvider;

  var provider = new HyperclickProvider();
  return {
    priority: 1, // Should be lower than all language-specific providers.
    providerName: 'nuclide-remote-ctags',
    getSuggestionForWord: provider.getSuggestionForWord.bind(provider)
  };
}

function getQuickOpenProvider() {
  return require('./QuickOpenProvider');
}

function deactivate() {}