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

// TODO(jxg): Please fix the major issues here:
//
// 1. This subscription should be set up eagerly. The first time the file opener is loaded, this
// subscription has not been created yet, so the order in the Open Files list does not correspond
// to the order in which things have been focused. The Filenames provider also needs the ability to
// start indexing before the first query is made, so it seems like all providers should be allowed
// to run some initialization logic.
//
// 2. When I open the quick open dialog and navigate to Open Files, creating this subscription,
// close it, focus some files, and then open it again, there is still no update to the order of the
// files in the list (for an empty query). I suspect some results are being incorrectly cached.
//
// 3. itemToLastOpened should be an instance field of OpenFileListProvider. The only reason it isn't
// right now is because getOpenTabsMatching() needs it, and it is a static method. It appears that
// providers are currently created via reflection in SearchResultManager. This should be changed to
// more properly manage the lifecycle of these provider instances. For example, currently nothing
// is reponsible for invoking the dispose() method of the observeActivePaneItem subscription.
var itemToLastOpened: WeakMap<mixed, number> = new WeakMap();
if (atom.workspace) {
  // Apparently atom.workspace is not defined at this point when `apm test` is run.
  // This is another reason why this should be set up in the constructor of OpenFileListProvider.
  atom.workspace.observeActivePaneItem(item => {
    if (item === undefined) {
      // Ideally, we would confirm that we are in a test environment:
      // https://discuss.atom.io/t/how-do-you-determine-if-your-code-is-running-under-apm-test/19831
      require('nuclide-logging').getLogger().error('undefined pane: is this running in a test?');
      return;
    }
    itemToLastOpened.set(item, Date.now());
  });
}

class OpenFileListProvider extends QuickSelectionProvider {

  // Returns the currently opened tabs, ordered from most recently opened to least recently opened.
  static getOpenTabsMatching(query: string): Array<{path: string; matchIndexes: Array<number>}> {
    var seenPaths: {[key: string]: boolean} = {};
    return atom.workspace.getTextEditors()
      .sort((a: TextEditor, b: TextEditor) => {
        // TextEditors that have been opened most recently should appear at the top of the list.
        // There will be no entry in itemToLastOpened if the editor has never been focused.
        var aLastOpened = itemToLastOpened.get(a);
        var bLastOpened = itemToLastOpened.get(b);
        var aIsNumber = typeof aLastOpened === 'number';
        var bIsNumber = typeof bLastOpened === 'number';
        if (aIsNumber && !bIsNumber) {
          return -1;
        } else if (!aIsNumber && bIsNumber) {
          return 1;
        } else if (aIsNumber && bIsNumber) {
          var delta = bLastOpened - aLastOpened;
          if (delta !== 0) {
            return delta;
          }
        }

        // Use TextEditor::getPath() as a tiebreaker.
        var aPath = a.getPath();
        var bPath = b.getPath();
        var aHasPath = aPath != null;
        var bHasPath = bPath != null;
        if (aHasPath && bHasPath) {
          return aPath.localeCompare(bPath);
        } else if (aHasPath) {
          return -1;
        } else if (bHasPath) {
          return 1;
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
