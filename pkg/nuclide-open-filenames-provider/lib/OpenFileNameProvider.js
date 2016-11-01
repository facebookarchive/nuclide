'use strict';
'use babel';

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _collection;

function _load_collection() {
  return _collection = require('../../commons-node/collection');
}

var _nuclideFuzzyNative;

function _load_nuclideFuzzyNative() {
  return _nuclideFuzzyNative = require('../../nuclide-fuzzy-native');
}

// Returns paths of currently opened editor tabs.
function getOpenTabsMatching(query) {
  const matcher = new (_nuclideFuzzyNative || _load_nuclideFuzzyNative()).Matcher((0, (_collection || _load_collection()).arrayCompact)(atom.workspace.getTextEditors().map(editor => editor.getPath())));
  return matcher.match(query, { recordMatchIndexes: true }).map(result => ({
    path: result.value,
    score: result.score,
    matchIndexes: result.matchIndexes
  }));
}

const OpenFileListProvider = {
  getName: function () {
    return 'OpenFileListProvider';
  },
  getProviderType: function () {
    return 'GLOBAL';
  },
  getDebounceDelay: function () {
    return 0;
  },
  isRenderable: function () {
    return true;
  },
  getAction: function () {
    return 'nuclide-open-filenames-provider:toggle-provider';
  },
  getPromptText: function () {
    return 'Search names of open files';
  },
  getTabTitle: function () {
    return 'Open Files';
  },
  executeQuery: function (query) {
    return Promise.resolve(getOpenTabsMatching(query));
  }
};

module.exports = OpenFileListProvider;