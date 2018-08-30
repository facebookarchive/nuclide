/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 * @format
 */

import type Immutable from 'immutable';
import type {NuclideUri} from 'nuclide-commons/nuclideUri';
import type {RemoteTransferService} from '../../nuclide-remote-transfer';
import type {FileTreeNode} from './FileTreeNode';
import type {StatusCodeNumberValue} from '../../nuclide-hg-rpc/lib/HgService';
import * as React from 'react';
import type {WorkingSet} from '../../nuclide-working-sets-common';
import type {WorkingSetsStore} from '../../nuclide-working-sets/lib/types';
import type CwdApi from '../../nuclide-current-working-directory/lib/CwdApi';
import type {SelectionRange} from './FileTreeSelectionRange';
import type {GeneratedFileType} from '../../nuclide-generated-files-rpc';
import type {FileChangeStatusValue} from '../../nuclide-vcs-base';
import type {RemoteProjectsService} from '../../nuclide-remote-projects';

export type Roots = Immutable.OrderedMap<NuclideUri, FileTreeNode>;

export type Store = {
  getState(): AppState,
  dispatch(action: Action): void,
  subscribe(cb: (AppState) => mixed): () => mixed,
};

// Middleware does not get passed the subscribe function
export type MiddlewareStore = {
  getState(): AppState,
  dispatch(action: Action): void,
};

export type ExportStoreData = {
  childKeyMap: {[key: string]: Array<string>},
  expandedKeysByRoot: {[key: string]: Array<string>},
  rootKeys: Array<string>,
  selectedKeysByRoot: {[key: string]: Array<string>},
  version: number,
  openFilesExpanded?: boolean,
  uncommittedChangesExpanded?: boolean,
  foldersExpanded?: boolean,
};

export type InitialData = {|
  roots: Roots,
  openFilesExpanded: ?boolean,
  uncommittedChangesExpanded: ?boolean,
  foldersExpanded: ?boolean,
|};

export type StoreConfigData = {
  vcsStatuses: Immutable.Map<
    NuclideUri,
    Map<NuclideUri, StatusCodeNumberValue>,
  >,
  workingSet: WorkingSet,
  hideIgnoredNames: boolean,
  excludeVcsIgnoredPaths: boolean,
  hideVcsIgnoredPaths: boolean,
  ignoredPatterns: Immutable.Set<any /* Minimatch */>,
  usePreviewTabs: boolean,
  focusEditorOnFileSelection: boolean,
  isEditingWorkingSet: boolean,
  openFilesWorkingSet: WorkingSet,
  reposByRoot: {[rootUri: NuclideUri]: atom$Repository},
  editedWorkingSet: WorkingSet,
  fileChanges: Immutable.Map<
    NuclideUri,
    Immutable.Map<NuclideUri, FileChangeStatusValue>,
  >,
};

type TargetNodeKeys = {|
  rootKey: NuclideUri,
  nodeKey: NuclideUri,
|};

// TODO: Rename to AppState, FileTreeState, or something like that.
export type AppState = {|
  VERSION: number,
  _roots: Roots,
  _openFilesExpanded: boolean,
  _uncommittedChangesExpanded: boolean,
  _foldersExpanded: boolean,
  _reorderPreviewStatus: ReorderPreviewStatus,

  _conf: StoreConfigData, // The configuration for the file-tree. Avoid direct writing.
  _workingSetsStore: ?WorkingSetsStore,
  _usePrefixNav: boolean,
  _autoExpandSingleChild: boolean,
  _isLoadingMap: Immutable.Map<NuclideUri, Promise<void>>,
  _repositories: Immutable.Set<atom$Repository>,
  _fileChanges: Immutable.Map<
    NuclideUri,
    Immutable.Map<NuclideUri, FileChangeStatusValue>,
  >,

  _generatedOpenChangedFiles: Immutable.Map<NuclideUri, GeneratedFileType>,
  _cwdApi: ?CwdApi,
  _cwdKey: ?NuclideUri,
  _filter: string,
  _extraProjectSelectionContent: Immutable.List<React.Element<any>>,
  _selectionRange: ?SelectionRange,
  _targetNodeKeys: ?TargetNodeKeys,
  _trackedRootKey: ?NuclideUri,
  _trackedNodeKey: ?NuclideUri,
  _isCalculatingChanges: boolean,

  _maxComponentWidth: number,

  _selectedUris: Immutable.Map<NuclideUri, Immutable.Set<NuclideUri>>,
  _focusedUris: Immutable.Map<NuclideUri, Immutable.Set<NuclideUri>>,
  remoteTransferService: ?RemoteTransferService,
|};

