'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {HgRepositoryClient} from '../../hg-repository-client';
import type {
  FileChangeState,
  RevisionsState,
  FileChangeStatusValue,
  HgDiffState,
  CommitModeType,
  CommitModeStateType,
  PublishModeType,
  DiffModeType,
} from './types';
import type {RevisionInfo} from '../../hg-repository-base/lib/hg-constants';
import type {NuclideUri} from '../../remote-uri';

import invariant from 'assert';
import {CompositeDisposable, Emitter} from 'atom';
import {CommitMode, CommitModeState, DiffMode, PublishMode} from './constants';
import {repositoryForPath} from '../../hg-git-bridge';
import {track, trackTiming} from '../../analytics';
import {getFileSystemContents} from './utils';
import {array, map, debounce, promises} from '../../commons';
import RepositoryStack from './RepositoryStack';
import {
  notifyInternalError,
  notifyFilesystemOverrideUserEdits,
} from './notifications';
import {bufferForUri} from '../../atom-helpers';

const CHANGE_DIRTY_STATUS_EVENT = 'did-change-dirty-status';
const CHANGE_COMPARE_STATUS_EVENT = 'did-change-compare-status';
const ACTIVE_FILE_UPDATE_EVENT = 'active-file-update';
const CHANGE_REVISIONS_EVENT = 'did-change-revisions';
const ACTIVE_BUFFER_CHANGE_MODIFIED_EVENT = 'active-buffer-change-modified';
const DID_UPDATE_STATE_EVENT = 'did-update-state';
const UPDATE_REVISION_TEMPLATE = '';

const FILE_CHANGE_DEBOUNCE_MS = 200;
const UI_CHANGE_DEBOUNCE_MS = 100;

// Returns a string with all newline strings, '\\n', converted to literal newlines, '\n'.
function convertNewlines(message: string): string {
  return message.replace(/\\n/g, '\n');
}

function getInitialFileChangeState(): FileChangeState {
  return {
    fromRevisionTitle: 'No file selected',
    toRevisionTitle: 'No file selected',
    filePath: '',
    oldContents: '',
    newContents: '',
    compareRevisionInfo: null,
  };
}

