'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {NuclideUri} from '../../commons-node/nuclideUri';
import type {RevisionInfo} from '../../nuclide-hg-rpc/lib/HgService';
import type {HgRepositoryClient} from '../../nuclide-hg-repository-client';
import type {RevisionStatuses} from '../../nuclide-hg-repository-client/lib/HgRepositoryClient';
import type {CwdApi} from '../../nuclide-current-working-directory/lib/CwdApi';

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
};

export type UIProvider = {
  composeUiElements: (filePath: string) => Promise<Array<UIElement>>,
};

// Redux store types.

export type RepositoryState = {
  diffOption: DiffOptionType,
  revisionStatuses: RevisionStatuses,
  dirtyFiles: Map<NuclideUri, FileChangeStatusValue>,
  headToForkBaseRevisions: Array<RevisionInfo>,
  selectedFiles: Map<NuclideUri, FileChangeStatusValue>,
  compareRevisionId: ?number,
};

export type CommitState = {
  message: ?string,
  mode: CommitModeType,
  modeState: CommitModeStateType,
};

export type PublishState = {
  message: ?string,
  mode: PublishModeType,
  modeState: PublishModeStateType,
};

export type FileDiffState = {
  filePath: NuclideUri,
  fromRevisionTitle: string,
  newContents: string,
  oldContents: string,
  toRevisionTitle: string,
};

export type AppState = {
  activeRepository: ?HgRepositoryClient,
  commit: CommitState,
  fileDiff: FileDiffState,
  publish: PublishState,
  repositories: Map<HgRepositoryClient, RepositoryState>,
  shouldRebaseOnAmend: boolean,
  viewMode: DiffModeType,
};

export type Store = {
  getState(): AppState,
  dispatch(action: Action): void,
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


export type ActivateRepositoryAction = {
  type: 'ACTIVATE_REPOSITORY',
  payload: {
    repository: HgRepositoryClient,
  },
};

export type DeactivateRepositoryAction = {
  type: 'DEACTIVATE_REPOSITORY',
  payload: {
    repository: HgRepositoryClient,
  },
};

export type SetDiffOptionAction = {
  type: 'SET_DIFF_OPTION',
  payload: {
    repository: HgRepositoryClient,
    diffOption: DiffOptionType,
  },
};

export type SetCompareIdAction = {
  type: 'SET_COMPARE_ID',
  payload: {
    repository: HgRepositoryClient,
    compareId: ?number,
  },
};

export type DummyAction = {
  type: 'DUMMY',
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
  }
};

export type UpdateSelectedFilesAction = {
  type: 'UPDATE_SELECTED_FILES',
  payload: {
    repository: HgRepositoryClient,
    selectedFiles: Map<NuclideUri, FileChangeStatusValue>,
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
  },
};

export type UpdateFileDiffAction = {
  type: 'UPDATE_FILE_DIFF',
  payload: {
    fileDiff: FileDiffState,
  },
};

export type SetViewModeAction = {
  type: 'SET_VIEW_MODE',
  payload: {
    viewMode: DiffModeType,
  },
};

export type Action = ActivateRepositoryAction
  | AddRepositoryAction
  | DeactivateRepositoryAction
  | DiffFileAction
  | DummyAction
  | RemoveRepositoryAction
  | SetCompareIdAction
  | SetCwdApiAction
  | SetDiffOptionAction
  | SetViewModeAction
  | UpdateActiveRepositoryAction
  | UpdateDirtyFilesAction
  | UpdateFileDiffAction
  | UpdateHeadToForkBaseRevisions
  | UpdateSelectedFilesAction
;

export type RepositoryAction = ActivateRepositoryAction
  | AddRepositoryAction
  | DeactivateRepositoryAction
  | RemoveRepositoryAction
  | SetCompareIdAction
  | SetDiffOptionAction
  | UpdateDirtyFilesAction
  | UpdateHeadToForkBaseRevisions
  | UpdateSelectedFilesAction
;
