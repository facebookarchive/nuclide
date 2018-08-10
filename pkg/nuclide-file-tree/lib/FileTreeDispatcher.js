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

// $FlowFixMe(>=0.53.0) Flow suppress
import type React from 'react';
import type Immutable from 'immutable';
import type {NuclideUri} from 'nuclide-commons/nuclideUri';
import type CwdApi from '../../nuclide-current-working-directory/lib/CwdApi';
import type {StatusCodeNumberValue} from '../../nuclide-hg-rpc/lib/HgService';
import type {WorkingSet} from '../../nuclide-working-sets-common';
import type {WorkingSetsStore} from '../../nuclide-working-sets/lib/types';
import type {RemoteProjectsService} from '../../nuclide-remote-projects';
import type {FileTreeNode} from './FileTreeNode';
import type {ExportStoreData, InitialData, Roots} from './types';
import type {GeneratedFileType} from '../../nuclide-generated-files-rpc';

import Dispatcher from '../../commons-node/Dispatcher';

export type FileTreeAction =
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

export const ActionTypes = Object.freeze({
  CLEAR_DRAG_HOVER: 'CLEAR_DRAG_HOVER',
  CLEAR_LOADING: 'CLEAR_LOADING',
  CLEAR_SELECTION: 'CLEAR_SELECTION',
  CLEAR_SELECTION_RANGE: 'CLEAR_SELECTION_RANGE',
  COLLAPSE_NODE: 'COLLAPSE_NODE',
  COLLAPSE_NODE_DEEP: 'COLLAPSE_NODE_DEEP',
  COLLAPSE_SELECTION: 'COLLAPSE_SELECTION',
  COLLAPSE_ALL: 'COLLAPSE_ALL',
  CONFIRM_NODE: 'CONFIRM_NODE',
  COPY_FILENAMES_WITH_DIR: 'COPY_FILENAMES_WITH_DIR',
  DELETE_SELECTED_NODES: 'DELETE_SELECTED_NODES',
  DELETE_SELECTION: 'DELETE_SELECTION',
  EXPAND_NODE: 'EXPAND_NODE',
  EXPAND_SELECTION: 'EXPAND_SELECTION',
  LOAD_DATA: 'LOAD_DATA',
  SET_EXCLUDE_VCS_IGNORED_PATHS: 'SET_EXCLUDE_VCS_IGNORED_PATHS',
  EXPAND_NODE_DEEP: 'EXPAND_NODE_DEEP',
  SET_CWD: 'SET_CWD',
  SET_CWD_TO_SELECTION: 'SET_CWD_TO_SELECTION',
  SET_CWD_API: 'SET_CWD_API',
  SET_HIDE_IGNORED_NAMES: 'SET_HIDE_IGNORED_NAMES',
  SET_HIDE_VCS_IGNORED_PATHS: 'SET_HIDE_VCS_IGNORED_PATHS',
  SET_IS_CALCULATING_CHANGES: 'SET_IS_CALCULATING_CHANGES',
  SET_IGNORED_NAMES: 'SET_IGNORED_NAMES',
  SET_LOADING: 'SET_LOADING',
  SET_ROOTS: 'SET_ROOTS',
  SET_TRACKED_NODE: 'SET_TRACKED_NODE',
  SET_REMOTE_PROJECTS_SERVICE: 'SET_REMOTE_PROJECTS_SERVICE',
  CLEAR_TRACKED_NODE: 'CLEAR_TRACKED_NODE',
  CLEAR_TRACKED_NODE_IF_NOT_LOADING: 'CLEAR_TRACKED_NODE_IF_NOT_LOADING',
  KEEP_PREVIEW_TAB: 'KEEP_PREVIEW_TAB',
  OPEN_SELECTED_ENTRY: 'OPEN_SELECTED_ENTRY',
  OPEN_SELECTED_ENTRY_SPLIT: 'OPEN_SELECTED_ENTRY_SPLIT',
  OPEN_ENTRY_SPLIT: 'OPEN_ENTRY_SPLIT',
  OPEN_ADD_FOLDER_DIALOG: 'OPEN_ADD_FOLDER_DIALOG',
  OPEN_ADD_FILE_DIALOG: 'OPEN_ADD_FILE_DIALOG',
  OPEN_ADD_FILE_DIALOG_RELATIVE: 'OPEN_ADD_FILE_DIALOG_RELATIVE',
  OPEN_RENAME_DIALOG: 'OPEN_RENAME_DIALOG',
  OPEN_DUPLICATE_DIALOG: 'OPEN_DUPLICATE_DIALOG',
  OPEN_NEXT_DUPLICATE_DIALOG: 'OPEN_NEXT_DUPLICATE_DIALOG',
  OPEN_PASTE_DIALOG: 'OPEN_PASTE_DIALOG',
  START_REORDER_DRAG: 'START_REORDER_DRAG',
  END_REORDER_DRAG: 'END_REORDER_DRAG',
  REVEAL_NODE_KEY: 'REVEAL_NODE_KEY',
  REVEAL_FILE_PATH: 'REVEAL_FILE_PATH',
  OPEN_AND_REVEAL_FILE_PATH: 'OPEN_AND_REVEAL_FILE_PATH',
  OPEN_AND_REVEAL_FILE_PATHS: 'OPEN_AND_REVEAL_FILE_PATHS',
  OPEN_AND_REVEAL_DIRECTORY_PATH: 'OPEN_AND_REVEAL_DIRECTORY_PATH',
  REORDER_DRAG_INTO: 'REORDER_DRAG_INTO',
  REORDER_ROOTS: 'REORDER_ROOTS',
  MOVE_TO_NODE: 'MOVE_TO_NODE',
  SET_INITIAL_DATA: 'SET_INITIAL_DATA',
  SET_USE_PREVIEW_TABS: 'SET_USE_PREVIEW_TABS',
  SET_USE_PREFIX_NAV: 'SET_USE_PREFIX_NAV',
  SET_AUTO_EXPAND_SINGLE_CHILD: 'SET_AUTO_EXPAND_SINGLE_CHILD',
  SET_FOCUS_EDITOR_ON_FILE_SELECTION: 'SET_FOCUS_EDITOR_ON_FILE_SELECTION',
  SET_VCS_STATUSES: 'SET_VCS_STATUSES',
  SET_REPOSITORIES: 'SET_REPOSITORIES',
  SET_WORKING_SET: 'SET_WORKING_SET',
  WORKING_SET_CHANGE_REQUESTED: 'WORKING_SET_CHANGE_REQUESTED',
  SET_OPEN_FILES_WORKING_SET: 'SET_OPEN_FILES_WORKING_SET',
  SET_WORKING_SETS_STORE: 'SET_WORKING_SETS_STORE',
  START_EDITING_WORKING_SET: 'START_EDITING_WORKING_SET',
  FINISH_EDITING_WORKING_SET: 'FINISH_EDITING_WORKING_SET',
  CHECK_NODE: 'CHECK_NODE',
  UNCHECK_NODE: 'UNCHECK_NODE',
  SET_DRAG_HOVERED_NODE: 'SET_DRAG_HOVERED_NODE',
  UNHOVER_NODE: 'UNHOVER_NODE',
  SET_SELECTED_NODE: 'SET_SELECTED_NODE',
  SET_FOCUSED_NODE: 'SET_FOCUSED_NODE',
  ADD_SELECTED_NODE: 'ADD_SELECTED_NODE',
  UNSELECT_NODE: 'UNSELECT_NODE',
  RANGE_SELECT_TO_NODE: 'RANGE_SELECT_TO_NODE',
  RANGE_SELECT_UP: 'RANGE_SELECT_UP',
  RANGE_SELECT_DOWN: 'RANGE_SELECT_DOWN',
  MOVE_SELECTION_UP: 'MOVE_SELECTION_UP',
  MOVE_SELECTION_DOWN: 'MOVE_SELECTION_DOWN',
  MOVE_SELECTION_TO_TOP: 'MOVE_SELECTION_TO_TOP',
  MOVE_SELECTION_TO_BOTTOM: 'MOVE_SELECTION_TO_BOTTOM',
  CLEAR_FILTER: 'CLEAR_FILTER',
  ADD_EXTRA_PROJECT_SELECTION_CONTENT: 'ADD_EXTRA_PROJECT_SELECTION_CONTENT',
  REMOVE_EXTRA_PROJECT_SELECTION_CONTENT:
    'REMOVE_EXTRA_PROJECT_SELECTION_CONTENT',
  REMOVE_ROOT_FOLDER_SELECTION: 'REMOVE_ROOT_FOLDER_SELECTION',
  SET_OPEN_FILES_EXPANDED: 'SET_OPEN_FILES_EXPANDED',
  SET_UNCOMMITTED_CHANGES_EXPANDED: 'SET_UNCOMMITTED_CHANGES_EXPANDED',
  SET_FOLDERS_EXPANDED: 'SET_FOLDERS_EXPANDED',
  INVALIDATE_REMOVED_FOLDER: 'INVALIDATE_REMOVED_FOLDER',
  SET_TARGET_NODE: 'SET_TARGET_NODE',
  UPDATE_GENERATED_STATUSES: 'UPDATE_GENERATED_STATUSES',
  ADD_FILTER_LETTER: 'ADD_FILTER_LETTER',
  REMOVE_FILTER_LETTER: 'REMOVE_FILTER_LETTER',
  UPDATE_REPOSITORIES: 'UPDATE_REPOSITORIES',
  UPDATE_ROOT_DIRECTORIES: 'UPDATE_ROOT_DIRECTORIES',
});

// Flow hack: Every FileTreeAction type must be in ActionTypes.
// $FlowFixMe(>=0.68.0) Flow suppress (T27187857)
(('': $PropertyType<FileTreeAction, 'type'>): $Keys<typeof ActionTypes>);

let instance: ?FileTreeDispatcher;

export default class FileTreeDispatcher extends Dispatcher<FileTreeAction> {
  static getInstance(): FileTreeDispatcher {
    if (!instance) {
      instance = new FileTreeDispatcher();
    }
    return instance;
  }
}
