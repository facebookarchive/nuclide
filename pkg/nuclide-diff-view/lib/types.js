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
import type DiffViewEditor from './DiffViewEditor';

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
export type LineMapper = Array<number>;

export type TextDiff = LineMapping & {
  addedLines: Array<number>,
  removedLines: Array<number>,
  oldLineOffsets: OffsetMap,
  newLineOffsets: OffsetMap,
};

export type LineMapping = {
  newToOld: LineMapper,
  oldToNew: LineMapper,
};

export type HgDiffState = {
  revisionInfo: RevisionInfo,
  committedContents: string,
};

export type HighlightedLines = {
  added: Array<number>,
  removed: Array<number>,
};

export type NavigationSectionStatusType =
  'Added' | 'Changed' | 'Removed' | 'New Element' | 'Old Element';

export type NavigationSection = {
  lineCount: number,
  lineNumber: number,
  offsetLineNumber: number,
  status: NavigationSectionStatusType,
};

export type EditorElementsMap = Map<number, React.Element<any>>;

export type UIElements = {
  oldEditorElements: EditorElementsMap,
  newEditorElements: EditorElementsMap,
};

export type UIProvider = {
  composeUiElements: (
    filePath: NuclideUri,
    oldContents: string,
    newContents: string,
  ) => Observable<UIElements>,
};

// Redux store types.

export type RepositoryState = {
  compareRevisionId: ?number,
  dirtyFiles: Map<NuclideUri, FileChangeStatusValue>,
  headToForkBaseRevisions: Array<RevisionInfo>,
  headRevision: ?RevisionInfo,
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

export type EditorState = {
  revisionTitle: string,
  text: string,
  offsets: OffsetMap,
  highlightedLines: {
    added: Array<number>,
    removed: Array<number>,
  },
  inlineElements: EditorElementsMap,
  inlineOffsetElements: EditorElementsMap,
};

export type FileDiffState = {
  filePath: NuclideUri,
  lineMapping: LineMapping,
  oldEditorState: EditorState,
  newEditorState: EditorState,
  navigationSections: Array<NavigationSection>,
  activeSectionIndex: number,
};

export type DiffEditorsState = {
  newDiffEditor: DiffViewEditor,
  oldDiffEditor: DiffViewEditor,
};

export type AppState = {
  activeRepository: ?HgRepositoryClient,
  activeRepositoryState: RepositoryState,
  commit: CommitState,
  cwdApi: ?CwdApi,
  diffEditors: ?DiffEditorsState,
  diffEditorsVisible: boolean,
  diffNavigatorVisible: boolean,
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
    filePath: NuclideUri,
    newContents: string,
    oldContents: string,
    fromRevision: ?RevisionInfo,
  },
};

export type UpdateFileUiElementsAction = {
  type: 'UPDATE_FILE_UI_ELEMENTS',
  payload: UIElements,
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

export type UpdateDiffEditorsVisibilityAction = {
  type: 'UPDATE_DIFF_EDITORS_VISIBILITY',
  payload: {
    visible: boolean,
  },
};

export type UpdateDiffNavigatorVisibilityAction = {
  type: 'UPDATE_DIFF_NAVIGATOR_VISIBILITY',
  payload: {
    visible: boolean,
  },
};

export type UpdateDiffEditorsAction = {
  type: 'UPDATE_DIFF_EDITORS',
  payload: ?DiffEditorsState,
};

export type UpdateActiveNavigationSectionAction = {
  type: 'UPDATE_ACTIVE_NAVIGATION_SECTION',
  payload: {
    sectionIndex: number,
  },
};

export type Action = AddRepositoryAction
  | AddUiProviderAction
  | CommitAction
  | DiffFileAction
  | PublishDiffAction
  | RemoveRepositoryAction
  | RemoveUiProviderAction
  | SetCommitModeAction
  | SetCompareIdAction
  | SetCwdApiAction
  | SetShouldReabaseOnAmendAction
  | SetViewModeAction
  | UpdateActiveNavigationSectionAction
  | UpdateActiveRepositoryAction
  | UpdateCommitStateAction
  | UpdateDiffEditorsAction
  | UpdateDiffEditorsVisibilityAction
  | UpdateDiffNavigatorVisibilityAction
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
