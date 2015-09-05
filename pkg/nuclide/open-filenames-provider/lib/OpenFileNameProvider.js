'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {
  FileResult,
  Provider,
  ProviderType,
} from 'nuclide-quick-open-interfaces';

// Returns the currently opened tabs, ordered from most recently opened to least recently opened.
function getOpenTabsMatching(query: string): Array<FileResult> {
  var queryRegExp = new RegExp(query, 'i');
  return atom.workspace.getTextEditors()
   .sort((a, b) => b.lastOpened - a.lastOpened)
   .map(editor => editor.getPath())
   .filter(path => !query.length || queryRegExp.test(path))
   .map(file => ({path: file, matchIndexes: []}));
}

var OpenFileListProvider: Provider = {

  getName(): string {
    return 'OpenFileListProvider';
  },

  getProviderType(): ProviderType {
    return 'GLOBAL';
  },

  getDebounceDelay(): number {
    return 0;
  },

  getAction(): string {
    return 'nuclide-open-filenames-provider:toggle-provider';
  },

  getPromptText(): string {
    return 'Search names of open files';
  },

  getTabTitle(): string {
    return 'Open Files';
  },

  executeQuery(query: string): Promise<Array<FileResult>> {
    return Promise.resolve(getOpenTabsMatching(query));
  },

};

module.exports = OpenFileListProvider;
