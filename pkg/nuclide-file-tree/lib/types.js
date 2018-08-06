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

import type {FileTreeAction} from '../lib/FileTreeDispatcher';
import type Immutable from 'immutable';
import type {NuclideUri} from 'nuclide-commons/nuclideUri';
import type {FileTreeNode} from './FileTreeNode';
import type {StatusCodeNumberValue} from '../../nuclide-hg-rpc/lib/HgService';
import * as React from 'react';
import type {WorkingSet} from '../../nuclide-working-sets-common';
import type {WorkingSetsStore} from '../../nuclide-working-sets/lib/types';
import type CwdApi from '../../nuclide-current-working-directory/lib/CwdApi';
import type {SelectionRange} from './FileTreeSelectionRange';
import type {GeneratedFileType} from '../../nuclide-generated-files-rpc';
import type {FileChangeStatusValue} from '../../nuclide-vcs-base';

export type AppState = FileTreeStore;

export type Roots = Immutable.OrderedMap<NuclideUri, FileTreeNode>;

export type Store = {
  getState(): AppState,
  dispatch(action: Action): void,
  subscribe(cb: (AppState) => mixed): () => mixed,
};

export type Action = FileTreeAction;

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
export type FileTreeStore = {|
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

  _selectedNodes: Immutable.Set<FileTreeNode>,
  _focusedNodes: Immutable.Set<FileTreeNode>,
|};

export type NodeCheckedStatus = 'checked' | 'clear' | 'partial';

export type ReorderPreviewStatus = ?{
  source: NuclideUri,
  sourceIdx: number,
  target?: NuclideUri,
  targetIdx?: number,
};
