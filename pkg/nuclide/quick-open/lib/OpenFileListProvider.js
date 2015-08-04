'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import type {TextEditor} from 'atom';

var QuickSelectionProvider = require('./QuickSelectionProvider');
var FileResultComponent = require('./FileResultComponent');

var OPENFILE_SEARCH_PROVIDER = 'openfiles';

class OpenFileListProvider extends QuickSelectionProvider {

  // Returns the currently opened tabs, ordered from most recently opened to least recently opened.
  static getOpenTabsMatching(query: string): Array<{path: string; matchIndexes: Array<number>}> {
    var seenPaths: {[key: string]: boolean} = {};
    return atom.workspace.getTextEditors()
      .sort((a: TextEditor, b: TextEditor) => {
        // Note that the lastOpened property is not a standard field of TextEditor, but an expando
        // property added via the fuzzy-finder package:
        // https://github.com/atom/fuzzy-finder/blob/00195eb4/lib/main.coffee#L31
        if (typeof a.lastOpened === 'number' && typeof b.lastOpened === 'number') {
          return b.lastOpened - a.lastOpened;
        } else {
          return 0;
        }
      })
      .map((editor: TextEditor): ?string => editor.getPath())
      .filter((filePath: ?string) => {
        if (
          filePath == null || // This is true for "untitled" tabs.
          (query.length && !(new RegExp(query, 'i')).test(filePath)) ||
          seenPaths[filePath]
        ) {
          return false;
        } else {
          seenPaths[filePath] = true;
          return true;
        }
      })
      .map((filePath: string) => ({path: filePath, matchIndexes: []}));
  }

  getDebounceDelay(): number {
    return 0;
  }

  getPromptText(): string {
    return 'Search names of open files';
  }

  async executeQuery(query: string): {[key: string]: Promise<Array<FileResult>>} {
    var openTabs = Promise.resolve({
      results: OpenFileListProvider.getOpenTabsMatching(query)
    });
    var result = {workspace: {}};
    result.workspace[OPENFILE_SEARCH_PROVIDER] = Promise.resolve(openTabs);
    return result;
  }

  static async getOpenTabsForQuery(query: string): {[key: string]: Promise<Array<FileResult>>} {
    var openTabs = Promise.resolve({
      results: this.getOpenTabsMatching(query)
    });
    return Promise.resolve(openTabs);
  }

  getComponentForItem(item: FileResult): ReactElement {
    return FileResultComponent.getComponentForItem(item);
  }
}

module.exports = OpenFileListProvider;
