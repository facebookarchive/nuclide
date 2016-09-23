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
import type {StatusCodeNumberValue} from '../../nuclide-hg-rpc/lib/HgService';
import type {WorkingSet} from '../../nuclide-working-sets-common';
import type {WorkingSetsStore} from '../../nuclide-working-sets/lib/types';

export type FileTreeAction =
  {
    actionType: 'COLLAPSE_NODE',
    rootKey: NuclideUri,
    nodeKey: NuclideUri,
  } |
  {
    actionType: 'COLLAPSE_NODE_DEEP',
    rootKey: NuclideUri,
    nodeKey: NuclideUri,
  } |
  {
    actionType: 'DELETE_SELECTED_NODES',
  } |
  {
    actionType: 'EXPAND_NODE',
    rootKey: NuclideUri,
    nodeKey: NuclideUri,
  } |
  {
    actionType: 'SET_EXCLUDE_VCS_IGNORED_PATHS',
    excludeVcsIgnoredPaths: boolean,
  } |
  {
    actionType: 'EXPAND_NODE_DEEP',
    rootKey: NuclideUri,
    nodeKey: NuclideUri,
  } |
  {
    actionType: 'SET_CWD',
    rootKey: ?NuclideUri,
  } |
  {
    actionType: 'SET_HIDE_IGNORED_NAMES',
    hideIgnoredNames: boolean,
  } |
  {
    actionType: 'SET_IGNORED_NAMES',
    ignoredNames: Array<string>,
  } |
  {
    actionType: 'SET_ROOT_KEYS',
    rootKeys: Array<NuclideUri>,
  } |
  {
    actionType: 'SET_TRACKED_NODE',
    rootKey: NuclideUri,
    nodeKey: NuclideUri,
  } |
  {
    actionType: 'CLEAR_TRACKED_NODE',
  } |
  {
    actionType: 'MOVE_TO_NODE',
    rootKey: NuclideUri,
    nodeKey: NuclideUri,
  } |
  {
    actionType: 'SET_DROP_TARGET_NODE',
  } |
  {
    actionType: 'SET_USE_PREVIEW_TABS',
    usePreviewTabs: boolean,
  } |
  {
    actionType: 'SET_USE_PREFIX_NAV',
    usePrefixNav: boolean,
  } |
  {
    actionType: 'SET_VCS_STATUSES', // VCS = version control system
    rootKey: NuclideUri,
    vcsStatuses: {[path: NuclideUri]: StatusCodeNumberValue}
  } |
  {
    actionType: 'SET_REPOSITORIES',
    // Immutable.Set<atom$Repository>, but since we don't have typedefs for immutable let's just be
    // honest here.
    repositories: any,
  } |
  {
    actionType: 'SET_WORKING_SET',
    workingSet: WorkingSet,
  } |
  {
    actionType: 'SET_OPEN_FILES_WORKING_SET',
    openFilesWorkingSet: WorkingSet,
  } |
  {
    actionType: 'SET_WORKING_SETS_STORE',
    workingSetsStore: ?WorkingSetsStore,
  } |
  {
    actionType: 'START_EDITING_WORKING_SET',
    editedWorkingSet: WorkingSet,
  } |
  {
    actionType: 'FINISH_EDITING_WORKING_SET',
  } |
  {
    actionType: 'CHECK_NODE',
    rootKey: NuclideUri,
    nodeKey: NuclideUri,
  } |
  {
    actionType: 'UNCHECK_NODE',
    rootKey: NuclideUri,
    nodeKey: NuclideUri,
  } |
  {
    actionType: 'SET_DRAG_HOVERED_NODE',
    rootKey: NuclideUri,
    nodeKey: NuclideUri,
  } |
  {
    actionType: 'UNHOVER_NODE',
    rootKey: NuclideUri,
    nodeKey: NuclideUri,
  } |
  {
    actionType: 'SET_SELECTED_NODE',
    rootKey: NuclideUri,
    nodeKey: NuclideUri,
  } |
  {
    actionType: 'SET_FOCUSED_NODE',
    rootKey: NuclideUri,
    nodeKey: NuclideUri,
  } |
  {
    actionType: 'ADD_SELECTED_NODE',
    rootKey: NuclideUri,
    nodeKey: NuclideUri,
  } |
  {
    actionType: 'UNSELECT_NODE',
    rootKey: NuclideUri,
    nodeKey: NuclideUri,
  } |
  {
    actionType: 'MOVE_SELECTION_UP',
  } |
  {
    actionType: 'MOVE_SELECTION_DOWN',
  } |
  {
    actionType: 'MOVE_SELECTION_TO_TOP',
  } |
  {
    actionType: 'MOVE_SELECTION_TO_BOTTOM',
  } |
  {
    actionType: 'ENSURE_CHILD_NODE',
    nodeKey: NuclideUri,
  } |
  {
    actionType: 'CLEAR_FILTER',
  } |
  {
    actionType: 'SET_OPEN_FILES_EXPANDED',
    openFilesExpanded: boolean,
  } |
  {
    actionType: 'SET_UNCOMMITTED_CHANGES_EXPANDED',
    uncommittedChangesExpanded: boolean,
  };

import {ActionType} from './FileTreeConstants';

// Flow hackery to make sure that action type listed here is also available as a constant
((((null: any): FileTreeAction).actionType): $Keys<typeof ActionType>);
