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
var {fileTypeClass} = require('nuclide-atom-helpers');
var {getClient} = require('nuclide-client');
var React = require('react-for-atom');
var path = require('path');
var {getClient} = require('nuclide-client');
var QuickSelectionProvider = require('./QuickSelectionProvider');
var FileResultComponent = require('./FileResultComponent');

var OPENFILE_SEARCH_PROVIDER = 'openfiles';

class OpenFileListProvider extends QuickSelectionProvider {

  // Returns the currently opened tabs, ordered from most recently opened to least recently opened.
  static getOpenTabsMatching(query: string): Array<string> {
    return atom.workspace.getTextEditors()
     .sort((a,b) => b.lastOpened - a.lastOpened)
     .map((editor) => editor.getPath())
     .filter(path => !query.length || (new RegExp(query, 'i')).test(path))
     .map((file) => ({path: file, matchIndexes: []}));
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
