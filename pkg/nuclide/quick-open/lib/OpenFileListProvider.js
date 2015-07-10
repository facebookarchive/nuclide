'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var {QuickSelectionProvider} = require('./QuickSelectionProvider');
var QuickSelectionProvider = require('./QuickSelectionProvider');
var FileResultComponent = require('./FileResultComponent');

var OPENFILE_SEARCH_PROVIDER = 'openfiles';

class OpenFileListProvider extends QuickSelectionProvider {

  // Returns the currently opened tabs, ordered from most recently opened to least recently opened.
  static getOpenTabsMatching(query: string): Array<{path: string; matchIndexes: Array}> {
    var seenPaths = {};
    return atom.workspace.getTextEditors()
      .sort((a,b) => b.lastOpened - a.lastOpened)
      .map((editor) => editor.getPath())
      .filter(filePath => {
        if (
          (query.length && !(new RegExp(query, 'i')).test(filePath)) ||
          seenPaths[filePath]
        ) {
          return false;
        }
        seenPaths[filePath] = true;
        return true;
      })
      .map(filePath => ({path: filePath, matchIndexes: []}));
  }

  getDebounceDelay(): number {
    return 0;
  }

  getPromptText() {
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
  };
}

module.exports = OpenFileListProvider;
