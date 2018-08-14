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

function _FileTreeDispatcher() {
  const data = require("../FileTreeDispatcher");

  _FileTreeDispatcher = function () {
    return data;
  };

  return data;
}

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
function setCwd(rootKey) {
  return {
    type: _FileTreeDispatcher().ActionTypes.SET_CWD,
    rootKey
  };
}

function clearFilter() {
  return {
    type: _FileTreeDispatcher().ActionTypes.CLEAR_FILTER
  };
}

function addExtraProjectSelectionContent(content) {
  return {
    type: _FileTreeDispatcher().ActionTypes.ADD_EXTRA_PROJECT_SELECTION_CONTENT,
    content
  };
}

function removeExtraProjectSelectionContent(content) {
  return {
    type: _FileTreeDispatcher().ActionTypes.REMOVE_EXTRA_PROJECT_SELECTION_CONTENT,
    content
  };
}

function expandNode(rootKey, nodeKey) {
  return {
    type: _FileTreeDispatcher().ActionTypes.EXPAND_NODE,
    rootKey,
    nodeKey
  };
}

function expandNodeDeep(rootKey, nodeKey) {
  return {
    type: _FileTreeDispatcher().ActionTypes.EXPAND_NODE_DEEP,
    rootKey,
    nodeKey
  };
}

function deleteSelectedNodes() {
  return {
    type: _FileTreeDispatcher().ActionTypes.DELETE_SELECTED_NODES
  };
}

function collapseNode(rootKey, nodeKey) {
  return {
    type: _FileTreeDispatcher().ActionTypes.COLLAPSE_NODE,
    rootKey,
    nodeKey
  };
}

function collapseNodeDeep(rootKey, nodeKey) {
  return {
    type: _FileTreeDispatcher().ActionTypes.COLLAPSE_NODE_DEEP,
    rootKey,
    nodeKey
  };
}

function setExcludeVcsIgnoredPaths(excludeVcsIgnoredPaths) {
  return {
    type: _FileTreeDispatcher().ActionTypes.SET_EXCLUDE_VCS_IGNORED_PATHS,
    excludeVcsIgnoredPaths
  };
}

function setHideVcsIgnoredPaths(hideVcsIgnoredPaths) {
  return {
    type: _FileTreeDispatcher().ActionTypes.SET_HIDE_VCS_IGNORED_PATHS,
    hideVcsIgnoredPaths
  };
}

function setHideIgnoredNames(hideIgnoredNames) {
  return {
    type: _FileTreeDispatcher().ActionTypes.SET_HIDE_IGNORED_NAMES,
    hideIgnoredNames
  };
}

function setIsCalculatingChanges(isCalculatingChanges) {
  return {
    type: _FileTreeDispatcher().ActionTypes.SET_IS_CALCULATING_CHANGES,
    isCalculatingChanges
  };
}

function setIgnoredNames(ignoredNames) {
  return {
    type: _FileTreeDispatcher().ActionTypes.SET_IGNORED_NAMES,
    ignoredNames
  };
}

function setTrackedNode(rootKey, nodeKey) {
  return {
    type: _FileTreeDispatcher().ActionTypes.SET_TRACKED_NODE,
    nodeKey,
    rootKey
  };
}

function clearTrackedNode() {
  return {
    type: _FileTreeDispatcher().ActionTypes.CLEAR_TRACKED_NODE
  };
}

function clearTrackedNodeIfNotLoading() {
  return {
    type: _FileTreeDispatcher().ActionTypes.CLEAR_TRACKED_NODE_IF_NOT_LOADING
  };
}

function startReorderDrag(draggedRootKey) {
  return {
    type: _FileTreeDispatcher().ActionTypes.START_REORDER_DRAG,
    draggedRootKey
  };
}

function endReorderDrag() {
  return {
    type: _FileTreeDispatcher().ActionTypes.END_REORDER_DRAG
  };
}

function reorderDragInto(dragTargetNodeKey) {
  return {
    type: _FileTreeDispatcher().ActionTypes.REORDER_DRAG_INTO,
    dragTargetNodeKey
  };
}

function reorderRoots() {
  return {
    type: _FileTreeDispatcher().ActionTypes.REORDER_ROOTS
  };
}

