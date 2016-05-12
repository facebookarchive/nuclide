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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _HyperclickHelpers2;

function _HyperclickHelpers() {
  return _HyperclickHelpers2 = _interopRequireDefault(require('./HyperclickHelpers'));
}

var _QuickOpenHelpers2;

function _QuickOpenHelpers() {
  return _QuickOpenHelpers2 = _interopRequireDefault(require('./QuickOpenHelpers'));
}

function activate(state) {}

function getHyperclickProvider() {
  return {
    priority: 1, // Should be lower than all language-specific providers.
    providerName: 'nuclide-remote-ctags',
    getSuggestionForWord: function getSuggestionForWord(editor, text, range) {
      return (_HyperclickHelpers2 || _HyperclickHelpers()).default.getSuggestionForWord(editor, text, range);
    }
  };
}

function getQuickOpenProvider() {
  return {
    getProviderType: function getProviderType() {
      return 'DIRECTORY';
    },
    getName: function getName() {
      return 'CtagsSymbolProvider';
    },
    isRenderable: function isRenderable() {
      return true;
    },
    getTabTitle: function getTabTitle() {
      return 'Ctags';
    },
    isEligibleForDirectory: function isEligibleForDirectory(directory) {
      return (_QuickOpenHelpers2 || _QuickOpenHelpers()).default.isEligibleForDirectory(directory);
    },
    getComponentForItem: function getComponentForItem(item) {
      return (_QuickOpenHelpers2 || _QuickOpenHelpers()).default.getComponentForItem(item);
    },
    executeQuery: function executeQuery(query, directory) {
      return (_QuickOpenHelpers2 || _QuickOpenHelpers()).default.executeQuery(query, directory);
    }
  };
}

function deactivate() {}