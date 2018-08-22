"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.expressionForRevisionsBeforeHead = expressionForRevisionsBeforeHead;
exports.expressionForCommonAncestor = expressionForCommonAncestor;
exports.fetchCommonAncestorOfHeadAndRevision = fetchCommonAncestorOfHeadAndRevision;
exports.fetchRevisionsInfo = fetchRevisionsInfo;
exports.fetchRevisionInfoBetweenRevisions = fetchRevisionInfoBetweenRevisions;
exports.fetchRevisionInfo = fetchRevisionInfo;
exports.fetchSmartlogRevisions = fetchSmartlogRevisions;
exports.parseRevisionInfoOutput = parseRevisionInfoOutput;
exports.parseSuccessorData = parseSuccessorData;
exports.successorInfoToDisplay = successorInfoToDisplay;
exports.NULL_CHAR = exports.INFO_REV_END_MARK = void 0;

function _hgUtils() {
  const data = require("./hg-utils");

  _hgUtils = function () {
    return data;
  };

  return data;
}

function _hgConstants() {
  const data = require("./hg-constants");

  _hgConstants = function () {
    return data;
  };

  return data;
}

function _log4js() {
  const data = require("log4js");

  _log4js = function () {
    return data;
  };

  return data;
}

var _RxMin = require("rxjs/bundles/Rx.min.js");

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 */

/**
 * This file contains utilities for getting an expression to specify a certain
 * revision in Hg (i.e. something that can be passed to the '--rev' option of
 * an Hg command).
 * Note: "Head" in this set of helper functions refers to the "current working
 * directory parent" in Hg terms.
 */
// Exported for testing.
const INFO_REV_END_MARK = '<<NUCLIDE_REV_END_MARK>>';
exports.INFO_REV_END_MARK = INFO_REV_END_MARK;
const NULL_CHAR = '\0';
exports.NULL_CHAR = NULL_CHAR;
const ESCAPED_NULL_CHAR = '\\0'; // We use `{p1node|short} {p2node|short}` instead of `{parents}`
// because `{parents}` only prints when a node has more than one parent,
// not when a node has one natural parent.
// Reference: `hg help templates`

const NO_NODE_HASH = '000000000000';
const HEAD_MARKER = '@';
const SHORT_HASH_LENGTH = 12; // {node|short} results in a fixed length 12 char hash
// comma-separated list of successors, used when tracking multi-step succession from commit cloud

const commitCloudSuccessionTemplate = "{join(succsandmarkers % '{join(successors % \\'{node|short}\\', \\',\\')}',',')}";
const REVISION_INFO_TEMPLATE = `{rev}
{desc|firstline}
{author}
{date|isodate}
{node|short}
{branch}
{phase}
{bookmarks % '{bookmark}${ESCAPED_NULL_CHAR}'}
{remotenames % '{remotename}${ESCAPED_NULL_CHAR}'}
{tags % '{tag}${ESCAPED_NULL_CHAR}'}
{p1node|short}${ESCAPED_NULL_CHAR}{p2node|short}${ESCAPED_NULL_CHAR}
{ifcontains(rev, revset('.'), '${HEAD_MARKER}')}
{files|json}
{singlepublicsuccessor}
{amendsuccessors}
{rebasesuccessors}
{splitsuccessors}
{foldsuccessors}
{histeditsuccessors}
${commitCloudSuccessionTemplate}
{desc}
${INFO_REV_END_MARK}
`;
const SUCCESSOR_TEMPLATE_ORDER = [_hgConstants().SuccessorType.PUBLIC, _hgConstants().SuccessorType.AMEND, _hgConstants().SuccessorType.REBASE, _hgConstants().SuccessorType.SPLIT, _hgConstants().SuccessorType.FOLD, _hgConstants().SuccessorType.HISTEDIT, _hgConstants().SuccessorType.REWRITTEN];
/**
 * @param revisionExpression An expression that can be passed to hg as an argument
 * to the '--rev' option.
 * @param numberOfRevsBefore The number of revisions before the current revision
 * that you want a revision expression for. Passing 0 here will simply return 'revisionExpression'.
 * @return An expression for the 'numberOfRevsBefore'th revision before the given revision.
 */

function expressionForRevisionsBefore(revisionExpression, numberOfRevsBefore) {
  if (numberOfRevsBefore === 0) {
    return revisionExpression;
  } else {
    return revisionExpression + '~' + numberOfRevsBefore.toString();
  }
}

function expressionForRevisionsBeforeHead(numberOfRevsBefore_) {
  let numberOfRevsBefore = numberOfRevsBefore_;

  if (numberOfRevsBefore < 0) {
    numberOfRevsBefore = 0;
  }

  return expressionForRevisionsBefore(_hgConstants().HEAD_REVISION_EXPRESSION, numberOfRevsBefore);
} // Section: Revision Sets


function expressionForCommonAncestor(revision) {
  const commonAncestorExpression = `ancestor(${revision}, ${_hgConstants().HEAD_REVISION_EXPRESSION})`; // shell-escape does not wrap ancestorExpression in quotes without this toString conversion.

  return commonAncestorExpression.toString();
}
/**
 * @param revision The revision expression of a revision of interest.
 * @param workingDirectory The working directory of the Hg repository.
 * @return An expression for the common ancestor of the revision of interest and
 * the current Hg head.
 */


