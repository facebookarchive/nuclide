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
// eslint-disable-next-line nuclide-internal/import-type-style
import type {FileTreeAction as Action} from '../FileTreeDispatcher';
import type {FileTreeNode} from '../FileTreeNode';
import type CwdApi from '../../../nuclide-current-working-directory/lib/CwdApi';
import type {StatusCodeNumberValue} from '../../../nuclide-hg-rpc/lib/HgService';
import type {RemoteProjectsService} from '../../../nuclide-remote-projects';
import type {WorkingSet} from '../../../nuclide-working-sets-common';
import type {WorkingSetsStore} from '../../../nuclide-working-sets/lib/types';
import type {NuclideUri} from 'nuclide-commons/nuclideUri';
import type {InitialData, ExportStoreData, Roots} from '../types';
import type {GeneratedFileType} from '../../../nuclide-generated-files-rpc';

import {ActionTypes} from '../FileTreeDispatcher';
import * as Immutable from 'immutable';

export function setCwd(rootKey: ?string): Action {
  return {
    type: ActionTypes.SET_CWD,
    rootKey,
  };
}

export function clearFilter(): Action {
  return {
    type: ActionTypes.CLEAR_FILTER,
  };
}

export function addExtraProjectSelectionContent(
  content: React.Element<any>,
): Action {
  return {
    type: ActionTypes.ADD_EXTRA_PROJECT_SELECTION_CONTENT,
    content,
  };
}

export function removeExtraProjectSelectionContent(
  content: React.Element<any>,
): Action {
  return {
    type: ActionTypes.REMOVE_EXTRA_PROJECT_SELECTION_CONTENT,
    content,
  };
}

export function expandNode(rootKey: string, nodeKey: string): Action {
  return {
    type: ActionTypes.EXPAND_NODE,
    rootKey,
    nodeKey,
  };
}

export function expandNodeDeep(rootKey: string, nodeKey: string): Action {
  return {
    type: ActionTypes.EXPAND_NODE_DEEP,
    rootKey,
    nodeKey,
  };
}

export function deleteSelectedNodes(): Action {
  return {type: ActionTypes.DELETE_SELECTED_NODES};
}

export function collapseNode(rootKey: string, nodeKey: string): Action {
  return {
    type: ActionTypes.COLLAPSE_NODE,
    rootKey,
    nodeKey,
  };
}

export function collapseNodeDeep(rootKey: string, nodeKey: string): Action {
  return {
    type: ActionTypes.COLLAPSE_NODE_DEEP,
    rootKey,
    nodeKey,
  };
}

export function setExcludeVcsIgnoredPaths(
  excludeVcsIgnoredPaths: boolean,
): Action {
  return {
    type: ActionTypes.SET_EXCLUDE_VCS_IGNORED_PATHS,
    excludeVcsIgnoredPaths,
  };
}

export function setHideVcsIgnoredPaths(hideVcsIgnoredPaths: boolean): Action {
  return {
    type: ActionTypes.SET_HIDE_VCS_IGNORED_PATHS,
    hideVcsIgnoredPaths,
  };
}

export function setHideIgnoredNames(hideIgnoredNames: boolean): Action {
  return {
    type: ActionTypes.SET_HIDE_IGNORED_NAMES,
    hideIgnoredNames,
  };
}

export function setIsCalculatingChanges(isCalculatingChanges: boolean): Action {
  return {
    type: ActionTypes.SET_IS_CALCULATING_CHANGES,
    isCalculatingChanges,
  };
}

export function setIgnoredNames(ignoredNames: Array<string>): Action {
  return {
    type: ActionTypes.SET_IGNORED_NAMES,
    ignoredNames,
  };
}

export function setTrackedNode(rootKey: string, nodeKey: string): Action {
  return {
    type: ActionTypes.SET_TRACKED_NODE,
    nodeKey,
    rootKey,
  };
}

export function clearTrackedNode(): Action {
  return {
    type: ActionTypes.CLEAR_TRACKED_NODE,
  };
}

export function clearTrackedNodeIfNotLoading(): Action {
  return {
    type: ActionTypes.CLEAR_TRACKED_NODE_IF_NOT_LOADING,
  };
}

export function startReorderDrag(draggedRootKey: string): Action {
  return {
    type: ActionTypes.START_REORDER_DRAG,
    draggedRootKey,
  };
}

export function endReorderDrag(): Action {
  return {
    type: ActionTypes.END_REORDER_DRAG,
  };
}

