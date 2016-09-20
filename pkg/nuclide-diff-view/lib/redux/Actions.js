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
  CommitAction,
  CommitModeType,
  CommitState,
  DeactivateRepositoryAction,
  DiffFileAction,
  DiffModeType,
  FileChangeStatusValue,
  FileDiffState,
  PublishDiffAction,
  PublishState,
  RemoveRepositoryAction,
  SetCommitModeAction,
  SetCompareIdAction,
  SetCwdApiAction,
  SetShouldReabaseOnAmendAction,
  SetViewModeAction,
  UpdateActiveRepositoryAction,
  UpdateCommitStateAction,
  UpdateDirtyFilesAction,
  UpdateFileDiffAction,
  UpdateHeadToForkBaseRevisions,
  UpdatePublishStateAction,
  UpdateSelectedFilesAction,
} from '../types';
import type {HgRepositoryClient} from '../../../nuclide-hg-repository-client';
import type {RevisionStatuses} from '../../../nuclide-hg-repository-client/lib/HgRepositoryClient';
import type {
  RevisionInfo,
} from '../../../nuclide-hg-rpc/lib/HgService';
import type {CwdApi} from '../../../nuclide-current-working-directory/lib/CwdApi';
import type {Subject} from 'rxjs';

import {
  ACTIVATE_REPOSITORY,
  ADD_REPOSITORY,
  COMMIT,
  DEACTIVATE_REPOSITORY,
  DIFF_FILE,
  PUBLISH_DIFF,
  REMOVE_REPOSITORY,
  SET_COMMIT_MODE,
  SET_COMPARE_ID,
  SET_CWD_API,
  SET_SHOULD_REBASE_ON_AMEND,
  SET_VIEW_MODE,
  UPDATE_ACTIVE_REPOSITORY,
  UPDATE_COMMIT_STATE,
  UPDATE_DIRTY_FILES,
  UPDATE_FILE_DIFF,
  UPDATE_HEAD_TO_FORKBASE_REVISIONS,
  UPDATE_PUBLISH_STATE,
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

export function setViewMode(
  viewMode: DiffModeType,
): SetViewModeAction {
  return {
    type: SET_VIEW_MODE,
    payload: {
      viewMode,
    },
  };
}

export function setCommitMode(
  commitMode: CommitModeType,
): SetCommitModeAction {
  return {
    type: SET_COMMIT_MODE,
    payload: {
      commitMode,
    },
  };
}

export function updateCommitState(
  commitState: CommitState,
): UpdateCommitStateAction {
  return {
    type: UPDATE_COMMIT_STATE,
    payload: {
      commit: commitState,
    },
  };
}

export function updatePublishState(
  publish: PublishState,
): UpdatePublishStateAction {
  return {
    type: UPDATE_PUBLISH_STATE,
    payload: {
      publish,
    },
  };
}

export function setShouldRebaseOnAmend(
  shouldRebaseOnAmend: boolean,
): SetShouldReabaseOnAmendAction {
  return {
    type: SET_SHOULD_REBASE_ON_AMEND,
    payload: {
      shouldRebaseOnAmend,
    },
  };
}

export function commit(
  repository: HgRepositoryClient,
  message: string,
): CommitAction {
  return {
    type: COMMIT,
    payload: {
      message,
      repository,
    },
  };
}

export function publishDiff(
  repository: HgRepositoryClient,
  message: string,
  lintExcuse: ?string,
  publishUpdates: Subject<any>,
): PublishDiffAction {
  return {
    type: PUBLISH_DIFF,
    payload: {
      lintExcuse,
      message,
      publishUpdates,
      repository,
    },
  };
}