function moveToNode(rootKey, nodeKey) {
  return {
    type: _FileTreeDispatcher().ActionTypes.MOVE_TO_NODE,
    nodeKey,
    rootKey
  };
}

function setUsePreviewTabs(usePreviewTabs) {
  return {
    type: _FileTreeDispatcher().ActionTypes.SET_USE_PREVIEW_TABS,
    usePreviewTabs
  };
}

function setFocusEditorOnFileSelection(focusEditorOnFileSelection) {
  return {
    type: _FileTreeDispatcher().ActionTypes.SET_FOCUS_EDITOR_ON_FILE_SELECTION,
    focusEditorOnFileSelection
  };
}

function setUsePrefixNav(usePrefixNav) {
  return {
    type: _FileTreeDispatcher().ActionTypes.SET_USE_PREFIX_NAV,
    usePrefixNav
  };
}

function setAutoExpandSingleChild(autoExpandSingleChild) {
  return {
    type: _FileTreeDispatcher().ActionTypes.SET_AUTO_EXPAND_SINGLE_CHILD,
    autoExpandSingleChild
  };
}

function setVcsStatuses(rootKey, vcsStatuses) {
  return {
    type: _FileTreeDispatcher().ActionTypes.SET_VCS_STATUSES,
    rootKey,
    vcsStatuses
  };
}

function invalidateRemovedFolder() {
  return {
    type: _FileTreeDispatcher().ActionTypes.INVALIDATE_REMOVED_FOLDER
  };
}

function updateWorkingSet(workingSet) {
  return {
    type: _FileTreeDispatcher().ActionTypes.WORKING_SET_CHANGE_REQUESTED,
    workingSet
  };
}

function setWorkingSet(workingSet) {
  return {
    type: _FileTreeDispatcher().ActionTypes.SET_WORKING_SET,
    workingSet
  };
}

function updateOpenFilesWorkingSet(openFilesWorkingSet) {
  return {
    type: _FileTreeDispatcher().ActionTypes.SET_OPEN_FILES_WORKING_SET,
    openFilesWorkingSet
  };
}

function updateWorkingSetsStore(workingSetsStore) {
  return {
    type: _FileTreeDispatcher().ActionTypes.SET_WORKING_SETS_STORE,
    workingSetsStore
  };
}

function startEditingWorkingSet(editedWorkingSet) {
  return {
    type: _FileTreeDispatcher().ActionTypes.START_EDITING_WORKING_SET,
    editedWorkingSet
  };
}

function finishEditingWorkingSet() {
  return {
    type: _FileTreeDispatcher().ActionTypes.FINISH_EDITING_WORKING_SET
  };
}

function checkNode(rootKey, nodeKey) {
  return {
    type: _FileTreeDispatcher().ActionTypes.CHECK_NODE,
    rootKey,
    nodeKey
  };
}

function uncheckNode(rootKey, nodeKey) {
  return {
    type: _FileTreeDispatcher().ActionTypes.UNCHECK_NODE,
    rootKey,
    nodeKey
  };
}

function setDragHoveredNode(rootKey, nodeKey) {
  return {
    type: _FileTreeDispatcher().ActionTypes.SET_DRAG_HOVERED_NODE,
    rootKey,
    nodeKey
  };
}

function setSelectedNode(rootKey, nodeKey) {
  return {
    type: _FileTreeDispatcher().ActionTypes.SET_SELECTED_NODE,
    rootKey,
    nodeKey
  };
}

function setFocusedNode(rootKey, nodeKey) {
  return {
    type: _FileTreeDispatcher().ActionTypes.SET_FOCUSED_NODE,
    rootKey,
    nodeKey
  };
}

function addSelectedNode(rootKey, nodeKey) {
  return {
    type: _FileTreeDispatcher().ActionTypes.ADD_SELECTED_NODE,
    rootKey,
    nodeKey
  };
}

function unselectNode(rootKey, nodeKey) {
  return {
    type: _FileTreeDispatcher().ActionTypes.UNSELECT_NODE,
    rootKey,
    nodeKey
  };
}

function rangeSelectToNode(rootKey, nodeKey) {
  return {
    type: _FileTreeDispatcher().ActionTypes.RANGE_SELECT_TO_NODE,
    rootKey,
    nodeKey
  };
}

function rangeSelectUp() {
  return {
    type: _FileTreeDispatcher().ActionTypes.RANGE_SELECT_UP
  };
}

