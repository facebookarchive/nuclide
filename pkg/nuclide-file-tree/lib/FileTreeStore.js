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

import type CwdApi from '../../nuclide-current-working-directory/lib/CwdApi';
import type {GeneratedFileType} from '../../nuclide-generated-files-rpc';
import type {FileChangeStatusValue} from '../../nuclide-vcs-base';
// $FlowFixMe(>=0.53.0) Flow suppress
import type React from 'react';
import type {InitialData, Roots} from './types';

import invariant from 'assert';
import FileTreeDispatcher, {ActionTypes} from './FileTreeDispatcher';
import FileTreeHelpers from './FileTreeHelpers';
import * as Selectors from './FileTreeSelectors';
import {FileTreeNode} from './FileTreeNode';
import * as Immutable from 'immutable';
import {Emitter} from 'atom';
import {HgStatusToFileChangeStatus} from '../../nuclide-vcs-base';
import {matchesFilter} from './FileTreeFilterHelper';
import {Minimatch} from 'minimatch';
import {repositoryForPath} from '../../nuclide-vcs-base';
import {nextAnimationFrame} from 'nuclide-commons/observable';
import {StatusCodeNumber} from '../../nuclide-hg-rpc/lib/hg-constants';
import {getLogger} from 'log4js';
import {WorkingSet} from '../../nuclide-working-sets-common';
import {HistogramTracker, track} from '../../nuclide-analytics';
import nuclideUri from 'nuclide-commons/nuclideUri';
import nullthrows from 'nullthrows';
import {RangeKey, SelectionRange, RangeUtil} from './FileTreeSelectionRange';
import {awaitGeneratedFileServiceByNuclideUri} from '../../nuclide-remote-connection';
import * as SelectionActions from './redux/SelectionActions';

import type {FileTreeAction} from './FileTreeDispatcher';
import type {NuclideUri} from 'nuclide-commons/nuclideUri';
import type {WorkingSetsStore} from '../../nuclide-working-sets/lib/types';
import type {StatusCodeNumberValue} from '../../nuclide-hg-rpc/lib/HgService';

type ChangeListener = () => mixed;

type TargetNodeKeys = {
  rootKey: NuclideUri,
  nodeKey: NuclideUri,
};

