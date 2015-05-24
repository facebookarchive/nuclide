'use babel';
/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
/* @flow */

var {QuickSelectionProvider} = require('./QuickSelectionProvider');
var {fileTypeClass} = require('nuclide-atom-helpers');
var {getClient} = require('nuclide-client');
var React = require('react-for-atom');
var path = require('path');

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

  async executeQuery(query: string): Promise<Array<FileResult>> {
    if (query.length === 0) {
      // On no query, return the list of tabs, minus the open tab.
      return this._getOpenTabs().slice(1).map((file) => {return {path: file, matchIndexes: []}});
    } else {
      var queries = atom.project.getDirectories().map((directory) => {
        var directoryPath = directory.getPath();
        var client = getClient(directoryPath);
        return client.searchDirectory(directoryPath, query);
      });

      var outputs = await Promise.all(queries);
      return outputs.reduce((last, next) => last.concat(next), [])
                    .sort((score1, score2) => score2.score - score1.score);
    }
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
