'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {
  AppState,
  CommitState,
  DiffModeType,
  FileDiffState,
  PublishState,
  RepositoryState,
} from '../types';

import {
  CommitMode,
  CommitModeState,
  DiffMode,
  PublishMode,
  PublishModeState,
} from '../constants';


export function getEmptyActiveRepositoryState() {
  return null;
}

export function getEmptyCommitState(): CommitState {
  return {
    message: null,
    mode: CommitMode.COMMIT,
    state: CommitModeState.READY,
  };
}

export function getEmptyPublishState(): PublishState {
  return {
    message: null,
    mode: PublishMode.CREATE,
    state: PublishModeState.READY,
  };
}

export function getEmptyFileDiffState(): FileDiffState {
  return {
    filePath: '',
    fromRevisionTitle: 'No file selected',
    newContents: '',
    oldContents: '',
    toRevisionTitle: 'No file selected',
  };
}

export function getEmptyRebaseOnAmendState() {
  return true;
}

export function getEmptyRepositoriesState() {
  return new Map();
}

export function getEmptyRepositoryState(): RepositoryState {
  return {
    revisionStatuses: new Map(),
    dirtyFiles: new Map(),
    headToForkBaseRevisions: [],
    compareRevisionId: null,
    selectedFiles: new Map(),
  };
}

export function getEmptyViewModeState(): DiffModeType {
  return DiffMode.BROWSE_MODE;
}

export function createEmptyAppState(): AppState {
  return {
    activeRepository: getEmptyActiveRepositoryState(),
    commit: getEmptyCommitState(),
    fileDiff: getEmptyFileDiffState(),
    publish: getEmptyPublishState(),
    repositories: getEmptyRepositoriesState(),
    shouldRebaseOnAmend: getEmptyRebaseOnAmendState(),
    viewMode: getEmptyViewModeState(),
  };
}
