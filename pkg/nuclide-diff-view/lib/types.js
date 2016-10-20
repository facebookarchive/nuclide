/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 */

import type {Message} from '../../nuclide-console/lib/types';
import type {NuclideUri} from '../../commons-node/nuclideUri';
import type {RevisionInfo} from '../../nuclide-hg-rpc/lib/HgService';
import type {HgRepositoryClient} from '../../nuclide-hg-repository-client';
import type {RevisionStatuses} from '../../nuclide-hg-repository-client/lib/HgRepositoryClient';
import type {CwdApi} from '../../nuclide-current-working-directory/lib/CwdApi';
import type {Observable, Subject} from 'rxjs';

import {React} from 'react-for-atom';

export type DiffModeType = '1. Browse' | '2. Commit' | '3. Publish';

export type CommitModeType = 'Commit' | 'Amend';

export type CommitModeStateType = 'Ready' | 'Loading Commit Message' | 'Awaiting Commit';

export type PublishModeType = 'Create' | 'Update';

export type PublishModeStateType =
  'Ready'
  | 'Loading Publish Message'
  | 'Awaiting Publish'
  | 'Publish Error'
;

export type DiffOptionType = 'Dirty' | 'Last Commit' | 'Compare Commit';

export type FileChangeStatusValue = 1 | 2 | 3 | 4 | 5;

export type FileChange = {
  filePath: NuclideUri,
  statusCode?: FileChangeStatusValue,
};

export type RevisionsState = {
  headToForkBaseRevisions: Array<RevisionInfo>,
  compareCommitId: ?number,
  headCommitId: number,
  revisionStatuses: RevisionStatuses,
  revisions: Array<RevisionInfo>,
};

export type OffsetMap = Map<number, number>;

export type TextDiff = {
  addedLines: Array<number>,
  removedLines: Array<number>,
  oldLineOffsets: OffsetMap,
  newLineOffsets: OffsetMap,
};

export type HgDiffState = {
  revisionInfo: RevisionInfo,
  committedContents: string,
};

export type HighlightedLines = {
  added: Array<number>,
  removed: Array<number>,
};

export type DiffSectionStatusType = 'Added' | 'Changed' | 'Removed';

export type DiffSection = {
  lineCount: number,
  lineNumber: number,
  offsetLineNumber: number,
  status: DiffSectionStatusType,
};

export type UIElement = {
  node: React.Element<any>,
  bufferRow: number,
  inNewEditor: boolean,
};

export type UIProvider = {
  composeUiElements: (
    filePath: NuclideUri,
    oldContents: string,
    newContents: string,
  ) => Observable<Array<UIElement>>,
};

// Redux store types.

export type RepositoryState = {
  compareRevisionId: ?number,
  dirtyFiles: Map<NuclideUri, FileChangeStatusValue>,
  headToForkBaseRevisions: Array<RevisionInfo>,
  revisionStatuses: RevisionStatuses,
  selectedFiles: Map<NuclideUri, FileChangeStatusValue>,
  isLoadingSelectedFiles: boolean,
};

export type CommitState = {
  message: ?string,
  mode: CommitModeType,
  state: CommitModeStateType,
};

export type PublishState = {
  message: ?string,
  mode: PublishModeType,
  state: PublishModeStateType,
};

export type FileDiffState = {
  filePath: NuclideUri,
  fromRevisionTitle: string,
  newContents: string,
  oldContents: string,
  toRevisionTitle: string,
  uiElements?: Array<UIElement>,
};

export type AppState = {
  activeRepository: ?HgRepositoryClient,
  commit: CommitState,
  cwdApi: ?CwdApi,
  fileDiff: FileDiffState,
  isLoadingFileDiff: boolean,
  publish: PublishState,
  repositories: Map<HgRepositoryClient, RepositoryState>,
  shouldRebaseOnAmend: boolean,
  uiProviders: Array<UIProvider>,
  viewMode: DiffModeType,
};

export type Store = {
  getState(): AppState,
  dispatch(action: Action): void,
};

export type OpenViewAction = {
  type: 'OPEN_VIEW',
};

export type CloseViewAction = {
  type: 'CLOSE_VIEW',
};

export type AddRepositoryAction = {
  type: 'ADD_REPOSITORY',
  payload: {
    repository: HgRepositoryClient,
  },
};

export type RemoveRepositoryAction = {
  type: 'REMOVE_REPOSITORY',
  payload: {
    repository: HgRepositoryClient,
  },
};

export type SetCompareIdAction = {
  type: 'SET_COMPARE_ID',
  payload: {
    repository: HgRepositoryClient,
    compareId: ?number,
  },
};

