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
  GroupedResultPromise,
} from './types';

var QuickSelectionProvider = require('./QuickSelectionProvider');
var {fileTypeClass} = require('nuclide-atom-helpers');
var {getClient} = require('nuclide-client');
var React = require('react-for-atom');
var path = require('path');
var {getClient} = require('nuclide-client');
var QuickSelectionProvider = require('./QuickSelectionProvider');
var FileResultComponent = require('./FileResultComponent');

var assign = Object.assign || require('object-assign');
var logger;

function getLogger() {
  if (!logger) {
    logger = require('nuclide-logging').getLogger();
  }
  return logger;
}
class FileListProvider extends QuickSelectionProvider {

  // Returns the currently opened tabs, ordered from most recently opened to least recently opened.
  _getOpenTabs(): Array<string> {
    return atom.workspace.getTextEditors()
                         .sort((a,b) => b.lastOpened - a.lastOpened)
                         .map((editor) => editor.getPath());
  }

  getPromptText() {
    return 'Fuzzy File Name Search';
  }

  async executeQuery(query: string): GroupedResultPromise {
    if (query.length === 0) {
      // On no query, return the list of tabs, minus the open tab.
      return {
        workspace: {
          openfiles: Promise.resolve({
            results: this._getOpenTabs().slice(1).map(
              (file) => {return {path: file, matchIndexes: []}}
            ),
          })
        }
      }
    }
    var queries = atom.project.getDirectories().map(async (directory) => {
      var directoryPath = directory.getPath();
      var basename = directory.getBaseName();
      var client = getClient(directoryPath);

      var searchRequests = {
        filelist: client.searchDirectory(directoryPath, query).then(files => {return {results: files};}),
      };
      return {[basename]: searchRequests};
    });

    var outputs = [];
    try {
      outputs = await Promise.all(queries);
    } catch(e) {
      getLogger().error(e);
    }
    return assign.apply(null, [{}].concat(outputs));
  }

  // Returns a component with the filename on top, and the file's folder on the bottom.
  // Styling based on https://github.com/atom/fuzzy-finder/blob/master/lib/fuzzy-finder-view.coffee
  getComponentForItem(item: FileResult): ReactElement {
    return FileResultComponent.getComponentForItem(item);
  };
}

module.exports = FileListProvider;
