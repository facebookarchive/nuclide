'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.activate = activate;
exports.getHyperclickProvider = getHyperclickProvider;
exports.getQuickOpenProvider = getQuickOpenProvider;
exports.deactivate = deactivate;

var _HyperclickHelpers;

function _load_HyperclickHelpers() {
  return _HyperclickHelpers = _interopRequireDefault(require('./HyperclickHelpers'));
}

var _QuickOpenHelpers;

function _load_QuickOpenHelpers() {
  return _QuickOpenHelpers = _interopRequireDefault(require('./QuickOpenHelpers'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 */

function activate(state) {}

function getHyperclickProvider() {
  return {
    priority: 1, // Should be lower than all language-specific providers.
    providerName: 'nuclide-ctags',
    getSuggestionForWord(editor, text, range) {
      return (_HyperclickHelpers || _load_HyperclickHelpers()).default.getSuggestionForWord(editor, text, range);
    }
  };
}

function getQuickOpenProvider() {
  return {
    providerType: 'DIRECTORY',
    name: 'CtagsSymbolProvider',
    display: {
      title: 'Ctags',
      prompt: 'Search Ctags...'
    },
    isEligibleForDirectory(directory) {
      return (_QuickOpenHelpers || _load_QuickOpenHelpers()).default.isEligibleForDirectory(directory);
    },
    getComponentForItem(item) {
      return (_QuickOpenHelpers || _load_QuickOpenHelpers()).default.getComponentForItem(item);
    },
    executeQuery(query, directory) {
      return (_QuickOpenHelpers || _load_QuickOpenHelpers()).default.executeQuery(query, directory);
    }
  };
}

function deactivate() {}