function rangeSelectDown() {
  return {
    type: _FileTreeDispatcher().ActionTypes.RANGE_SELECT_DOWN
  };
}

function unhoverNode(rootKey, nodeKey) {
  return {
    type: _FileTreeDispatcher().ActionTypes.UNHOVER_NODE,
    rootKey,
    nodeKey
  };
}

function moveSelectionUp() {
  return {
    type: _FileTreeDispatcher().ActionTypes.MOVE_SELECTION_UP
  };
}

function moveSelectionDown() {
  return {
    type: _FileTreeDispatcher().ActionTypes.MOVE_SELECTION_DOWN
  };
}

function moveSelectionToTop() {
  return {
    type: _FileTreeDispatcher().ActionTypes.MOVE_SELECTION_TO_TOP
  };
}

function moveSelectionToBottom() {
  return {
    type: _FileTreeDispatcher().ActionTypes.MOVE_SELECTION_TO_BOTTOM
  };
}

function setOpenFilesExpanded(openFilesExpanded) {
  return {
    type: _FileTreeDispatcher().ActionTypes.SET_OPEN_FILES_EXPANDED,
    openFilesExpanded
  };
}

function setUncommittedChangesExpanded(uncommittedChangesExpanded) {
  return {
    type: _FileTreeDispatcher().ActionTypes.SET_UNCOMMITTED_CHANGES_EXPANDED,
    uncommittedChangesExpanded
  };
}

function setFoldersExpanded(foldersExpanded) {
  return {
    type: _FileTreeDispatcher().ActionTypes.SET_FOLDERS_EXPANDED,
    foldersExpanded
  };
}

function setTargetNode(rootKey, nodeKey) {
  return {
    type: _FileTreeDispatcher().ActionTypes.SET_TARGET_NODE,
    rootKey,
    nodeKey
  };
}

function updateGeneratedStatuses(generatedFileTypes) {
  return {
    type: _FileTreeDispatcher().ActionTypes.UPDATE_GENERATED_STATUSES,
    generatedFileTypes
  };
}

function addFilterLetter(letter) {
  return {
    type: _FileTreeDispatcher().ActionTypes.ADD_FILTER_LETTER,
    letter
  };
}

function removeFilterLetter() {
  return {
    type: _FileTreeDispatcher().ActionTypes.REMOVE_FILTER_LETTER
  };
}

function confirmNode(rootKey, nodeKey, pending = false) {
  return {
    type: _FileTreeDispatcher().ActionTypes.CONFIRM_NODE,
    rootKey,
    nodeKey,
    pending
  };
}

function keepPreviewTab() {
  return {
    type: _FileTreeDispatcher().ActionTypes.KEEP_PREVIEW_TAB
  };
}

function openEntrySplit(nodeKey, orientation, side) {
  return {
    type: _FileTreeDispatcher().ActionTypes.OPEN_ENTRY_SPLIT,
    nodeKey,
    orientation,
    side
  };
}

function updateRepositories(rootDirectories) {
  return {
    type: _FileTreeDispatcher().ActionTypes.UPDATE_REPOSITORIES,
    rootDirectories
  };
}

function revealNodeKey(nodeKey) {
  return {
    type: _FileTreeDispatcher().ActionTypes.REVEAL_NODE_KEY,
    nodeKey
  };
}

function revealFilePath(filePath, showIfHidden = true) {
  return {
    type: _FileTreeDispatcher().ActionTypes.REVEAL_FILE_PATH,
    filePath,
    showIfHidden
  };
}

function openAndRevealFilePath(filePath) {
  return {
    type: _FileTreeDispatcher().ActionTypes.OPEN_AND_REVEAL_FILE_PATH,
    filePath
  };
}

function openAndRevealFilePaths(filePaths) {
  return {
    type: _FileTreeDispatcher().ActionTypes.OPEN_AND_REVEAL_FILE_PATHS,
    filePaths
  };
}

function openAndRevealDirectoryPath(path) {
  return {
    type: _FileTreeDispatcher().ActionTypes.OPEN_AND_REVEAL_DIRECTORY_PATH,
    path
  };
}

function updateRootDirectories() {
  return {
    type: _FileTreeDispatcher().ActionTypes.UPDATE_ROOT_DIRECTORIES
  };
}