export function reorderDragInto(dragTargetNodeKey: string): Action {
  return {
    type: ActionTypes.REORDER_DRAG_INTO,
    dragTargetNodeKey,
  };
}

export function reorderRoots(): Action {
  return {
    type: ActionTypes.REORDER_ROOTS,
  };
}

export function moveToNode(rootKey: string, nodeKey: string): Action {
  return {
    type: ActionTypes.MOVE_TO_NODE,
    nodeKey,
    rootKey,
  };
}

export function setUsePreviewTabs(usePreviewTabs: boolean): Action {
  return {
    type: ActionTypes.SET_USE_PREVIEW_TABS,
    usePreviewTabs,
  };
}

export function setFocusEditorOnFileSelection(
  focusEditorOnFileSelection: boolean,
): Action {
  return {
    type: ActionTypes.SET_FOCUS_EDITOR_ON_FILE_SELECTION,
    focusEditorOnFileSelection,
  };
}

export function setUsePrefixNav(usePrefixNav: boolean): Action {
  return {
    type: ActionTypes.SET_USE_PREFIX_NAV,
    usePrefixNav,
  };
}

export function setAutoExpandSingleChild(
  autoExpandSingleChild: boolean,
): Action {
  return {
    type: ActionTypes.SET_AUTO_EXPAND_SINGLE_CHILD,
    autoExpandSingleChild,
  };
}

export function setVcsStatuses(
  rootKey: string,
  vcsStatuses: Map<NuclideUri, StatusCodeNumberValue>,
): Action {
  return {
    type: ActionTypes.SET_VCS_STATUSES,
    rootKey,
    vcsStatuses,
  };
}

export function invalidateRemovedFolder(): Action {
  return {
    type: ActionTypes.INVALIDATE_REMOVED_FOLDER,
  };
}

export function updateWorkingSet(workingSet: WorkingSet): Action {
  return {
    type: ActionTypes.WORKING_SET_CHANGE_REQUESTED,
    workingSet,
  };
}

export function setWorkingSet(workingSet: WorkingSet): Action {
  return {
    type: ActionTypes.SET_WORKING_SET,
    workingSet,
  };
}

export function updateOpenFilesWorkingSet(
  openFilesWorkingSet: WorkingSet,
): Action {
  return {
    type: ActionTypes.SET_OPEN_FILES_WORKING_SET,
    openFilesWorkingSet,
  };
}

export function updateWorkingSetsStore(
  workingSetsStore: ?WorkingSetsStore,
): Action {
  return {
    type: ActionTypes.SET_WORKING_SETS_STORE,
    workingSetsStore,
  };
}

export function startEditingWorkingSet(editedWorkingSet: WorkingSet): Action {
  return {
    type: ActionTypes.START_EDITING_WORKING_SET,
    editedWorkingSet,
  };
}

export function finishEditingWorkingSet(): Action {
  return {
    type: ActionTypes.FINISH_EDITING_WORKING_SET,
  };
}

export function checkNode(rootKey: string, nodeKey: string): Action {
  return {
    type: ActionTypes.CHECK_NODE,
    rootKey,
    nodeKey,
  };
}

export function uncheckNode(rootKey: string, nodeKey: string): Action {
  return {
    type: ActionTypes.UNCHECK_NODE,
    rootKey,
    nodeKey,
  };
}

export function setDragHoveredNode(rootKey: string, nodeKey: string): Action {
  return {
    type: ActionTypes.SET_DRAG_HOVERED_NODE,
    rootKey,
    nodeKey,
  };
}

export function setSelectedNode(rootKey: string, nodeKey: string): Action {
  return {
    type: ActionTypes.SET_SELECTED_NODE,
    rootKey,
    nodeKey,
  };
}

export function setFocusedNode(rootKey: string, nodeKey: string): Action {
  return {
    type: ActionTypes.SET_FOCUSED_NODE,
    rootKey,
    nodeKey,
  };
}

export function addSelectedNode(rootKey: string, nodeKey: string): Action {
  return {
    type: ActionTypes.ADD_SELECTED_NODE,
    rootKey,
    nodeKey,
  };
}

export function unselectNode(rootKey: string, nodeKey: string): Action {
  return {
    type: ActionTypes.UNSELECT_NODE,
    rootKey,
    nodeKey,
  };
}

export function rangeSelectToNode(rootKey: string, nodeKey: string): Action {
  return {
    type: ActionTypes.RANGE_SELECT_TO_NODE,
    rootKey,
    nodeKey,
  };
}

export function rangeSelectUp(): Action {
  return {
    type: ActionTypes.RANGE_SELECT_UP,
  };
}

