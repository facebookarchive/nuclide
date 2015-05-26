'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

type DirectoryUri = string;
type FileSearch = {
  query: (query: string) => Promise<Array<FileSearchResult>>;
  dispose: () => void;
};
var fileSearchForDirectoryUri: {[key: DirectoryUri]: Promise<MainProcessFileSearch>} = {};

/**
 * This is an object that lives in the main process that delegates calls to the
 * FileSearch in the forked process.
 */
class MainProcessFileSearch {
  constructor(task: Task, directoryUri: DirectoryUri) {
    this._task = task;
    this._directoryUri = directoryUri;
  }

  query(query: string): Promise<Array<FileSearchResult>> {
    return this._task.invokeRemoteMethod({
      file: require.resolve('./FileSearch'),
      method: 'doSearch',
      args: [this._directoryUri, query],
    });
  }

  dispose() {
    if (fileSearchForDirectoryUri[this._directoryUri] === this) {
      delete fileSearchForDirectoryUri[this._directoryUri];
    }
    this._task.dispose();
  }
}

async function newFileSearch(directoryUri: string): Promise<MainProcessFileSearch> {
  var {createTask} = require('nuclide-task');
  var task = createTask();
  await task.invokeRemoteMethod({
    file: require.resolve('./FileSearch'),
    method: 'initFileSearchForDirectory',
    args: [directoryUri],
  });
  return new MainProcessFileSearch(task, directoryUri);
}

/**
 * Currently, all the caller cares about is that the Promise resolves to an
 * object with a query() method.
 *
 * TODO(mbolin): Caller should also invoke dispose(), as appropriate.
 */
function fileSearchForDirectory(directoryUri: string): Promise<FileSearch> {
  if (directoryUri in fileSearchForDirectoryUri) {
    return fileSearchForDirectoryUri[directoryUri];
  }

  var promise = newFileSearch(directoryUri);
  fileSearchForDirectoryUri[directoryUri] = promise;
  return promise;
}

module.exports = {
  fileSearchForDirectory,
};
