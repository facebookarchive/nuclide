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
import type {FileChangeState, FileChangeStatusValue, HgDiffState, RevisionsState} from './types';
import type {NuclideUri} from 'nuclide-remote-uri';

import invariant from 'assert';
import {CompositeDisposable, Emitter} from 'atom';
import {repositoryForPath} from 'nuclide-hg-git-bridge';
import {track, trackTiming} from 'nuclide-analytics';
import {getFileSystemContents} from './utils';
import {getFileForPath, getFileSystemServiceByNuclideUri} from 'nuclide-client';
import {array, map} from 'nuclide-commons';
import RepositoryStack from './RepositoryStack';
import {notifyInternalError} from './notifications';

const CHANGE_DIRTY_STATUS_EVENT = 'did-change-dirty-status';
const CHANGE_COMPARE_STATUS_EVENT = 'did-change-compare-status';
const ACTIVE_FILE_UPDATE_EVENT = 'active-file-update';
const CHANGE_REVISIONS_EVENT = 'did-change-revisions';

class DiffViewModel {

  _emitter: Emitter;
  _subscriptions: CompositeDisposable;
  _activeSubscriptions: ?CompositeDisposable;
  _activeFileState: FileChangeState;
  _activeRepositoryStack: ?RepositoryStack;
  _newEditor: ?TextEditor;
  _dirtyFileChanges: Map<NuclideUri, FileChangeStatusValue>;
  _compareFileChanges: Map<NuclideUri, FileChangeStatusValue>;
  _uiProviders: Array<Object>;
  _repositoryStacks: Map<HgRepositoryClient, RepositoryStack>;
  _repositorySubscriptions: Map<HgRepositoryClient, CompositeDisposable>;

  constructor(uiProviders: Array<Object>) {
    this._uiProviders = uiProviders;
    this._dirtyFileChanges = new Map();
    this._compareFileChanges = new Map();
    this._emitter = new Emitter();
    this._subscriptions = new CompositeDisposable();
    this._repositoryStacks = new Map();
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
    const repositories = new Set(
      atom.project.getRepositories().filter(
        repository => repository != null && repository.getType() === 'hg'
      )
    );
    // Dispose removed projects repositories.
    array.from(this._repositoryStacks.keys())
      .filter(repository => !repositories.has(repository))
      .forEach(repository => {
        this._repositoryStacks.get(repository).dispose();
        this._repositoryStacks.delete(repository);
        this._repositorySubscriptions.get(repository).dispose();
        this._repositorySubscriptions.delete(repository);
      });

    for (const repository of repositories) {
      if (this._repositoryStacks.has(repository)) {
        continue;
      }
      const hgRepository = ((repository: any): HgRepositoryClient);
      this._createRepositoryStack(hgRepository);
    }

    this._updateDirtyChangedStatus();
  }

  _updateDirtyChangedStatus(): void {
    this._dirtyFileChanges = this._compareFileChanges = map.union(...array
      .from(this._repositoryStacks.values())
      .map(repositoryStack => repositoryStack.getDirtyFileChanges())
    );
    this._emitter.emit(CHANGE_DIRTY_STATUS_EVENT, this._dirtyFileChanges);
  }

  _createRepositoryStack(repository: HgRepositoryClient) {
    const repositoryStack = new RepositoryStack(repository);
    const subscriptions = new CompositeDisposable();
    subscriptions.add(
      repositoryStack.onDidChangeDirtyStatus(this._updateDirtyChangedStatus.bind(this)),
      repositoryStack.onDidChangeCompareStatus(this._updateCompareChangedStatus.bind(this)),
      repositoryStack.onDidChangeRevisions(
        this._updateChangedRevisions.bind(this, repositoryStack)
      ),
    );
    this._repositoryStacks.set(repository, repositoryStack);
    this._repositorySubscriptions.set(repository, subscriptions);
    return repositoryStack;
  }

  _updateCompareChangedStatus(): void {
    this._compareFileChanges = map.union(...array
      .from(this._repositoryStacks.values())
      .map(repositoryStack => repositoryStack.getCompareFileChanges())
    );
    this._emitter.emit(CHANGE_COMPARE_STATUS_EVENT, this._compareFileChanges);
  }

