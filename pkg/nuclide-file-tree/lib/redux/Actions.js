"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.setCwd = setCwd;
exports.clearFilter = clearFilter;
exports.addExtraProjectSelectionContent = addExtraProjectSelectionContent;
exports.removeExtraProjectSelectionContent = removeExtraProjectSelectionContent;
exports.expandNode = expandNode;
exports.expandNodeDeep = expandNodeDeep;
exports.deleteSelectedNodes = deleteSelectedNodes;
exports.collapseNode = collapseNode;
exports.collapseNodeDeep = collapseNodeDeep;
exports.setExcludeVcsIgnoredPaths = setExcludeVcsIgnoredPaths;
exports.setHideVcsIgnoredPaths = setHideVcsIgnoredPaths;
exports.setHideIgnoredNames = setHideIgnoredNames;
exports.setIsCalculatingChanges = setIsCalculatingChanges;
exports.setIgnoredNames = setIgnoredNames;
exports.setTrackedNode = setTrackedNode;
exports.clearTrackedNode = clearTrackedNode;
exports.clearTrackedNodeIfNotLoading = clearTrackedNodeIfNotLoading;
exports.startReorderDrag = startReorderDrag;
exports.endReorderDrag = endReorderDrag;
exports.reorderDragInto = reorderDragInto;
exports.reorderRoots = reorderRoots;
exports.moveToNode = moveToNode;
exports.movePathToNode = movePathToNode;
exports.setUsePreviewTabs = setUsePreviewTabs;
exports.setFocusEditorOnFileSelection = setFocusEditorOnFileSelection;
exports.setUsePrefixNav = setUsePrefixNav;
exports.setAutoExpandSingleChild = setAutoExpandSingleChild;
exports.setVcsStatuses = setVcsStatuses;
exports.invalidateRemovedFolder = invalidateRemovedFolder;
exports.updateWorkingSet = updateWorkingSet;
exports.setWorkingSet = setWorkingSet;
exports.updateOpenFilesWorkingSet = updateOpenFilesWorkingSet;
exports.updateWorkingSetsStore = updateWorkingSetsStore;
exports.startEditingWorkingSet = startEditingWorkingSet;
exports.finishEditingWorkingSet = finishEditingWorkingSet;
exports.checkNode = checkNode;
exports.uncheckNode = uncheckNode;
exports.setDragHoveredNode = setDragHoveredNode;
exports.setSelectedNode = setSelectedNode;
exports.setFocusedNode = setFocusedNode;
exports.addSelectedNode = addSelectedNode;
exports.unselectNode = unselectNode;
exports.rangeSelectToNode = rangeSelectToNode;
exports.rangeSelectUp = rangeSelectUp;
exports.rangeSelectDown = rangeSelectDown;
exports.unhoverNode = unhoverNode;
exports.moveSelectionUp = moveSelectionUp;
exports.moveSelectionDown = moveSelectionDown;
exports.moveSelectionToTop = moveSelectionToTop;
exports.moveSelectionToBottom = moveSelectionToBottom;
exports.setOpenFilesExpanded = setOpenFilesExpanded;
exports.setUncommittedChangesExpanded = setUncommittedChangesExpanded;
exports.setFoldersExpanded = setFoldersExpanded;
exports.setTargetNode = setTargetNode;
exports.updateGeneratedStatuses = updateGeneratedStatuses;
exports.addFilterLetter = addFilterLetter;
exports.removeFilterLetter = removeFilterLetter;
exports.confirmNode = confirmNode;
exports.keepPreviewTab = keepPreviewTab;
exports.openEntrySplit = openEntrySplit;
exports.updateRepositories = updateRepositories;
exports.revealNodeKey = revealNodeKey;
exports.revealFilePath = revealFilePath;
exports.openAndRevealFilePath = openAndRevealFilePath;
exports.openAndRevealFilePaths = openAndRevealFilePaths;
exports.openAndRevealDirectoryPath = openAndRevealDirectoryPath;
exports.updateRootDirectories = updateRootDirectories;
exports.setCwdToSelection = setCwdToSelection;
exports.setCwdApi = setCwdApi;
exports.setRemoteProjectsService = setRemoteProjectsService;
exports.collapseSelection = collapseSelection;
exports.selectAndTrackNode = selectAndTrackNode;
exports.collapseAll = collapseAll;
exports.deleteSelection = deleteSelection;
exports.expandSelection = expandSelection;
exports.openSelectedEntry = openSelectedEntry;
exports.openSelectedEntrySplit = openSelectedEntrySplit;
exports.openSelectedEntrySplitUp = openSelectedEntrySplitUp;
exports.openSelectedEntrySplitDown = openSelectedEntrySplitDown;
exports.openSelectedEntrySplitLeft = openSelectedEntrySplitLeft;
exports.openSelectedEntrySplitRight = openSelectedEntrySplitRight;
exports.removeRootFolderSelection = removeRootFolderSelection;
exports.copyFilenamesWithDir = copyFilenamesWithDir;
exports.openAddFolderDialog = openAddFolderDialog;
exports.openAddFileDialog = openAddFileDialog;
exports.openAddFileDialogRelative = openAddFileDialogRelative;
exports.openRenameDialog = openRenameDialog;
exports.openDuplicateDialog = openDuplicateDialog;
exports.openNextDuplicateDialog = openNextDuplicateDialog;
exports.openPasteDialog = openPasteDialog;
exports.clearSelection = clearSelection;
exports.clearSelectionRange = clearSelectionRange;
exports.clearDragHover = clearDragHover;
exports.setRoots = setRoots;
exports.clearLoading = clearLoading;
exports.setLoading = setLoading;
exports.loadData = loadData;
exports.setInitialData = setInitialData;
exports.gotRemoteTransferService = gotRemoteTransferService;
exports.uploadDroppedFiles = uploadDroppedFiles;
exports.select = select;
exports.unselect = unselect;
exports.focus = focus;
exports.unfocus = unfocus;
exports.clearSelected = clearSelected;
exports.clearFocused = clearFocused;
exports.UNFOCUS = exports.FOCUS = exports.UNSELECT = exports.SELECT = exports.UPLOAD_DROPPED_FILES = exports.GOT_REMOTE_TRANSFER_SERVICE = exports.UPDATE_ROOT_DIRECTORIES = exports.UPDATE_REPOSITORIES = exports.REMOVE_FILTER_LETTER = exports.ADD_FILTER_LETTER = exports.UPDATE_GENERATED_STATUSES = exports.SET_TARGET_NODE = exports.INVALIDATE_REMOVED_FOLDER = exports.SET_FOLDERS_EXPANDED = exports.SET_UNCOMMITTED_CHANGES_EXPANDED = exports.SET_OPEN_FILES_EXPANDED = exports.REMOVE_ROOT_FOLDER_SELECTION = exports.REMOVE_EXTRA_PROJECT_SELECTION_CONTENT = exports.ADD_EXTRA_PROJECT_SELECTION_CONTENT = exports.CLEAR_FILTER = exports.MOVE_SELECTION_TO_BOTTOM = exports.MOVE_SELECTION_TO_TOP = exports.MOVE_SELECTION_DOWN = exports.MOVE_SELECTION_UP = exports.RANGE_SELECT_DOWN = exports.RANGE_SELECT_UP = exports.RANGE_SELECT_TO_NODE = exports.UNSELECT_NODE = exports.ADD_SELECTED_NODE = exports.SET_FOCUSED_NODE = exports.SET_SELECTED_NODE = exports.UNHOVER_NODE = exports.SET_DRAG_HOVERED_NODE = exports.UNCHECK_NODE = exports.CHECK_NODE = exports.FINISH_EDITING_WORKING_SET = exports.START_EDITING_WORKING_SET = exports.SET_WORKING_SETS_STORE = exports.SET_OPEN_FILES_WORKING_SET = exports.WORKING_SET_CHANGE_REQUESTED = exports.SET_WORKING_SET = exports.SET_REPOSITORIES = exports.SET_VCS_STATUSES = exports.SET_FOCUS_EDITOR_ON_FILE_SELECTION = exports.SET_AUTO_EXPAND_SINGLE_CHILD = exports.SET_USE_PREFIX_NAV = exports.SET_USE_PREVIEW_TABS = exports.SET_INITIAL_DATA = exports.MOVE_PATH_TO_NODE = exports.MOVE_TO_NODE = exports.REORDER_ROOTS = exports.REORDER_DRAG_INTO = exports.OPEN_AND_REVEAL_DIRECTORY_PATH = exports.OPEN_AND_REVEAL_FILE_PATHS = exports.OPEN_AND_REVEAL_FILE_PATH = exports.REVEAL_FILE_PATH = exports.REVEAL_NODE_KEY = exports.END_REORDER_DRAG = exports.START_REORDER_DRAG = exports.OPEN_PASTE_DIALOG = exports.OPEN_NEXT_DUPLICATE_DIALOG = exports.OPEN_DUPLICATE_DIALOG = exports.OPEN_RENAME_DIALOG = exports.OPEN_ADD_FILE_DIALOG_RELATIVE = exports.OPEN_ADD_FILE_DIALOG = exports.OPEN_ADD_FOLDER_DIALOG = exports.OPEN_ENTRY_SPLIT = exports.OPEN_SELECTED_ENTRY_SPLIT = exports.OPEN_SELECTED_ENTRY = exports.KEEP_PREVIEW_TAB = exports.CLEAR_TRACKED_NODE_IF_NOT_LOADING = exports.CLEAR_TRACKED_NODE = exports.SET_REMOTE_PROJECTS_SERVICE = exports.SET_TRACKED_NODE = exports.SET_ROOTS = exports.SET_LOADING = exports.SET_IGNORED_NAMES = exports.SET_IS_CALCULATING_CHANGES = exports.SET_HIDE_VCS_IGNORED_PATHS = exports.SET_HIDE_IGNORED_NAMES = exports.SET_CWD_API = exports.SET_CWD_TO_SELECTION = exports.SET_CWD = exports.EXPAND_NODE_DEEP = exports.SET_EXCLUDE_VCS_IGNORED_PATHS = exports.LOAD_DATA = exports.EXPAND_SELECTION = exports.EXPAND_NODE = exports.DELETE_SELECTION = exports.DELETE_SELECTED_NODES = exports.COPY_FILENAMES_WITH_DIR = exports.CONFIRM_NODE = exports.COLLAPSE_ALL = exports.COLLAPSE_SELECTION = exports.COLLAPSE_NODE_DEEP = exports.COLLAPSE_NODE = exports.CLEAR_SELECTION_RANGE = exports.CLEAR_SELECTION = exports.CLEAR_LOADING = exports.CLEAR_DRAG_HOVER = void 0;
exports.CLEAR_FOCUSED = exports.CLEAR_SELECTED = void 0;

