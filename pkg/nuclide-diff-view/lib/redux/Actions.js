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
  DummyAction,
  FileChangeStatusValue,
  SetCompareIdAction,
  SetDiffOptionAction,
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
  DUMMY,
  SET_COMPARE_ID,
  SET_DIFF_OPTION,
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
): DummyAction {
  // TODO(most): return and handle the real action.
  return {
    type: DUMMY,
  };
}

export function removeRepository(
  repository: HgRepositoryClient,
): DummyAction {
  // TODO(most): return and handle the real action.
  return {
    type: DUMMY,
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
  revisionFileChanges: Map<NuclideUri, FileChangeStatusValue>,
): DummyAction {
  // TODO(most): return and handle the real action.
  return {
    type: DUMMY,
  };
}

export function updateHeadToForkBaseRevisionsState(
  repository: HgRepositoryClient,
  revisions: Array<RevisionInfo>,
  revisionStatuses: RevisionStatuses,
): DummyAction {
  // TODO(most): return and handle the real action.
  return {
    type: DUMMY,
  };
}
