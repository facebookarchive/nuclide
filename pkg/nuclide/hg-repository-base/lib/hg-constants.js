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

type HgRepositoryOptions = {
  /** The origin URL of this repository. */
  originURL: string;

  /** The working directory of this repository. */
  workingDirectory: Directory;

  /** The root directory that is opened in Atom, which this Repository serves. **/
  projectRootDirectory: Directory;
};

/**
 * These are status codes used by Mercurial's output.
 * Documented in http://selenic.com/hg/help/status.
 */
type StatusCodeId = string;
var StatusCodeId: {[key: string]: StatusCodeId} = {
  ADDED: 'A',
  CLEAN: 'C',
  IGNORED: 'I',
  MODIFIED: 'M',
  MISSING: '!', // (deleted by non-hg command, but still tracked)
  REMOVED: 'R',
  UNTRACKED: '?',
};

/**
 * Internally, the HgRepository uses the string StatusCodeId to do bookkeeping.
 * However, GitRepository uses numbers to represent its statuses, and returns
 * statuses as numbers. In order to keep our status 'types' the same, we map the
 * string StatusCodeId to numbers.
 * The numbers themselves should not matter; they are meant to be passed
 * to ::isStatusNew/::isStatusModified to be interpreted.
 */
type StatusCodeNumber = number;
var StatusCodeNumber: {[key: string]: StatusCodeNumber} = {
  ADDED: 1,
  CLEAN: 2,
  IGNORED: 3,
  MODIFIED: 4,
  MISSING: 5,
  REMOVED: 6,
  UNTRACKED: 7,
};

var StatusCodeIdToNumber: {[key: StatusCodeId]: StatusCodeNumber} = {
  [StatusCodeId.ADDED]: StatusCodeNumber.ADDED,
  [StatusCodeId.CLEAN]: StatusCodeNumber.CLEAN,
  [StatusCodeId.IGNORED]: StatusCodeNumber.IGNORED,
  [StatusCodeId.MODIFIED]: StatusCodeNumber.MODIFIED,
  [StatusCodeId.MISSING]: StatusCodeNumber.MISSING,
  [StatusCodeId.REMOVED]: StatusCodeNumber.REMOVED,
  [StatusCodeId.UNTRACKED]: StatusCodeNumber.UNTRACKED,
};

type HgStatusOption = number;
var HgStatusOption: {[key: string]: HgStatusOption} = {
  ONLY_NON_IGNORED: 1,  // only the output of `hg status`
  ONLY_IGNORED: 2,      // only the output of `hg status --ignored`
  ALL_STATUSES: 3,      // the output of `hg status --all`
};

type LineDiff = {
  oldStart: number;
  oldLines: number;
  newStart: number;
  newLines: number;
};

type DiffInfo = {
  added: number;
  deleted: number;
  lineDiffs: Array<LineDiff>;
};

type RevisionFileCopy = {
  from: string;
  to: string;
};

export type RevisionFileChanges = {
  all: Array<string>;
  added: Array<string>;
  deleted: Array<string>;
  copied: Array<RevisionFileCopy>;
  modified: Array<string>;
};

module.exports = {
  HgStatusOption,
  StatusCodeId,
  StatusCodeIdToNumber,
  StatusCodeNumber,
};
