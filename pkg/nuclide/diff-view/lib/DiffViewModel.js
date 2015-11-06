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
import type {FileChangeState, FileChangeStatusValue} from './types';
import type {NuclideUri} from 'nuclide-remote-uri';

import invariant from 'assert';
import {CompositeDisposable, Emitter} from 'atom';
import {repositoryForPath} from 'nuclide-hg-git-bridge';
import {HgStatusToFileChangeStatus} from './constants';
import {track, trackTiming} from 'nuclide-analytics';
import {getFileForPath, getFileSystemServiceByNuclideUri} from 'nuclide-client';
import {getLogger} from 'nuclide-logging';

const logger = getLogger();
const CHANGE_STATUS_EVENT = 'did-change-status';
const ACTIVE_FILE_UPDATE_EVENT = 'active-file-update';

type HgDiffState = {
  committedContents: string;
  filesystemContents: string;
};

class DiffViewModel {

  _emitter: Emitter;
  _subscriptions: CompositeDisposable;
  _activeSubscriptions: ?CompositeDisposable;
  _activeFileState: FileChangeState;
  _newEditor: ?TextEditor;
  _fileChanges: Map<NuclideUri, FileChangeStatusValue>;
  _uiProviders: Array<Object>;
  _repositorySubscriptions: Map<HgRepositoryClient, atom$Disposable>;
  _boundHandleInternalError: Function;

  constructor(uiProviders: Array<Object>) {
    this._uiProviders = uiProviders;
    this._fileChanges = new Map();
    this._emitter = new Emitter();
    this._boundHandleInternalError = this._handleInternalError.bind(this);
    this._subscriptions = new CompositeDisposable();
    this._repositorySubscriptions = new Map();
    this._updateRepositories();
    this._subscriptions.add(atom.project.onDidChangePaths(this._updateRepositories.bind(this)));
    this._setActiveFileState({
      filePath: '',
      oldContents: '',
      newContents: '',
    });
  }

  _updateRepositories(): void {
    for (const subscription of this._repositorySubscriptions.values()) {
      subscription.dispose();
    }
    this._repositorySubscriptions.clear();
    atom.project.getRepositories()
      .filter(repository => repository != null && repository.getType() === 'hg')
      .forEach(repository => {
        const hgRepository = ((repository: any): HgRepositoryClient);
        // Get the initial project status, if it's not already there,
        // triggered by another integration, like the file tree.
        hgRepository.getStatuses([hgRepository.getProjectDirectory()]);
        this._repositorySubscriptions.set(
          hgRepository, hgRepository.onDidChangeStatuses(this._updateChangedStatus.bind(this))
        );
      });
    this._updateChangedStatus();
  }

  _updateChangedStatus(): void {
    this._fileChanges.clear();
    for (const repository of this._repositorySubscriptions.keys()) {
      const statuses = repository.getAllPathStatuses();
      for (const filePath in statuses) {
        const changeStatus = HgStatusToFileChangeStatus[statuses[filePath]];
        if (changeStatus != null) {
          this._fileChanges.set(filePath, changeStatus);
        }
      }
    }
    this._emitter.emit(CHANGE_STATUS_EVENT, this._fileChanges);
  }

  activateFile(filePath: NuclideUri): void {
    if (this._activeSubscriptions) {
      this._activeSubscriptions.dispose();
    }
    const activeSubscriptions = this._activeSubscriptions = new CompositeDisposable();
    this._setActiveFileState({
      filePath: '',
      oldContents: '',
      newContents: '',
    });
    const file = getFileForPath(filePath);
    if (file) {
      activeSubscriptions.add(file.onDidChange(() => {
        this._onDidFileChange(filePath).catch(this._boundHandleInternalError);
      }));
    }
    track('diff-view-open-file', {filePath});
    this._updateActiveDiffState(filePath).catch(this._boundHandleInternalError);
  }

  @trackTiming('diff-view.file-change-update')
  async _onDidFileChange(filePath: NuclideUri): Promise<void> {
    const localFilePath = require('nuclide-remote-uri').getPath(filePath);
    const filesystemContents = (await getFileSystemServiceByNuclideUri(filePath).
        readFile(localFilePath)).toString('utf8');
    if (filesystemContents !== this._activeFileState.savedContents) {
      this._updateActiveDiffState(filePath).catch(this._boundHandleInternalError);
    }
  }

