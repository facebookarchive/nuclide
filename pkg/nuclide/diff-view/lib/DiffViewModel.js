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
import type {FileChangeState} from './types';

var {CompositeDisposable, Emitter} = require('atom');
var {repositoryForPath} = require('nuclide-hg-git-bridge');
var {HgStatusToFileChangeStatus, FileChangeStatus} = require('./constants');

var {getFileForPath} = require('nuclide-client');
var logger = require('nuclide-logging').getLogger();

class DiffViewModel {

  _emitter: Emitter;
  _subscriptions: ?CompositeDisposable;
  _activeSubscriptions: ?CompositeDisposable;
  _activeFileState: FileChangeState;
  _newEditor: ?TextEditor;
  _fileChanges: Map<string, number>;
  _uiProviders: Array<Object>;

  constructor(filePath: string, uiProviders: Array<Object>) {
    this._uiProviders = uiProviders;
    var repository: HgRepositoryClient = repositoryForPath(filePath);
    var hgStatusCode = repository.getPathStatus(filePath);
    var statusCode = HgStatusToFileChangeStatus[hgStatusCode] || FileChangeStatus.MODIFIED;
    this._fileChanges = new Map();
    this._emitter = new Emitter();
    this._subscriptions = new CompositeDisposable();
    this._subscriptions.add(repository.onDidChangeStatuses(() => {
      this._updateChangedStatus(repository.getAllPathStatuses());
    }));
    this._updateChangedStatus(repository.getAllPathStatuses());
    this.activateFile(filePath);
  }

  _updateChangedStatus(statuses: {[path: string]: HgStatusCodeNumber}): void {
    this._fileChanges.clear();
    for (var filePath in statuses) {
      var changeStatus = HgStatusToFileChangeStatus[statuses[filePath]];
      if (changeStatus != null) {
        this._fileChanges.set(filePath, changeStatus);
      }
    }
    this._emitter.emit('did-change-status', this._fileChanges);
  }

  activateFile(filePath: string): void {
    if (this._activeSubscriptions) {
      this._activeSubscriptions.dispose();
    }
    var activeSubscriptions = this._activeSubscriptions = new CompositeDisposable();
    this._setActiveFileState({
      filePath,
      oldContents: '',
      newContents: '',
    });
    var file = getFileForPath(filePath);
    if (file) {
      activeSubscriptions.add(file.onDidChange(() => this._updateActiveDiffState(filePath)));
    }
    this._updateActiveDiffState(filePath);
  }

  setNewContents(newContents: string): void {
    var {filePath, oldContents, inlineComponents} = this._activeFileState;
    this._setActiveFileState({
      filePath,
      oldContents,
      newContents,
      inlineComponents,
    });
  }

  getActiveFileState(): FileChangeState {
    return this._activeFileState;
  }

  async _updateActiveDiffState(filePath: string) {
    var {
      committedContents: oldContents,
      filesystemContents: newContents,
    } = await this._fetchHgDiff(filePath);
    this._setActiveFileState({
      filePath,
      oldContents,
      newContents,
    });
    var inlineComponents = await this._fetchInlineComponents();
    this._setActiveFileState({
      filePath,
      oldContents,
      newContents,
      inlineComponents,
    });
  }

  _setActiveFileState(state: FileChangeState): void {
    this._activeFileState = state;
    this._emitter.emit('active-file-update', state);
  }

  async _fetchHgDiff(filePath: string): Promise<void> {
    // Calling atom.project.repositoryForDirectory gets the real path of the directory,
    // which is another round-trip and calls the repository providers to get an existing repository.
    // Instead, the first match of the filtering here is the only possible match.
    var repository: HgRepositoryClient = repositoryForPath(filePath);

    // TODO(most): move repo type check error handling up the stack before creating the the view.
    if (!repository || repository.getType() !== 'hg') {
      var type = repository ? repository.getType() : 'no repository';
      throw new Error(`Diff view only supports hg repositories right now: found ${type}` );
    }
    var committedContentsPromise = repository.fetchFileContentAtRevision(filePath)
      // If the file didn't exist on the previous revision, return empty contents.
      .then(contents => contents || '', err => '');

    var {getClient} = require('nuclide-client');
    var {getPath} = require('nuclide-remote-uri');

    var client = getClient(filePath);
    if (!client) {
      throw new Error('Nuclide client not found.');
    }
    var localFilePath = getPath(filePath);
    var filesystemContentsPromise = client.readFile(localFilePath, 'utf8')
      // If the file was removed, return empty contents.
      .then(contents => contents || '', err => '');

    var [
      committedContents,
      filesystemContents,
    ] = await Promise.all([committedContentsPromise, filesystemContentsPromise]);
    return {
      committedContents,
      filesystemContents,
    };
  }

  async saveActiveFile(): Promise<void> {
    var {filePath, newContents} = this._activeFileState;
    var activeFile = getFileForPath(filePath);
    if (!activeFile) {
      return logger.error('No diff file to save:', filePath);
    }
    await activeFile.write(newContents);
  }

  onDidChangeStatus(callback: () => void): atom$Disposable {
    return this._emitter.on('did-change-status', callback);
  }

  onActiveFileUpdates(callback: () => void): atom$Disposable {
    return this._emitter.on('active-file-update', callback);
  }

  async _fetchInlineComponents(): Promise<Array<Object>> {
    var {filePath} = this._activeFileState;
    var uiElementPromises = this._uiProviders.map(provider => provider.composeUiElements(filePath));
    var uiComponentLists = await Promise.all(uiElementPromises);
    // Flatten uiComponentLists from list of lists of components to a list of components.
    var uiComponents = [].concat.apply([], uiComponentLists);
    return uiComponents;
  }

  getFileChanges(): Map<string, number> {
    return this._fileChanges;
  }

  onDidDestroy(callback: () => void): atom$Disposable {
    return this._emitter.on('did-destroy', callback);
  }

  destroy(): void {
    this._dispose();
    this._emitter.emit('did-destroy');
  }

  _dispose(): void {
    if (this._subscriptions) {
      this._subscriptions.dispose();
      this._subscriptions = null;
    }
    if (this._activeSubscriptions) {
      this._activeSubscriptions.dispose();
      this._activeSubscriptions = null;
    }
  }
}

module.exports = DiffViewModel;
