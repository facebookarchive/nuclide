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
  StatusCodeNumberValue,
} from '../../nuclide-hg-repository-base/lib/HgService';

import type {
  CommitModeType,
  CommitModeStateType,
  DiffModeType,
  FileChangeStatusValue,
  PublishModeType,
  PublishModeStateType,
  DiffOptionType,
} from './types';

import {
  hgConstants,
} from '../../nuclide-hg-repository-base';

const {StatusCodeNumber: HgStatusCodeNumber} = hgConstants;

export const FileChangeStatus = Object.freeze({
  ADDED: 1,
  MODIFIED: 2,
  MISSING: 3,
  REMOVED: 4,
  UNTRACKED: 5,
});

(FileChangeStatus: { [key: string]: FileChangeStatusValue });

export const DiffMode = Object.freeze({
  BROWSE_MODE: '1. Browse',
  COMMIT_MODE: '2. Commit',
  PUBLISH_MODE: '3. Publish',
});

// This is to work around flow's missing support of enums.
(DiffMode: { [key: string]: DiffModeType });

export const DiffOption = Object.freeze({
  DIRTY: 'Dirty',
  LAST_COMMIT: 'Last Commit',
  COMPARE_COMMIT: 'Compare Commit',
});

// This is to work around flow's missing support of enums.
(DiffOption: { [key: string]: DiffOptionType });

export const CommitMode = Object.freeze({
  COMMIT: 'Commit',
  AMEND: 'Amend',
});

// This is to work around flow's missing support of enums.
(CommitMode: { [key: string]: CommitModeType });

export const CommitModeState = Object.freeze({
  READY: 'Ready',
  LOADING_COMMIT_MESSAGE: 'Loading Commit Message',
  AWAITING_COMMIT: 'Awaiting Commit',
});

// This is to work around flow's missing support of enums.
(CommitModeState: { [key: string]: CommitModeStateType });

export const PublishMode = Object.freeze({
  CREATE: 'Create',
  UPDATE: 'Update',
});

// This is to work around flow's missing support of enums.
(PublishMode: { [key: string]: PublishModeType });

export const PublishModeState = Object.freeze({
  READY: 'Ready',
  LOADING_PUBLISH_MESSAGE: 'Loading Publish Message',
  AWAITING_PUBLISH: 'Awaiting Publish',
  PUBLISH_ERROR: 'Publish Error',
});

// This is to work around flow's missing support of enums.
(PublishModeState: { [key: string]: PublishModeStateType });

export const HgStatusToFileChangeStatus
  : {[key: StatusCodeNumberValue]: FileChangeStatusValue} = Object.freeze({
    [HgStatusCodeNumber.ADDED]: FileChangeStatus.ADDED,
    [HgStatusCodeNumber.MODIFIED]: FileChangeStatus.MODIFIED,
    [HgStatusCodeNumber.MISSING]: FileChangeStatus.MISSING,
    [HgStatusCodeNumber.REMOVED]: FileChangeStatus.REMOVED,
    [HgStatusCodeNumber.UNTRACKED]: FileChangeStatus.UNTRACKED,
  }
);

export const FileChangeStatusToPrefix: {[key: FileChangeStatusValue]: string} = Object.freeze({
  [FileChangeStatus.ADDED]: '[A] ',
  [FileChangeStatus.MODIFIED]: '[M] ',
  [FileChangeStatus.MISSING]: '[!] ',
  [FileChangeStatus.REMOVED]: '[D] ',
  [FileChangeStatus.UNTRACKED]: '[?] ',
});

export const NON_MERCURIAL_REPO_DISPLAY_NAME = '[X] Non-Mercurial Repository';
