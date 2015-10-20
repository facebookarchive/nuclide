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

var logger = require('nuclide-logging').getLogger();

/**
 * This file contains utilities for getting an expression to specify a certain
 * revision in Hg (i.e. something that can be passed to the '--rev' option of
 * an Hg command).
 * Note: "Head" in this set of helper functions refers to the "current working
 * directory parent" in Hg terms.
 */

// Section: Expression Formation

var HG_CURRENT_WORKING_DIRECTORY_PARENT = '.';

const INFO_REVISION_PREFIX = 'revision:';
const INFO_TITLE_PREFIX = 'title:';
const INFO_AUTHOR_PREFIX = 'author:';
const INFO_DATE_PREFIX = 'date:';

const REVISION_INFO_TEMPLATE = `${INFO_REVISION_PREFIX}{rev}
${INFO_TITLE_PREFIX}{desc|firstline}
${INFO_AUTHOR_PREFIX}{author|person}
${INFO_DATE_PREFIX}{date|isodate}

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
  var {asyncExecute} = require('nuclide-commons');

  var ancestorExpression = `ancestor(${revision}, ${HG_CURRENT_WORKING_DIRECTORY_PARENT})`;
  // shell-escape does not wrap ancestorExpression in quotes without this toString conversion.
  ancestorExpression = ancestorExpression.toString();

  // shell-escape does not wrap '{rev}' in quotes unless it is double-quoted.
  var args = ['log', '--template', '{rev}', '--rev', ancestorExpression];
  var options = {
    cwd: workingDirectory,
  };

  try {
    var {stdout: ancestorRevisionNumber} = await asyncExecute('hg', args, options);
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
 */
export async function fetchRevisionInfoBetweenRevisions(
  revisionFrom: string,
  revisionTo: string,
  workingDirectory: string,
): Promise<Array<RevisionInfo>> {
  var {asyncExecute} = require('nuclide-commons');

  var revisionExpression = `${revisionFrom}::${revisionTo}`;
  // shell-escape does not wrap revisionExpression in quotes without this toString conversion.
  revisionExpression = revisionExpression.toString();

  var args = ['log', '--template', REVISION_INFO_TEMPLATE, '--rev', revisionExpression];
  var options = {
    cwd: workingDirectory,
  };

  try {
    var {stdout: revisionsInfoString} = await asyncExecute('hg', args, options);
    return parseRevisionInfoOutput(revisionsInfoString);
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
    if (revisionLines.length !== 4) {
      continue;
    }
    revisionInfo.push({
      id: parseInt(revisionLines[0].slice(INFO_REVISION_PREFIX.length), 10),
      title: revisionLines[1].slice(INFO_TITLE_PREFIX.length),
      author: revisionLines[2].slice(INFO_AUTHOR_PREFIX.length),
      date: revisionLines[3].slice(INFO_DATE_PREFIX.length),
    });
  }
  return revisionInfo;
}