export type UpdateDirtyFilesAction = {
  type: 'UPDATE_DIRTY_FILES',
  payload: {
    repository: HgRepositoryClient,
    dirtyFiles: Map<NuclideUri, FileChangeStatusValue>,
  },
};

export type UpdateHeadToForkBaseRevisions = {
  type: 'UPDATE_HEAD_TO_FORKBASE_REVISIONS',
  payload: {
    repository: HgRepositoryClient,
    headToForkBaseRevisions: Array<RevisionInfo>,
    revisionStatuses: RevisionStatuses,
  },
};

export type UpdateSelectedFilesAction = {
  type: 'UPDATE_SELECTED_FILES',
  payload: {
    repository: HgRepositoryClient,
    selectedFiles: Map<NuclideUri, FileChangeStatusValue>,
  },
};

export type UpdateLoadingSelectedFilesAction = {
  type: 'UPDATE_LOADING_SELECTED_FILES',
  payload: {
    repository: HgRepositoryClient,
    isLoading: boolean,
  },
};

export type UpdateLoadingFileDiffAction = {
  type: 'UPDATE_LOADING_FILE_DIFF',
  payload: {
    isLoading: boolean,
  },
};

export type SetCwdApiAction = {
  type: 'SET_CWD_API',
  payload: {
    cwdApi: ?CwdApi,
  },
};

export type UpdateActiveRepositoryAction = {
  type: 'UPDATE_ACTIVE_REPOSITORY',
  payload: {
    hgRepository: ?HgRepositoryClient,
  },
};

export type DiffFileAction = {
  type: 'DIFF_FILE',
  payload: {
    filePath: NuclideUri,
    onChangeModified: () => mixed,
  },
};

export type UpdateFileDiffAction = {
  type: 'UPDATE_FILE_DIFF',
  payload: {
    fileDiff: FileDiffState,
  },
};

export type UpdateFileUiElementsAction = {
  type: 'UPDATE_FILE_UI_ELEMENTS',
  payload: {
    uiElements: Array<UIElement>,
  },
};

export type SetViewModeAction = {
  type: 'SET_VIEW_MODE',
  payload: {
    viewMode: DiffModeType,
  },
};

export type UpdateCommitStateAction = {
  type: 'UPDATE_COMMIT_STATE',
  payload: {
    commit: CommitState,
  },
};

export type UpdatePublishStateAction = {
  type: 'UPDATE_PUBLISH_STATE',
  payload: {
    publish: PublishState,
  },
};

export type SetCommitModeAction = {
  type: 'SET_COMMIT_MODE',
  payload: {
    commitMode: CommitModeType,
  },
};

export type SetShouldReabaseOnAmendAction = {
  type: 'SET_SHOULD_REBASE_ON_AMEND',
  payload: {
    shouldRebaseOnAmend: boolean,
  },
};

export type CommitAction = {
  type: 'COMMIT',
  payload: {
    message: string,
    repository: HgRepositoryClient,
    publishUpdates: Subject<Message>,
  },
};

export type PublishDiffAction = {
  type: 'PUBLISH_DIFF',
  payload: {
    isPrepareMode: boolean,
    lintExcuse: ?string,
    message: string,
    publishUpdates: Subject<any>,
    repository: HgRepositoryClient,
  },
};

export type AddUiProviderAction = {
  type: 'ADD_UI_PROVIDER',
  payload: {
    uiProvider: UIProvider,
  },
};

export type RemoveUiProviderAction = {
  type: 'REMOVE_UI_PROVIDER',
  payload: {
    uiProvider: UIProvider,
  },
};

export type Action = AddRepositoryAction
  | AddUiProviderAction
  | CloseViewAction
  | CommitAction
  | DiffFileAction
  | OpenViewAction
  | PublishDiffAction
  | RemoveRepositoryAction
  | RemoveUiProviderAction
  | SetCommitModeAction
  | SetCompareIdAction
  | SetCwdApiAction
  | SetShouldReabaseOnAmendAction
  | SetViewModeAction
  | UpdateActiveRepositoryAction
  | UpdateCommitStateAction
  | UpdateDirtyFilesAction
  | UpdateFileDiffAction
  | UpdateFileUiElementsAction
  | UpdateHeadToForkBaseRevisions
  | UpdateLoadingFileDiffAction
  | UpdateLoadingSelectedFilesAction
  | UpdatePublishStateAction
  | UpdateSelectedFilesAction
;

export type RepositoryAction =
  | AddRepositoryAction
  | RemoveRepositoryAction
  | SetCompareIdAction
  | UpdateDirtyFilesAction
  | UpdateHeadToForkBaseRevisions
  | UpdateLoadingSelectedFilesAction
  | UpdateSelectedFilesAction
;
