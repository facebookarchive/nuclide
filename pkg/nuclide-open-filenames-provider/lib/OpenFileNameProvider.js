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
  Provider,
  ProviderType,
} from '../../nuclide-quick-open/lib/types';
import type {
  FileResult,
} from '../../nuclide-quick-open/lib/rpc-types';

import {arrayCompact} from '../../commons-node/collection';
import {Matcher} from '../../nuclide-fuzzy-native';

// Returns paths of currently opened editor tabs.
function getOpenTabsMatching(query: string): Array<FileResult> {
  const matcher = new Matcher(arrayCompact(
    atom.workspace.getTextEditors()
      .map(editor => editor.getPath()),
  ));
  return matcher.match(query, {recordMatchIndexes: true})
    .map(result => ({
      path: result.value,
      score: result.score,
      matchIndexes: result.matchIndexes,
    }));
}

const OpenFileListProvider: Provider = {

  getName(): string {
    return 'OpenFileListProvider';
  },

  getProviderType(): ProviderType {
    return 'GLOBAL';
  },

  getDebounceDelay(): number {
    return 0;
  },

  isRenderable(): boolean {
    return true;
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