export type NodeCheckedStatus = 'checked' | 'clear' | 'partial';

export type ReorderPreviewStatus = ?{
  source: NuclideUri,
  sourceIdx: number,
  target?: NuclideUri,
  targetIdx?: number,
};

export type Action =
  | {
      type: 'COLLAPSE_NODE',
      rootKey: NuclideUri,
      nodeKey: NuclideUri,
    }
  | {
      type: 'COLLAPSE_NODE_DEEP',
      rootKey: NuclideUri,
      nodeKey: NuclideUri,
    }
  | {
      type: 'DELETE_SELECTED_NODES',
    }
  | {
      type: 'EXPAND_NODE',
      rootKey: NuclideUri,
      nodeKey: NuclideUri,
    }
  | {
      type: 'SET_EXCLUDE_VCS_IGNORED_PATHS',
      excludeVcsIgnoredPaths: boolean,
    }
  | {
      type: 'SET_HIDE_VCS_IGNORED_PATHS',
      hideVcsIgnoredPaths: boolean,
    }
  | {
      type: 'EXPAND_NODE_DEEP',
      rootKey: NuclideUri,
      nodeKey: NuclideUri,
    }
  | {
      type: 'SET_CWD',
      rootKey: ?NuclideUri,
    }
  | {
      type: 'SET_CWD_API',
      cwdApi: ?CwdApi,
    }
  | {
      type: 'SET_HIDE_IGNORED_NAMES',
      hideIgnoredNames: boolean,
    }
  | {
      type: 'SET_IS_CALCULATING_CHANGES',
      isCalculatingChanges: boolean,
    }
  | {
      type: 'SET_IGNORED_NAMES',
      ignoredNames: Array<string>,
    }
  | {
      type: 'SET_TRACKED_NODE',
      rootKey: NuclideUri,
      nodeKey: NuclideUri,
    }
  | {
      type: 'CLEAR_TRACKED_NODE',
    }
  | {
      type: 'CLEAR_TRACKED_NODE_IF_NOT_LOADING',
    }
  | {
      type: 'START_REORDER_DRAG',
      draggedRootKey: NuclideUri,
    }
  | {
      type: 'END_REORDER_DRAG',
    }
  | {
      type: 'REORDER_DRAG_INTO',
      dragTargetNodeKey: NuclideUri,
    }
  | {
      type: 'MOVE_TO_NODE',
      rootKey: NuclideUri,
      nodeKey: NuclideUri,
    }
  | {
      type: 'SET_USE_PREVIEW_TABS',
      usePreviewTabs: boolean,
    }
  | {
      type: 'SET_FOCUS_EDITOR_ON_FILE_SELECTION',
      focusEditorOnFileSelection: boolean,
    }
  | {
      type: 'SET_USE_PREFIX_NAV',
      usePrefixNav: boolean,
    }
  | {
      type: 'SET_AUTO_EXPAND_SINGLE_CHILD',
      autoExpandSingleChild: boolean,
    }
  | {
      type: 'SET_VCS_STATUSES', // VCS = version control system
      rootKey: NuclideUri,
      vcsStatuses: Map<NuclideUri, StatusCodeNumberValue>,
    }
  | {
      type: 'SET_REPOSITORIES',
      // Immutable.Set<atom$Repository>, but since we don't have typedefs for immutable let's just be
      // honest here.
      repositories: any,
    }
  | {
      type: 'SET_WORKING_SET',
      workingSet: WorkingSet,
    }
  | {
      type: 'SET_OPEN_FILES_WORKING_SET',
      openFilesWorkingSet: WorkingSet,
    }
  | {
      type: 'SET_WORKING_SETS_STORE',
      workingSetsStore: ?WorkingSetsStore,
    }
  | {
      type: 'START_EDITING_WORKING_SET',
      editedWorkingSet: WorkingSet,
    }
  | {
      type: 'FINISH_EDITING_WORKING_SET',
    }
  | {
      type: 'CHECK_NODE',
      rootKey: NuclideUri,
      nodeKey: NuclideUri,
    }
  | {
      type: 'UNCHECK_NODE',
      rootKey: NuclideUri,
      nodeKey: NuclideUri,
    }
  | {
      type: 'SET_DRAG_HOVERED_NODE',
      rootKey: NuclideUri,
      nodeKey: NuclideUri,
    }
  | {
      type: 'UNHOVER_NODE',
      rootKey: NuclideUri,
      nodeKey: NuclideUri,
    }
  | {
      type: 'SET_SELECTED_NODE',
      rootKey: NuclideUri,
      nodeKey: NuclideUri,
    }
  | {
      type: 'SET_FOCUSED_NODE',
      rootKey: NuclideUri,
      nodeKey: NuclideUri,
    }
  | {
      type: 'ADD_SELECTED_NODE',
      rootKey: NuclideUri,
      nodeKey: NuclideUri,
    }
  | {
      type: 'UNSELECT_NODE',
      rootKey: NuclideUri,
      nodeKey: NuclideUri,
    }
  | {
      type: 'RANGE_SELECT_TO_NODE',
      rootKey: NuclideUri,
      nodeKey: NuclideUri,
    }
  | {
      type: 'RANGE_SELECT_UP',
    }
  | {
      type: 'RANGE_SELECT_DOWN',
    }
  | {
      type: 'MOVE_SELECTION_UP',
    }
  | {
      type: 'MOVE_SELECTION_DOWN',
    }
  | {
      type: 'MOVE_SELECTION_TO_TOP',
    }
  | {
      type: 'MOVE_SELECTION_TO_BOTTOM',
    }
  | {
      type: 'CLEAR_FILTER',
    }
  | {
      type: 'ADD_EXTRA_PROJECT_SELECTION_CONTENT',
      content: React.Element<any>,
    }
  | {
      type: 'REMOVE_EXTRA_PROJECT_SELECTION_CONTENT',
      content: React.Element<any>,
    }
  | {
      type: 'SET_FOLDERS_EXPANDED',
      foldersExpanded: boolean,
    }
  | {
      type: 'SET_OPEN_FILES_EXPANDED',
      openFilesExpanded: boolean,
    }
  | {
      type: 'SET_UNCOMMITTED_CHANGES_EXPANDED',
      uncommittedChangesExpanded: boolean,
    }
  | {
      type: 'INVALIDATE_REMOVED_FOLDER',
    }
  | {
      type: 'SET_TARGET_NODE',
      rootKey: NuclideUri,
      nodeKey: NuclideUri,
    }
  | {
      type: 'UPDATE_GENERATED_STATUSES',
      generatedFileTypes: Map<NuclideUri, GeneratedFileType>,
    }
  | {
      type: 'ADD_FILTER_LETTER',
      letter: string,
    }
  | {
      type: 'REMOVE_FILTER_LETTER',
    }
  | {|
      type: 'SET_CWD',
      rootKey: ?string,
    |}
  | {|type: 'CLEAR_FILTER'|}
  | {|
      type: 'ADD_EXTRA_PROJECT_SELECTION_CONTENT',
      content: React.Element<any>,
    |}
  | {|
      type: 'REMOVE_EXTRA_PROJECT_SELECTION_CONTENT',
      content: React.Element<any>,
    |}
  | {|type: 'DELETE_SELECTED_NODES'|}
  | {|
      type: 'SET_EXCLUDE_VCS_IGNORED_PATHS',
      excludeVcsIgnoredPaths: boolean,
    |}
  | {|
      type: 'SET_HIDE_VCS_IGNORED_PATHS',
      hideVcsIgnoredPaths: boolean,
    |}
  | {|
      type: 'SET_HIDE_IGNORED_NAMES',
      hideIgnoredNames: boolean,
    |}
  | {|
      type: 'SET_IS_CALCULATING_CHANGES',
      isCalculatingChanges: boolean,
    |}
  | {|
      type: 'SET_IGNORED_NAMES',
      ignoredNames: Array<string>,
    |}
  | {|
      type: 'SET_TRACKED_NODE',
      nodeKey: string,
      rootKey: string,
    |}
  | {|
      type: 'CLEAR_TRACKED_NODE',
    |}
  | {|
      type: 'CLEAR_TRACKED_NODE_IF_NOT_LOADING',
    |}
  | {|
      type: 'START_REORDER_DRAG',
      draggedRootKey: string,
    |}
  | {|
      type: 'END_REORDER_DRAG',
    |}
  | {|
      type: 'REORDER_DRAG_INTO',
      dragTargetNodeKey: string,
    |}
  | {|type: 'REORDER_ROOTS'|}
  | {|
      type: 'MOVE_TO_NODE',
      nodeKey: string,
      rootKey: string,
    |}
  | {|
      type: 'SET_USE_PREVIEW_TABS',
      usePreviewTabs: boolean,
    |}
  | {|
      type: 'SET_FOCUS_EDITOR_ON_FILE_SELECTION',
      focusEditorOnFileSelection: boolean,
    |}
  | {|
      type: 'SET_USE_PREFIX_NAV',
      usePrefixNav: boolean,
    |}
  | {|
      type: 'SET_AUTO_EXPAND_SINGLE_CHILD',
      autoExpandSingleChild: boolean,
    |}
  | {|
      type: 'SET_VCS_STATUSES',
      rootKey: string,
      vcsStatuses: Map<NuclideUri, StatusCodeNumberValue>,
    |}
  | {|
      type: 'INVALIDATE_REMOVED_FOLDER',
    |}
  | {|
      type: 'WORKING_SET_CHANGE_REQUESTED',
      workingSet: WorkingSet,
    |}
  | {|
      type: 'SET_WORKING_SET',
      workingSet: WorkingSet,
    |}
  | {|
      type: 'SET_OPEN_FILES_WORKING_SET',
      openFilesWorkingSet: WorkingSet,
    |}
  | {|
      type: 'SET_WORKING_SETS_STORE',
      workingSetsStore: ?WorkingSetsStore,
    |}
  | {|
      type: 'START_EDITING_WORKING_SET',
      editedWorkingSet: WorkingSet,
    |}
  | {|
      type: 'FINISH_EDITING_WORKING_SET',
    |}
  | {|
      type: 'CHECK_NODE',
      rootKey: string,
      nodeKey: string,
    |}
  | {|
      type: 'UNCHECK_NODE',
      rootKey: string,
      nodeKey: string,
    |}
  | {|
      type: 'SET_DRAG_HOVERED_NODE',
      rootKey: string,
      nodeKey: string,
    |}
  | {|
      type: 'SET_SELECTED_NODE',
      rootKey: string,
      nodeKey: string,
    |}
  | {|
      type: 'SET_FOCUSED_NODE',
      rootKey: string,
      nodeKey: string,
    |}
  | {|
      type: 'ADD_SELECTED_NODE',
      rootKey: string,
      nodeKey: string,
    |}
  | {|
      type: 'UNSELECT_NODE',
      rootKey: string,
      nodeKey: string,
    |}
  | {|
      type: 'RANGE_SELECT_TO_NODE',
      rootKey: string,
      nodeKey: string,
    |}
  | {|
      type: 'RANGE_SELECT_UP',
    |}
  | {|
      type: 'RANGE_SELECT_DOWN',
    |}
  | {|
      type: 'UNHOVER_NODE',
      rootKey: string,
      nodeKey: string,
    |}
  | {|
      type: 'MOVE_SELECTION_UP',
    |}
  | {|
      type: 'MOVE_SELECTION_DOWN',
    |}
  | {|
      type: 'MOVE_SELECTION_TO_TOP',
    |}
  | {|
      type: 'MOVE_SELECTION_TO_BOTTOM',
    |}
  | {|
      type: 'SET_OPEN_FILES_EXPANDED',
      openFilesExpanded: boolean,
    |}
  | {|
      type: 'SET_UNCOMMITTED_CHANGES_EXPANDED',
      uncommittedChangesExpanded: boolean,
    |}
  | {|
      type: 'SET_FOLDERS_EXPANDED',
      foldersExpanded: boolean,
    |}
  | {|
      type: 'SET_TARGET_NODE',
      rootKey: NuclideUri,
      nodeKey: NuclideUri,
    |}
  | {|
      type: 'ADD_FILTER_LETTER',
      letter: string,
    |}
  | {|
      type: 'REMOVE_FILTER_LETTER',
    |}
  | {|
      type: 'UPDATE_MAX_COMPONENT_WIDTH',
      width: ?number,
    |}
  | {|
      type: 'CONFIRM_NODE',
      rootKey: string,
      nodeKey: string,
      pending: boolean,
    |}
  | {|type: 'KEEP_PREVIEW_TAB'|}
  | {|
      type: 'OPEN_ENTRY_SPLIT',
      nodeKey: string,
      orientation: atom$PaneSplitOrientation,
      side: atom$PaneSplitSide,
    |}
  | {|
      type: 'OPEN_SELECTED_ENTRY_SPLIT',
      orientation: atom$PaneSplitOrientation,
      side: atom$PaneSplitSide,
    |}
  | {|
      type: 'UPDATE_REPOSITORIES',
      rootDirectories: Array<atom$Directory>,
    |}
  | {|
      type: 'REVEAL_NODE_KEY',
      nodeKey: ?string,
    |}
  | {|
      type: 'REVEAL_FILE_PATH',
      filePath: ?string,
      showIfHidden: boolean,
    |}
  | {|
      type: 'OPEN_AND_REVEAL_FILE_PATH',
      filePath: ?string,
    |}
  | {|
      type: 'OPEN_AND_REVEAL_FILE_PATHS',
      filePaths: Array<string>,
    |}
  | {|
      type: 'OPEN_AND_REVEAL_DIRECTORY_PATH',
      path: ?string,
    |}
  | {|type: 'UPDATE_ROOT_DIRECTORIES'|}
  | {|type: 'SET_CWD_TO_SELECTION'|}
  | {|
      type: 'SET_CWD_API',
      cwdApi: ?CwdApi,
    |}
  | {|
      type: 'SET_REMOTE_PROJECTS_SERVICE',
      service: ?RemoteProjectsService,
    |}
  | {|
      type: 'COLLAPSE_SELECTION',
      deep: boolean,
    |}
  | {|type: 'COLLAPSE_ALL'|}
  | {|type: 'DELETE_SELECTION'|}
  | {|
      type: 'EXPAND_SELECTION',
      deep: boolean,
    |}
  | {|type: 'OPEN_SELECTED_ENTRY'|}
  | {|type: 'REMOVE_ROOT_FOLDER_SELECTION'|}
  | {|type: 'COPY_FILENAMES_WITH_DIR'|}
  | {|
      type: 'OPEN_ADD_FOLDER_DIALOG',
      onDidConfirm: (filePath: ?string) => mixed,
    |}
  | {|
      type: 'OPEN_ADD_FILE_DIALOG',
      onDidConfirm: (filePath: ?string) => mixed,
    |}
  | {|
      type: 'OPEN_ADD_FILE_DIALOG_RELATIVE',
      onDidConfirm: (filePath: ?string) => mixed,
    |}
  | {|type: 'OPEN_RENAME_DIALOG'|}
  | {|
      type: 'OPEN_DUPLICATE_DIALOG',
      onDidConfirm: (filePaths: Array<string>) => mixed,
    |}
  | {|
      type: 'OPEN_NEXT_DUPLICATE_DIALOG',
      nodes: Immutable.List<FileTreeNode>,
      onDidConfirm: (filePaths: Array<string>) => mixed,
    |}
  | {|type: 'OPEN_PASTE_DIALOG'|}
  | {|type: 'CLEAR_SELECTION_RANGE'|}
  | {|type: 'CLEAR_DRAG_HOVER'|}
  | {|type: 'CLEAR_SELECTION'|}
  | {|
      type: 'SET_ROOTS',
      roots: Roots,
    |}
  | {|
      type: 'CLEAR_LOADING',
      nodeKey: NuclideUri,
    |}
  | {|
      type: 'SET_LOADING',
      nodeKey: NuclideUri,
      promise: Promise<void>,
    |}
  | {|
      type: 'SET_INITIAL_DATA',
      data: InitialData,
    |}
  | {|
      type: 'LOAD_DATA',
      data: ExportStoreData,
    |}
  | {|
      type: 'GOT_REMOTE_TRANSFER_SERVICE',
      remoteTransferService: ?RemoteTransferService,
    |}
  | {|
      type: 'UPLOAD_DROPPED_FILES',
      destination: FileTreeNode,
      files: FileList,
    |}
  | SelectionAction;

export type SelectionAction =
  | {|
      type: 'SELECTION:SELECT',
      node: FileTreeNode,
    |}
  | {|
      type: 'SELECTION:UNSELECT',
      node: FileTreeNode,
    |}
  | {|
      type: 'SELECTION:FOCUS',
      node: FileTreeNode,
    |}
  | {|
      type: 'SELECTION:UNFOCUS',
      node: FileTreeNode,
    |}
  | {|type: 'SELECTION:CLEAR_SELECTED'|}
  | {|type: 'SELECTION:CLEAR_FOCUSED'|};
