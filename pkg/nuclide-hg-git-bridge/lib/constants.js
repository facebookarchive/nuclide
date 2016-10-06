Object.defineProperty(exports, '__esModule', {
  value: true
});

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _Object$freeze, _Object$freeze2, _Object$freeze3;

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var _nuclideHgRpc2;

function _nuclideHgRpc() {
  return _nuclideHgRpc2 = require('../../nuclide-hg-rpc');
}

var HgStatusCodeNumber = (_nuclideHgRpc2 || _nuclideHgRpc()).hgConstants.StatusCodeNumber;

var FileChangeStatus = Object.freeze({
  ADDED: 1,
  MODIFIED: 2,
  MISSING: 3,
  REMOVED: 4,
  UNTRACKED: 5
});

exports.FileChangeStatus = FileChangeStatus;
var FileChangeStatusToPrefix = Object.freeze((_Object$freeze = {}, _defineProperty(_Object$freeze, FileChangeStatus.ADDED, '[A] '), _defineProperty(_Object$freeze, FileChangeStatus.MODIFIED, '[M] '), _defineProperty(_Object$freeze, FileChangeStatus.MISSING, '[!] '), _defineProperty(_Object$freeze, FileChangeStatus.REMOVED, '[D] '), _defineProperty(_Object$freeze, FileChangeStatus.UNTRACKED, '[?] '), _Object$freeze));

exports.FileChangeStatusToPrefix = FileChangeStatusToPrefix;
var FileChangeStatusToTextColor = Object.freeze((_Object$freeze2 = {}, _defineProperty(_Object$freeze2, FileChangeStatus.ADDED, 'text-success'), _defineProperty(_Object$freeze2, FileChangeStatus.MODIFIED, 'text-warning'), _defineProperty(_Object$freeze2, FileChangeStatus.MISSING, 'text-error'), _defineProperty(_Object$freeze2, FileChangeStatus.REMOVED, 'text-error'), _defineProperty(_Object$freeze2, FileChangeStatus.UNTRACKED, 'text-error'), _Object$freeze2));

exports.FileChangeStatusToTextColor = FileChangeStatusToTextColor;
var RevertibleStatusCodes = [FileChangeStatus.ADDED, FileChangeStatus.MODIFIED, FileChangeStatus.REMOVED];

exports.RevertibleStatusCodes = RevertibleStatusCodes;
var HgStatusToFileChangeStatus = Object.freeze((_Object$freeze3 = {}, _defineProperty(_Object$freeze3, HgStatusCodeNumber.ADDED, FileChangeStatus.ADDED), _defineProperty(_Object$freeze3, HgStatusCodeNumber.MODIFIED, FileChangeStatus.MODIFIED), _defineProperty(_Object$freeze3, HgStatusCodeNumber.MISSING, FileChangeStatus.MISSING), _defineProperty(_Object$freeze3, HgStatusCodeNumber.REMOVED, FileChangeStatus.REMOVED), _defineProperty(_Object$freeze3, HgStatusCodeNumber.UNTRACKED, FileChangeStatus.UNTRACKED), _Object$freeze3));
exports.HgStatusToFileChangeStatus = HgStatusToFileChangeStatus;