export function rangeSelectDown(): Action {
  return {
    type: ActionTypes.RANGE_SELECT_DOWN,
  };
}

export function unhoverNode(rootKey: string, nodeKey: string): Action {
  return {
    type: ActionTypes.UNHOVER_NODE,
    rootKey,
    nodeKey,
  };
}

export function moveSelectionUp(): Action {
  return {
    type: ActionTypes.MOVE_SELECTION_UP,
  };
}

export function moveSelectionDown(): Action {
  return {
    type: ActionTypes.MOVE_SELECTION_DOWN,
  };
}

export function moveSelectionToTop(): Action {
  return {
    type: ActionTypes.MOVE_SELECTION_TO_TOP,
  };
}

export function moveSelectionToBottom(): Action {
  return {
    type: ActionTypes.MOVE_SELECTION_TO_BOTTOM,
  };
}

export function setOpenFilesExpanded(openFilesExpanded: boolean): Action {
  return {
    type: ActionTypes.SET_OPEN_FILES_EXPANDED,
    openFilesExpanded,
  };
}

export function setUncommittedChangesExpanded(
  uncommittedChangesExpanded: boolean,
): Action {
  return {
    type: ActionTypes.SET_UNCOMMITTED_CHANGES_EXPANDED,
    uncommittedChangesExpanded,
  };
}

export function setFoldersExpanded(foldersExpanded: boolean): Action {
  return {
    type: ActionTypes.SET_FOLDERS_EXPANDED,
    foldersExpanded,
  };
}

export function setTargetNode(
  rootKey: NuclideUri,
  nodeKey: NuclideUri,
): Action {
  return {
    type: ActionTypes.SET_TARGET_NODE,
    rootKey,
    nodeKey,
  };
}

export function updateGeneratedStatuses(
  generatedFileTypes: Map<NuclideUri, GeneratedFileType>,
): Action {
  return {
    type: ActionTypes.UPDATE_GENERATED_STATUSES,
    generatedFileTypes,
  };
}

export function addFilterLetter(letter: string): Action {
  return {
    type: ActionTypes.ADD_FILTER_LETTER,
    letter,
  };
}

export function removeFilterLetter(): Action {
  return {
    type: ActionTypes.REMOVE_FILTER_LETTER,
  };
}

export function confirmNode(
  rootKey: string,
  nodeKey: string,
  pending: boolean = false,
): Action {
  return {
    type: ActionTypes.CONFIRM_NODE,
    rootKey,
    nodeKey,
    pending,
  };
}

export function keepPreviewTab(): Action {
  return {type: ActionTypes.KEEP_PREVIEW_TAB};
}

export function openEntrySplit(
  nodeKey: string,
  orientation: atom$PaneSplitOrientation,
  side: atom$PaneSplitSide,
): Action {
  return {
    type: ActionTypes.OPEN_ENTRY_SPLIT,
    nodeKey,
    orientation,
    side,
  };
}

export function updateRepositories(
  rootDirectories: Array<atom$Directory>,
): Action {
  return {
    type: ActionTypes.UPDATE_REPOSITORIES,
    rootDirectories,
  };
}

export function revealNodeKey(nodeKey: ?string): Action {
  return {
    type: ActionTypes.REVEAL_NODE_KEY,
    nodeKey,
  };
}

export function revealFilePath(
  filePath: ?string,
  showIfHidden?: boolean = true,
): Action {
  return {
    type: ActionTypes.REVEAL_FILE_PATH,
    filePath,
    showIfHidden,
  };
}

export function openAndRevealFilePath(filePath: ?string): Action {
  return {
    type: ActionTypes.OPEN_AND_REVEAL_FILE_PATH,
    filePath,
  };
}

export function openAndRevealFilePaths(filePaths: Array<string>): Action {
  return {
    type: ActionTypes.OPEN_AND_REVEAL_FILE_PATHS,
    filePaths,
  };
}

export function openAndRevealDirectoryPath(path: ?string): Action {
  return {
    type: ActionTypes.OPEN_AND_REVEAL_DIRECTORY_PATH,
    path,
  };
}

export function updateRootDirectories(): Action {
  return {
    type: ActionTypes.UPDATE_ROOT_DIRECTORIES,
  };
}

export function setCwdToSelection(): Action {
  return {
    type: ActionTypes.SET_CWD_TO_SELECTION,
  };
}

export function setCwdApi(cwdApi: ?CwdApi): Action {
  return {
    type: ActionTypes.SET_CWD_API,
    cwdApi,
  };
}

