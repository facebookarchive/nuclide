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
import type {NuclideUri} from 'nuclide-commons/nuclideUri';
import type CwdApi from '../../nuclide-current-working-directory/lib/CwdApi';
import type {StatusCodeNumberValue} from '../../nuclide-hg-rpc/lib/HgService';
import type {WorkingSet} from '../../nuclide-working-sets-common';
import type {WorkingSetsStore} from '../../nuclide-working-sets/lib/types';

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
      type: 'SET_ROOT_KEYS',
      rootKeys: Array<NuclideUri>,
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
      type: 'REORDER_ROOTS',
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
      type: 'ENSURE_CHILD_NODE',
      nodeKey: NuclideUri,
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
      type: 'UPDATE_GENERATED_STATUS',
      filesToCheck: Iterable<NuclideUri>,
    }
  | {
      type: 'ADD_FILTER_LETTER',
      letter: string,
    }
  | {
      type: 'REMOVE_FILTER_LETTER',
    }
  | {
      type: 'RESET',
    }
  | {
      type: 'UPDATE_MAX_COMPONENT_WIDTH',
    };

export const ActionTypes = Object.freeze({
  COLLAPSE_NODE: 'COLLAPSE_NODE',
  COLLAPSE_NODE_DEEP: 'COLLAPSE_NODE_DEEP',
  DELETE_SELECTED_NODES: 'DELETE_SELECTED_NODES',
  EXPAND_NODE: 'EXPAND_NODE',
  SET_EXCLUDE_VCS_IGNORED_PATHS: 'SET_EXCLUDE_VCS_IGNORED_PATHS',
  EXPAND_NODE_DEEP: 'EXPAND_NODE_DEEP',
  SET_CWD: 'SET_CWD',
  SET_CWD_API: 'SET_CWD_API',
  SET_HIDE_IGNORED_NAMES: 'SET_HIDE_IGNORED_NAMES',
  SET_HIDE_VCS_IGNORED_PATHS: 'SET_HIDE_VCS_IGNORED_PATHS',
  SET_IS_CALCULATING_CHANGES: 'SET_IS_CALCULATING_CHANGES',
  SET_IGNORED_NAMES: 'SET_IGNORED_NAMES',
  SET_ROOT_KEYS: 'SET_ROOT_KEYS',
  SET_TRACKED_NODE: 'SET_TRACKED_NODE',
  CLEAR_TRACKED_NODE: 'CLEAR_TRACKED_NODE',
  CLEAR_TRACKED_NODE_IF_NOT_LOADING: 'CLEAR_TRACKED_NODE_IF_NOT_LOADING',
  START_REORDER_DRAG: 'START_REORDER_DRAG',
  END_REORDER_DRAG: 'END_REORDER_DRAG',
  REORDER_DRAG_INTO: 'REORDER_DRAG_INTO',
  REORDER_ROOTS: 'REORDER_ROOTS',
  MOVE_TO_NODE: 'MOVE_TO_NODE',
  SET_USE_PREVIEW_TABS: 'SET_USE_PREVIEW_TABS',
  SET_USE_PREFIX_NAV: 'SET_USE_PREFIX_NAV',
  SET_AUTO_EXPAND_SINGLE_CHILD: 'SET_AUTO_EXPAND_SINGLE_CHILD',
  SET_FOCUS_EDITOR_ON_FILE_SELECTION: 'SET_FOCUS_EDITOR_ON_FILE_SELECTION',
  SET_VCS_STATUSES: 'SET_VCS_STATUSES',
  SET_REPOSITORIES: 'SET_REPOSITORIES',
  SET_WORKING_SET: 'SET_WORKING_SET',
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
  ENSURE_CHILD_NODE: 'ENSURE_CHILD_NODE',
  CLEAR_FILTER: 'CLEAR_FILTER',
  ADD_EXTRA_PROJECT_SELECTION_CONTENT: 'ADD_EXTRA_PROJECT_SELECTION_CONTENT',
  REMOVE_EXTRA_PROJECT_SELECTION_CONTENT:
    'REMOVE_EXTRA_PROJECT_SELECTION_CONTENT',
  SET_OPEN_FILES_EXPANDED: 'SET_OPEN_FILES_EXPANDED',
  SET_UNCOMMITTED_CHANGES_EXPANDED: 'SET_UNCOMMITTED_CHANGES_EXPANDED',
  SET_FOLDERS_EXPANDED: 'SET_FOLDERS_EXPANDED',
  INVALIDATE_REMOVED_FOLDER: 'INVALIDATE_REMOVED_FOLDER',
  SET_TARGET_NODE: 'SET_TARGET_NODE',
  UPDATE_GENERATED_STATUS: 'UPDATE_GENERATED_STATUS',
  ADD_FILTER_LETTER: 'ADD_FILTER_LETTER',
  REMOVE_FILTER_LETTER: 'REMOVE_FILTER_LETTER',
  RESET: 'RESET',
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
