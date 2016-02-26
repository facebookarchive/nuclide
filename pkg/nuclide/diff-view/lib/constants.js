'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

const {StatusCodeNumber: HgStatusCodeNumber} = require('../../hg-repository-base').hgConstants;

import type {StatusCodeNumberValue} from '../../hg-repository-base/lib/hg-constants';
import type {
  CommitModeType,
  CommitModeStateType,
  DiffModeType,
  FileChangeStatusValue,
  PublishModeType,
} from './types';

const FileChangeStatus: {[key: string]: FileChangeStatusValue} = {
  ADDED: 1,
  MODIFIED: 2,
  MISSING: 3,
  REMOVED: 4,
  UNTRACKED: 5,
};

const DiffMode = {
  BROWSE_MODE: 'Browse',
  COMMIT_MODE: 'Commit',
  PUBLISH_MODE: 'Publish',
};

// This is to work around flow's missing support of enums.
(DiffMode: { [key: string]: DiffModeType });

const CommitMode = {
  COMMIT: 'Commit',
  AMEND: 'Amend',
};

// This is to work around flow's missing support of enums.
(CommitMode: { [key: string]: CommitModeType });

const CommitModeState = {
  READY: 'Ready',
  LOADING_COMMIT_MESSAGE: 'Loading Commit Message',
  AWAITING_COMMIT: 'Awaiting Commit',
};

// This is to work around flow's missing support of enums.
(CommitModeState: { [key: string]: CommitModeStateType });

const PublishMode = {
  CREATE: 'Create',
  UPDATE: 'Update',
};

// This is to work around flow's missing support of enums.
(PublishMode: { [key: string]: PublishModeType });

const HgStatusToFileChangeStatus : {[key: StatusCodeNumberValue]: FileChangeStatusValue} = {
  [HgStatusCodeNumber.ADDED]: FileChangeStatus.ADDED,
  [HgStatusCodeNumber.MODIFIED]: FileChangeStatus.MODIFIED,
  [HgStatusCodeNumber.MISSING]: FileChangeStatus.MISSING,
  [HgStatusCodeNumber.REMOVED]: FileChangeStatus.REMOVED,
  [HgStatusCodeNumber.UNTRACKED]: FileChangeStatus.UNTRACKED,
};

const FileChangeStatusToPrefix: {[key: FileChangeStatusValue]: string} = {
  [FileChangeStatus.ADDED]: '[A] ',
  [FileChangeStatus.MODIFIED]: '[M] ',
  [FileChangeStatus.MISSING]: '[!] ',
  [FileChangeStatus.REMOVED]: '[D] ',
  [FileChangeStatus.UNTRACKED]: '[?] ',
};

module.exports = {
  DiffMode,
  CommitMode,
  CommitModeState,
  PublishMode,
  FileChangeStatus,
  HgStatusToFileChangeStatus,
  FileChangeStatusToPrefix,
  HgStatusCodeNumber,
};
