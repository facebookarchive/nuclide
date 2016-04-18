'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

/* @providesModule HgConstants */

import type {
  StatusCodeIdValue,
  StatusCodeNumberValue,
  HgStatusOptionValue,
} from './HgService';

const StatusCodeId: {[key: string]: StatusCodeIdValue} = Object.freeze({
  ADDED: 'A',
  CLEAN: 'C',
  IGNORED: 'I',
  MODIFIED: 'M',
  MISSING: '!', // (deleted by non-hg command, but still tracked)
  REMOVED: 'R',
  UNTRACKED: '?',
});

const StatusCodeNumber = Object.freeze({
  ADDED: 1,
  CLEAN: 2,
  IGNORED: 3,
  MODIFIED: 4,
  MISSING: 5,
  REMOVED: 6,
  UNTRACKED: 7,
});

// This is to work around flow's missing support of enums.
(StatusCodeNumber: { [key: string]: StatusCodeNumberValue });

const StatusCodeIdToNumber: {[key: StatusCodeIdValue]: StatusCodeNumberValue} = {
  [StatusCodeId.ADDED]: StatusCodeNumber.ADDED,
  [StatusCodeId.CLEAN]: StatusCodeNumber.CLEAN,
  [StatusCodeId.IGNORED]: StatusCodeNumber.IGNORED,
  [StatusCodeId.MODIFIED]: StatusCodeNumber.MODIFIED,
  [StatusCodeId.MISSING]: StatusCodeNumber.MISSING,
  [StatusCodeId.REMOVED]: StatusCodeNumber.REMOVED,
  [StatusCodeId.UNTRACKED]: StatusCodeNumber.UNTRACKED,
};

const HgStatusOption: {[key: string]: HgStatusOptionValue} = Object.freeze({
  ONLY_NON_IGNORED: 1,  // only the output of `hg status`
  ONLY_IGNORED: 2,      // only the output of `hg status --ignored`
  ALL_STATUSES: 3,      // the output of `hg status --all`
});

module.exports = {
  HgStatusOption,
  StatusCodeId,
  StatusCodeIdToNumber,
  StatusCodeNumber,
};
