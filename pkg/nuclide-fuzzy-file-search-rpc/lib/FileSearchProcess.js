'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {FileSearchResult as FileSearchResultType} from './FileSearch';

import {getLogger} from '../../nuclide-logging';
import {arrayEqual} from '../../commons-node/collection';
import fsPromise from '../../commons-node/fsPromise';
import Task from '../../nuclide-task';

export type FileSearchResult = FileSearchResultType;

type DirectoryUri = string;

const logger = getLogger();

/**
 * This is an object that lives in the main process that delegates calls to the
 * FileSearch in the forked process.
 */
class FileSearchProcess {
  _task: ?Task;
  _directoryUri: DirectoryUri;
  _ignoredNames: Array<string>;

  constructor(task: Task, directoryUri: DirectoryUri, ignoredNames: Array<string>) {
    this._task = task;
    this._task.onError(buffer => {
      logger.error('File search process crashed with message:', buffer.toString());
      this.dispose();
    });
    this._directoryUri = directoryUri;
    this._ignoredNames = ignoredNames;
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

  getIgnoredNames() {
    return this._ignoredNames;
  }

  dispose() {
    if (this._task != null) {
      delete fileSearchForDirectoryUri[this._directoryUri];
      this._task.dispose();
      this._task = null;
    }
  }
}

const fileSearchForDirectoryUri: {[key: DirectoryUri]: Promise<FileSearchProcess>} = {};

async function newFileSearch(
  directoryUri: string,
  ignoredNames: Array<string>,
): Promise<FileSearchProcess> {
  const exists = await fsPromise.exists(directoryUri);
  if (!exists) {
    throw new Error('Could not find directory to search : ' + directoryUri);
  }

  const stat = await fsPromise.stat(directoryUri);
  if (!stat.isDirectory()) {
    throw new Error('Provided path is not a directory : ' + directoryUri);
  }

  const task = new Task();
  await task.invokeRemoteMethod({
    file: require.resolve('./FileSearch'),
    method: 'initFileSearchForDirectory',
    args: [directoryUri, ignoredNames],
  });
  return new FileSearchProcess(task, directoryUri, ignoredNames);
}

export async function fileSearchForDirectory(
  directoryUri: string,
  ignoredNames: Array<string>,
): Promise<FileSearchProcess> {
  const cached = fileSearchForDirectoryUri[directoryUri];
  if (cached != null) {
    const fileSearch = await cached;
    if (arrayEqual(fileSearch.getIgnoredNames(), ignoredNames)) {
      return fileSearch;
    }
    // In case of a mismatch, dispose and recreate the searcher task.
    fileSearch.dispose();
  }

  const promise = newFileSearch(directoryUri, ignoredNames);
  fileSearchForDirectoryUri[directoryUri] = promise;
  return promise;
}

export async function disposeSearchForDirectory(directoryUri: string): Promise<void> {
  const cached = fileSearchForDirectoryUri[directoryUri];
  if (cached != null) {
    const search = await cached;
    search.dispose();
  }
}
