var _StatusCodeIdToNumber;

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

/* @providesModule HgConstants */

var StatusCodeId = Object.freeze({
  ADDED: 'A',
  CLEAN: 'C',
  IGNORED: 'I',
  MODIFIED: 'M',
  MISSING: '!', // (deleted by non-hg command, but still tracked)
  REMOVED: 'R',
  UNTRACKED: '?'
});

var StatusCodeNumber = Object.freeze({
  ADDED: 1,
  CLEAN: 2,
  IGNORED: 3,
  MODIFIED: 4,
  MISSING: 5,
  REMOVED: 6,
  UNTRACKED: 7
});

// This is to work around flow's missing support of enums.
StatusCodeNumber;

var StatusCodeIdToNumber = (_StatusCodeIdToNumber = {}, _defineProperty(_StatusCodeIdToNumber, StatusCodeId.ADDED, StatusCodeNumber.ADDED), _defineProperty(_StatusCodeIdToNumber, StatusCodeId.CLEAN, StatusCodeNumber.CLEAN), _defineProperty(_StatusCodeIdToNumber, StatusCodeId.IGNORED, StatusCodeNumber.IGNORED), _defineProperty(_StatusCodeIdToNumber, StatusCodeId.MODIFIED, StatusCodeNumber.MODIFIED), _defineProperty(_StatusCodeIdToNumber, StatusCodeId.MISSING, StatusCodeNumber.MISSING), _defineProperty(_StatusCodeIdToNumber, StatusCodeId.REMOVED, StatusCodeNumber.REMOVED), _defineProperty(_StatusCodeIdToNumber, StatusCodeId.UNTRACKED, StatusCodeNumber.UNTRACKED), _StatusCodeIdToNumber);

var HgStatusOption = Object.freeze({
  ONLY_NON_IGNORED: 1, // only the output of `hg status`
  ONLY_IGNORED: 2, // only the output of `hg status --ignored`
  ALL_STATUSES: 3 });

// the output of `hg status --all`
module.exports = {
  HgStatusOption: HgStatusOption,
  StatusCodeId: StatusCodeId,
  StatusCodeIdToNumber: StatusCodeIdToNumber,
  StatusCodeNumber: StatusCodeNumber
};