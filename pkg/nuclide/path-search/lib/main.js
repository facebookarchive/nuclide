'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {Task} from '../../task';
import type {FileSearchResult as FileSearchResultType} from './FileSearch';

export type FileSearchResult = FileSearchResultType;

type DirectoryUri = string;
export type FileSearch = {
  query: (query: string) => Promise<Array<FileSearchResult>>;
  dispose: () => void;
};

let _fileSearchModule: ?string;
async function getFileSearchModule(): Promise<string> {
  if (_fileSearchModule != null) {
    return _fileSearchModule;
  }
  const GK_NATIVE_SEARCH = 'nuclide_file_search_native';
  const GK_TIMEOUT = 2000;
  try {
    const {gatekeeper} = require('../../../fb/gatekeeper');
    if (await gatekeeper.asyncIsGkEnabled(GK_NATIVE_SEARCH, GK_TIMEOUT)) {
      _fileSearchModule = require.resolve('./NativeFileSearch');
      return _fileSearchModule;
    }
  } catch (e) {
    // ignore
  }
  _fileSearchModule = require.resolve('./FileSearch');
  return _fileSearchModule;
}

/**
 * This is an object that lives in the main process that delegates calls to the
 * FileSearch in the forked process.
 */
class MainProcessFileSearch {
  _task: Task;
  _directoryUri: DirectoryUri;

  constructor(task: Task, directoryUri: DirectoryUri) {
    this._task = task;
    this._directoryUri = directoryUri;
  }

  async query(query: string): Promise<Array<FileSearchResult>> {
    return this._task.invokeRemoteMethod({
      file: await getFileSearchModule(),
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

const fileSearchForDirectoryUri: {[key: DirectoryUri]: Promise<MainProcessFileSearch>} = {};

async function newFileSearch(directoryUri: string): Promise<MainProcessFileSearch> {
  const {createTask} = require('../../task');
  const task = createTask();
  await task.invokeRemoteMethod({
    file: await getFileSearchModule(),
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
export function fileSearchForDirectory(directoryUri: string): Promise<FileSearch> {
  if (directoryUri in fileSearchForDirectoryUri) {
    return fileSearchForDirectoryUri[directoryUri];
  }

  const promise = newFileSearch(directoryUri);
  fileSearchForDirectoryUri[directoryUri] = promise;
  return promise;
}
