'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {RevisionInfo} from './hg-constants';

const logger = require('nuclide-logging').getLogger();

/**
 * This file contains utilities for getting an expression to specify a certain
 * revision in Hg (i.e. something that can be passed to the '--rev' option of
 * an Hg command).
 * Note: "Head" in this set of helper functions refers to the "current working
 * directory parent" in Hg terms.
 */

// Section: Expression Formation

const HG_CURRENT_WORKING_DIRECTORY_PARENT = '.';

const INFO_ID_PREFIX = 'id:';
const INFO_HASH_PREFIX = 'hash:';
const INFO_TITLE_PREFIX = 'title:';
const INFO_AUTHOR_PREFIX = 'author:';
const INFO_DATE_PREFIX = 'date:';

const REVISION_INFO_TEMPLATE = `${INFO_ID_PREFIX}{rev}
${INFO_TITLE_PREFIX}{desc|firstline}
${INFO_AUTHOR_PREFIX}{author}
${INFO_DATE_PREFIX}{date|isodate}
${INFO_HASH_PREFIX}{node|short}

`;

/**
 * @param revisionExpression An expression that can be passed to hg as an argument
 * to the '--rev' option.
 * @param numberOfRevsBefore The number of revisions before the current revision
 * that you want a revision expression for. Passing 0 here will simply return 'revisionExpression'.
 * @return An expression for the 'numberOfRevsBefore'th revision before the given revision.
 */
function expressionForRevisionsBefore(
  revisionExpression: string,
  numberOfRevsBefore: number,
): string {
  if (numberOfRevsBefore === 0) {
    return revisionExpression;
  } else {
    return revisionExpression + '~' + numberOfRevsBefore.toString();
  }
}

export function expressionForRevisionsBeforeHead(numberOfRevsBefore: number): string {
  if (numberOfRevsBefore < 0) {
    numberOfRevsBefore = 0;
  }
  return expressionForRevisionsBefore(HG_CURRENT_WORKING_DIRECTORY_PARENT, numberOfRevsBefore);
}

// Section: Revision Sets

/**
 * @param revision The revision expression of a revision of interest.
 * @param workingDirectory The working directory of the Hg repository.
 * @return An expression for the common ancestor of the revision of interest and
 * the current Hg head.
 */
export async function fetchCommonAncestorOfHeadAndRevision(
  revision: string,
  workingDirectory: string,
): Promise<string> {
  const {asyncExecute} = require('nuclide-commons');

  let ancestorExpression = `ancestor(${revision}, ${HG_CURRENT_WORKING_DIRECTORY_PARENT})`;
  // shell-escape does not wrap ancestorExpression in quotes without this toString conversion.
  ancestorExpression = ancestorExpression.toString();

  // shell-escape does not wrap '{rev}' in quotes unless it is double-quoted.
  const args = ['log', '--template', '{rev}', '--rev', ancestorExpression];
  const options = {
    cwd: workingDirectory,
  };

  try {
    const {stdout: ancestorRevisionNumber} = await asyncExecute('hg', args, options);
    return ancestorRevisionNumber;
  } catch (e) {
    logger.warn('Failed to get hg common ancestor: ', e.stderr, e.command);
    throw new Error('Could not fetch common ancestor of head and revision: ' + revision);
  }
}

/**
 * @param revisionFrom The revision expression of the "start" (older) revision.
 * @param revisionTo The revision expression of the "end" (newer) revision.
 * @param workingDirectory The working directory of the Hg repository.
 * @return An array of revision info between revisionFrom and
 *   revisionTo, plus revisionFrom and revisionTo;
 * "Between" means that revisionFrom is an ancestor of, and
 *   revisionTo is a descendant of.
 * For each RevisionInfo, the `bookmarks` field will contain the list
 * of bookmark names applied to that revision.
 */
export async function fetchRevisionInfoBetweenRevisions(
  revisionFrom: string,
  revisionTo: string,
  workingDirectory: string,
): Promise<Array<RevisionInfo>> {
  const {asyncExecute} = require('nuclide-commons');

  const revisionExpression = `${revisionFrom}::${revisionTo}`;
  const revisionLogArgs = [
    'log', '--template', REVISION_INFO_TEMPLATE,
    '--rev', revisionExpression,
  ];
  const bookmarksArgs = ['bookmarks'];
  const options = {
    cwd: workingDirectory,
  };

  try {
    const [revisionsResult, bookmarksResult] = await Promise.all([
      asyncExecute('hg', revisionLogArgs, options),
      asyncExecute('hg', bookmarksArgs, options),
    ]);
    const revisionsInfo = parseRevisionInfoOutput(revisionsResult.stdout);
    const bookmarksInfo = parseBookmarksOutput(bookmarksResult.stdout);
    for (const revisionInfo of revisionsInfo) {
      revisionInfo.bookmarks = bookmarksInfo.get(revisionInfo.id) || [];
    }
    return revisionsInfo;
  } catch (e) {
    logger.warn('Failed to get revision info between two revisions: ', e.stderr || e, e.command);
    throw new Error(
      `Could not fetch revision numbers between the revisions: ${revisionFrom}, ${revisionTo}`
    );
  }
}

/**
 * Helper function to `fetchRevisionInfoBetweenRevisions`.
 */
export function parseRevisionInfoOutput(revisionsInfoOutput: string): Array<RevisionInfo> {
  const revisions = revisionsInfoOutput.split('\n\n');
  const revisionInfo = [];
  for (const chunk of revisions) {
    const revisionLines = chunk.trim().split('\n');
    if (revisionLines.length !== 5) {
      continue;
    }
    revisionInfo.push({
      id: parseInt(revisionLines[0].slice(INFO_ID_PREFIX.length), 10),
      title: revisionLines[1].slice(INFO_TITLE_PREFIX.length),
      author: revisionLines[2].slice(INFO_AUTHOR_PREFIX.length),
      date: new Date(revisionLines[3].slice(INFO_DATE_PREFIX.length)),
      hash: revisionLines[4].slice(INFO_HASH_PREFIX.length),
      bookmarks: [],
    });
  }
  return revisionInfo;
}

// Capture the local commit id and bookmark name from the `hg bookmarks` output.
const BOOKMARK_MATCH_REGEX = /^ . ([^ ]+)\s+(\d+):([0-9a-f]+)$/;

/**
 * Parse the result of `hg bookmarks` into a `Map` from
 * revision id to a array of bookmark names applied to revision.
 */
export function parseBookmarksOutput(bookmarksOutput: string): Map<number, Array<string>> {
  const bookmarksLines = bookmarksOutput.split('\n');
  const commitsToBookmarks = new Map();
  for (const bookmarkLine of bookmarksLines) {
    const match = BOOKMARK_MATCH_REGEX.exec(bookmarkLine);
    if (match == null) {
      continue;
    }
    const [, bookmarkString, commitIdString] = match;
    const commitId = parseInt(commitIdString, 10);
    if (!commitsToBookmarks.has(commitId)) {
      commitsToBookmarks.set(commitId, []);
    }
    const bookmarks = commitsToBookmarks.get(commitId);
    bookmarks.push(bookmarkString);
  }
  return commitsToBookmarks;
}
