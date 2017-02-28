'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.fetchRevisionInfo = exports.fetchCommonAncestorOfHeadAndRevision = exports.INFO_REV_END_MARK = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

/**
 * @param revision The revision expression of a revision of interest.
 * @param workingDirectory The working directory of the Hg repository.
 * @return An expression for the common ancestor of the revision of interest and
 * the current Hg head.
 */
let fetchCommonAncestorOfHeadAndRevision = exports.fetchCommonAncestorOfHeadAndRevision = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* (revision, workingDirectory) {
    const ancestorExpression = expressionForCommonAncestor(revision);
    // shell-escape does not wrap '{rev}' in quotes unless it is double-quoted.
    const args = ['log', '--template', '{rev}', '--rev', ancestorExpression, '--limit', '1'];
    const options = {
      cwd: workingDirectory
    };

    try {
      const { stdout: ancestorRevisionNumber } = yield (0, (_hgUtils || _load_hgUtils()).hgAsyncExecute)(args, options);
      return ancestorRevisionNumber;
    } catch (e) {
      (0, (_nuclideLogging || _load_nuclideLogging()).getLogger)().warn('Failed to get hg common ancestor: ', e.stderr, e.command);
      throw new Error('Could not fetch common ancestor of head and revision: ' + revision);
    }
  });

  return function fetchCommonAncestorOfHeadAndRevision(_x, _x2) {
    return _ref.apply(this, arguments);
  };
})();

let fetchRevisionInfo = exports.fetchRevisionInfo = (() => {
  var _ref2 = (0, _asyncToGenerator.default)(function* (revisionExpression, workingDirectory) {
    const [revisionInfo] = yield fetchRevisionsInfo(revisionExpression, workingDirectory).toPromise();
    return revisionInfo;
  });

  return function fetchRevisionInfo(_x3, _x4) {
    return _ref2.apply(this, arguments);
  };
})();

exports.expressionForRevisionsBeforeHead = expressionForRevisionsBeforeHead;
exports.expressionForCommonAncestor = expressionForCommonAncestor;
exports.fetchRevisionsInfo = fetchRevisionsInfo;
exports.fetchRevisionInfoBetweenRevisions = fetchRevisionInfoBetweenRevisions;
exports.fetchSmartlogRevisions = fetchSmartlogRevisions;
exports.parseRevisionInfoOutput = parseRevisionInfoOutput;

var _hgUtils;

function _load_hgUtils() {
  return _hgUtils = require('./hg-utils');
}

var _hgConstants;

function _load_hgConstants() {
  return _hgConstants = require('./hg-constants');
}

var _nuclideLogging;

function _load_nuclideLogging() {
  return _nuclideLogging = require('../../nuclide-logging');
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * This file contains utilities for getting an expression to specify a certain
 * revision in Hg (i.e. something that can be passed to the '--rev' option of
 * an Hg command).
 * Note: "Head" in this set of helper functions refers to the "current working
 * directory parent" in Hg terms.
 */

// Exported for testing.
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 */

const INFO_REV_END_MARK = exports.INFO_REV_END_MARK = '<<NUCLIDE_REV_END_MARK>>';

// We use `{p1node|short} {p2node|short}` instead of `{parents}`
// because `{parents}` only prints when a node has more than one parent,
// not when a node has one natural parent.
// Reference: `hg help templates`
const NO_NODE_HASH = '000000000000';
const HEAD_MARKER = '@';

const REVISION_INFO_TEMPLATE = `{rev}
{desc|firstline}
{author}
{date|isodate}
{node|short}
{branch}
{phase}
{bookmarks}
{remotenames}
{tags}
{p1node|short} {p2node|short}
{ifcontains(rev, revset('.'), '${HEAD_MARKER}')}
{desc}
${INFO_REV_END_MARK}
`;

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
  return expressionForRevisionsBefore((_hgConstants || _load_hgConstants()).HEAD_REVISION_EXPRESSION, numberOfRevsBefore);
}

// Section: Revision Sets

function expressionForCommonAncestor(revision) {
  const commonAncestorExpression = `ancestor(${revision}, ${(_hgConstants || _load_hgConstants()).HEAD_REVISION_EXPRESSION})`;
  // shell-escape does not wrap ancestorExpression in quotes without this toString conversion.
  return commonAncestorExpression.toString();
}function fetchRevisionsInfo(revisionExpression, workingDirectory, options) {
  const revisionLogArgs = ['log', '--template', REVISION_INFO_TEMPLATE, '--rev', revisionExpression];
  if (options == null || options.shouldLimit == null || options.shouldLimit) {
    revisionLogArgs.push('--limit', '20');
  }

  // --hidden prevents mercurial from loading the obsstore, which can be expensive.
  if (options && options.hidden === true) {
    revisionLogArgs.push('--hidden');
  }

  const hgOptions = {
    cwd: workingDirectory
  };
  return (0, (_hgUtils || _load_hgUtils()).hgRunCommand)(revisionLogArgs, hgOptions).map(stdout => parseRevisionInfoOutput(stdout)).catch(e => {
    (0, (_nuclideLogging || _load_nuclideLogging()).getLogger)().warn('Failed to get revision info for revisions' + ` ${revisionExpression}: ${e.stderr || e}, ${e.command}`);
    throw new Error(`Could not fetch revision info for revisions: ${revisionExpression}`);
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

function fetchSmartlogRevisions(workingDirectory) {
  // This will get the `smartlog()` expression revisions
  // and the head revision commits to the nearest public commit parent.
  const revisionExpression = 'smartlog(all) + parents(smartlog(all))';
  return fetchRevisionsInfo(revisionExpression, workingDirectory, { shouldLimit: false }).publish();
}

/**
 * Helper function to `fetchRevisionInfoBetweenRevisions`.
 */
function parseRevisionInfoOutput(revisionsInfoOutput) {
  const revisions = revisionsInfoOutput.split(INFO_REV_END_MARK);
  const revisionInfo = [];
  for (const chunk of revisions) {
    const revisionLines = chunk.trim().split('\n');
    if (revisionLines.length < 12) {
      continue;
    }
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
      description: revisionLines.slice(12).join('\n')
    });
  }
  return revisionInfo;
}

function splitLine(line) {
  if (line.length === 0) {
    return [];
  } else {
    return line.split(' ');
  }
}