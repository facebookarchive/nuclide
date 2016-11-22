'use strict';
'use babel';

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.HgStatusToFileChangeStatus = exports.RevertibleStatusCodes = exports.FileChangeStatusToTextColor = exports.FileChangeStatusToPrefix = exports.FileChangeStatus = undefined;

var _nuclideHgRpc;

function _load_nuclideHgRpc() {
  return _nuclideHgRpc = require('../../nuclide-hg-rpc');
}

const HgStatusCodeNumber = (_nuclideHgRpc || _load_nuclideHgRpc()).hgConstants.StatusCodeNumber;

const FileChangeStatus = exports.FileChangeStatus = Object.freeze({
  ADDED: 1,
  MODIFIED: 2,
  MISSING: 3,
  REMOVED: 4,
  UNTRACKED: 5
});

const FileChangeStatusToPrefix = exports.FileChangeStatusToPrefix = Object.freeze({
  [FileChangeStatus.ADDED]: '[A] ',
  [FileChangeStatus.MODIFIED]: '[M] ',
  [FileChangeStatus.MISSING]: '[!] ',
  [FileChangeStatus.REMOVED]: '[D] ',
  [FileChangeStatus.UNTRACKED]: '[?] '
});

const FileChangeStatusToTextColor = exports.FileChangeStatusToTextColor = Object.freeze({
  [FileChangeStatus.ADDED]: 'text-success',
  [FileChangeStatus.MODIFIED]: 'text-warning',
  [FileChangeStatus.MISSING]: 'text-error',
  [FileChangeStatus.REMOVED]: 'text-error',
  [FileChangeStatus.UNTRACKED]: 'text-error'
});

const RevertibleStatusCodes = exports.RevertibleStatusCodes = [FileChangeStatus.ADDED, FileChangeStatus.MODIFIED, FileChangeStatus.REMOVED];

const HgStatusToFileChangeStatus = exports.HgStatusToFileChangeStatus = Object.freeze({
  [HgStatusCodeNumber.ADDED]: FileChangeStatus.ADDED,
  [HgStatusCodeNumber.MODIFIED]: FileChangeStatus.MODIFIED,
  [HgStatusCodeNumber.MISSING]: FileChangeStatus.MISSING,
  [HgStatusCodeNumber.REMOVED]: FileChangeStatus.REMOVED,
  [HgStatusCodeNumber.UNTRACKED]: FileChangeStatus.UNTRACKED
});