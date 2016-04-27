var _nuclideCommons = require('../../nuclide-commons');

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _nuclideFuzzyNative = require('../../nuclide-fuzzy-native');

// Returns paths of currently opened editor tabs.
function getOpenTabsMatching(query) {
  var matcher = new _nuclideFuzzyNative.Matcher(_nuclideCommons.array.compact(atom.workspace.getTextEditors().map(function (editor) {
    return editor.getPath();
  })));
  return matcher.match(query, { recordMatchIndexes: true }).map(function (result) {
    return {
      path: result.value,
      score: result.score,
      matchIndexes: result.matchIndexes
    };
  });
}

var OpenFileListProvider = {

  getName: function getName() {
    return 'OpenFileListProvider';
  },

  getProviderType: function getProviderType() {
    return 'GLOBAL';
  },

  getDebounceDelay: function getDebounceDelay() {
    return 0;
  },

  isRenderable: function isRenderable() {
    return true;
  },

  getAction: function getAction() {
    return 'nuclide-open-filenames-provider:toggle-provider';
  },

  getPromptText: function getPromptText() {
    return 'Search names of open files';
  },

  getTabTitle: function getTabTitle() {
    return 'Open Files';
  },

  executeQuery: function executeQuery(query) {
    return Promise.resolve(getOpenTabsMatching(query));
  }

};

module.exports = OpenFileListProvider;