  _updateChangedRevisions(repositoryStack: RepositoryStack): void {
    if (repositoryStack === this._activeRepositoryStack) {
      const revisionsState = repositoryStack.getRevisionsState();
      invariant(revisionsState, 'revisionsState must exist to update changed revisions');
      track('diff-view-update-timeline-revisions', {
        revisionsCount: `${revisionsState.revisions.length}`,
      });
      this._emitter.emit(CHANGE_REVISIONS_EVENT, revisionsState);
      this._updateActiveDiffState(this._activeFileState.filePath).catch(notifyInternalError);
    }
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
        this._onDidFileChange(filePath).catch(notifyInternalError);
      }));
    }
    track('diff-view-open-file', {filePath});
    this._updateActiveDiffState(filePath).catch(notifyInternalError);
  }

  @trackTiming('diff-view.file-change-update')
  async _onDidFileChange(filePath: NuclideUri): Promise<void> {
    const filesystemContents = await getFileSystemContents(filePath);
    if (filesystemContents !== this._activeFileState.savedContents) {
      this._updateActiveDiffState(filePath).catch(notifyInternalError);
    }
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
  _fetchHgDiff(filePath: NuclideUri): Promise<HgDiffState> {
    // Calling atom.project.repositoryForDirectory gets the real path of the directory,
    // which is another round-trip and calls the repository providers to get an existing repository.
    // Instead, the first match of the filtering here is the only possible match.
    const repository: HgRepositoryClient = repositoryForPath(filePath);
    if (repository == null || repository.getType() !== 'hg') {
      const type = repository ? repository.getType() : 'no repository';
      throw new Error(`Diff view only supports \`Mercurial\` repositories, but found \`${type}\``);
    }

    const repositoryStack = this._repositoryStacks.get(repository);
    invariant(repositoryStack);
    this._setActiveRepositoryStack(repositoryStack);
    return repositoryStack.fetchHgDiff(filePath);
  }

  _setActiveRepositoryStack(repositoryStack: RepositoryStack) {
    if (this._activeRepositoryStack === repositoryStack) {
      return;
    }
    this._activeRepositoryStack = repositoryStack;
    this._emitter.emit(CHANGE_REVISIONS_EVENT, repositoryStack.getRevisionsState());
  }

  @trackTiming('diff-view.save-file')
  async saveActiveFile(): Promise<void> {
    const {filePath, newContents} = this._activeFileState;
    track('diff-view-save-file', {filePath});
    try {
      await this._saveFile(filePath, newContents);
      this._activeFileState.savedContents = newContents;
    } catch(error) {
      notifyInternalError(error);
    }
  }

  async _saveFile(filePath: NuclideUri, newContents: string): Promise<void> {
    const {getPath} = require('nuclide-remote-uri');
    try {
      // We don't use files, because `getFileForPath` returns the same remote file
      // instance everytime, which could have an invalid filesystem contents cache.
      await getFileSystemServiceByNuclideUri(filePath).writeFile(getPath(filePath), newContents);
    } catch (err) {
      throw new Error(`could not save file: \`${filePath}\` - ${err.toString()}`);
    }
  }

  onDidChangeDirtyStatus(
    callback: (dirtyFileChanges: Map<NuclideUri, FileChangeStatusValue>) => void
  ): atom$Disposable {
    return this._emitter.on(CHANGE_DIRTY_STATUS_EVENT, callback);
  }

  onDidChangeCompareStatus(
    callback: (compareFileChanges: Map<NuclideUri, FileChangeStatusValue>) => void
  ): atom$Disposable {
    return this._emitter.on(CHANGE_COMPARE_STATUS_EVENT, callback);
  }

  onRevisionsUpdate(callback: (state: ?RevisionsState) => void): atom$Disposable {
    return this._emitter.on(CHANGE_REVISIONS_EVENT, callback);
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

  getDirtyFileChanges(): Map<NuclideUri, FileChangeStatusValue> {
    return this._dirtyFileChanges;
  }

  getCompareFileChanges(): Map<NuclideUri, FileChangeStatusValue> {
    return this._compareFileChanges;
  }

  getActiveRevisionsState(): ?RevisionsState {
    if (this._activeRepositoryStack == null) {
      return null;
    }
    return this._activeRepositoryStack.getRevisionsState();
  }

  dispose(): void {
    this._subscriptions.dispose();
    for (const repositoryStack of this._repositoryStacks.values()) {
      repositoryStack.dispose();
    }
    this._repositoryStacks.clear();
    for (const subscription of this._repositorySubscriptions.values()) {
      subscription.dispose();
    }
    this._repositorySubscriptions.clear();
    this._dirtyFileChanges.clear();
    if (this._activeSubscriptions != null) {
      this._activeSubscriptions.dispose();
      this._activeSubscriptions = null;
    }
  }
}

module.exports = DiffViewModel;
