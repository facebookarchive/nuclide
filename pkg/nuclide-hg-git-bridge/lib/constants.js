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
} from '../../nuclide-hg-rpc/lib/HgService';

import {
 hgConstants,
} from '../../nuclide-hg-rpc';

const {StatusCodeNumber: HgStatusCodeNumber} = hgConstants;

export type FileChangeStatusValue = 1 | 2 | 3 | 4 | 5;

export const FileChangeStatus = Object.freeze({
  ADDED: 1,
  MODIFIED: 2,
  MISSING: 3,
  REMOVED: 4,
  UNTRACKED: 5,
});

export const FileChangeStatusToPrefix: {[key: ?FileChangeStatusValue]: string} = Object.freeze({
  [FileChangeStatus.ADDED]: '[A] ',
  [FileChangeStatus.MODIFIED]: '[M] ',
  [FileChangeStatus.MISSING]: '[!] ',
  [FileChangeStatus.REMOVED]: '[D] ',
  [FileChangeStatus.UNTRACKED]: '[?] ',
});

export const FileChangeStatusToIcon: {[key: ?FileChangeStatusValue]: atom$Octicon} = Object.freeze({
  [FileChangeStatus.ADDED]: 'diff-added',
  [FileChangeStatus.MODIFIED]: 'diff-modified',
  [FileChangeStatus.MISSING]: 'stop',
  [FileChangeStatus.REMOVED]: 'diff-removed',
  [FileChangeStatus.UNTRACKED]: 'question',
});

export const FileChangeStatusToTextColor: {[key: ?FileChangeStatusValue]: string} = Object.freeze({
  [FileChangeStatus.ADDED]: 'text-success',
  [FileChangeStatus.MODIFIED]: 'text-warning',
  [FileChangeStatus.MISSING]: 'text-error',
  [FileChangeStatus.REMOVED]: 'text-error',
  [FileChangeStatus.UNTRACKED]: 'text-error',
});

export const RevertibleStatusCodes = [
  FileChangeStatus.ADDED,
  FileChangeStatus.MODIFIED,
  FileChangeStatus.REMOVED,
];

export const HgStatusToFileChangeStatus
  : {[key: StatusCodeNumberValue]: FileChangeStatusValue} = Object.freeze({
    [HgStatusCodeNumber.ADDED]: FileChangeStatus.ADDED,
    [HgStatusCodeNumber.MODIFIED]: FileChangeStatus.MODIFIED,
    [HgStatusCodeNumber.MISSING]: FileChangeStatus.MISSING,
    [HgStatusCodeNumber.REMOVED]: FileChangeStatus.REMOVED,
    [HgStatusCodeNumber.UNTRACKED]: FileChangeStatus.UNTRACKED,
  },
);