export function setRemoteProjectsService(
  service: ?RemoteProjectsService,
): Action {
  return {
    type: ActionTypes.SET_REMOTE_PROJECTS_SERVICE,
    service,
  };
}

export function collapseSelection(deep: boolean = false): Action {
  return {
    type: ActionTypes.COLLAPSE_SELECTION,
    deep,
  };
}

export function selectAndTrackNode(node: FileTreeNode): Action {
  return setSelectedNode(node.rootUri, node.uri);
}

export function collapseAll(): Action {
  return {type: ActionTypes.COLLAPSE_ALL};
}

export function deleteSelection(): Action {
  return {type: ActionTypes.DELETE_SELECTION};
}

export function expandSelection(deep: boolean): Action {
  return {
    type: ActionTypes.EXPAND_SELECTION,
    deep,
  };
}

export function openSelectedEntry(): Action {
  return {type: ActionTypes.OPEN_SELECTED_ENTRY};
}

export function openSelectedEntrySplit(
  orientation: atom$PaneSplitOrientation,
  side: atom$PaneSplitSide,
): Action {
  return {
    type: ActionTypes.OPEN_SELECTED_ENTRY_SPLIT,
    orientation,
    side,
  };
}

export function openSelectedEntrySplitUp(): Action {
  return openSelectedEntrySplit('vertical', 'before');
}

export function openSelectedEntrySplitDown(): Action {
  return openSelectedEntrySplit('vertical', 'after');
}

export function openSelectedEntrySplitLeft(): Action {
  return openSelectedEntrySplit('horizontal', 'before');
}

export function openSelectedEntrySplitRight(): Action {
  return openSelectedEntrySplit('horizontal', 'after');
}

export function removeRootFolderSelection(): Action {
  return {type: ActionTypes.REMOVE_ROOT_FOLDER_SELECTION};
}

export function copyFilenamesWithDir(): Action {
  return {type: ActionTypes.COPY_FILENAMES_WITH_DIR};
}

export function openAddFolderDialog(
  onDidConfirm: (filePath: ?string) => mixed,
): Action {
  return {
    type: ActionTypes.OPEN_ADD_FOLDER_DIALOG,
    onDidConfirm,
  };
}

export function openAddFileDialog(
  onDidConfirm: (filePath: ?string) => mixed,
): Action {
  return {
    type: ActionTypes.OPEN_ADD_FILE_DIALOG,
    onDidConfirm,
  };
}

export function openAddFileDialogRelative(
  onDidConfirm: (filePath: ?string) => mixed,
): Action {
  return {
    type: ActionTypes.OPEN_ADD_FILE_DIALOG_RELATIVE,
    onDidConfirm,
  };
}

export function openRenameDialog(): Action {
  return {type: ActionTypes.OPEN_RENAME_DIALOG};
}

export function openDuplicateDialog(
  onDidConfirm: (filePaths: Array<string>) => mixed,
): Action {
  return {
    type: ActionTypes.OPEN_DUPLICATE_DIALOG,
    onDidConfirm,
  };
}

export function openNextDuplicateDialog(
  nodes: Immutable.List<FileTreeNode>,
  onDidConfirm: (filePaths: Array<string>) => mixed,
): Action {
  return {
    type: ActionTypes.OPEN_NEXT_DUPLICATE_DIALOG,
    nodes,
    onDidConfirm,
  };
}

export function openPasteDialog(): Action {
  return {type: ActionTypes.OPEN_PASTE_DIALOG};
}

export function clearSelection(): Action {
  return {type: ActionTypes.CLEAR_SELECTION};
}

export function clearSelectionRange(): Action {
  return {type: ActionTypes.CLEAR_SELECTION_RANGE};
}

export function clearDragHover(): Action {
  return {type: ActionTypes.CLEAR_DRAG_HOVER};
}

export function setRoots(roots: Roots): Action {
  return {
    type: ActionTypes.SET_ROOTS,
    roots,
  };
}

export function clearLoading(nodeKey: NuclideUri): Action {
  return {
    type: ActionTypes.CLEAR_LOADING,
    nodeKey,
  };
}

export function setLoading(
  nodeKey: NuclideUri,
  promise: Promise<void>,
): Action {
  return {
    type: ActionTypes.SET_LOADING,
    nodeKey,
    promise,
  };
}

export function loadData(data: ExportStoreData): Action {
  return {
    type: ActionTypes.LOAD_DATA,
    data,
  };
}

export function setInitialData(data: InitialData): Action {
  return {
    type: ActionTypes.SET_INITIAL_DATA,
    data,
  };
}