function Immutable() {
  const data = _interopRequireWildcard(require("immutable"));

  Immutable = function () {
    return data;
  };

  return data;
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 */
// $FlowFixMe(>=0.53.0) Flow suppress
// eslint-disable-next-line nuclide-internal/import-type-style
const CLEAR_DRAG_HOVER = 'CLEAR_DRAG_HOVER';
exports.CLEAR_DRAG_HOVER = CLEAR_DRAG_HOVER;
const CLEAR_LOADING = 'CLEAR_LOADING';
exports.CLEAR_LOADING = CLEAR_LOADING;
const CLEAR_SELECTION = 'CLEAR_SELECTION';
exports.CLEAR_SELECTION = CLEAR_SELECTION;
const CLEAR_SELECTION_RANGE = 'CLEAR_SELECTION_RANGE';
exports.CLEAR_SELECTION_RANGE = CLEAR_SELECTION_RANGE;
const COLLAPSE_NODE = 'COLLAPSE_NODE';
exports.COLLAPSE_NODE = COLLAPSE_NODE;
const COLLAPSE_NODE_DEEP = 'COLLAPSE_NODE_DEEP';
exports.COLLAPSE_NODE_DEEP = COLLAPSE_NODE_DEEP;
const COLLAPSE_SELECTION = 'COLLAPSE_SELECTION';
exports.COLLAPSE_SELECTION = COLLAPSE_SELECTION;
const COLLAPSE_ALL = 'COLLAPSE_ALL';
exports.COLLAPSE_ALL = COLLAPSE_ALL;
const CONFIRM_NODE = 'CONFIRM_NODE';
exports.CONFIRM_NODE = CONFIRM_NODE;
const COPY_FILENAMES_WITH_DIR = 'COPY_FILENAMES_WITH_DIR';
exports.COPY_FILENAMES_WITH_DIR = COPY_FILENAMES_WITH_DIR;
const DELETE_SELECTED_NODES = 'DELETE_SELECTED_NODES';
exports.DELETE_SELECTED_NODES = DELETE_SELECTED_NODES;
const DELETE_SELECTION = 'DELETE_SELECTION';
exports.DELETE_SELECTION = DELETE_SELECTION;
const EXPAND_NODE = 'EXPAND_NODE';
exports.EXPAND_NODE = EXPAND_NODE;
const EXPAND_SELECTION = 'EXPAND_SELECTION';
exports.EXPAND_SELECTION = EXPAND_SELECTION;
const LOAD_DATA = 'LOAD_DATA';
exports.LOAD_DATA = LOAD_DATA;
const SET_EXCLUDE_VCS_IGNORED_PATHS = 'SET_EXCLUDE_VCS_IGNORED_PATHS';
exports.SET_EXCLUDE_VCS_IGNORED_PATHS = SET_EXCLUDE_VCS_IGNORED_PATHS;
const EXPAND_NODE_DEEP = 'EXPAND_NODE_DEEP';
exports.EXPAND_NODE_DEEP = EXPAND_NODE_DEEP;
const SET_CWD = 'SET_CWD';
exports.SET_CWD = SET_CWD;
const SET_CWD_TO_SELECTION = 'SET_CWD_TO_SELECTION';
exports.SET_CWD_TO_SELECTION = SET_CWD_TO_SELECTION;
const SET_CWD_API = 'SET_CWD_API';
exports.SET_CWD_API = SET_CWD_API;
const SET_HIDE_IGNORED_NAMES = 'SET_HIDE_IGNORED_NAMES';
exports.SET_HIDE_IGNORED_NAMES = SET_HIDE_IGNORED_NAMES;
const SET_HIDE_VCS_IGNORED_PATHS = 'SET_HIDE_VCS_IGNORED_PATHS';
exports.SET_HIDE_VCS_IGNORED_PATHS = SET_HIDE_VCS_IGNORED_PATHS;
const SET_IS_CALCULATING_CHANGES = 'SET_IS_CALCULATING_CHANGES';
exports.SET_IS_CALCULATING_CHANGES = SET_IS_CALCULATING_CHANGES;
const SET_IGNORED_NAMES = 'SET_IGNORED_NAMES';
exports.SET_IGNORED_NAMES = SET_IGNORED_NAMES;
const SET_LOADING = 'SET_LOADING';
exports.SET_LOADING = SET_LOADING;
const SET_ROOTS = 'SET_ROOTS';
exports.SET_ROOTS = SET_ROOTS;
const SET_TRACKED_NODE = 'SET_TRACKED_NODE';
exports.SET_TRACKED_NODE = SET_TRACKED_NODE;
const SET_REMOTE_PROJECTS_SERVICE = 'SET_REMOTE_PROJECTS_SERVICE';
exports.SET_REMOTE_PROJECTS_SERVICE = SET_REMOTE_PROJECTS_SERVICE;
const CLEAR_TRACKED_NODE = 'CLEAR_TRACKED_NODE';
exports.CLEAR_TRACKED_NODE = CLEAR_TRACKED_NODE;
const CLEAR_TRACKED_NODE_IF_NOT_LOADING = 'CLEAR_TRACKED_NODE_IF_NOT_LOADING';
exports.CLEAR_TRACKED_NODE_IF_NOT_LOADING = CLEAR_TRACKED_NODE_IF_NOT_LOADING;
const KEEP_PREVIEW_TAB = 'KEEP_PREVIEW_TAB';
exports.KEEP_PREVIEW_TAB = KEEP_PREVIEW_TAB;
const OPEN_SELECTED_ENTRY = 'OPEN_SELECTED_ENTRY';
exports.OPEN_SELECTED_ENTRY = OPEN_SELECTED_ENTRY;
const OPEN_SELECTED_ENTRY_SPLIT = 'OPEN_SELECTED_ENTRY_SPLIT';
exports.OPEN_SELECTED_ENTRY_SPLIT = OPEN_SELECTED_ENTRY_SPLIT;
const OPEN_ENTRY_SPLIT = 'OPEN_ENTRY_SPLIT';
exports.OPEN_ENTRY_SPLIT = OPEN_ENTRY_SPLIT;
const OPEN_ADD_FOLDER_DIALOG = 'OPEN_ADD_FOLDER_DIALOG';
exports.OPEN_ADD_FOLDER_DIALOG = OPEN_ADD_FOLDER_DIALOG;
const OPEN_ADD_FILE_DIALOG = 'OPEN_ADD_FILE_DIALOG';
exports.OPEN_ADD_FILE_DIALOG = OPEN_ADD_FILE_DIALOG;
const OPEN_ADD_FILE_DIALOG_RELATIVE = 'OPEN_ADD_FILE_DIALOG_RELATIVE';
exports.OPEN_ADD_FILE_DIALOG_RELATIVE = OPEN_ADD_FILE_DIALOG_RELATIVE;
const OPEN_RENAME_DIALOG = 'OPEN_RENAME_DIALOG';
exports.OPEN_RENAME_DIALOG = OPEN_RENAME_DIALOG;
const OPEN_DUPLICATE_DIALOG = 'OPEN_DUPLICATE_DIALOG';
exports.OPEN_DUPLICATE_DIALOG = OPEN_DUPLICATE_DIALOG;
const OPEN_NEXT_DUPLICATE_DIALOG = 'OPEN_NEXT_DUPLICATE_DIALOG';
exports.OPEN_NEXT_DUPLICATE_DIALOG = OPEN_NEXT_DUPLICATE_DIALOG;
const OPEN_PASTE_DIALOG = 'OPEN_PASTE_DIALOG';
exports.OPEN_PASTE_DIALOG = OPEN_PASTE_DIALOG;
const START_REORDER_DRAG = 'START_REORDER_DRAG';
exports.START_REORDER_DRAG = START_REORDER_DRAG;
const END_REORDER_DRAG = 'END_REORDER_DRAG';
exports.END_REORDER_DRAG = END_REORDER_DRAG;
const REVEAL_NODE_KEY = 'REVEAL_NODE_KEY';
exports.REVEAL_NODE_KEY = REVEAL_NODE_KEY;
const REVEAL_FILE_PATH = 'REVEAL_FILE_PATH';
exports.REVEAL_FILE_PATH = REVEAL_FILE_PATH;
const OPEN_AND_REVEAL_FILE_PATH = 'OPEN_AND_REVEAL_FILE_PATH';
exports.OPEN_AND_REVEAL_FILE_PATH = OPEN_AND_REVEAL_FILE_PATH;
const OPEN_AND_REVEAL_FILE_PATHS = 'OPEN_AND_REVEAL_FILE_PATHS';
exports.OPEN_AND_REVEAL_FILE_PATHS = OPEN_AND_REVEAL_FILE_PATHS;
const OPEN_AND_REVEAL_DIRECTORY_PATH = 'OPEN_AND_REVEAL_DIRECTORY_PATH';
exports.OPEN_AND_REVEAL_DIRECTORY_PATH = OPEN_AND_REVEAL_DIRECTORY_PATH;
const REORDER_DRAG_INTO = 'REORDER_DRAG_INTO';
exports.REORDER_DRAG_INTO = REORDER_DRAG_INTO;
const REORDER_ROOTS = 'REORDER_ROOTS';
exports.REORDER_ROOTS = REORDER_ROOTS;
const MOVE_TO_NODE = 'MOVE_TO_NODE';
exports.MOVE_TO_NODE = MOVE_TO_NODE;
const MOVE_PATH_TO_NODE = 'MOVE_PATH_TO_NODE';
exports.MOVE_PATH_TO_NODE = MOVE_PATH_TO_NODE;
const SET_INITIAL_DATA = 'SET_INITIAL_DATA';
exports.SET_INITIAL_DATA = SET_INITIAL_DATA;
const SET_USE_PREVIEW_TABS = 'SET_USE_PREVIEW_TABS';
exports.SET_USE_PREVIEW_TABS = SET_USE_PREVIEW_TABS;
const SET_USE_PREFIX_NAV = 'SET_USE_PREFIX_NAV';
exports.SET_USE_PREFIX_NAV = SET_USE_PREFIX_NAV;
const SET_AUTO_EXPAND_SINGLE_CHILD = 'SET_AUTO_EXPAND_SINGLE_CHILD';
exports.SET_AUTO_EXPAND_SINGLE_CHILD = SET_AUTO_EXPAND_SINGLE_CHILD;
const SET_FOCUS_EDITOR_ON_FILE_SELECTION = 'SET_FOCUS_EDITOR_ON_FILE_SELECTION';
exports.SET_FOCUS_EDITOR_ON_FILE_SELECTION = SET_FOCUS_EDITOR_ON_FILE_SELECTION;
const SET_VCS_STATUSES = 'SET_VCS_STATUSES';
exports.SET_VCS_STATUSES = SET_VCS_STATUSES;
const SET_REPOSITORIES = 'SET_REPOSITORIES';
exports.SET_REPOSITORIES = SET_REPOSITORIES;
const SET_WORKING_SET = 'SET_WORKING_SET';
exports.SET_WORKING_SET = SET_WORKING_SET;
const WORKING_SET_CHANGE_REQUESTED = 'WORKING_SET_CHANGE_REQUESTED';
exports.WORKING_SET_CHANGE_REQUESTED = WORKING_SET_CHANGE_REQUESTED;
const SET_OPEN_FILES_WORKING_SET = 'SET_OPEN_FILES_WORKING_SET';
exports.SET_OPEN_FILES_WORKING_SET = SET_OPEN_FILES_WORKING_SET;
const SET_WORKING_SETS_STORE = 'SET_WORKING_SETS_STORE';
exports.SET_WORKING_SETS_STORE = SET_WORKING_SETS_STORE;
const START_EDITING_WORKING_SET = 'START_EDITING_WORKING_SET';
exports.START_EDITING_WORKING_SET = START_EDITING_WORKING_SET;
const FINISH_EDITING_WORKING_SET = 'FINISH_EDITING_WORKING_SET';
exports.FINISH_EDITING_WORKING_SET = FINISH_EDITING_WORKING_SET;
const CHECK_NODE = 'CHECK_NODE';
exports.CHECK_NODE = CHECK_NODE;
const UNCHECK_NODE = 'UNCHECK_NODE';
exports.UNCHECK_NODE = UNCHECK_NODE;
const SET_DRAG_HOVERED_NODE = 'SET_DRAG_HOVERED_NODE';
exports.SET_DRAG_HOVERED_NODE = SET_DRAG_HOVERED_NODE;
const UNHOVER_NODE = 'UNHOVER_NODE';
exports.UNHOVER_NODE = UNHOVER_NODE;
const SET_SELECTED_NODE = 'SET_SELECTED_NODE';
exports.SET_SELECTED_NODE = SET_SELECTED_NODE;
const SET_FOCUSED_NODE = 'SET_FOCUSED_NODE';
exports.SET_FOCUSED_NODE = SET_FOCUSED_NODE;
const ADD_SELECTED_NODE = 'ADD_SELECTED_NODE';
exports.ADD_SELECTED_NODE = ADD_SELECTED_NODE;
const UNSELECT_NODE = 'UNSELECT_NODE';
exports.UNSELECT_NODE = UNSELECT_NODE;
const RANGE_SELECT_TO_NODE = 'RANGE_SELECT_TO_NODE';
exports.RANGE_SELECT_TO_NODE = RANGE_SELECT_TO_NODE;
const RANGE_SELECT_UP = 'RANGE_SELECT_UP';
exports.RANGE_SELECT_UP = RANGE_SELECT_UP;
const RANGE_SELECT_DOWN = 'RANGE_SELECT_DOWN';
exports.RANGE_SELECT_DOWN = RANGE_SELECT_DOWN;
const MOVE_SELECTION_UP = 'MOVE_SELECTION_UP';
exports.MOVE_SELECTION_UP = MOVE_SELECTION_UP;
const MOVE_SELECTION_DOWN = 'MOVE_SELECTION_DOWN';
exports.MOVE_SELECTION_DOWN = MOVE_SELECTION_DOWN;
const MOVE_SELECTION_TO_TOP = 'MOVE_SELECTION_TO_TOP';
exports.MOVE_SELECTION_TO_TOP = MOVE_SELECTION_TO_TOP;
const MOVE_SELECTION_TO_BOTTOM = 'MOVE_SELECTION_TO_BOTTOM';
exports.MOVE_SELECTION_TO_BOTTOM = MOVE_SELECTION_TO_BOTTOM;
const CLEAR_FILTER = 'CLEAR_FILTER';
exports.CLEAR_FILTER = CLEAR_FILTER;
const ADD_EXTRA_PROJECT_SELECTION_CONTENT = 'ADD_EXTRA_PROJECT_SELECTION_CONTENT';
exports.ADD_EXTRA_PROJECT_SELECTION_CONTENT = ADD_EXTRA_PROJECT_SELECTION_CONTENT;
const REMOVE_EXTRA_PROJECT_SELECTION_CONTENT = 'REMOVE_EXTRA_PROJECT_SELECTION_CONTENT';
exports.REMOVE_EXTRA_PROJECT_SELECTION_CONTENT = REMOVE_EXTRA_PROJECT_SELECTION_CONTENT;
const REMOVE_ROOT_FOLDER_SELECTION = 'REMOVE_ROOT_FOLDER_SELECTION';
exports.REMOVE_ROOT_FOLDER_SELECTION = REMOVE_ROOT_FOLDER_SELECTION;
const SET_OPEN_FILES_EXPANDED = 'SET_OPEN_FILES_EXPANDED';
exports.SET_OPEN_FILES_EXPANDED = SET_OPEN_FILES_EXPANDED;
const SET_UNCOMMITTED_CHANGES_EXPANDED = 'SET_UNCOMMITTED_CHANGES_EXPANDED';
exports.SET_UNCOMMITTED_CHANGES_EXPANDED = SET_UNCOMMITTED_CHANGES_EXPANDED;
const SET_FOLDERS_EXPANDED = 'SET_FOLDERS_EXPANDED';
exports.SET_FOLDERS_EXPANDED = SET_FOLDERS_EXPANDED;
const INVALIDATE_REMOVED_FOLDER = 'INVALIDATE_REMOVED_FOLDER';
exports.INVALIDATE_REMOVED_FOLDER = INVALIDATE_REMOVED_FOLDER;
const SET_TARGET_NODE = 'SET_TARGET_NODE';
exports.SET_TARGET_NODE = SET_TARGET_NODE;
const UPDATE_GENERATED_STATUSES = 'UPDATE_GENERATED_STATUSES';
exports.UPDATE_GENERATED_STATUSES = UPDATE_GENERATED_STATUSES;
const ADD_FILTER_LETTER = 'ADD_FILTER_LETTER';
exports.ADD_FILTER_LETTER = ADD_FILTER_LETTER;
const REMOVE_FILTER_LETTER = 'REMOVE_FILTER_LETTER';
exports.REMOVE_FILTER_LETTER = REMOVE_FILTER_LETTER;
const UPDATE_REPOSITORIES = 'UPDATE_REPOSITORIES';
exports.UPDATE_REPOSITORIES = UPDATE_REPOSITORIES;
const UPDATE_ROOT_DIRECTORIES = 'UPDATE_ROOT_DIRECTORIES';
exports.UPDATE_ROOT_DIRECTORIES = UPDATE_ROOT_DIRECTORIES;
const GOT_REMOTE_TRANSFER_SERVICE = 'GOT_REMOTE_TRANSFER_SERVICE';
exports.GOT_REMOTE_TRANSFER_SERVICE = GOT_REMOTE_TRANSFER_SERVICE;
const UPLOAD_DROPPED_FILES = 'UPLOAD_DROPPED_FILES';
exports.UPLOAD_DROPPED_FILES = UPLOAD_DROPPED_FILES;
const SELECT = 'SELECTION:SELECT';
exports.SELECT = SELECT;
const UNSELECT = 'SELECTION:UNSELECT';
exports.UNSELECT = UNSELECT;
const FOCUS = 'SELECTION:FOCUS';
exports.FOCUS = FOCUS;
const UNFOCUS = 'SELECTION:UNFOCUS';
exports.UNFOCUS = UNFOCUS;
const CLEAR_SELECTED = 'SELECTION:CLEAR_SELECTED';
exports.CLEAR_SELECTED = CLEAR_SELECTED;
const CLEAR_FOCUSED = 'SELECTION:CLEAR_FOCUSED';
exports.CLEAR_FOCUSED = CLEAR_FOCUSED;

function setCwd(rootKey) {
  return {
    type: SET_CWD,
    rootKey
  };
}

function clearFilter() {
  return {
    type: CLEAR_FILTER
  };
}

function addExtraProjectSelectionContent(content) {
  return {
    type: ADD_EXTRA_PROJECT_SELECTION_CONTENT,
    content
  };
}

function removeExtraProjectSelectionContent(content) {
  return {
    type: REMOVE_EXTRA_PROJECT_SELECTION_CONTENT,
    content
  };
}

function expandNode(rootKey, nodeKey) {
  return {
    type: EXPAND_NODE,
    rootKey,
    nodeKey
  };
}

function expandNodeDeep(rootKey, nodeKey) {
  return {
    type: EXPAND_NODE_DEEP,
    rootKey,
    nodeKey
  };
}

function deleteSelectedNodes() {
  return {
    type: DELETE_SELECTED_NODES
  };
}

function collapseNode(rootKey, nodeKey) {
  return {
    type: COLLAPSE_NODE,
    rootKey,
    nodeKey
  };
}

function collapseNodeDeep(rootKey, nodeKey) {
  return {
    type: COLLAPSE_NODE_DEEP,
    rootKey,
    nodeKey
  };
}

function setExcludeVcsIgnoredPaths(excludeVcsIgnoredPaths) {
  return {
    type: SET_EXCLUDE_VCS_IGNORED_PATHS,
    excludeVcsIgnoredPaths
  };
}

function setHideVcsIgnoredPaths(hideVcsIgnoredPaths) {
  return {
    type: SET_HIDE_VCS_IGNORED_PATHS,
    hideVcsIgnoredPaths
  };
}

function setHideIgnoredNames(hideIgnoredNames) {
  return {
    type: SET_HIDE_IGNORED_NAMES,
    hideIgnoredNames
  };
}

function setIsCalculatingChanges(isCalculatingChanges) {
  return {
    type: SET_IS_CALCULATING_CHANGES,
    isCalculatingChanges
  };
}

function setIgnoredNames(ignoredNames) {
  return {
    type: SET_IGNORED_NAMES,
    ignoredNames
  };
}

function setTrackedNode(rootKey, nodeKey) {
  return {
    type: SET_TRACKED_NODE,
    nodeKey,
    rootKey
  };
}

function clearTrackedNode() {
  return {
    type: CLEAR_TRACKED_NODE
  };
}

function clearTrackedNodeIfNotLoading() {
  return {
    type: CLEAR_TRACKED_NODE_IF_NOT_LOADING
  };
}

function startReorderDrag(draggedRootKey) {
  return {
    type: START_REORDER_DRAG,
    draggedRootKey
  };
}

function endReorderDrag() {
  return {
    type: END_REORDER_DRAG
  };
}

function reorderDragInto(dragTargetNodeKey) {
  return {
    type: REORDER_DRAG_INTO,
    dragTargetNodeKey
  };
}

function reorderRoots() {
  return {
    type: REORDER_ROOTS
  };
}

function moveToNode(rootKey, nodeKey) {
  return {
    type: MOVE_TO_NODE,
    nodeKey,
    rootKey
  };
}

function movePathToNode(uri, destination) {
  return {
    type: MOVE_PATH_TO_NODE,
    uri,
    destination
  };
}

function setUsePreviewTabs(usePreviewTabs) {
  return {
    type: SET_USE_PREVIEW_TABS,
    usePreviewTabs
  };
}

function setFocusEditorOnFileSelection(focusEditorOnFileSelection) {
  return {
    type: SET_FOCUS_EDITOR_ON_FILE_SELECTION,
    focusEditorOnFileSelection
  };
}

function setUsePrefixNav(usePrefixNav) {
  return {
    type: SET_USE_PREFIX_NAV,
    usePrefixNav
  };
}

function setAutoExpandSingleChild(autoExpandSingleChild) {
  return {
    type: SET_AUTO_EXPAND_SINGLE_CHILD,
    autoExpandSingleChild
  };
}

function setVcsStatuses(rootKey, vcsStatuses) {
  return {
    type: SET_VCS_STATUSES,
    rootKey,
    vcsStatuses
  };
}

function invalidateRemovedFolder() {
  return {
    type: INVALIDATE_REMOVED_FOLDER
  };
}

function updateWorkingSet(workingSet) {
  return {
    type: WORKING_SET_CHANGE_REQUESTED,
    workingSet
  };
}

function setWorkingSet(workingSet) {
  return {
    type: SET_WORKING_SET,
    workingSet
  };
}

function updateOpenFilesWorkingSet(openFilesWorkingSet) {
  return {
    type: SET_OPEN_FILES_WORKING_SET,
    openFilesWorkingSet
  };
}

function updateWorkingSetsStore(workingSetsStore) {
  return {
    type: SET_WORKING_SETS_STORE,
    workingSetsStore
  };
}

function startEditingWorkingSet(editedWorkingSet) {
  return {
    type: START_EDITING_WORKING_SET,
    editedWorkingSet
  };
}

function finishEditingWorkingSet() {
  return {
    type: FINISH_EDITING_WORKING_SET
  };
}

function checkNode(rootKey, nodeKey) {
  return {
    type: CHECK_NODE,
    rootKey,
    nodeKey
  };
}

function uncheckNode(rootKey, nodeKey) {
  return {
    type: UNCHECK_NODE,
    rootKey,
    nodeKey
  };
}

function setDragHoveredNode(rootKey, nodeKey) {
  return {
    type: SET_DRAG_HOVERED_NODE,
    rootKey,
    nodeKey
  };
}

function setSelectedNode(rootKey, nodeKey) {
  return {
    type: SET_SELECTED_NODE,
    rootKey,
    nodeKey
  };
}

function setFocusedNode(rootKey, nodeKey) {
  return {
    type: SET_FOCUSED_NODE,
    rootKey,
    nodeKey
  };
}

function addSelectedNode(rootKey, nodeKey) {
  return {
    type: ADD_SELECTED_NODE,
    rootKey,
    nodeKey
  };
}

function unselectNode(rootKey, nodeKey) {
  return {
    type: UNSELECT_NODE,
    rootKey,
    nodeKey
  };
}

function rangeSelectToNode(rootKey, nodeKey) {
  return {
    type: RANGE_SELECT_TO_NODE,
    rootKey,
    nodeKey
  };
}

function rangeSelectUp() {
  return {
    type: RANGE_SELECT_UP
  };
}

function rangeSelectDown() {
  return {
    type: RANGE_SELECT_DOWN
  };
}

function unhoverNode(rootKey, nodeKey) {
  return {
    type: UNHOVER_NODE,
    rootKey,
    nodeKey
  };
}

function moveSelectionUp() {
  return {
    type: MOVE_SELECTION_UP
  };
}

function moveSelectionDown() {
  return {
    type: MOVE_SELECTION_DOWN
  };
}

function moveSelectionToTop() {
  return {
    type: MOVE_SELECTION_TO_TOP
  };
}

function moveSelectionToBottom() {
  return {
    type: MOVE_SELECTION_TO_BOTTOM
  };
}

function setOpenFilesExpanded(openFilesExpanded) {
  return {
    type: SET_OPEN_FILES_EXPANDED,
    openFilesExpanded
  };
}

function setUncommittedChangesExpanded(uncommittedChangesExpanded) {
  return {
    type: SET_UNCOMMITTED_CHANGES_EXPANDED,
    uncommittedChangesExpanded
  };
}

function setFoldersExpanded(foldersExpanded) {
  return {
    type: SET_FOLDERS_EXPANDED,
    foldersExpanded
  };
}

function setTargetNode(rootKey, nodeKey) {
  return {
    type: SET_TARGET_NODE,
    rootKey,
    nodeKey
  };
}

function updateGeneratedStatuses(generatedFileTypes) {
  return {
    type: UPDATE_GENERATED_STATUSES,
    generatedFileTypes
  };
}

function addFilterLetter(letter) {
  return {
    type: ADD_FILTER_LETTER,
    letter
  };
}

function removeFilterLetter() {
  return {
    type: REMOVE_FILTER_LETTER
  };
}

function confirmNode(rootKey, nodeKey, pending = false) {
  return {
    type: CONFIRM_NODE,
    rootKey,
    nodeKey,
    pending
  };
}

function keepPreviewTab() {
  return {
    type: KEEP_PREVIEW_TAB
  };
}

function openEntrySplit(nodeKey, orientation, side) {
  return {
    type: OPEN_ENTRY_SPLIT,
    nodeKey,
    orientation,
    side
  };
}

function updateRepositories(rootDirectories) {
  return {
    type: UPDATE_REPOSITORIES,
    rootDirectories
  };
}

function revealNodeKey(nodeKey) {
  return {
    type: REVEAL_NODE_KEY,
    nodeKey
  };
}

function revealFilePath(filePath, showIfHidden = true) {
  return {
    type: REVEAL_FILE_PATH,
    filePath,
    showIfHidden
  };
}

function openAndRevealFilePath(filePath) {
  return {
    type: OPEN_AND_REVEAL_FILE_PATH,
    filePath
  };
}

function openAndRevealFilePaths(filePaths) {
  return {
    type: OPEN_AND_REVEAL_FILE_PATHS,
    filePaths
  };
}

function openAndRevealDirectoryPath(path) {
  return {
    type: OPEN_AND_REVEAL_DIRECTORY_PATH,
    path
  };
}

function updateRootDirectories() {
  return {
    type: UPDATE_ROOT_DIRECTORIES
  };
}

function setCwdToSelection() {
  return {
    type: SET_CWD_TO_SELECTION
  };
}

function setCwdApi(cwdApi) {
  return {
    type: SET_CWD_API,
    cwdApi
  };
}

function setRemoteProjectsService(service) {
  return {
    type: SET_REMOTE_PROJECTS_SERVICE,
    service
  };
}

function collapseSelection(deep = false) {
  return {
    type: COLLAPSE_SELECTION,
    deep
  };
}

function selectAndTrackNode(node) {
  return setSelectedNode(node.rootUri, node.uri);
}

function collapseAll() {
  return {
    type: COLLAPSE_ALL
  };
}

function deleteSelection() {
  return {
    type: DELETE_SELECTION
  };
}

function expandSelection(deep) {
  return {
    type: EXPAND_SELECTION,
    deep
  };
}

function openSelectedEntry() {
  return {
    type: OPEN_SELECTED_ENTRY
  };
}

function openSelectedEntrySplit(orientation, side) {
  return {
    type: OPEN_SELECTED_ENTRY_SPLIT,
    orientation,
    side
  };
}

function openSelectedEntrySplitUp() {
  return openSelectedEntrySplit('vertical', 'before');
}

function openSelectedEntrySplitDown() {
  return openSelectedEntrySplit('vertical', 'after');
}

function openSelectedEntrySplitLeft() {
  return openSelectedEntrySplit('horizontal', 'before');
}

function openSelectedEntrySplitRight() {
  return openSelectedEntrySplit('horizontal', 'after');
}

function removeRootFolderSelection() {
  return {
    type: REMOVE_ROOT_FOLDER_SELECTION
  };
}

function copyFilenamesWithDir() {
  return {
    type: COPY_FILENAMES_WITH_DIR
  };
}

function openAddFolderDialog(onDidConfirm) {
  return {
    type: OPEN_ADD_FOLDER_DIALOG,
    onDidConfirm
  };
}

function openAddFileDialog(onDidConfirm) {
  return {
    type: OPEN_ADD_FILE_DIALOG,
    onDidConfirm
  };
}

function openAddFileDialogRelative(onDidConfirm) {
  return {
    type: OPEN_ADD_FILE_DIALOG_RELATIVE,
    onDidConfirm
  };
}

function openRenameDialog() {
  return {
    type: OPEN_RENAME_DIALOG
  };
}

function openDuplicateDialog(onDidConfirm) {
  return {
    type: OPEN_DUPLICATE_DIALOG,
    onDidConfirm
  };
}

function openNextDuplicateDialog(nodes, onDidConfirm) {
  return {
    type: OPEN_NEXT_DUPLICATE_DIALOG,
    nodes,
    onDidConfirm
  };
}

function openPasteDialog() {
  return {
    type: OPEN_PASTE_DIALOG
  };
}

function clearSelection() {
  return {
    type: CLEAR_SELECTION
  };
}

function clearSelectionRange() {
  return {
    type: CLEAR_SELECTION_RANGE
  };
}

function clearDragHover() {
  return {
    type: CLEAR_DRAG_HOVER
  };
}

function setRoots(roots) {
  return {
    type: SET_ROOTS,
    roots
  };
}

function clearLoading(nodeKey) {
  return {
    type: CLEAR_LOADING,
    nodeKey
  };
}

function setLoading(nodeKey, promise) {
  return {
    type: SET_LOADING,
    nodeKey,
    promise
  };
}

function loadData(data) {
  return {
    type: LOAD_DATA,
    data
  };
}

function setInitialData(data) {
  return {
    type: SET_INITIAL_DATA,
    data
  };
}

function gotRemoteTransferService(remoteTransferService) {
  return {
    type: GOT_REMOTE_TRANSFER_SERVICE,
    remoteTransferService
  };
}

function uploadDroppedFiles(destination, files) {
  return {
    type: UPLOAD_DROPPED_FILES,
    destination,
    files
  };
}

function select(node) {
  return {
    type: SELECT,
    node
  };
}

function unselect(node) {
  return {
    type: UNSELECT,
    node
  };
}

function focus(node) {
  return {
    type: FOCUS,
    node
  };
}

function unfocus(node) {
  return {
    type: UNFOCUS,
    node
  };
}

function clearSelected() {
  return {
    type: CLEAR_SELECTED
  };
}

function clearFocused() {
  return {
    type: CLEAR_FOCUSED
  };
}