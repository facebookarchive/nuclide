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

export type HgRepositoryOptions = {
  /** The origin URL of this repository. */
  originURL: string;

  /** The working directory of this repository. */
  workingDirectory: atom$Directory;

  /** The root directory that is opened in Atom, which this Repository serves. **/
  projectRootDirectory: atom$Directory;
};

/**
 * These are status codes used by Mercurial's output.
 * Documented in http://selenic.com/hg/help/status.
 */
export type StatusCodeIdValue = 'A' | 'C' | 'I' | 'M' | '!' | 'R' | '?';
var StatusCodeId: {[key: string]: StatusCodeIdValue} = {
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
export type StatusCodeNumberValue = 1 | 2 | 3 | 4 | 5 | 6 | 7;
var StatusCodeNumber: {[key: string]: StatusCodeNumberValue} = {
  ADDED: 1,
  CLEAN: 2,
  IGNORED: 3,
  MODIFIED: 4,
  MISSING: 5,
  REMOVED: 6,
  UNTRACKED: 7,
};

var StatusCodeIdToNumber: {[key: StatusCodeIdValue]: StatusCodeNumberValue} = {
  // $FlowIssue (t6187050)
  [StatusCodeId.ADDED]: StatusCodeNumber.ADDED,
  // $FlowIssue (t6187050)
  [StatusCodeId.CLEAN]: StatusCodeNumber.CLEAN,
  // $FlowIssue (t6187050)
  [StatusCodeId.IGNORED]: StatusCodeNumber.IGNORED,
  // $FlowIssue (t6187050)
  [StatusCodeId.MODIFIED]: StatusCodeNumber.MODIFIED,
  // $FlowIssue (t6187050)
  [StatusCodeId.MISSING]: StatusCodeNumber.MISSING,
  // $FlowIssue (t6187050)
  [StatusCodeId.REMOVED]: StatusCodeNumber.REMOVED,
  // $FlowIssue (t6187050)
  [StatusCodeId.UNTRACKED]: StatusCodeNumber.UNTRACKED,
};

export type HgStatusOptionValue = 1 | 2 | 3;
var HgStatusOption: {[key: string]: HgStatusOptionValue} = {
  ONLY_NON_IGNORED: 1,  // only the output of `hg status`
  ONLY_IGNORED: 2,      // only the output of `hg status --ignored`
  ALL_STATUSES: 3,      // the output of `hg status --all`
};

export type LineDiff = {
  oldStart: number;
  oldLines: number;
  newStart: number;
  newLines: number;
};

export type DiffInfo = {
  added: number;
  deleted: number;
  lineDiffs: Array<LineDiff>;
};

export type RevisionInfo = {
  id: number;
  title: string;
  author: string;
  date: string;
};

export type RevisionFileCopy = {
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