function setCwdToSelection() {
  return {
    type: _FileTreeDispatcher().ActionTypes.SET_CWD_TO_SELECTION
  };
}

function setCwdApi(cwdApi) {
  return {
    type: _FileTreeDispatcher().ActionTypes.SET_CWD_API,
    cwdApi
  };
}

function setRemoteProjectsService(service) {
  return {
    type: _FileTreeDispatcher().ActionTypes.SET_REMOTE_PROJECTS_SERVICE,
    service
  };
}

function collapseSelection(deep = false) {
  return {
    type: _FileTreeDispatcher().ActionTypes.COLLAPSE_SELECTION,
    deep
  };
}

function selectAndTrackNode(node) {
  return setSelectedNode(node.rootUri, node.uri);
}

function collapseAll() {
  return {
    type: _FileTreeDispatcher().ActionTypes.COLLAPSE_ALL
  };
}

function deleteSelection() {
  return {
    type: _FileTreeDispatcher().ActionTypes.DELETE_SELECTION
  };
}

function expandSelection(deep) {
  return {
    type: _FileTreeDispatcher().ActionTypes.EXPAND_SELECTION,
    deep
  };
}

function openSelectedEntry() {
  return {
    type: _FileTreeDispatcher().ActionTypes.OPEN_SELECTED_ENTRY
  };
}

function openSelectedEntrySplit(orientation, side) {
  return {
    type: _FileTreeDispatcher().ActionTypes.OPEN_SELECTED_ENTRY_SPLIT,
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
    type: _FileTreeDispatcher().ActionTypes.REMOVE_ROOT_FOLDER_SELECTION
  };
}

function copyFilenamesWithDir() {
  return {
    type: _FileTreeDispatcher().ActionTypes.COPY_FILENAMES_WITH_DIR
  };
}

function openAddFolderDialog(onDidConfirm) {
  return {
    type: _FileTreeDispatcher().ActionTypes.OPEN_ADD_FOLDER_DIALOG,
    onDidConfirm
  };
}

function openAddFileDialog(onDidConfirm) {
  return {
    type: _FileTreeDispatcher().ActionTypes.OPEN_ADD_FILE_DIALOG,
    onDidConfirm
  };
}

function openAddFileDialogRelative(onDidConfirm) {
  return {
    type: _FileTreeDispatcher().ActionTypes.OPEN_ADD_FILE_DIALOG_RELATIVE,
    onDidConfirm
  };
}

function openRenameDialog() {
  return {
    type: _FileTreeDispatcher().ActionTypes.OPEN_RENAME_DIALOG
  };
}

function openDuplicateDialog(onDidConfirm) {
  return {
    type: _FileTreeDispatcher().ActionTypes.OPEN_DUPLICATE_DIALOG,
    onDidConfirm
  };
}

function openNextDuplicateDialog(nodes, onDidConfirm) {
  return {
    type: _FileTreeDispatcher().ActionTypes.OPEN_NEXT_DUPLICATE_DIALOG,
    nodes,
    onDidConfirm
  };
}

function openPasteDialog() {
  return {
    type: _FileTreeDispatcher().ActionTypes.OPEN_PASTE_DIALOG
  };
}

function clearSelection() {
  return {
    type: _FileTreeDispatcher().ActionTypes.CLEAR_SELECTION
  };
}

function clearSelectionRange() {
  return {
    type: _FileTreeDispatcher().ActionTypes.CLEAR_SELECTION_RANGE
  };
}

function clearDragHover() {
  return {
    type: _FileTreeDispatcher().ActionTypes.CLEAR_DRAG_HOVER
  };
}

function setRoots(roots) {
  return {
    type: _FileTreeDispatcher().ActionTypes.SET_ROOTS,
    roots
  };
}

function clearLoading(nodeKey) {
  return {
    type: _FileTreeDispatcher().ActionTypes.CLEAR_LOADING,
    nodeKey
  };
}

function setLoading(nodeKey, promise) {
  return {
    type: _FileTreeDispatcher().ActionTypes.SET_LOADING,
    nodeKey,
    promise
  };
}

function loadData(data) {
  return {
    type: _FileTreeDispatcher().ActionTypes.LOAD_DATA,
    data
  };
}

function setInitialData(data) {
  return {
    type: _FileTreeDispatcher().ActionTypes.SET_INITIAL_DATA,
    data
  };
}