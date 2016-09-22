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
  DiffOptionType,
  UIProvider,
  UIElement,
} from './types';
import type {
  RevisionInfo,
} from '../../nuclide-hg-rpc/lib/HgService';
import type {NuclideUri} from '../../commons-node/nuclideUri';
import type {PhabricatorRevisionInfo} from '../../nuclide-arcanist-rpc/lib/utils';
import typeof * as BoundActionCreators from './redux/Actions';

type FileChangeState = {
  filePath: NuclideUri,
  oldContents: string,
  newContents: string,
  fromRevisionTitle: string,
  toRevisionTitle: string,
  inlineComponents?: Array<UIElement>,
};

export type DiffEntityOptions = {
  file?: NuclideUri,
  directory?: NuclideUri,
  viewMode?: DiffModeType,
  commitMode?: CommitModeType,
};

import {getPhabricatorRevisionFromCommitMessage} from '../../nuclide-arcanist-rpc/lib/utils';
import {CompositeDisposable, Emitter} from 'atom';
import {shell} from 'electron';
import {
  DiffMode,
  DiffOption,
  CommitMode,
  CommitModeState,
  PublishMode,
  PublishModeState,
} from './constants';
import invariant from 'assert';
import {track, trackTiming} from '../../nuclide-analytics';
import {hgConstants} from '../../nuclide-hg-rpc';
import {Observable, Subject} from 'rxjs';
import {notifyInternalError} from './notifications';
import {bufferForUri} from '../../commons-atom/text-editor';
import {getLogger} from '../../nuclide-logging';
import {getArcanistServiceByNuclideUri} from '../../nuclide-remote-connection';
import {
  processArcanistOutput,
} from './utils';

const ACTIVE_BUFFER_CHANGE_MODIFIED_EVENT = 'active-buffer-change-modified';
const DID_UPDATE_STATE_EVENT = 'did-update-state';

export function formatFileDiffRevisionTitle(revisionInfo: RevisionInfo): string {
  const {hash, bookmarks} = revisionInfo;
  return `${hash}` + (bookmarks.length === 0 ? '' : ` - (${bookmarks.join(', ')})`);
}

export function getRevisionUpdateMessage(phabricatorRevision: PhabricatorRevisionInfo): string {
  return `

# Updating ${phabricatorRevision.name}
#
# Enter a brief description of the changes included in this update.
# The first line is used as subject, next lines as comment.`;
}

function getInitialFileChangeState(): FileChangeState {
  return {
    fromRevisionTitle: 'No file selected',
    toRevisionTitle: 'No file selected',
    filePath: '',
    oldContents: '',
    newContents: '',
  };
}

