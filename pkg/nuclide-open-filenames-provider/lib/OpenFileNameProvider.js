'use strict';

var _collection;

function _load_collection() {
  return _collection = require('nuclide-commons/collection');
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
} /**
   * Copyright (c) 2015-present, Facebook, Inc.
   * All rights reserved.
   *
   * This source code is licensed under the license found in the LICENSE file in
   * the root directory of this source tree.
   *
   * 
   * @format
   */

const OpenFileListProvider = {
  providerType: 'GLOBAL',
  name: 'OpenFileListProvider',
  debounceDelay: 0,
  display: {
    title: 'Open Files',
    prompt: 'Search open filenames...',
    action: 'nuclide-open-filenames-provider:toggle-provider'
  },

  isEligibleForDirectories(directories) {
    return Promise.resolve(true);
  },

  executeQuery(query, directories) {
    return Promise.resolve(getOpenTabsMatching(query));
  }
};

// eslint-disable-next-line nuclide-internal/no-commonjs
module.exports = OpenFileListProvider;