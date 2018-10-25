"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.activate = activate;
exports.getHyperclickProvider = getHyperclickProvider;
exports.getQuickOpenProvider = getQuickOpenProvider;
exports.deactivate = deactivate;

function _HyperclickHelpers() {
  const data = _interopRequireDefault(require("./HyperclickHelpers"));

  _HyperclickHelpers = function () {
    return data;
  };

  return data;
}

function _QuickOpenHelpers() {
  const data = _interopRequireDefault(require("./QuickOpenHelpers"));

  _QuickOpenHelpers = function () {
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
 * 
 * @format
 */
function activate(state) {}

function getHyperclickProvider() {
  return {
    priority: 1,
    // Should be lower than all language-specific providers.
    providerName: 'nuclide-ctags',

    getSuggestionForWord(editor, text, range) {
      return _HyperclickHelpers().default.getSuggestionForWord(editor, text, range);
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
      return _QuickOpenHelpers().default.isEligibleForDirectory(directory);
    },

    getComponentForItem(item) {
      return _QuickOpenHelpers().default.getComponentForItem(item);
    },

    executeQuery(query, directory) {
      return _QuickOpenHelpers().default.executeQuery(query, directory);
    }

  };
}

function deactivate() {}