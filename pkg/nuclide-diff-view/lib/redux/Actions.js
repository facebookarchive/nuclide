'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {NuclideUri} from '../../../commons-node/nuclideUri';
import type {
  ActivateRepositoryAction,
  AddRepositoryAction,
  DeactivateRepositoryAction,
  DiffOptionType,
  FileChangeStatusValue,
  RemoveRepositoryAction,
  SetCompareIdAction,
  SetDiffOptionAction,
  UpdateDirtyFilesAction,
  UpdateHeadToForkBaseRevisions,
  UpdateSelectedFilesAction,
} from '../types';
import type {HgRepositoryClient} from '../../../nuclide-hg-repository-client';
import type {RevisionStatuses} from '../../../nuclide-hg-repository-client/lib/HgRepositoryClient';
import type {
  RevisionInfo,
} from '../../../nuclide-hg-rpc/lib/HgService';

import {
  ACTIVATE_REPOSITORY,
  DEACTIVATE_REPOSITORY,
  ADD_REPOSITORY,
  REMOVE_REPOSITORY,
  SET_COMPARE_ID,
  SET_DIFF_OPTION,
  UPDATE_DIRTY_FILES,
  UPDATE_HEAD_TO_FORKBASE_REVISIONS,
  UPDATE_SELECTED_FILES,
} from './ActionTypes';

export function addRepository(
  repository: HgRepositoryClient,
): AddRepositoryAction {
  return {
    type: ADD_REPOSITORY,
    payload: {
      repository,
    },
  };
}

export function setDiffOption(
  repository: HgRepositoryClient,
  diffOption: DiffOptionType,
): SetDiffOptionAction {
  return {
    type: SET_DIFF_OPTION,
    payload: {
      repository,
      diffOption,
    },
  };
}

export function setCompareId(
  repository: HgRepositoryClient,
  compareId: ?number,
): SetCompareIdAction {
  return {
    type: SET_COMPARE_ID,
    payload: {
      repository,
      compareId,
    },
  };
}

export function updateDirtyFiles(
  repository: HgRepositoryClient,
  dirtyFiles: Map<NuclideUri, FileChangeStatusValue>,
): UpdateDirtyFilesAction {
  return {
    type: UPDATE_DIRTY_FILES,
    payload: {
      repository,
      dirtyFiles,
    },
  };
}

export function removeRepository(
  repository: HgRepositoryClient,
): RemoveRepositoryAction {
  return {
    type: REMOVE_REPOSITORY,
    payload: {
      repository,
    },
  };
}

export function activateRepository(
  repository: HgRepositoryClient,
): ActivateRepositoryAction {
  return {
    type: ACTIVATE_REPOSITORY,
    payload: {
      repository,
    },
  };
}

export function deactivateRepository(
  repository: HgRepositoryClient,
): DeactivateRepositoryAction {
  return {
    type: DEACTIVATE_REPOSITORY,
    payload: {
      repository,
    },
  };
}

export function updateSelectedFiles(
  repository: HgRepositoryClient,
  selectedFiles: Map<NuclideUri, FileChangeStatusValue>,
): UpdateSelectedFilesAction {
  return {
    type: UPDATE_SELECTED_FILES,
    payload: {
      repository,
      selectedFiles,
    },
  };
}

export function updateHeadToForkBaseRevisionsState(
  repository: HgRepositoryClient,
  headToForkBaseRevisions: Array<RevisionInfo>,
  revisionStatuses: RevisionStatuses,
): UpdateHeadToForkBaseRevisions {
  return {
    type: UPDATE_HEAD_TO_FORKBASE_REVISIONS,
    payload: {
      repository,
      headToForkBaseRevisions,
      revisionStatuses,
    },
  };
}
