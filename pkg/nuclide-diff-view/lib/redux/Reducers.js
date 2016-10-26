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
  Action,
  AppState,
  CommitState,
  FileDiffState,
  PublishState,
  RepositoryAction,
  RepositoryState,
  UIProvider,
  UpdateFileDiffAction,
  UpdateFileUiElementsAction,
} from '../types';
import type {HgRepositoryClient} from '../../../nuclide-hg-repository-client';

import * as ActionTypes from './ActionTypes';
import invariant from 'assert';
import {
  createEmptyAppState,
  getEmptyRepositoryState,
} from './createEmptyAppState';
import {
  computeDiff,
  computeNavigationSections,
} from '../diff-utils';
import {formatFileDiffRevisionTitle} from '../utils';

const FILESYSTEM_REVISION_TITLE = 'Filesystem / Editor';

export function rootReducer(
  state: ?AppState,
  action: Action,
): AppState {
  if (state == null) {
    return createEmptyAppState();
  }
  switch (action.type) {
    case ActionTypes.UPDATE_ACTIVE_REPOSITORY:
      return {
        ...state,
        activeRepository: action.payload.hgRepository,
      };

    case ActionTypes.ADD_REPOSITORY:
    case ActionTypes.REMOVE_REPOSITORY:
    case ActionTypes.SET_COMPARE_ID:
    case ActionTypes.UPDATE_DIRTY_FILES:
    case ActionTypes.UPDATE_SELECTED_FILES:
    case ActionTypes.UPDATE_HEAD_TO_FORKBASE_REVISIONS:
    case ActionTypes.UPDATE_LOADING_SELECTED_FILES: {
      return {
        ...state,
        repositories: reduceRepositories(state.repositories, action),
      };
    }

    case ActionTypes.UPDATE_COMMIT_STATE:
    case ActionTypes.SET_COMMIT_MODE: {
      return {
        ...state,
        commit: reduceCommitState(state.commit, action),
      };
    }

    case ActionTypes.UPDATE_PUBLISH_STATE:
      return {
        ...state,
        publish: reducePublishState(state.publish, action),
      };

    case ActionTypes.UPDATE_FILE_DIFF:
      return {
        ...state,
        fileDiff: reduceFileDiff(state.fileDiff, action),
      };
    case ActionTypes.UPDATE_FILE_UI_ELEMENTS:
      return {
        ...state,
        fileDiff: reduceUiElements(state.fileDiff, action),
      };

    case ActionTypes.UPDATE_LOADING_FILE_DIFF:
      return {
        ...state,
        isLoading: action.payload.isLoading,
      };

    case ActionTypes.SET_SHOULD_REBASE_ON_AMEND:
      return {
        ...state,
        shouldRebaseOnAmend: action.payload.shouldRebaseOnAmend,
      };

    case ActionTypes.SET_VIEW_MODE:
      return {
        ...state,
        viewMode: action.payload.viewMode,
      };

    case ActionTypes.SET_CWD_API:
      return {
        ...state,
        cwdApi: action.payload.cwdApi,
      };

    case ActionTypes.ADD_UI_PROVIDER:
    case ActionTypes.REMOVE_UI_PROVIDER:
      return {
        ...state,
        uiProviders: reduceUiProviders(state.uiProviders, action),
      };

    default:
      return state;
  }
}

function reduceRepositories(
  state: Map<HgRepositoryClient, RepositoryState>,
  action: Action,
): Map<HgRepositoryClient, RepositoryState> {
  switch (action.type) {
    case ActionTypes.SET_COMPARE_ID:
    case ActionTypes.UPDATE_DIRTY_FILES:
    case ActionTypes.UPDATE_SELECTED_FILES:
    case ActionTypes.UPDATE_HEAD_TO_FORKBASE_REVISIONS:
    case ActionTypes.UPDATE_LOADING_SELECTED_FILES: {
      const {repository} = action.payload;
      const oldRepositoryState = state.get(repository);
      invariant(oldRepositoryState != null);
      return new Map(state)
        .set(repository, reduceRepositoryAction(oldRepositoryState, action));
    }
    case ActionTypes.ADD_REPOSITORY: {
      const {repository} = action.payload;
      return new Map(state)
          .set(repository, getEmptyRepositoryState());
    }
    case ActionTypes.REMOVE_REPOSITORY: {
      const {repository} = action.payload;
      const newRepositories = new Map(state);
      newRepositories.delete(repository);
      return newRepositories;
    }
  }
  return state;
}