async function fetchCommonAncestorOfHeadAndRevision(revision, workingDirectory) {
  const ancestorExpression = expressionForCommonAncestor(revision); // shell-escape does not wrap '{rev}' in quotes unless it is double-quoted.

  const args = ['log', '--template', '{rev}', '--rev', ancestorExpression, '--limit', '1'];
  const options = {
    cwd: workingDirectory
  };

  try {
    const {
      stdout: ancestorRevisionNumber
    } = await (0, _hgUtils().hgAsyncExecute)(args, options);
    return ancestorRevisionNumber;
  } catch (e) {
    (0, _log4js().getLogger)('nuclide-hg-rpc').warn('Failed to get hg common ancestor: ', e.stderr, e.command);
    throw new Error('Could not fetch common ancestor of head and revision: ' + revision);
  }
}

function fetchRevisionsInfo(revisionExpression, workingDirectory, options) {
  const revisionLogArgs = ['log', '--template', REVISION_INFO_TEMPLATE, '--rev', revisionExpression];

  if (options == null || options.shouldLimit == null || options.shouldLimit) {
    revisionLogArgs.push('--limit', '20');
  } // --hidden prevents mercurial from loading the obsstore, which can be expensive.


  if (options && options.hidden === true) {
    revisionLogArgs.push('--hidden');
  }

  const hgOptions = {
    cwd: workingDirectory
  };
  return (0, _hgUtils().hgRunCommand)(revisionLogArgs, hgOptions).map(stdout => parseRevisionInfoOutput(stdout)).catch(e => {
    (0, _log4js().getLogger)('nuclide-hg-rpc').warn('Failed to get revision info for revisions' + ` ${revisionExpression}: ${e.stderr || e}, ${e.command}`);
    throw new Error(`Could not fetch revision info for revisions: ${revisionExpression} ${e}`);
  });
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


function fetchRevisionInfoBetweenRevisions(revisionFrom, revisionTo, workingDirectory) {
  const revisionExpression = `${revisionFrom}::${revisionTo}`;
  return fetchRevisionsInfo(revisionExpression, workingDirectory).toPromise();
}

async function fetchRevisionInfo(revisionExpression, workingDirectory) {
  const [revisionInfo] = await fetchRevisionsInfo(revisionExpression, workingDirectory).toPromise();
  return revisionInfo;
}

function fetchSmartlogRevisions(workingDirectory) {
  // This will get the `smartlog()` expression revisions
  // and the head revision commits to the nearest public commit parent.
  const revisionExpression = 'smartlog() + parents(smartlog())';
  return fetchRevisionsInfo(revisionExpression, workingDirectory, {
    shouldLimit: false
  }).publish();
}
/**
 * Helper function to `fetchRevisionInfoBetweenRevisions`.
 */


function parseRevisionInfoOutput(revisionsInfoOutput) {
  const revisions = revisionsInfoOutput.split(INFO_REV_END_MARK);
  const revisionInfo = [];

  for (const chunk of revisions) {
    const revisionLines = chunk.trim().split('\n');

    if (revisionLines.length < 18) {
      continue;
    }

    const successorInfo = parseSuccessorData(revisionLines.slice(13, 20));
    revisionInfo.push({
      id: parseInt(revisionLines[0], 10),
      title: revisionLines[1],
      author: revisionLines[2],
      date: new Date(revisionLines[3]),
      hash: revisionLines[4],
      branch: revisionLines[5],
      // Phase is either `public`, `draft` or `secret`.
      // https://www.mercurial-scm.org/wiki/Phases
      phase: revisionLines[6],
      bookmarks: splitLine(revisionLines[7]),
      remoteBookmarks: splitLine(revisionLines[8]),
      tags: splitLine(revisionLines[9]),
      parents: splitLine(revisionLines[10]).filter(hash => hash !== NO_NODE_HASH),
      isHead: revisionLines[11] === HEAD_MARKER,
      files: JSON.parse(revisionLines[12]),
      successorInfo,
      description: revisionLines.slice(20).join('\n')
    });
  }

  return revisionInfo;
}

function parseSuccessorData(successorLines) {
  if (!(successorLines.length === SUCCESSOR_TEMPLATE_ORDER.length)) {
    throw new Error("Invariant violation: \"successorLines.length === SUCCESSOR_TEMPLATE_ORDER.length\"");
  }

  for (let i = 0; i < SUCCESSOR_TEMPLATE_ORDER.length; i++) {
    if (successorLines[i].length > 0) {
      return {
        hash: successorLines[i].slice(0, SHORT_HASH_LENGTH),
        // take only first hash if multiple given
        type: SUCCESSOR_TEMPLATE_ORDER[i]
      };
    }
  }

  return null;
}

function successorInfoToDisplay(successorInfo) {
  if (successorInfo == null) {
    return '';
  }

  switch (successorInfo.type) {
    case 'public':
      return 'Landed as a newer commit';

    case 'amend':
      return 'Amended as a newer commit';

    case 'rebase':
      return 'Rebased as a newer commit';

    case 'split':
      return 'Split as a newer commit';

    case 'fold':
      return 'Folded as a newer commit';

    case 'histedit':
      return 'Histedited as a newer commit';

    case 'rewritten':
      return 'Rewritten as a newer commit';

    default:
      return '';
  }
}

function splitLine(line) {
  return line.split(NULL_CHAR).filter(e => e.length > 0);
}