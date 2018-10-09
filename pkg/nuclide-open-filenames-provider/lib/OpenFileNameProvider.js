"use strict";

function _collection() {
  const data = require("../../../modules/nuclide-commons/collection");

  _collection = function () {
    return data;
  };

  return data;
}

function _nuclideFuzzyNative() {
  const data = require("../../../modules/nuclide-fuzzy-native");

  _nuclideFuzzyNative = function () {
    return data;
  };

  return data;
}

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
// Returns paths of currently opened editor tabs.
function getOpenTabsMatching(query) {
  const matcher = new (_nuclideFuzzyNative().Matcher)((0, _collection().arrayCompact)(atom.workspace.getTextEditors().map(editor => editor.getPath())));
  return matcher.match(query, {
    recordMatchIndexes: true
  }).map(result => ({
    resultType: 'FILE',
    path: result.value,
    score: result.score,
    matchIndexes: result.matchIndexes
  }));
}

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

}; // eslint-disable-next-line nuclide-internal/no-commonjs

module.exports = OpenFileListProvider;