function reduceRepositoryAction(
  repositoryState: RepositoryState,
  action: RepositoryAction,
): RepositoryState {
  switch (action.type) {
    case ActionTypes.SET_COMPARE_ID:
      return {
        ...repositoryState,
        compareRevisionId: action.payload.compareId,
      };
    case ActionTypes.UPDATE_DIRTY_FILES:
      return {
        ...repositoryState,
        dirtyFiles: action.payload.dirtyFiles,
      };
    case ActionTypes.UPDATE_SELECTED_FILES:
      return {
        ...repositoryState,
        selectedFiles: action.payload.selectedFiles,
      };
    case ActionTypes.UPDATE_HEAD_TO_FORKBASE_REVISIONS:
      return {
        ...repositoryState,
        headToForkBaseRevisions: action.payload.headToForkBaseRevisions,
        revisionStatuses: action.payload.revisionStatuses,
      };
    case ActionTypes.UPDATE_LOADING_SELECTED_FILES:
      return {
        ...repositoryState,
        isLoadingSelectedFiles: action.payload.isLoading,
      };
    default:
      throw new Error('Invalid Repository Action!');
  }
}

function reduceCommitState(
  state: CommitState,
  action: Action,
): CommitState {
  switch (action.type) {
    case ActionTypes.UPDATE_COMMIT_STATE:
      return action.payload.commit;
    case ActionTypes.SET_COMMIT_MODE:
      return {
        ...state,
        mode: action.payload.commitMode,
      };
  }
  return state;
}

function reducePublishState(
  state: PublishState,
  action: Action,
): PublishState {
  switch (action.type) {
    case ActionTypes.UPDATE_PUBLISH_STATE:
      return action.payload.publish;
  }
  return state;
}

function reduceFileDiff(
  state: FileDiffState,
  action: UpdateFileDiffAction,
): FileDiffState {
  const {filePath, fromRevision, newContents, oldContents} = action.payload;
  const {inlineElements: newEditorElements} = state.newEditorState;
  const {inlineElements: oldEditorElements} = state.oldEditorState;

  const {
    addedLines,
    removedLines,
    oldLineOffsets,
    newLineOffsets,
    newToOld,
    oldToNew,
  } = computeDiff(oldContents, newContents);

  const oldEditorState = {
    revisionTitle: fromRevision == null ? '...' : formatFileDiffRevisionTitle(fromRevision),
    text: oldContents,
    offsets: oldLineOffsets,
    highlightedLines: {
      added: [],
      removed: removedLines,
    },
    inlineElements: oldEditorElements,
    inlineOffsetElements: newEditorElements,
  };
  const newEditorState = {
    revisionTitle: FILESYSTEM_REVISION_TITLE,
    text: newContents,
    offsets: newLineOffsets,
    highlightedLines: {
      added: addedLines,
      removed: [],
    },
    inlineElements: newEditorElements,
    inlineOffsetElements: oldEditorElements,
  };

  const navigationSections = computeNavigationSections(
    addedLines,
    removedLines,
    newEditorElements.keys(),
    oldEditorElements.keys(),
    oldLineOffsets,
    newLineOffsets,
  );

  return {
    filePath,
    lineMapping: {newToOld, oldToNew},
    newEditorState,
    oldEditorState,
    navigationSections,
  };
}

function reduceUiElements(
  state: FileDiffState,
  action: UpdateFileUiElementsAction,
): FileDiffState {
  const {newEditorElements, oldEditorElements} = action.payload;
  const {newEditorState, oldEditorState} = state;
  return {
    ...state,
    oldEditorState: {
      ...oldEditorState,
      inlineElements: oldEditorElements,
      inlineOffsetElements: newEditorElements,
    },
    newEditorState: {
      ...newEditorState,
      inlineElements: newEditorElements,
      inlineOffsetElements: oldEditorElements,
    },
  };
}

function reduceUiProviders(
  state: Array<UIProvider>,
  action: Action,
): Array<UIProvider> {
  switch (action.type) {
    case ActionTypes.ADD_UI_PROVIDER:
      return state.concat(action.payload.uiProvider);
    case ActionTypes.REMOVE_UI_PROVIDER:
      const {uiProvider} = action.payload;
      return state.filter(provider => provider !== uiProvider);
  }
  return state || [];
}