export type StoreConfigData = {
  vcsStatuses: Immutable.Map<
    NuclideUri,
    Map<NuclideUri, StatusCodeNumberValue>,
  >,
  workingSet: WorkingSet,
  hideIgnoredNames: boolean,
  excludeVcsIgnoredPaths: boolean,
  hideVcsIgnoredPaths: boolean,
  ignoredPatterns: Immutable.Set<Minimatch>,
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

export type NodeCheckedStatus = 'checked' | 'clear' | 'partial';

export const DEFAULT_CONF = {
  vcsStatuses: Immutable.Map(),
  workingSet: new WorkingSet(),
  editedWorkingSet: new WorkingSet(),
  hideIgnoredNames: true,
  excludeVcsIgnoredPaths: true,
  hideVcsIgnoredPaths: true,
  ignoredPatterns: Immutable.Set(),
  usePreviewTabs: false,
  focusEditorOnFileSelection: true,
  isEditingWorkingSet: false,
  openFilesWorkingSet: new WorkingSet(),
  reposByRoot: {},
  fileChanges: Immutable.Map(),
};

export type ReorderPreviewStatus = ?{
  source: NuclideUri,
  sourceIdx: number,
  target?: NuclideUri,
  targetIdx?: number,
};

const actionTrackers: Map<string, HistogramTracker> = new Map();

// TODO: Don't `export default` an object.
const {replaceNode, updateNodeAtRoot, updateNodeAtAllRoots} = FileTreeHelpers;

/**
 * Implements the Flux pattern for our file tree. All state for the file tree will be kept in
 * FileTreeStore and the only way to update the store is through methods on FileTreeActions. The
 * dispatcher is a mechanism through which FileTreeActions interfaces with FileTreeStore.
 */
export default class FileTreeStore {
  VERSION: number;
  _roots: Roots;
  _openFilesExpanded: boolean;
  _uncommittedChangesExpanded: boolean;
  _foldersExpanded: boolean;
  _reorderPreviewStatus: ReorderPreviewStatus;

  _conf: StoreConfigData; // The configuration for the file-tree. Avoid direct writing.
  _workingSetsStore: ?WorkingSetsStore;
  _usePrefixNav: boolean;
  _autoExpandSingleChild: boolean;
  _isLoadingMap: Immutable.Map<NuclideUri, Promise<void>>;
  _repositories: Immutable.Set<atom$Repository>;
  _fileChanges: Immutable.Map<
    NuclideUri,
    Immutable.Map<NuclideUri, FileChangeStatusValue>,
  >;

  _generatedOpenChangedFiles: Immutable.Map<NuclideUri, GeneratedFileType>;
  _dispatcher: FileTreeDispatcher;
  _emitter: Emitter;
  _logger: any;
  _animationFrameRequestSubscription: ?rxjs$Subscription;
  _cwdApi: ?CwdApi;
  _cwdKey: ?NuclideUri;
  _filter: string;
  _extraProjectSelectionContent: Immutable.List<React.Element<any>>;
  _selectionRange: ?SelectionRange;
  _targetNodeKeys: ?TargetNodeKeys;
  _trackedRootKey: ?NuclideUri;
  _trackedNodeKey: ?NuclideUri;
  _isCalculatingChanges: boolean;

  _maxComponentWidth: number;

  _selectedNodes: Immutable.Set<FileTreeNode> = Immutable.Set();
  _focusedNodes: Immutable.Set<FileTreeNode> = Immutable.Set();

  constructor() {
    // Used to ensure the version we serialized is the same version we are deserializing.
    this.VERSION = 1;

    this._roots = Immutable.OrderedMap();
    this._dispatcher = FileTreeDispatcher.getInstance();
    this._emitter = new Emitter();
    this._dispatcher.register(this._onDispatch.bind(this));
    this._logger = getLogger('nuclide-file-tree');
    this._fileChanges = Immutable.Map();
    this._generatedOpenChangedFiles = Immutable.Map();
    this._reorderPreviewStatus = null;

    this._usePrefixNav = false;
    this._autoExpandSingleChild = true;
    this._isLoadingMap = Immutable.Map();
    this._repositories = Immutable.Set();

    this._conf = {...DEFAULT_CONF};
    this._filter = '';
    this._extraProjectSelectionContent = Immutable.List();
    this._foldersExpanded = true;
    this._openFilesExpanded = true;
    this._uncommittedChangesExpanded = true;
    this._selectionRange = null;
    this._targetNodeKeys = null;
    this._isCalculatingChanges = false;
  }

  _setExcludeVcsIgnoredPaths(excludeVcsIgnoredPaths: boolean): void {
    this._updateConf(conf => {
      conf.excludeVcsIgnoredPaths = excludeVcsIgnoredPaths;
    });
  }

  _setHideVcsIgnoredPaths(hideVcsIgnoredPaths: boolean): void {
    this._updateConf(conf => {
      conf.hideVcsIgnoredPaths = hideVcsIgnoredPaths;
    });
  }

  _setHideIgnoredNames(hideIgnoredNames: boolean): void {
    this._updateConf(conf => {
      conf.hideIgnoredNames = hideIgnoredNames;
    });
  }

  _setIsCalculatingChanges(isCalculatingChanges: boolean): void {
    this._isCalculatingChanges = isCalculatingChanges;
    this._emitChange();
  }

  /**
   * Given a list of names to ignore, compile them into minimatch patterns and
   * update the store with them.
   */
  _setIgnoredNames(ignoredNames: Array<string>) {
    const ignoredPatterns = Immutable.Set(ignoredNames)
      .map(ignoredName => {
        if (ignoredName === '') {
          return null;
        }
        try {
          return new Minimatch(ignoredName, {matchBase: true, dot: true});
        } catch (error) {
          atom.notifications.addWarning(
            `Error parsing pattern '${ignoredName}' from "Settings" > "Ignored Names"`,
            {detail: error.message},
          );
          return null;
        }
      })
      .filter(pattern => pattern != null);
    this._updateConf(conf => {
      conf.ignoredPatterns = ignoredPatterns;
    });
  }

  _onDispatch(payload: FileTreeAction): void {
    const {performance} = global;
    const start = performance.now();

    switch (payload.type) {
      case ActionTypes.SET_INITIAL_DATA:
        this._setInitialData(payload.data);
        break;
      case ActionTypes.CLEAR_SELECTION_RANGE:
        this._clearSelectionRange();
        break;
      case ActionTypes.CLEAR_DRAG_HOVER:
        this._clearDragHover();
        break;
      case ActionTypes.CLEAR_SELECTION:
        this._clearSelection();
        break;
      case ActionTypes.SET_CWD:
        this._setCwdKey(payload.rootKey);
        break;
      case ActionTypes.SET_CWD_API:
        this._setCwdApi(payload.cwdApi);
        break;
      case ActionTypes.SET_TRACKED_NODE:
        this._setTrackedNode(payload.rootKey, payload.nodeKey);
        break;
      case ActionTypes.CLEAR_TRACKED_NODE:
        this._clearTrackedNode();
        break;
      case ActionTypes.CLEAR_TRACKED_NODE_IF_NOT_LOADING:
        this._clearTrackedNodeIfNotLoading();
        break;
      case ActionTypes.START_REORDER_DRAG:
        this._startReorderDrag(payload.draggedRootKey);
        break;
      case ActionTypes.END_REORDER_DRAG:
        this._endReorderDrag();
        break;
      case ActionTypes.REORDER_DRAG_INTO:
        this._reorderDragInto(payload.dragTargetNodeKey);
        break;
      case ActionTypes.COLLAPSE_NODE:
        this._collapseNode(payload.rootKey, payload.nodeKey);
        break;
      case ActionTypes.SET_EXCLUDE_VCS_IGNORED_PATHS:
        this._setExcludeVcsIgnoredPaths(payload.excludeVcsIgnoredPaths);
        break;
      case ActionTypes.SET_HIDE_VCS_IGNORED_PATHS:
        this._setHideVcsIgnoredPaths(payload.hideVcsIgnoredPaths);
        break;
      case ActionTypes.SET_USE_PREVIEW_TABS:
        this._setUsePreviewTabs(payload.usePreviewTabs);
        break;
      case ActionTypes.SET_FOCUS_EDITOR_ON_FILE_SELECTION:
        this._setFocusEditorOnFileSelection(payload.focusEditorOnFileSelection);
        break;
      case ActionTypes.SET_USE_PREFIX_NAV:
        this._setUsePrefixNav(payload.usePrefixNav);
        break;
      case ActionTypes.SET_AUTO_EXPAND_SINGLE_CHILD:
        this._setAutoExpandSingleChild(payload.autoExpandSingleChild);
        break;
      case ActionTypes.COLLAPSE_NODE_DEEP:
        this._collapseNodeDeep(payload.rootKey, payload.nodeKey);
        break;
      case ActionTypes.SET_HIDE_IGNORED_NAMES:
        this._setHideIgnoredNames(payload.hideIgnoredNames);
        break;
      case ActionTypes.SET_IS_CALCULATING_CHANGES:
        this._setIsCalculatingChanges(payload.isCalculatingChanges);
        break;
      case ActionTypes.SET_IGNORED_NAMES:
        this._setIgnoredNames(payload.ignoredNames);
        break;
      case ActionTypes.SET_VCS_STATUSES:
        this._setVcsStatuses(payload.rootKey, payload.vcsStatuses);
        break;
      case ActionTypes.SET_REPOSITORIES:
        this._setRepositories(payload.repositories);
        break;
      case ActionTypes.SET_WORKING_SET:
        this._setWorkingSet(payload.workingSet);
        break;
      case ActionTypes.SET_OPEN_FILES_WORKING_SET:
        this._setOpenFilesWorkingSet(payload.openFilesWorkingSet);
        break;
      case ActionTypes.SET_WORKING_SETS_STORE:
        this._setWorkingSetsStore(payload.workingSetsStore);
        break;
      case ActionTypes.START_EDITING_WORKING_SET:
        this._startEditingWorkingSet(payload.editedWorkingSet);
        break;
      case ActionTypes.FINISH_EDITING_WORKING_SET:
        this._finishEditingWorkingSet();
        break;
      case ActionTypes.CHECK_NODE:
        this._checkNode(payload.rootKey, payload.nodeKey);
        break;
      case ActionTypes.UNCHECK_NODE:
        this._uncheckNode(payload.rootKey, payload.nodeKey);
        break;
      case ActionTypes.SET_DRAG_HOVERED_NODE:
        this._setDragHoveredNode(payload.rootKey, payload.nodeKey);
        break;
      case ActionTypes.UNHOVER_NODE:
        this._unhoverNode(payload.rootKey, payload.nodeKey);
        break;
      case ActionTypes.SET_SELECTED_NODE:
        this._setSelectedNode(payload.rootKey, payload.nodeKey);
        break;
      case ActionTypes.SET_FOCUSED_NODE:
        this._setFocusedNode(payload.rootKey, payload.nodeKey);
        break;
      case ActionTypes.ADD_SELECTED_NODE:
        this._addSelectedNode(payload.rootKey, payload.nodeKey);
        break;
      case ActionTypes.UNSELECT_NODE:
        this._unselectNode(payload.rootKey, payload.nodeKey);
        break;
      case ActionTypes.MOVE_SELECTION_UP:
        this._moveSelectionUp();
        break;
      case ActionTypes.RANGE_SELECT_TO_NODE:
        this._rangeSelectToNode(payload.rootKey, payload.nodeKey);
        break;
      case ActionTypes.RANGE_SELECT_UP:
        this._rangeSelectUp();
        break;
      case ActionTypes.RANGE_SELECT_DOWN:
        this._rangeSelectDown();
        break;
      case ActionTypes.MOVE_SELECTION_DOWN:
        this._moveSelectionDown();
        break;
      case ActionTypes.MOVE_SELECTION_TO_TOP:
        this._moveSelectionToTop();
        break;
      case ActionTypes.MOVE_SELECTION_TO_BOTTOM:
        this._moveSelectionToBottom();
        break;
      case ActionTypes.CLEAR_FILTER:
        this._clearFilter();
        break;
      case ActionTypes.ADD_EXTRA_PROJECT_SELECTION_CONTENT:
        this._addExtraProjectSelectionContent(payload.content);
        break;
      case ActionTypes.REMOVE_EXTRA_PROJECT_SELECTION_CONTENT:
        this._removeExtraProjectSelectionContent(payload.content);
        break;
      case ActionTypes.SET_OPEN_FILES_EXPANDED:
        this._setOpenFilesExpanded(payload.openFilesExpanded);
        break;
      case ActionTypes.SET_UNCOMMITTED_CHANGES_EXPANDED:
        this._setUncommittedChangesExpanded(payload.uncommittedChangesExpanded);
        break;
      case ActionTypes.SET_FOLDERS_EXPANDED:
        this._setFoldersExpanded(payload.foldersExpanded);
        break;
      case ActionTypes.INVALIDATE_REMOVED_FOLDER:
        this._invalidateRemovedFolder();
        break;
      case ActionTypes.SET_TARGET_NODE:
        this._setTargetNode(payload.rootKey, payload.nodeKey);
        break;
      case ActionTypes.UPDATE_GENERATED_STATUS:
        this._updateGeneratedStatus(payload.filesToCheck);
        break;
      case ActionTypes.ADD_FILTER_LETTER:
        this._addFilterLetter(payload.letter);
        break;
      case ActionTypes.REMOVE_FILTER_LETTER:
        this._removeFilterLetter();
        break;
      case ActionTypes.RESET:
        this._reset();
        break;
      case ActionTypes.SET_ROOTS:
        this._setRoots(payload.roots);
        break;
      case SelectionActions.SELECT:
        this._selectedNodes = this._selectedNodes.add(payload.node);
        this._emitChange();
        break;
      case SelectionActions.UNSELECT:
        this._selectedNodes = this._selectedNodes.delete(payload.node);
        this._emitChange();
        break;
      case SelectionActions.CLEAR_SELECTED:
        this._clearSelected();
        break;
      case SelectionActions.FOCUS:
        this._focusedNodes = this._focusedNodes.add(payload.node);
        this._emitChange();
        break;
      case SelectionActions.UNFOCUS:
        this._focusedNodes = this._focusedNodes.delete(payload.node);
        this._emitChange();
        break;
      case SelectionActions.CLEAR_FOCUSED:
        this._clearFocused();
        break;
      default:
        break;
    }

    const end = performance.now();

    let tracker = actionTrackers.get(payload.type);
    if (tracker == null) {
      tracker = new HistogramTracker(
        `file-tree-action:${payload.type}`,
        1000,
        10,
      );
      actionTrackers.set(payload.type, tracker);
    }

    tracker.track(end - start);
  }

  _setInitialData(data: InitialData): void {
    if (data.openFilesExpanded != null) {
      this._openFilesExpanded = data.openFilesExpanded;
    }

    if (data.uncommittedChangesExpanded != null) {
      this._uncommittedChangesExpanded = data.uncommittedChangesExpanded;
    }

    if (data.foldersExpanded != null) {
      this._foldersExpanded = data.foldersExpanded;
    }

    this._setRoots(data.roots);
  }

  /**
   * Use the predicate function to update one or more of the roots in the file tree
   */
  _updateRoots(predicate: (root: FileTreeNode) => FileTreeNode): void {
    this._setRoots(this._roots.map(predicate));
  }

  /**
   * Update a node by calling the predicate, returns the new node.
   */
  _updateNode(
    node: FileTreeNode,
    predicate: (node: FileTreeNode) => FileTreeNode,
  ): FileTreeNode {
    const newNode = predicate(node);
    const roots = this._roots.set(node.rootUri, replaceNode(node, newNode));
    this._setRoots(roots);
    return newNode;
  }

  /**
   * Updates the roots, maintains their sibling relationships and fires the change event.
   */
  _setRoots(roots: Roots): void {
    // Explicitly test for the empty case, otherwise configuration changes with an empty
    // tree will not emit changes.
    const changed = !Immutable.is(roots, this._roots) || roots.isEmpty();
    if (changed) {
      this._roots = roots;
      let prevRoot = null;
      roots.forEach(r => {
        r.prevSibling = prevRoot;
        if (prevRoot != null) {
          prevRoot.nextSibling = r;
        }
        prevRoot = r;
      });

      if (prevRoot != null) {
        prevRoot.nextSibling = null;
      }

      this._emitChange();
    }
  }

  _emitChange(): void {
    if (this._animationFrameRequestSubscription != null) {
      return;
    }

    this._animationFrameRequestSubscription = nextAnimationFrame.subscribe(
      () => {
        this._animationFrameRequestSubscription = null;
        const {performance} = global;
        const renderStart = performance.now();
        const childrenCount = this._roots.reduce(
          (sum, root) => sum + root.shownChildrenCount,
          0,
        );

        this._emitter.emit('change');

        const duration = (performance.now() - renderStart).toString();
        track('filetree-root-node-component-render', {
          'filetree-root-node-component-render-duration': duration,
          'filetree-root-node-component-rendered-child-count': childrenCount,
        });
      },
    );
  }

  /**
   * Update the configuration for the file-tree. The direct writing to the this._conf should be
   * avoided.
   */
  _updateConf(predicate: (conf: StoreConfigData) => void): void {
    predicate(this._conf);
    this._updateRoots(root => {
      return root.updateConf().setRecursive(
        // Remove selection from hidden nodes under this root
        node => (node.containsHidden ? null : node),
        node => {
          if (node.shouldBeShown) {
            return node;
          }

          // The node is hidden - unselect all nodes under it if there are any
          return node.setRecursive(
            subNode => null,
            subNode => subNode.setIsSelected(false),
          );
        },
      );
    });
  }

  _invalidateRemovedFolder(): void {
    const updatedFileChanges = new Map();
    atom.project.getPaths().forEach(projectPath => {
      const standardizedPath = nuclideUri.ensureTrailingSeparator(projectPath);
      // Atom sometimes tells you a repo exists briefly even after it has been removed
      // This causes the map to first flush out the repo and then again try to add the
      // repo but the files now don't exist causing an undefined value to be added.
      // Adding check to prevent this from happening.
      const fileChangesForPath = this._fileChanges.get(standardizedPath);
      if (fileChangesForPath != null) {
        updatedFileChanges.set(standardizedPath, fileChangesForPath);
      }
    });

    this._fileChanges = Immutable.Map(updatedFileChanges);
  }

  _setFileChanges(
    rootKey: NuclideUri,
    vcsStatuses: Map<NuclideUri, StatusCodeNumberValue>,
  ): void {
    let fileChanges = Immutable.Map();
    vcsStatuses.forEach((statusCode, filePath) => {
      fileChanges = fileChanges.set(
        filePath,
        HgStatusToFileChangeStatus[statusCode],
      );
    });

    this._fileChanges = this._fileChanges.set(rootKey, fileChanges);
  }

  _setVcsStatuses(
    rootKey: NuclideUri,
    vcsStatuses: Map<NuclideUri, StatusCodeNumberValue>,
  ): void {
    // We use file changes for populating the uncommitted list, this is different as compared
    // to what is computed in the vcsStatuses in that it does not need the exact path but just
    // the root folder present in atom and the file name and its status. Another difference is
    // in the terms used for status change, while uncommitted changes needs the HgStatusChange
    // codes the file tree doesn't.
    this._setFileChanges(rootKey, vcsStatuses);
    this._updateGeneratedStatus(vcsStatuses.keys());

    // We can't build on the child-derived properties to maintain vcs statuses in the entire
    // tree, since the reported VCS status may be for a node that is not yet present in the
    // fetched tree, and so it it can't affect its parents statuses. To have the roots colored
    // consistently we manually add all parents of all of the modified nodes up till the root
    const enrichedVcsStatuses = new Map(vcsStatuses);

    const ensurePresentParents = uri => {
      if (uri === rootKey) {
        return;
      }

      let current = uri;
      while (current !== rootKey) {
        current = FileTreeHelpers.getParentKey(current);

        if (enrichedVcsStatuses.has(current)) {
          return;
        }

        enrichedVcsStatuses.set(current, StatusCodeNumber.MODIFIED);
      }
    };

    vcsStatuses.forEach((status, uri) => {
      if (
        status === StatusCodeNumber.MODIFIED ||
        status === StatusCodeNumber.ADDED ||
        status === StatusCodeNumber.REMOVED
      ) {
        try {
          // An invalid URI might cause an exception to be thrown
          ensurePresentParents(uri);
        } catch (e) {
          this._logger.error(`Error enriching the VCS statuses for ${uri}`, e);
        }
      }
    });

    this._updateConf(conf => {
      conf.vcsStatuses = conf.vcsStatuses.set(rootKey, enrichedVcsStatuses);
    });
  }

  _setUsePreviewTabs(usePreviewTabs: boolean): void {
    this._updateConf(conf => {
      conf.usePreviewTabs = usePreviewTabs;
    });
  }

  _setFocusEditorOnFileSelection(focusEditorOnFileSelection: boolean): void {
    this._updateConf(conf => {
      conf.focusEditorOnFileSelection = focusEditorOnFileSelection;
    });
  }

  _setUsePrefixNav(usePrefixNav: boolean) {
    this._usePrefixNav = usePrefixNav;
  }

  usePrefixNav(): boolean {
    return this._usePrefixNav;
  }

  _setAutoExpandSingleChild(autoExpandSingleChild: boolean) {
    this._autoExpandSingleChild = autoExpandSingleChild;
  }

  _getLoading(nodeKey: NuclideUri): ?Promise<void> {
    return this._isLoadingMap.get(nodeKey);
  }

  _setLoading(nodeKey: NuclideUri, value: Promise<void>): void {
    this._isLoadingMap = this._isLoadingMap.set(nodeKey, value);
  }

  _setCwdKey(cwdKey: ?NuclideUri): void {
    if (this._cwdKey != null) {
      this._setRoots(
        updateNodeAtAllRoots(this._roots, this._cwdKey, node =>
          node.setIsCwd(false),
        ),
      );
    }
    this._cwdKey = cwdKey;
    if (cwdKey != null) {
      this._setRoots(
        updateNodeAtAllRoots(this._roots, cwdKey, node => node.setIsCwd(true)),
      );
    }
  }

  _setCwdApi(cwdApi: ?CwdApi): void {
    this._cwdApi = cwdApi;
  }

  _addFilterLetter(letter: string): void {
    this._filter = this._filter + letter;
    this._updateRoots(root => {
      return root.setRecursive(
        node => (node.containsFilterMatches ? null : node),
        node => {
          return matchesFilter(node.name, this._filter)
            ? node.set({
                highlightedText: this._filter,
                matchesFilter: true,
              })
            : node.set({highlightedText: '', matchesFilter: false});
        },
      );
    });
    this._selectFirstFilter();
    this._emitChange();
  }

  _clearFilter(): void {
    this._filter = '';
    this._updateRoots(root => {
      return root.setRecursive(
        node => null,
        node => node.set({highlightedText: '', matchesFilter: true}),
      );
    });
  }

  _removeFilterLetter(): void {
    const oldLength = this._filter.length;
    this._filter = this._filter.substr(0, this._filter.length - 1);
    if (oldLength > 1) {
      this._updateRoots(root => {
        return root.setRecursive(
          node => null,
          node => {
            return matchesFilter(node.name, this._filter)
              ? node.set({
                  highlightedText: this._filter,
                  matchesFilter: true,
                })
              : node.set({highlightedText: '', matchesFilter: false});
          },
        );
      });
      this._emitChange();
    } else if (oldLength === 1) {
      this._clearFilter();
    }
  }

  _addExtraProjectSelectionContent(content: React.Element<any>) {
    this._extraProjectSelectionContent = this._extraProjectSelectionContent.push(
      content,
    );
    this._emitChange();
  }

  _removeExtraProjectSelectionContent(content: React.Element<any>) {
    const index = this._extraProjectSelectionContent.indexOf(content);
    if (index === -1) {
      return;
    }
    this._extraProjectSelectionContent = this._extraProjectSelectionContent.remove(
      index,
    );
    this._emitChange();
  }

  _confCollectDebugState(): Object {
    return {
      hideIgnoredNames: this._conf.hideIgnoredNames,
      excludeVcsIgnoredPaths: this._conf.excludeVcsIgnoredPaths,
      hideVcsIgnoredPaths: this._conf.hideVcsIgnoredPaths,
      usePreviewTabs: this._conf.usePreviewTabs,
      focusEditorOnFileSelection: this._conf.focusEditorOnFileSelection,
      isEditingWorkingSet: this._conf.isEditingWorkingSet,

      vcsStatuses: this._conf.vcsStatuses.toObject(),
      workingSet: this._conf.workingSet.getUris(),
      ignoredPatterns: this._conf.ignoredPatterns
        .toArray()
        .map(ignored => ignored.pattern),
      openFilesWorkingSet: this._conf.openFilesWorkingSet.getUris(),
      editedWorkingSet: this._conf.editedWorkingSet.getUris(),
    };
  }

  /*
  * Manually sets a target node used for context menu actions. The value can be
  * retrieved by calling `getTargetNodes` or `getSingleTargetNode` both of
  * which will retrieve the target node if it exists and default to selected
  * nodes otherwise.
  * This value gets cleared everytime a selection is set
  */
  _setTargetNode(rootKey: NuclideUri, nodeKey: NuclideUri): void {
    this._targetNodeKeys = {rootKey, nodeKey};
  }

  _updateGeneratedStatus(filesToCheck: Iterable<NuclideUri>): void {
    const generatedPromises: Map<
      NuclideUri,
      Promise<[NuclideUri, GeneratedFileType]>,
    > = new Map();
    const addGeneratedPromise: NuclideUri => void = file => {
      if (!generatedPromises.has(file)) {
        const promise = awaitGeneratedFileServiceByNuclideUri(file)
          .then(gfs => gfs.getGeneratedFileType(file))
          .then(type => [file, type]);
        generatedPromises.set(file, promise);
      }
    };
    for (const file of filesToCheck) {
      addGeneratedPromise(file);
    }
    Promise.all(Array.from(generatedPromises.values())).then(
      generatedOpenChangedFiles => {
        this._generatedOpenChangedFiles = this._generatedOpenChangedFiles
          .merge(generatedOpenChangedFiles)
          // just drop any non-generated files from the map
          .filter(value => value !== 'manual');
        this._emitChange();
      },
    );
  }

  /**
   * Resets the node to be kept in view if no more data is being awaited. Safe to call many times
   * because it only changes state if a node is being tracked.
   */
  _clearTrackedNodeIfNotLoading(): void {
    if (
      /*
       * The loading map being empty is a heuristic for when loading has completed. It is inexact
       * because the loading might be unrelated to the tracked node, however it is cheap and false
       * positives will only last until loading is complete or until the user clicks another node in
       * the tree.
       */
      this._isLoadingMap.isEmpty()
    ) {
      // Loading has completed. Allow scrolling to proceed as usual.
      this._clearTrackedNode();
    }
  }

  _clearLoading(nodeKey: NuclideUri): void {
    this._isLoadingMap = this._isLoadingMap.delete(nodeKey);
  }

  _startReorderDrag(draggedRootKey: NuclideUri): void {
    const rootIdx = Selectors.getRootKeys(this).indexOf(draggedRootKey);
    if (rootIdx === -1) {
      return;
    }
    this._setRoots(
      updateNodeAtRoot(this._roots, draggedRootKey, draggedRootKey, node =>
        node.setIsBeingReordered(true),
      ),
    );
    this._reorderPreviewStatus = {
      source: draggedRootKey,
      sourceIdx: rootIdx,
    };
    this._emitChange();
  }

  _reorderDragInto(targetRootKey: NuclideUri): void {
    const reorderPreviewStatus = this._reorderPreviewStatus;
    const targetIdx = Selectors.getRootKeys(this).indexOf(targetRootKey);
    const targetRootNode = Selectors.getNode(
      this,
      targetRootKey,
      targetRootKey,
    );
    if (
      reorderPreviewStatus == null ||
      targetIdx === -1 ||
      targetRootNode == null
    ) {
      return;
    }

    let targetNode;
    if (targetIdx <= reorderPreviewStatus.sourceIdx) {
      targetNode = targetRootNode;
    } else {
      targetNode = targetRootNode.findLastRecursiveChild();
    }

    this._reorderPreviewStatus = {
      ...this._reorderPreviewStatus,
      target: targetNode == null ? undefined : targetNode.uri,
      targetIdx,
    };
    this._emitChange();
  }

  _endReorderDrag(): void {
    if (this._reorderPreviewStatus != null) {
      const sourceRootKey = this._reorderPreviewStatus.source;
      this._setRoots(
        updateNodeAtRoot(this._roots, sourceRootKey, sourceRootKey, node =>
          node.setIsBeingReordered(false),
        ),
      );
      this._reorderPreviewStatus = null;
      this._emitChange();
    }
  }

  _collapseNode(rootKey: NuclideUri, nodeKey: NuclideUri): void {
    this._setRoots(
      updateNodeAtRoot(this._roots, rootKey, nodeKey, node => {
        // Clear all selected nodes under the node being collapsed and dispose their subscriptions
        return node.setRecursive(
          childNode => {
            if (childNode.isExpanded) {
              return null;
            }
            return childNode;
          },
          childNode => {
            if (childNode.subscription != null) {
              childNode.subscription.dispose();
            }

            if (childNode.uri === node.uri) {
              return childNode.set({isExpanded: false, subscription: null});
            } else {
              return childNode.set({isSelected: false, subscription: null});
            }
          },
        );
      }),
    );
  }

  _collapseNodeDeep(rootKey: NuclideUri, nodeKey: NuclideUri): void {
    this._setRoots(
      updateNodeAtRoot(this._roots, rootKey, nodeKey, node => {
        return node.setRecursive(/* prePredicate */ null, childNode => {
          if (childNode.subscription != null) {
            childNode.subscription.dispose();
          }

          if (childNode.uri !== node.uri) {
            return childNode.set({
              isExpanded: false,
              isSelected: false,
              subscription: null,
            });
          } else {
            return childNode.set({isExpanded: false, subscription: null});
          }
        });
      }),
    );
  }

  _setDragHoveredNode(rootKey: NuclideUri, nodeKey: NuclideUri): void {
    this._clearDragHover();
    this._setRoots(
      updateNodeAtRoot(this._roots, rootKey, nodeKey, node =>
        node.setIsDragHovered(true),
      ),
    );
  }

  _unhoverNode(rootKey: NuclideUri, nodeKey: NuclideUri): void {
    this._setRoots(
      updateNodeAtRoot(this._roots, rootKey, nodeKey, node =>
        node.setIsDragHovered(false),
      ),
    );
  }

  /**
   * Selects a single node and tracks it.
   */
  _setSelectedNode(rootKey: NuclideUri, nodeKey: NuclideUri): void {
    this._clearSelection();
    this._setRoots(
      updateNodeAtRoot(this._roots, rootKey, nodeKey, node =>
        node.setIsSelected(true),
      ),
    );
    this._setTrackedNode(rootKey, nodeKey);
    this._setSelectionRange(
      SelectionRange.ofSingleItem(new RangeKey(rootKey, nodeKey)),
    );
  }

  /**
   * Mark a node that has been focused, similar to selected, but only true after mouseup.
   */
  _setFocusedNode(rootKey: NuclideUri, nodeKey: NuclideUri): void {
    this._setRoots(
      updateNodeAtRoot(this._roots, rootKey, nodeKey, node =>
        node.setIsFocused(true),
      ),
    );
  }

  /**
   * Selects and focuses a node in one pass.
   */
  _setSelectedAndFocusedNode(rootKey: NuclideUri, nodeKey: NuclideUri): void {
    this._clearSelection();
    this._setRoots(
      updateNodeAtRoot(this._roots, rootKey, nodeKey, node =>
        node.set({isSelected: true, isFocused: true}),
      ),
    );
    this._setTrackedNode(rootKey, nodeKey);
    this._setSelectionRange(
      SelectionRange.ofSingleItem(new RangeKey(rootKey, nodeKey)),
    );
  }

  _addSelectedNode(rootKey: NuclideUri, nodeKey: NuclideUri): void {
    this._setRoots(
      updateNodeAtRoot(this._roots, rootKey, nodeKey, node =>
        node.setIsSelected(true),
      ),
    );
    this._setSelectionRange(
      SelectionRange.ofSingleItem(new RangeKey(rootKey, nodeKey)),
    );
  }

  _unselectNode(rootKey: NuclideUri, nodeKey: NuclideUri): void {
    this._setRoots(
      updateNodeAtRoot(this._roots, rootKey, nodeKey, node =>
        node.set({isSelected: false, isFocused: false}),
      ),
    );
  }

  _setSelectionRange(selectionRange: SelectionRange): void {
    this._selectionRange = selectionRange;
    this._targetNodeKeys = null;
  }

  _clearSelectionRange(): void {
    this._selectionRange = null;
    this._targetNodeKeys = null;
  }

  /**
   * Refresh the selection range data.
   * invalidate the data
   * - if anchor node or range node is deleted.
   * - if these two nodes are not selected, and there is no nearby node to fall back to.
   * When this function returns, the selection range always contains valid data.
   */
  _refreshSelectionRange(): ?{
    selectionRange: SelectionRange,
    anchorNode: FileTreeNode,
    rangeNode: FileTreeNode,
    anchorIndex: number,
    rangeIndex: number,
    direction: 'up' | 'down' | 'none',
  } {
    const invalidate = () => {
      this._clearSelectionRange();
      return null;
    };

    let selectionRange = this._selectionRange;
    if (selectionRange == null) {
      return invalidate();
    }
    const anchor = selectionRange.anchor();
    const range = selectionRange.range();
    let anchorNode = Selectors.getNode(
      this,
      anchor.rootKey(),
      anchor.nodeKey(),
    );
    let rangeNode = Selectors.getNode(this, range.rootKey(), range.nodeKey());
    if (anchorNode == null || rangeNode == null) {
      return invalidate();
    }

    anchorNode = RangeUtil.findSelectedNode(anchorNode);
    rangeNode = RangeUtil.findSelectedNode(rangeNode);
    if (anchorNode == null || rangeNode == null) {
      return invalidate();
    }
    const anchorIndex = anchorNode.calculateVisualIndex();
    const rangeIndex = rangeNode.calculateVisualIndex();
    const direction =
      rangeIndex > anchorIndex
        ? 'down'
        : rangeIndex === anchorIndex
          ? 'none'
          : 'up';

    selectionRange = new SelectionRange(
      RangeKey.of(anchorNode),
      RangeKey.of(rangeNode),
    );
    this._setSelectionRange(selectionRange);
    return {
      selectionRange,
      anchorNode,
      rangeNode,
      anchorIndex,
      rangeIndex,
      direction,
    };
  }

  /**
   * Bulk selection based on the range.
   */
  _rangeSelectToNode(rootKey: NuclideUri, nodeKey: NuclideUri): void {
    const data = this._refreshSelectionRange();
    if (data == null) {
      return;
    }
    const {selectionRange, anchorIndex, rangeIndex} = data;

    let nextRangeNode = Selectors.getNode(this, rootKey, nodeKey);
    if (nextRangeNode == null) {
      return;
    }
    const nextRangeIndex = nextRangeNode.calculateVisualIndex();
    if (nextRangeIndex === rangeIndex) {
      return;
    }

    const modMinIndex = Math.min(anchorIndex, rangeIndex, nextRangeIndex);
    const modMaxIndex = Math.max(anchorIndex, rangeIndex, nextRangeIndex);

    let beginIndex = 1;

    // traversing the tree, flip the isSelected flag when applicable.
    const roots = this._roots.map(
      (rootNode: FileTreeNode): FileTreeNode =>
        rootNode.setRecursive(
          // keep traversing the sub-tree,
          // - if the node is shown, has children, and in the applicable range.
          (node: FileTreeNode): ?FileTreeNode => {
            if (!node.shouldBeShown) {
              return node;
            }
            if (node.shownChildrenCount === 1) {
              beginIndex++;
              return node;
            }
            const endIndex = beginIndex + node.shownChildrenCount - 1;
            if (beginIndex <= modMaxIndex && modMinIndex <= endIndex) {
              beginIndex++;
              return null;
            }
            beginIndex += node.shownChildrenCount;
            return node;
          },
          // flip the isSelected flag accordingly, based on previous and current range.
          (node: FileTreeNode): FileTreeNode => {
            if (!node.shouldBeShown) {
              return node;
            }
            const curIndex = beginIndex - node.shownChildrenCount;
            const inOldRange =
              Math.sign(curIndex - anchorIndex) *
                Math.sign(curIndex - rangeIndex) !==
              1;
            const inNewRange =
              Math.sign(curIndex - anchorIndex) *
                Math.sign(curIndex - nextRangeIndex) !==
              1;
            if ((inOldRange && inNewRange) || (!inOldRange && !inNewRange)) {
              return node;
            } else if (inOldRange && !inNewRange) {
              return node.set({isSelected: false, isFocused: false});
            } else {
              return node.set({isSelected: true, isFocused: true});
            }
          },
        ),
    );
    this._setRoots(roots);

    // expand the range to merge existing selected nodes.
    const getNextNode = (cur: FileTreeNode) =>
      nextRangeIndex < rangeIndex ? cur.findPrevious() : cur.findNext();
    let probe = getNextNode(nextRangeNode);
    while (probe != null && probe.isSelected()) {
      nextRangeNode = probe;
      probe = getNextNode(nextRangeNode);
    }
    this._setSelectionRange(
      selectionRange.withNewRange(RangeKey.of(nextRangeNode)),
    );
  }

  /**
   * Move the range of selections by one step.
   */
  _rangeSelectMove(move: 'up' | 'down'): void {
    const data = this._refreshSelectionRange();
    if (data == null) {
      return;
    }
    const {selectionRange, anchorNode, rangeNode, direction} = data;
    const getNextNode = (cur: FileTreeNode) =>
      move === 'up' ? cur.findPrevious() : cur.findNext();

    const isExpanding = direction === move || direction === 'none';

    if (isExpanding) {
      let nextNode = getNextNode(rangeNode);
      while (nextNode != null && nextNode.isSelected()) {
        nextNode = getNextNode(nextNode);
      }
      if (nextNode == null) {
        return;
      }
      nextNode = this._updateNode(nextNode, n =>
        n.set({isSelected: true, isFocused: true}),
      );
      let probe = getNextNode(nextNode);
      while (probe != null && probe.isSelected()) {
        nextNode = probe;
        probe = getNextNode(nextNode);
      }
      this._setSelectionRange(
        selectionRange.withNewRange(RangeKey.of(nextNode)),
      );
      this._setTrackedNode(nextNode.rootUri, nextNode.uri);
    } else {
      let nextNode = rangeNode;
      while (
        nextNode != null &&
        nextNode !== anchorNode &&
        nextNode.isSelected() === false
      ) {
        nextNode = getNextNode(nextNode);
      }
      if (nextNode == null) {
        return;
      }
      if (nextNode === anchorNode) {
        this._setSelectionRange(
          selectionRange.withNewRange(RangeKey.of(nextNode)),
        );
        return;
      }
      nextNode = this._updateNode(nextNode, n =>
        n.set({isSelected: false, isFocused: false}),
      );
      this._setSelectionRange(
        selectionRange.withNewRange(RangeKey.of(nextNode)),
      );
      this._setTrackedNode(nextNode.rootUri, nextNode.uri);
    }
  }

  _rangeSelectUp(): void {
    this._rangeSelectMove('up');
  }

  _rangeSelectDown(): void {
    this._rangeSelectMove('down');
  }

  _selectFirstFilter(): void {
    let node = Selectors.getSingleSelectedNode(this);
    // if the current node matches the filter do nothing
    if (node != null && node.matchesFilter) {
      return;
    }

    this._moveSelectionDown();
    node = Selectors.getSingleSelectedNode(this);
    // if the selection does not find anything up go down
    if (node != null && !node.matchesFilter) {
      this._moveSelectionUp();
    }
  }

  /**
   * Moves the selection one node down. In case several nodes were selected, the topmost (first in
   * the natural visual order) is considered to be the reference point for the move.
   */
  _moveSelectionDown(): void {
    if (this._roots.isEmpty()) {
      return;
    }

    const selectedNodes = Selectors.getSelectedNodes(this);

    let nodeToSelect;
    if (selectedNodes.isEmpty()) {
      nodeToSelect = this._roots.first();
    } else {
      const selectedNode = nullthrows(selectedNodes.first());
      nodeToSelect = selectedNode.findNext();
    }

    while (nodeToSelect != null && !nodeToSelect.matchesFilter) {
      nodeToSelect = nodeToSelect.findNext();
    }

    if (nodeToSelect != null) {
      this._setSelectedAndFocusedNode(nodeToSelect.rootUri, nodeToSelect.uri);
    }
  }

  /**
   * Moves the selection one node up. In case several nodes were selected, the topmost (first in
   * the natural visual order) is considered to be the reference point for the move.
   */
  _moveSelectionUp(): void {
    if (this._roots.isEmpty()) {
      return;
    }

    const selectedNodes = Selectors.getSelectedNodes(this);

    let nodeToSelect;
    if (selectedNodes.isEmpty()) {
      nodeToSelect = nullthrows(this._roots.last()).findLastRecursiveChild();
    } else {
      const selectedNode = nullthrows(selectedNodes.first());
      nodeToSelect = selectedNode.findPrevious();
    }

    while (nodeToSelect != null && !nodeToSelect.matchesFilter) {
      nodeToSelect = nodeToSelect.findPrevious();
    }

    if (nodeToSelect != null) {
      this._setSelectedAndFocusedNode(nodeToSelect.rootUri, nodeToSelect.uri);
    }
  }

  _moveSelectionToTop(): void {
    if (this._roots.isEmpty()) {
      return;
    }

    let nodeToSelect = this._roots.first();
    if (nodeToSelect != null && !nodeToSelect.shouldBeShown) {
      nodeToSelect = nodeToSelect.findNext();
    }

    if (nodeToSelect != null) {
      this._setSelectedAndFocusedNode(nodeToSelect.uri, nodeToSelect.uri);
    }
  }

  _moveSelectionToBottom(): void {
    if (this._roots.isEmpty()) {
      return;
    }

    const lastRoot = this._roots.last();
    invariant(lastRoot != null);
    const lastChild = lastRoot.findLastRecursiveChild();
    invariant(lastChild != null);
    this._setSelectedAndFocusedNode(lastChild.rootUri, lastChild.uri);
  }

  _clearDragHover(): void {
    this._updateRoots(root => {
      return root.setRecursive(
        node => (node.containsDragHover ? null : node),
        node => node.setIsDragHovered(false),
      );
    });
  }

  // Clear selections and focuses on all nodes except an optionally specified
  // current node.
  _clearSelection(): void {
    this._clearSelected();
    this._clearFocused();
    this._clearSelectionRange();
  }

  _clearSelected(): void {
    this._selectedNodes = Immutable.Set();
    this._emitChange();
  }

  _clearFocused(): void {
    this._focusedNodes = Immutable.Set();
    this._emitChange();
  }

  _clearTrackedNode(): void {
    if (this._trackedRootKey != null || this._trackedNodeKey != null) {
      this._trackedRootKey = null;
      this._trackedNodeKey = null;
      this._emitChange();
    }
  }

  _setTrackedNode(rootKey: NuclideUri, nodeKey: NuclideUri): void {
    if (this._trackedRootKey !== rootKey || this._trackedNodeKey !== nodeKey) {
      this._trackedRootKey = rootKey;
      this._trackedNodeKey = nodeKey;
      this._emitChange();
    }
  }

  _setRepositories(repositories: Immutable.Set<atom$Repository>): void {
    this._repositories = repositories;
    this._updateConf(conf => {
      const reposByRoot = {};
      this._roots.forEach(root => {
        reposByRoot[root.uri] = repositoryForPath(root.uri);
      });
      conf.reposByRoot = reposByRoot;
    });
  }

  _setWorkingSet(workingSet: WorkingSet): void {
    this._updateConf(conf => {
      conf.workingSet = workingSet;
    });
  }

  _setOpenFilesWorkingSet(openFilesWorkingSet: WorkingSet): void {
    this._updateGeneratedStatus(openFilesWorkingSet.getAbsoluteUris());
    // Optimization: with an empty working set, we don't need a full tree refresh.
    if (this._conf.workingSet.isEmpty()) {
      this._conf.openFilesWorkingSet = openFilesWorkingSet;
      this._emitChange();
      return;
    }
    this._updateConf(conf => {
      conf.openFilesWorkingSet = openFilesWorkingSet;
    });
  }

  _setWorkingSetsStore(workingSetsStore: ?WorkingSetsStore): void {
    this._workingSetsStore = workingSetsStore;
  }

  _startEditingWorkingSet(editedWorkingSet: WorkingSet): void {
    this._updateConf(conf => {
      conf.editedWorkingSet = editedWorkingSet;
      conf.isEditingWorkingSet = true;
    });
  }

  _finishEditingWorkingSet(): void {
    this._updateConf(conf => {
      conf.isEditingWorkingSet = false;
      conf.editedWorkingSet = new WorkingSet();
    });
  }

  _checkNode(rootKey: NuclideUri, nodeKey: NuclideUri): void {
    if (!this._conf.isEditingWorkingSet) {
      return;
    }

    let node = Selectors.getNode(this, rootKey, nodeKey);
    if (node == null) {
      return;
    }

    let uriToAppend = nodeKey; // Workaround flow's (over)aggressive nullability detection

    const allChecked = nodeParent => {
      return nodeParent.children.every(c => {
        return !c.shouldBeShown || c.checkedStatus === 'checked' || c === node;
      });
    };

    while (node.parent != null && allChecked(node.parent)) {
      node = node.parent;
      uriToAppend = node.uri;
    }

    this._updateConf(conf => {
      conf.editedWorkingSet = conf.editedWorkingSet.append(uriToAppend);
    });
  }

  _uncheckNode(rootKey: NuclideUri, nodeKey: NuclideUri): void {
    if (!this._conf.isEditingWorkingSet) {
      return;
    }

    let node = Selectors.getNode(this, rootKey, nodeKey);
    if (node == null) {
      return;
    }

    const nodesToAppend = [];
    let uriToRemove = nodeKey;

    while (node.parent != null && node.parent.checkedStatus === 'checked') {
      const parent = node.parent; // Workaround flow's (over)aggressive nullability detection
      parent.children.forEach(c => {
        if (c !== node) {
          nodesToAppend.push(c);
        }
      });

      node = parent;
      uriToRemove = node.uri;
    }

    this._updateConf(conf => {
      const urisToAppend = nodesToAppend.map(n => n.uri);
      conf.editedWorkingSet = conf.editedWorkingSet
        .remove(uriToRemove)
        .append(...urisToAppend);
    });
  }

  _setOpenFilesExpanded(openFilesExpanded: boolean): void {
    this._openFilesExpanded = openFilesExpanded;
    this._emitChange();
  }

  _setUncommittedChangesExpanded(uncommittedChangesExpanded: boolean): void {
    this._uncommittedChangesExpanded = uncommittedChangesExpanded;
    this._emitChange();
  }

  _setFoldersExpanded(foldersExpanded: boolean): void {
    this._foldersExpanded = foldersExpanded;
    this._emitChange();
  }

  _reset(): void {
    this._roots.forEach(root => {
      root.traverse(n => {
        if (n.subscription != null) {
          n.subscription.dispose();
        }

        return true;
      });
    });

    // Reset data store.
    this._conf = {...DEFAULT_CONF};
    this._setRoots(Immutable.OrderedMap());
    this._clearSelected();
    this._clearFocused();
    this._trackedRootKey = null;
    this._trackedNodeKey = null;
  }

  subscribe(listener: ChangeListener): IDisposable {
    return this._emitter.on('change', listener);
  }

  dispatch(action: FileTreeAction): mixed {
    this._dispatcher.dispatch(action);
  }
}
