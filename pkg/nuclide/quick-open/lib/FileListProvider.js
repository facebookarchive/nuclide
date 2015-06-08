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
    var filePath = item.path;

    var filenameStart = filePath.lastIndexOf(path.sep);
    var importantIndexes = [filenameStart, filePath.length].concat(item.matchIndexes)
                                                           .sort((index1, index2) => index1 - index2);

    var folderComponents = [];
    var filenameComponents = [];

    var last = -1;
    // Split the path into it's path and directory, with matching characters pulled out and highlighted.
    //
    // When there's no matches, the ouptut is equivalent to just calling path.dirname/basename.
    importantIndexes.forEach((index) => {
      // If the index is after the filename start, push the new text elements
      // into `filenameComponents`, otherwise push them into `folderComponents`.
      var target = index <= filenameStart ? folderComponents : filenameComponents;

      // If there was text before the `index`, push it onto `target` unstyled.
      var previousString = filePath.slice(last + 1, index);
      if (previousString.length !== 0) {
        target.push(<span>{previousString}</span>);
      }

      // Don't put the '/' between the folder path and the filename on either line.
      if (index !== filenameStart && index < filePath.length) {
        var character = filePath.charAt(index);
        target.push(<span className='nuclide-file-search-match'>{character}</span>);
      }

      last = index;
    });

    var filenameClasses = ['primary-line', 'file', 'icon', fileTypeClass(filePath)].join(' ');
    var folderClasses = ['secondary-line', 'path', 'no-icon'].join(' ');

    return (
      <div className={'two-lines nuclide-file-search'}>
        <div className={filenameClasses}>{filenameComponents}</div>
        <div className={folderClasses}>{folderComponents}</div>
      </div>
    );
  };
}

module.exports = FileListProvider;