type State = {
  viewMode: DiffModeType;
  commitMessage: ?string;
  commitMode: CommitModeType;
  commitModeState: CommitModeStateType;
  publishMessageLoading: boolean;
  publishMessage: string;
  isPublishing: boolean;
  publishMode: PublishModeType;
  headRevision: ?RevisionInfo;
};

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
  _isActive: boolean;
  _state: State;
  _debouncedEmitActiveFileUpdate: () => void;

  constructor(uiProviders: Array<Object>) {
    this._uiProviders = uiProviders;
    this._dirtyFileChanges = new Map();
    this._compareFileChanges = new Map();
    this._emitter = new Emitter();
    this._subscriptions = new CompositeDisposable();
    this._repositoryStacks = new Map();
    this._repositorySubscriptions = new Map();
    this._isActive = false;
    this._state = {
      viewMode: DiffMode.BROWSE_MODE,
      commitMessage: null,
      commitMode: CommitMode.COMMIT,
      commitModeState: CommitModeState.READY,
      publishMessageLoading: true,
      publishMessage: '',
      publishMode: PublishMode.CREATE,
      isPublishing: false,
      headRevision: null,
    };
    this._updateRepositories();
    this._subscriptions.add(atom.project.onDidChangePaths(this._updateRepositories.bind(this)));
    this._debouncedEmitActiveFileUpdate = debounce(
      this._emitActiveFileUpdate.bind(this),
      UI_CHANGE_DEBOUNCE_MS,
      false,
    );
    this._setActiveFileState(getInitialFileChangeState());
  }

  _updateRepositories(): void {
    const repositories = new Set(
      atom.project.getRepositories().filter(
        repository => repository != null && repository.getType() === 'hg'
      )
    );
    // Dispose removed projects repositories.
    for (const [repository, repositoryStack] of this._repositoryStacks) {
      if (repositories.has(repository)) {
        continue;
      }
      repositoryStack.dispose();
      this._repositoryStacks.delete(repository);
      const subscriptions = this._repositorySubscriptions.get(repository);
      invariant(subscriptions);
      subscriptions.dispose();
      this._repositorySubscriptions.delete(repository);
    }

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

  _createRepositoryStack(repository: HgRepositoryClient): RepositoryStack {
    const repositoryStack = new RepositoryStack(repository);
    const subscriptions = new CompositeDisposable();
    subscriptions.add(
      repositoryStack.onDidChangeDirtyStatus(this._updateDirtyChangedStatus.bind(this)),
      repositoryStack.onDidChangeCompareStatus(this._updateCompareChangedStatus.bind(this)),
      repositoryStack.onDidChangeRevisions(revisionsState => {
        this._updateChangedRevisions(repositoryStack, revisionsState, true)
          .catch(notifyInternalError);
      }),
    );
    this._repositoryStacks.set(repository, repositoryStack);
    this._repositorySubscriptions.set(repository, subscriptions);
    if (this._isActive) {
      repositoryStack.activate();
    }
    return repositoryStack;
  }

  _updateCompareChangedStatus(): void {
    this._compareFileChanges = map.union(...array
      .from(this._repositoryStacks.values())
      .map(repositoryStack => repositoryStack.getCompareFileChanges())
    );
    this._emitter.emit(CHANGE_COMPARE_STATUS_EVENT, this._compareFileChanges);
  }

  async _updateChangedRevisions(
    repositoryStack: RepositoryStack,
    revisionsState: RevisionsState,
    reloadFileDiff: boolean,
  ): Promise<void> {
    if (repositoryStack === this._activeRepositoryStack) {
      track('diff-view-update-timeline-revisions', {
        revisionsCount: `${revisionsState.revisions.length}`,
      });
      const {revisions} = revisionsState;
      invariant(revisions.length > 0, 'Diff View Error: Zero Revisions');
      const headRevision = revisions[revisions.length - 1];
      const headMessage = headRevision.description;
      // TODO(most): Use @mareksapota's utility when done.
      const hasPhabricatorRevision = headMessage.indexOf('Differential Revision:') !== -1;
      this._setState({
        ...this._state,
        publishMessageLoading: false,
        publishMessage: hasPhabricatorRevision
          ? UPDATE_REVISION_TEMPLATE
          : headMessage,
        isPublishing: false,
        publishMode: hasPhabricatorRevision ? PublishMode.UPDATE : PublishMode.CREATE,
        headRevision,
      });
      this._emitter.emit(CHANGE_REVISIONS_EVENT, revisionsState);

      // Update the active file, if changed.
      const {filePath} = this._activeFileState;
      if (!filePath || !reloadFileDiff) {
        return;
      }
      const {
        committedContents,
        filesystemContents,
        revisionInfo,
      } = await this._fetchHgDiff(filePath);
      await this._updateDiffStateIfChanged(
        filePath,
        committedContents,
        filesystemContents,
        revisionInfo,
      );
    }
  }

  setPublishMessage(publishMessage: string) {
    this._setState({
      ...this._state,
      publishMessage,
    });
  }

  setViewMode(viewMode: DiffModeType) {
    this._setState({
      ...this._state,
      viewMode,
    });
  }

  activateFile(filePath: NuclideUri): void {
    if (this._activeSubscriptions) {
      this._activeSubscriptions.dispose();
    }
    const activeSubscriptions = this._activeSubscriptions = new CompositeDisposable();
    // TODO(most): Show progress indicator: t8991676
    const buffer = bufferForUri(filePath);
    const {file} = buffer;
    if (file != null) {
      activeSubscriptions.add(file.onDidChange(debounce(
        () => this._onDidFileChange(filePath).catch(notifyInternalError),
        FILE_CHANGE_DEBOUNCE_MS,
        false,
      )));
    }
    activeSubscriptions.add(buffer.onDidChangeModified(
      this._onDidBufferChangeModified.bind(this),
    ));
    track('diff-view-open-file', {filePath});
    this._updateActiveDiffState(filePath).catch(notifyInternalError);
  }

  @trackTiming('diff-view.file-change-update')
  async _onDidFileChange(filePath: NuclideUri): Promise<void> {
    if (this._activeFileState.filePath !== filePath) {
      return;
    }
    const filesystemContents = await getFileSystemContents(filePath);
    const {
      oldContents: committedContents,
      compareRevisionInfo: revisionInfo,
    } = this._activeFileState;
    invariant(revisionInfo, 'Diff View: Revision info must be defined to update changed state');
    await this._updateDiffStateIfChanged(
      filePath,
      committedContents,
      filesystemContents,
      revisionInfo,
    );
  }

  _onDidBufferChangeModified(): void {
    this._emitter.emit(ACTIVE_BUFFER_CHANGE_MODIFIED_EVENT);
  }

  onDidActiveBufferChangeModified(
    callback: () => mixed,
  ): IDisposable {
    return this._emitter.on(ACTIVE_BUFFER_CHANGE_MODIFIED_EVENT, callback);
  }

  isActiveBufferModified(): boolean {
    const {filePath} = this._activeFileState;
    const buffer = bufferForUri(filePath);
    return buffer.isModified();
  }

  _updateDiffStateIfChanged(
    filePath: NuclideUri,
    committedContents: string,
    filesystemContents: string,
    revisionInfo: RevisionInfo,
  ): Promise<void> {
    const {
      filePath: activeFilePath,
      newContents,
      savedContents,
    } = this._activeFileState;
    if (filePath !== activeFilePath) {
      return Promise.resolve();
    }
    const updatedDiffState = {
      committedContents,
      filesystemContents,
      revisionInfo,
    };
    if (savedContents === newContents || filesystemContents === newContents) {
      return this._updateDiffState(filePath, updatedDiffState);
    }
    // The user have edited since the last update.
    if (filesystemContents === savedContents) {
      // The changes haven't touched the filesystem, keep user edits.
      return this._updateDiffState(
        filePath,
        {...updatedDiffState, filesystemContents: newContents},
      );
    } else {
      // The committed and filesystem state have changed, notify of override.
      notifyFilesystemOverrideUserEdits(filePath);
      return this._updateDiffState(filePath, updatedDiffState);
    }
  }

  setNewContents(newContents: string): void {
    this._setActiveFileState({...this._activeFileState, newContents});
  }

  setRevision(revision: RevisionInfo): void {
    track('diff-view-set-revision');
    const repositoryStack = this._activeRepositoryStack;
    invariant(repositoryStack, 'There must be an active repository stack!');
    this._activeFileState = {...this._activeFileState, compareRevisionInfo: revision};
    repositoryStack.setRevision(revision).catch(notifyInternalError);
  }

  getActiveFileState(): FileChangeState {
    return this._activeFileState;
  }

  async _updateActiveDiffState(filePath: NuclideUri): Promise<void> {
    if (!filePath) {
      return;
    }
    const hgDiffState = await this._fetchHgDiff(filePath);
    await this._updateDiffState(filePath, hgDiffState);
  }

  async _updateDiffState(filePath: NuclideUri, hgDiffState: HgDiffState): Promise<void> {
    const {
      committedContents: oldContents,
      filesystemContents: newContents,
      revisionInfo,
    } = hgDiffState;
    const {hash, bookmarks} = revisionInfo;
    const newFileState = {
      filePath,
      oldContents,
      newContents,
      savedContents: newContents,
      compareRevisionInfo: revisionInfo,
      fromRevisionTitle: `${hash}` + (bookmarks.length === 0 ? '' : ` - (${bookmarks.join(', ')})`),
      toRevisionTitle: 'Filesystem / Editor',
    };
    this._setActiveFileState(newFileState);
    // TODO(most): Fix: this assumes that the editor contents aren't changed while
    // fetching the comments, that's okay now because we don't fetch them.
    const inlineComponents = await this._fetchInlineComponents();
    this._setActiveFileState({...newFileState, inlineComponents});
  }

  _setActiveFileState(state: FileChangeState): void {
    this._activeFileState = state;
    this._debouncedEmitActiveFileUpdate();
  }

  _emitActiveFileUpdate(): void {
    this._emitter.emit(ACTIVE_FILE_UPDATE_EVENT, this._activeFileState);
  }

  @trackTiming('diff-view.hg-state-update')
  async _fetchHgDiff(filePath: NuclideUri): Promise<HgDiffState> {
    // Calling atom.project.repositoryForDirectory gets the real path of the directory,
    // which is another round-trip and calls the repository providers to get an existing repository.
    // Instead, the first match of the filtering here is the only possible match.
    const repository = repositoryForPath(filePath);
    if (repository == null || repository.getType() !== 'hg') {
      const type = repository ? repository.getType() : 'no repository';
      throw new Error(`Diff view only supports \`Mercurial\` repositories, but found \`${type}\``);
    }

    const hgRepository: HgRepositoryClient = (repository: any);
    const repositoryStack = this._repositoryStacks.get(hgRepository);
    invariant(repositoryStack, 'There must be an repository stack for a given repository!');
    const [hgDiff] = await Promise.all([
      repositoryStack.fetchHgDiff(filePath),
      this._setActiveRepositoryStack(repositoryStack),
    ]);
    return hgDiff;
  }

  async _setActiveRepositoryStack(repositoryStack: RepositoryStack): Promise<void> {
    if (this._activeRepositoryStack === repositoryStack) {
      return;
    }
    this._activeRepositoryStack = repositoryStack;
    const revisionsState = await repositoryStack.getCachedRevisionsStatePromise();
    this._updateChangedRevisions(repositoryStack, revisionsState, false);
  }


  @trackTiming('diff-view.save-file')
  async saveActiveFile(): Promise<void> {
    const {filePath} = this._activeFileState;
    track('diff-view-save-file', {filePath});
    try {
      this._activeFileState.savedContents = await this._saveFile(filePath);
    } catch (error) {
      notifyInternalError(error);
    }
  }

  @trackTiming('diff-view.publish-diff')
  async publishDiff(publishMessage: string): Promise<void> {
    this._setState({
      ...this._state,
      publishMessage,
      isPublishing: true,
    });
    // TODO(most): do publish to Phabricator.
    try {
      await promises.awaitMilliSeconds(5000);
      await Promise.resolve();
      // Switch to browse mode after a successful publish.
      this.setViewMode(DiffMode.BROWSE_MODE);
    } catch (error) {
      notifyInternalError(error);
    } finally {
      this._setState({
        ...this._state,
        publishMessage,
        isPublishing: false,
      });
    }
  }

  async _saveFile(filePath: NuclideUri): Promise<string> {
    const buffer = bufferForUri(filePath);
    if (buffer == null) {
      throw new Error(`Could not find file buffer to save: \`${filePath}\``);
    }
    try {
      await buffer.save();
      return buffer.getText();
    } catch (err) {
      throw new Error(`Could not save file buffer: \`${filePath}\` - ${err.toString()}`);
    }
  }

  onDidUpdateState(callback: () => mixed): IDisposable {
    return this._emitter.on(DID_UPDATE_STATE_EVENT, callback);
  }

  onDidChangeDirtyStatus(
    callback: (dirtyFileChanges: Map<NuclideUri, FileChangeStatusValue>) => void
  ): IDisposable {
    return this._emitter.on(CHANGE_DIRTY_STATUS_EVENT, callback);
  }

  onDidChangeCompareStatus(
    callback: (compareFileChanges: Map<NuclideUri, FileChangeStatusValue>) => void
  ): IDisposable {
    return this._emitter.on(CHANGE_COMPARE_STATUS_EVENT, callback);
  }

  onRevisionsUpdate(callback: (state: ?RevisionsState) => void): IDisposable {
    return this._emitter.on(CHANGE_REVISIONS_EVENT, callback);
  }

  onActiveFileUpdates(callback: (state: FileChangeState) => void): IDisposable {
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

  // TODO(ssorallen): This should be removed by moving the DiffMode from DiffViewComponent's state
  //   into this model. After that, commit message loading can be triggered by either changing the
  //   the diff mode *or* the commit mode.
  async loadCommitMessage(): Promise<void> {
    this._setState({
      ...this._state,
      commitModeState: CommitModeState.LOADING_COMMIT_MESSAGE,
    });

    let commitMessage;
    try {
      if (this._state.commitMode === CommitMode.COMMIT) {
        commitMessage = await this._loadActiveRepositoryTemplateCommitMessage();
        // Commit templates that include newline strings, '\\n' in JavaScript, need to convert their
        // strings to literal newlines, '\n' in JavaScript, to be rendered as line breaks.
        if (commitMessage != null) {
          commitMessage = convertNewlines(commitMessage);
        }
      } else {
        commitMessage = await this._loadActiveRepositoryLatestCommitMessage();
      }
    } catch (error) {
      notifyInternalError(error);
    } finally {
      this._setState({
        ...this._state,
        commitMessage,
        commitModeState: CommitModeState.READY,
      });
    }
  }

  async _loadActiveRepositoryLatestCommitMessage(): Promise<string> {
    if (this._activeRepositoryStack == null) {
      throw new Error('Diff View: No active file or repository open');
    }
    const revisionsState = await this.getActiveRevisionsState();
    invariant(revisionsState, 'Diff View Internal Error: revisionsState cannot be null');
    const {revisions} = revisionsState;
    invariant(revisions.length > 0, 'Diff View Error: Cannot amend non-existing commit');
    return revisions[revisions.length - 1].description;
  }

  _loadActiveRepositoryTemplateCommitMessage(): Promise<?string> {
    if (this._activeRepositoryStack == null) {
      throw new Error('Diff View: No active file or repository open');
    }
    return this._activeRepositoryStack.getTemplateCommitMessage();
  }

  async getActiveRevisionsState(): Promise<?RevisionsState> {
    if (this._activeRepositoryStack == null) {
      return null;
    }
    return await this._activeRepositoryStack.getCachedRevisionsStatePromise();
  }

  _setState(newState: State) {
    this._state = newState;
    this._emitter.emit(DID_UPDATE_STATE_EVENT);
  }

  async commit(message: string): Promise<void> {
    this._setState({
      ...this._state,
      commitMessage: message,
      commitModeState: CommitModeState.AWAITING_COMMIT,
    });

    try {
      invariant(this._activeRepositoryStack);
      await this._activeRepositoryStack.commit(message);
    } catch (e) {
      atom.notifications.addError(
        'Error creating commit',
        {detail: `Details: ${e.stdout}`},
      );
      this._setState({
        ...this._state,
        commitModeState: CommitModeState.READY,
      });
      return;
    }

    atom.notifications.addSuccess('Commit created');
    // After a successful commit, load the appropriate commit message again because the one in the
    // editor might no longer be correct for the current repo state.
    this.loadCommitMessage();
  }

  getState(): State {
    return this._state;
  }

  setCommitMode(commitMode: CommitModeType): void {
    this._setState({
      ...this._state,
      commitMode,
    });
    // When the commit mode changes, load the appropriate commit message.
    this.loadCommitMessage();
  }

  activate(): void {
    this._updateRepositories();
    this._isActive = true;
    for (const repositoryStack of this._repositoryStacks.values()) {
      repositoryStack.activate();
    }
  }

  deactivate(): void {
    this._isActive = false;
    if (this._activeRepositoryStack != null) {
      this._activeRepositoryStack.deactivate();
      this._activeRepositoryStack = null;
    }
    this._setActiveFileState(getInitialFileChangeState());
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
