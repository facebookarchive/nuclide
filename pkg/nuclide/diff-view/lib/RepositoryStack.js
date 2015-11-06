'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {HgRepositoryClient} from 'nuclide-hg-repository-client';
import type {FileChangeStatusValue, HgDiffState} from './types';
import type {NuclideUri} from 'nuclide-remote-uri';

import invariant from 'assert';
import {CompositeDisposable, Emitter} from 'atom';
import {HgStatusToFileChangeStatus} from './constants';
import {getFileSystemServiceByNuclideUri} from 'nuclide-client';

const CHANGE_DIRTY_STATUS_EVENT = 'did-change-dirty-status';

export default class RepositoryStack {

  _emitter: Emitter;
  _subscriptions: CompositeDisposable;
  _dirtyFileChanges: Map<NuclideUri, FileChangeStatusValue>;
  _repository: HgRepositoryClient;

  constructor(repository: HgRepositoryClient) {
    this._repository = repository;
    this._emitter = new Emitter();
    this._subscriptions = new CompositeDisposable();
    this._dirtyFileChanges = new Map();
    this._updateDirtyChangedStatus();
    // Get the initial project status, if it's not already there,
    // triggered by another integration, like the file tree.
    repository.getStatuses([repository.getProjectDirectory()]);
    this._subscriptions.add(
      repository.onDidChangeStatuses(this._updateDirtyChangedStatus.bind(this))
    );
  }

  _updateDirtyChangedStatus(): void {
    this._dirtyFileChanges.clear();
    const statuses = this._repository.getAllPathStatuses();
    for (const filePath in statuses) {
      const changeStatus = HgStatusToFileChangeStatus[statuses[filePath]];
      if (changeStatus != null) {
        this._dirtyFileChanges.set(filePath, changeStatus);
      }
    }
    this._emitter.emit(CHANGE_DIRTY_STATUS_EVENT, this._dirtyFileChanges);
  }

  getDirtyFileChanges(): Map<NuclideUri, FileChangeStatusValue> {
    return this._dirtyFileChanges;
  }

  async fetchHgDiff(filePath: NuclideUri): Promise<HgDiffState> {
    const fileSystemService = getFileSystemServiceByNuclideUri(filePath);
    invariant(fileSystemService);

    const committedContentsPromise = this._repository.fetchFileContentAtRevision(filePath, null)
      // If the file didn't exist on the previous revision, return empty contents.
      .then(contents => contents || '', err => '');

    const localFilePath = require('nuclide-remote-uri').getPath(filePath);
    const filesystemContentsPromise = fileSystemService.readFile(localFilePath)
      // If the file was removed, return empty contents.
      .then(contents => contents.toString('utf8') || '', err => '');

    const [
      committedContents,
      filesystemContents,
    ] = await Promise.all([committedContentsPromise, filesystemContentsPromise]);
    return {
      committedContents,
      filesystemContents,
    };
  }

  onDidChangeDirtyStatus(
    callback: (fileChanges: Map<NuclideUri, FileChangeStatusValue>) => void
  ): atom$Disposable {
    return this._emitter.on(CHANGE_DIRTY_STATUS_EVENT, callback);
  }

  dispose(): void {
    this._subscriptions.dispose();
  }
}
