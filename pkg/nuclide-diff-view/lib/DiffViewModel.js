'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {
  HgRepositoryClient,
} from '../../nuclide-hg-repository-client';
import type {
  RevisionsState,
  FileChangeStatusValue,
  CommitModeType,
  CommitModeStateType,
  PublishModeType,
  PublishModeStateType,
  DiffModeType,
  UIProvider,
  UIElement,
} from './types';
import type {
  RevisionInfo,
} from '../../nuclide-hg-rpc/lib/HgService';
import type {NuclideUri} from '../../commons-node/nuclideUri';
import typeof * as BoundActionCreators from './redux/Actions';

export type DiffEntityOptions = {
  file?: NuclideUri,
  directory?: NuclideUri,
  viewMode?: DiffModeType,
  commitMode?: CommitModeType,
};

import {Emitter} from 'atom';
import {
  DiffMode,
  CommitMode,
  CommitModeState,
  PublishMode,
  PublishModeState,
} from './constants';
import invariant from 'assert';
import {track, trackTiming} from '../../nuclide-analytics';
import {Subject} from 'rxjs';
import {notifyInternalError} from './notifications';
import {bufferForUri} from '../../commons-atom/text-editor';

const ACTIVE_BUFFER_CHANGE_MODIFIED_EVENT = 'active-buffer-change-modified';
const DID_UPDATE_STATE_EVENT = 'did-update-state';

function getInitialState(): State {
  return {
    fromRevisionTitle: 'No file selected',
    toRevisionTitle: 'No file selected',
    filePath: '',
    oldContents: '',
    newContents: '',
    activeRepository: null,
    viewMode: DiffMode.BROWSE_MODE,
    commitMessage: null,
    commitMode: CommitMode.COMMIT,
    commitModeState: CommitModeState.READY,
    shouldRebaseOnAmend: true,
    publishMessage: null,
    publishMode: PublishMode.CREATE,
    publishModeState: PublishModeState.READY,
    headCommitMessage: null,
    dirtyFileChanges: new Map(),
    selectedFileChanges: new Map(),
    showNonHgRepos: true,
    revisionsState: null,
  };
}

export type State = {
  activeRepository: ?HgRepositoryClient,
  filePath: NuclideUri,
  oldContents: string,
  newContents: string,
  fromRevisionTitle: string,
  toRevisionTitle: string,
  inlineComponents?: Array<UIElement>,
  viewMode: DiffModeType,
  commitMessage: ?string,
  commitMode: CommitModeType,
  commitModeState: CommitModeStateType,
  shouldRebaseOnAmend: boolean,
  publishMessage: ?string,
  publishMode: PublishModeType,
  publishModeState: PublishModeStateType,
  headCommitMessage: ?string,
  dirtyFileChanges: Map<NuclideUri, FileChangeStatusValue>,
  selectedFileChanges: Map<NuclideUri, FileChangeStatusValue>,
  showNonHgRepos: boolean,
  revisionsState: ?RevisionsState,
};

export default class DiffViewModel {

  _emitter: Emitter;
  _uiProviders: Array<UIProvider>;
  _state: State;
  _publishUpdates: Subject<any>;
  _actionCreators: BoundActionCreators;

  constructor(actionCreators: BoundActionCreators) {
    this._actionCreators = actionCreators;
    this._emitter = new Emitter();
    this._uiProviders = [];
    this._publishUpdates = new Subject();
    this._state = getInitialState();
  }

  diffFile(filePath: NuclideUri): void {
    this._actionCreators.diffFile(
      filePath,
      this.emitActiveBufferChangeModified.bind(this),
    );
  }

  getActiveStackDirtyFileChanges(): Map<NuclideUri, FileChangeStatusValue> {
    return this._state.dirtyFileChanges;
  }

  setViewMode(viewMode: DiffModeType): void {
    this._actionCreators.setViewMode(viewMode);
  }

  emitActiveBufferChangeModified(): void {
    this._emitter.emit(ACTIVE_BUFFER_CHANGE_MODIFIED_EVENT);
  }

  onDidActiveBufferChangeModified(
    callback: () => mixed,
  ): IDisposable {
    return this._emitter.on(ACTIVE_BUFFER_CHANGE_MODIFIED_EVENT, callback);
  }

  isActiveBufferModified(): boolean {
    const {filePath} = this._state;
    const buffer = bufferForUri(filePath);
    return buffer.isModified();
  }

  setCompareRevision(revision: RevisionInfo): void {
    track('diff-view-set-revision');
    invariant(this._state.activeRepository != null, 'There must be an active repository!');
    this._actionCreators.setCompareId(this._state.activeRepository, revision.id);
  }

  getPublishUpdates(): Subject<any> {
    return this._publishUpdates;
  }

  @trackTiming('diff-view.save-file')
  saveActiveFile(): Promise<void> {
    const {filePath} = this._state;
    track('diff-view-save-file', {filePath});
    return this._saveFile(filePath).catch(notifyInternalError);
  }

  async publishDiff(
    publishMessage: string,
    lintExcuse: ?string,
  ): Promise<void> {
    const activeRepository = this._state.activeRepository;
    invariant(activeRepository != null, 'Cannot publish without an active stack!');

    this._actionCreators.publishDiff(
      activeRepository,
      publishMessage,
      lintExcuse,
      this._publishUpdates,
    );
  }

  async _saveFile(filePath: NuclideUri): Promise<void> {
    const buffer = bufferForUri(filePath);
    if (buffer == null) {
      throw new Error(`Could not find file buffer to save: \`${filePath}\``);
    }
    try {
      await buffer.save();
    } catch (err) {
      throw new Error(`Could not save file buffer: \`${filePath}\` - ${err.toString()}`);
    }
  }

  onDidUpdateState(callback: () => mixed): IDisposable {
    return this._emitter.on(DID_UPDATE_STATE_EVENT, callback);
  }

  setUiProviders(uiProviders: Array<UIProvider>): void {
    this._uiProviders = uiProviders;
  }

  commit(message: string): void {
    if (message === '') {
      atom.notifications.addError('Commit aborted', {detail: 'Commit message empty'});
      return;
    }
    const activeRepository = this._state.activeRepository;
    invariant(activeRepository != null, 'No active repository stack');
    this._actionCreators.commit(activeRepository, message);
  }

  injectState(newState: State): void {
    this._state = newState;
    this._emitter.emit(DID_UPDATE_STATE_EVENT);
  }

  getState(): State {
    return this._state;
  }

  setCommitMode(commitMode: CommitModeType): void {
    this._actionCreators.setCommitMode(commitMode);
  }

  setShouldAmendRebase(shouldRebaseOnAmend: boolean): void {
    this._actionCreators.setShouldRebaseOnAmend(shouldRebaseOnAmend);
  }

  activate(): void {
    this._actionCreators.openView();
  }

  deactivate(): void {
    this._actionCreators.closeView();
  }

  dispose(): void {
    this.deactivate();
  }
}