  _handleInternalError(error: Error): void {
    const errorMessage = `Diff View Internal Error - ${error.message}`;
    logger.error(errorMessage, error);
    atom.notifications.addError(errorMessage);
  }

  setNewContents(newContents: string): void {
    const {filePath, oldContents, savedContents, inlineComponents} = this._activeFileState;
    this._setActiveFileState({
      filePath,
      oldContents,
      newContents,
      savedContents,
      inlineComponents,
    });
  }

  getActiveFileState(): FileChangeState {
    return this._activeFileState;
  }

  async _updateActiveDiffState(filePath: NuclideUri): Promise<void> {
    const hgDiffState = await this._fetchHgDiff(filePath);
    if (!hgDiffState) {
      return;
    }
    const {
      committedContents: oldContents,
      filesystemContents: newContents,
    } = hgDiffState;
    this._setActiveFileState({
      filePath,
      oldContents,
      newContents,
    });
    const inlineComponents = await this._fetchInlineComponents();
    this._setActiveFileState({
      filePath,
      oldContents,
      newContents,
      inlineComponents,
    });
  }

  _setActiveFileState(state: FileChangeState): void {
    this._activeFileState = state;
    this._emitter.emit(ACTIVE_FILE_UPDATE_EVENT, state);
  }

  @trackTiming('diff-view.hg-state-update')
  async _fetchHgDiff(filePath: NuclideUri): Promise<?HgDiffState> {
    // Calling atom.project.repositoryForDirectory gets the real path of the directory,
    // which is another round-trip and calls the repository providers to get an existing repository.
    // Instead, the first match of the filtering here is the only possible match.
    const repository: HgRepositoryClient = repositoryForPath(filePath);

    // TODO(most): move repo type check error handling up the stack before creating the the view.
    if (!repository || repository.getType() !== 'hg') {
      const type = repository ? repository.getType() : 'no repository';
      throw new Error(`Diff view only supports \`Mercurial\` repositories, but found \`${type}\``);
    }

    const fileSystemService = getFileSystemServiceByNuclideUri(filePath);
    invariant(fileSystemService);

    const committedContentsPromise = repository.fetchFileContentAtRevision(filePath, null)
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

  @trackTiming('diff-view.save-file')
  async saveActiveFile(): Promise<void> {
    const {filePath, newContents} = this._activeFileState;
    track('diff-view-save-file', {filePath});
    try {
      await this._saveFile(filePath, newContents);
      this._activeFileState.savedContents = newContents;
    } catch(error) {
      this._handleInternalError(error);
      throw error;
    }
  }

  async _saveFile(filePath: NuclideUri, newContents: string): Promise<void> {
    const {isLocal, getPath} = require('nuclide-remote-uri');
    try {
      if (isLocal(filePath)) {
        await getFileForPath(filePath).write(newContents);
      } else {
        // Remote files return the same instance everytime,
        // which could have an invalid filesystem contents cache.
        await getFileSystemServiceByNuclideUri(filePath).writeFile(getPath(filePath), newContents);
      }
    } catch (err) {
      throw new Error(`could not save file: \`${filePath}\` - ${err.toString()}`);
    }
  }

  onDidChangeStatus(callback: (fileChanges: Map<string, number>) => void): atom$Disposable {
    return this._emitter.on(CHANGE_STATUS_EVENT, callback);
  }

  onActiveFileUpdates(callback: (state: FileChangeState) => void): atom$Disposable {
    return this._emitter.on(ACTIVE_FILE_UPDATE_EVENT, callback);
  }

  @trackTiming('diff-view.fetch-comments')
  async _fetchInlineComponents(): Promise<Array<Object>> {
    const {filePath} = this._activeFileState;
    const uiElementPromises = this._uiProviders.map(
      provider => provider.composeUiElements(filePath)
    );
    const uiComponentLists = await Promise.all(uiElementPromises);
    // Flatten uiComponentLists from list of lists of components to a list of components.
    const uiComponents = [].concat.apply([], uiComponentLists);
    return uiComponents;
  }

  getFileChanges(): Map<NuclideUri, FileChangeStatusValue> {
    return this._fileChanges;
  }

  dispose(): void {
    this._subscriptions.dispose();
    for (const subscription of this._repositorySubscriptions.values()) {
      subscription.dispose();
    }
    this._repositorySubscriptions.clear();
    if (this._activeSubscriptions != null) {
      this._activeSubscriptions.dispose();
      this._activeSubscriptions = null;
    }
  }
}

module.exports = DiffViewModel;