function getInitialState(): State {
  return {
    ...getInitialFileChangeState(),
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

export function viewModeToDiffOption(viewMode: DiffModeType): DiffOptionType {
  switch (viewMode) {
    case DiffMode.COMMIT_MODE:
      return DiffOption.DIRTY;
    case DiffMode.PUBLISH_MODE:
      return DiffOption.LAST_COMMIT;
    case DiffMode.BROWSE_MODE:
      return DiffOption.COMPARE_COMMIT;
    default:
      throw new Error('Unrecognized view mode!');
  }
}

// TODO(most): Cleanup to avoid using `.do()` and have side effects:
// (notifications & publish updates).
export function createPhabricatorRevision(
  repository: HgRepositoryClient,
  publishUpdates: Subject<any>,
  headCommitMessage: string,
  publishMessage: string,
  amended: boolean,
  lintExcuse: ?string,
): Observable<void> {
  const filePath = repository.getProjectDirectory();
  let amendStream = Observable.empty();
  if (!amended && publishMessage !== headCommitMessage) {
    getLogger().info('Amending commit with the updated message');
    // We intentionally amend in clean mode here, because creating the revision
    // amends the commit message (with the revision url), breaking the stack on top of it.
    // Consider prompting for `hg amend --fixup` after to rebase the stack when needed.
    amendStream = repository.amend(publishMessage, hgConstants.AmendMode.CLEAN).do({
      complete: () => atom.notifications.addSuccess('Commit amended with the updated message'),
    });
  }

  return Observable.concat(
    // Amend head, if needed.
    amendStream,
    // Create a new revision.
    Observable.defer(() => {
      const stream = getArcanistServiceByNuclideUri(filePath)
        .createPhabricatorRevision(filePath, lintExcuse)
        .refCount();

      return processArcanistOutput(stream)
        .startWith({level: 'log', text: 'Creating new revision...\n'})
        .do(message => publishUpdates.next(message));
    }),

    Observable.defer(() =>
      Observable.fromPromise(repository.async.getHeadCommitMessage())
        .do(commitMessage => {
          const phabricatorRevision = getPhabricatorRevisionFromCommitMessage(commitMessage || '');
          if (phabricatorRevision != null) {
            notifyRevisionStatus(phabricatorRevision, 'created');
          }
        })),
  ).ignoreElements();
}

// TODO(most): Cleanup to avoid using `.do()` and have side effects:
// (notifications & publish updates).
export function updatePhabricatorRevision(
  repository: HgRepositoryClient,
  publishUpdates: Subject<any>,
  headCommitMessage: string,
  publishMessage: string,
  allowUntracked: boolean,
  lintExcuse: ?string,
): Observable<void> {
  const filePath = repository.getProjectDirectory();

  const phabricatorRevision = getPhabricatorRevisionFromCommitMessage(headCommitMessage);
  if (phabricatorRevision == null) {
    return Observable.throw(new Error('A phabricator revision must exist to update!'));
  }

  const updateTemplate = getRevisionUpdateMessage(phabricatorRevision).trim();
  const userUpdateMessage = publishMessage.replace(updateTemplate, '').trim();
  if (userUpdateMessage.length === 0) {
    return Observable.throw(new Error('Cannot update revision with empty message'));
  }

  const stream = getArcanistServiceByNuclideUri(filePath)
    .updatePhabricatorRevision(filePath, userUpdateMessage, allowUntracked, lintExcuse)
    .refCount();

  return processArcanistOutput(stream)
    .startWith({level: 'log', text: `Updating revision \`${phabricatorRevision.name}\`...\n`})
    .do({
      next: message => publishUpdates.next(message),
      complete: () => notifyRevisionStatus(phabricatorRevision, 'updated'),
    }).ignoreElements();
}

function notifyRevisionStatus(
  phabRevision: ?PhabricatorRevisionInfo,
  statusMessage: string,
): void {
  let message = `Revision ${statusMessage}`;
  if (phabRevision == null) {
    atom.notifications.addSuccess(message, {nativeFriendly: true});
    return;
  }
  const {name, url} = phabRevision;
  message = `Revision '${name}' ${statusMessage}`;
  atom.notifications.addSuccess(message, {
    buttons: [{
      className: 'icon icon-globe',
      onDidClick() { shell.openExternal(url); },
      text: 'Open in Phabricator',
    }],
    nativeFriendly: true,
  });
}

export type State = {
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
  _subscriptions: CompositeDisposable;
  _activeRepository: ?HgRepositoryClient;
  _uiProviders: Array<UIProvider>;
  _repositories: Set<HgRepositoryClient>;
  _isActive: boolean;
  _state: State;
  _publishUpdates: Subject<any>;
  _actionCreators: BoundActionCreators;

  constructor(actionCreators: BoundActionCreators) {
    this._actionCreators = actionCreators;
    this._emitter = new Emitter();
    this._subscriptions = new CompositeDisposable();
    this._uiProviders = [];
    this._repositories = new Set();
    this._isActive = false;
    this._publishUpdates = new Subject();
    this._state = getInitialState();
    this._updateRepositories();
    this._subscriptions.add(atom.project.onDidChangePaths(this._updateRepositories.bind(this)));
  }

  _updateRepositories(): void {
    const repositories = new Set(
      atom.project.getRepositories().filter(
        repository => repository != null && repository.getType() === 'hg',
      ),
    );
    // Dispose removed projects repositories, if any.
    for (const repository of this._repositories) {
      if (repositories.has(repository)) {
        continue;
      }
      if (this._activeRepository === repository) {
        this._activeRepository = null;
      }
      this._repositories.delete(repository);
    }

    // Add the new project repositories, if any.
    for (const repository of repositories) {
      if (this._repositories.has(repository)) {
        continue;
      }
      const hgRepository = ((repository: any): HgRepositoryClient);
      this._repositories.add(hgRepository);
      if (this._isActive) {
        this._actionCreators.activateRepository(repository);
      }
    }

    // Update active repository stack, if needed.
    // This will make sure we have a repository stack active whenever we have
    // a mercurial repository added to the project.
    if (this._activeRepository == null && this._repositories.size > 0) {
      this._setActiveRepository(
        Array.from(this._repositories)[0],
      );
    }
  }

  diffFile(filePath: NuclideUri): void {
    this._actionCreators.diffFile(filePath);
  }

  getActiveStackDirtyFileChanges(): Map<NuclideUri, FileChangeStatusValue> {
    return this._state.dirtyFileChanges;
  }

  setPublishMessage(publishMessage: ?string): void {
    // TODO(most) remove API.
  }

  setCommitMessage(commitMessage: string): void {
    // TODO(most) remove API.
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

  setNewContents(newContents: string): void {
    // TODO(most): set new contents.
  }

  setCompareRevision(revision: RevisionInfo): void {
    track('diff-view-set-revision');
    const repository = this._activeRepository;
    invariant(repository, 'There must be an active repository!');
    this._actionCreators.setCompareId(repository, revision.id);
  }

  getPublishUpdates(): Subject<any> {
    return this._publishUpdates;
  }

  _setActiveRepository(repository: HgRepositoryClient): void {
    this._activeRepository = repository;
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
    const activeRepository = this._activeRepository;
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
    const activeRepository = this._activeRepository;
    invariant(activeRepository != null, 'No active repository stack');
    track('diff-view-commit');
    this._actionCreators.commit(activeRepository, message);
  }

  injectState(newState: State): void {
    this._state = newState;
    this._emitter.emit(DID_UPDATE_STATE_EVENT);
  }

  getState(): State {
    return this._state;
  }

  setCommitMode(commitMode: CommitModeType, loadModeState?: boolean = true): void {
    this._actionCreators.setCommitMode(commitMode);
  }

  setShouldAmendRebase(shouldRebaseOnAmend: boolean): void {
    this._actionCreators.setShouldRebaseOnAmend(shouldRebaseOnAmend);
  }

  activate(): void {
    this._updateRepositories();
    this._isActive = true;
    for (const repository of this._repositories) {
      // TODO(most): Consider activating only the visible repository.
      this._actionCreators.activateRepository(repository);
    }
  }

  deactivate(): void {
    if (!this._isActive) {
      return;
    }
    this._isActive = false;
    for (const repository of this._repositories) {
      this._actionCreators.deactivateRepository(repository);
    }
    this._activeRepository = null;
  }

  dispose(): void {
    this.deactivate();
    this._subscriptions.dispose();
    this._repositories.clear();
  }
}
