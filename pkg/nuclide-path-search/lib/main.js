'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {Task} from '../../nuclide-task';
import type {FileSearchResult as FileSearchResultType} from './FileSearch';

import {getLogger} from '../../nuclide-logging';
import {fsPromise} from '../../nuclide-commons';

export type FileSearchResult = FileSearchResultType;

type DirectoryUri = string;
export type FileSearch = {
  query: (query: string) => Promise<Array<FileSearchResult>>;
  dispose: () => void;
};

const logger = getLogger();

/**
 * This is an object that lives in the main process that delegates calls to the
 * FileSearch in the forked process.
 */
class MainProcessFileSearch {
  _task: ?Task;
  _directoryUri: DirectoryUri;

  constructor(task: Task, directoryUri: DirectoryUri) {
    this._task = task;
    this._task.onError(buffer => {
      logger.error('File search process crashed with message:', buffer.toString());
      this.dispose();
    });
    this._directoryUri = directoryUri;
  }

  async query(query: string): Promise<Array<FileSearchResult>> {
    const task = this._task;
    if (task == null) {
      throw new Error('Task has been disposed');
    }
    return task.invokeRemoteMethod({
      file: require.resolve('./FileSearch'),
      method: 'doSearch',
      args: [this._directoryUri, query],
    });
  }

  dispose() {
    if (this._task != null) {
      delete fileSearchForDirectoryUri[this._directoryUri];
      this._task.dispose();
      this._task = null;
    }
  }
}

const fileSearchForDirectoryUri: {[key: DirectoryUri]: Promise<MainProcessFileSearch>} = {};

async function newFileSearch(directoryUri: string): Promise<MainProcessFileSearch> {
  const {createTask} = require('../../nuclide-task');
  const task = createTask();
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
export async function fileSearchForDirectory(directoryUri: string): Promise<FileSearch> {
  if (directoryUri in fileSearchForDirectoryUri) {
    return fileSearchForDirectoryUri[directoryUri];
  }

  const exists = await fsPromise.exists(directoryUri);
  if (!exists) {
    throw new Error('Could not find directory to search : ' + directoryUri);
  }

  const stat = await fsPromise.stat(directoryUri);
  if (!stat.isDirectory()) {
    throw new Error('Provided path is not a directory : ' + directoryUri);
  }

  const promise = newFileSearch(directoryUri);
  fileSearchForDirectoryUri[directoryUri] = promise;
  return promise;
}
