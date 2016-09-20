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
  DiffFileAction,
  DiffOptionType,
  FileChangeStatusValue,
  FileDiffState,
  RemoveRepositoryAction,
  SetCompareIdAction,
  SetCwdApiAction,
  SetDiffOptionAction,
  UpdateActiveRepositoryAction,
  UpdateDirtyFilesAction,
  UpdateFileDiffAction,
  UpdateHeadToForkBaseRevisions,
  UpdateSelectedFilesAction,
} from '../types';
import type {HgRepositoryClient} from '../../../nuclide-hg-repository-client';
import type {RevisionStatuses} from '../../../nuclide-hg-repository-client/lib/HgRepositoryClient';
import type {
  RevisionInfo,
} from '../../../nuclide-hg-rpc/lib/HgService';
import type {CwdApi} from '../../../nuclide-current-working-directory/lib/CwdApi';

import {
  ACTIVATE_REPOSITORY,
  ADD_REPOSITORY,
  DEACTIVATE_REPOSITORY,
  DIFF_FILE,
  REMOVE_REPOSITORY,
  SET_COMPARE_ID,
  SET_CWD_API,
  SET_DIFF_OPTION,
  UPDATE_ACTIVE_REPOSITORY,
  UPDATE_DIRTY_FILES,
  UPDATE_FILE_DIFF,
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

export function updateActiveRepository(
  repository: ?atom$Repository,
): UpdateActiveRepositoryAction {
  let hgRepository;
  if (repository == null || repository.getType() !== 'hg') {
    hgRepository = null;
  } else {
    hgRepository = ((repository: any): HgRepositoryClient);
  }
  return {
    type: UPDATE_ACTIVE_REPOSITORY,
    payload: {
      hgRepository,
    },
  };
}

export function setCwdApi(
  cwdApi: ?CwdApi,
): SetCwdApiAction {
  return {
    type: SET_CWD_API,
    payload: {
      cwdApi,
    },
  };
}

export function diffFile(
  filePath: NuclideUri,
): DiffFileAction {
  return {
    type: DIFF_FILE,
    payload: {
      filePath,
    },
  };
}

export function updateFileDiff(
  fileDiff: FileDiffState,
): UpdateFileDiffAction {
  return {
    type: UPDATE_FILE_DIFF,
    payload: {
      fileDiff,
    },
  };
}
