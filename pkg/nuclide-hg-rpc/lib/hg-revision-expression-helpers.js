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

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

exports.expressionForRevisionsBeforeHead = expressionForRevisionsBeforeHead;
exports.expressionForCommonAncestor = expressionForCommonAncestor;

/**
 * @param revision The revision expression of a revision of interest.
 * @param workingDirectory The working directory of the Hg repository.
 * @return An expression for the common ancestor of the revision of interest and
 * the current Hg head.
 */

var fetchCommonAncestorOfHeadAndRevision = _asyncToGenerator(function* (revision, workingDirectory) {
  var ancestorExpression = expressionForCommonAncestor(revision);
  // shell-escape does not wrap '{rev}' in quotes unless it is double-quoted.
  var args = ['log', '--template', '{rev}', '--rev', ancestorExpression, '--limit', '1'];
  var options = {
    cwd: workingDirectory
  };

  try {
    var _ref = yield (0, (_hgUtils2 || _hgUtils()).hgAsyncExecute)(args, options);

    var ancestorRevisionNumber = _ref.stdout;

    return ancestorRevisionNumber;
  } catch (e) {
    (0, (_nuclideLogging2 || _nuclideLogging()).getLogger)().warn('Failed to get hg common ancestor: ', e.stderr, e.command);
    throw new Error('Could not fetch common ancestor of head and revision: ' + revision);
  }
});

exports.fetchCommonAncestorOfHeadAndRevision = fetchCommonAncestorOfHeadAndRevision;
exports.fetchRevisionInfoBetweenRevisions = fetchRevisionInfoBetweenRevisions;

var fetchRevisionInfo = _asyncToGenerator(function* (revisionExpression, workingDirectory) {
  var _ref2 = yield fetchRevisions(revisionExpression, workingDirectory).toPromise();

  var _ref22 = _slicedToArray(_ref2, 1);

  var revisionInfo = _ref22[0];

  return revisionInfo;
});

exports.fetchRevisionInfo = fetchRevisionInfo;
exports.fetchSmartlogRevisions = fetchSmartlogRevisions;
exports.parseRevisionInfoOutput = parseRevisionInfoOutput;

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

var _hgUtils2;

function _hgUtils() {
  return _hgUtils2 = require('./hg-utils');
}

var _hgConstants2;

function _hgConstants() {
  return _hgConstants2 = require('./hg-constants');
}

var _nuclideLogging2;

function _nuclideLogging() {
  return _nuclideLogging2 = require('../../nuclide-logging');
}

var _rxjsBundlesRxMinJs2;

function _rxjsBundlesRxMinJs() {
  return _rxjsBundlesRxMinJs2 = require('rxjs/bundles/Rx.min.js');
}

/**
 * This file contains utilities for getting an expression to specify a certain
 * revision in Hg (i.e. something that can be passed to the '--rev' option of
 * an Hg command).
 * Note: "Head" in this set of helper functions refers to the "current working
 * directory parent" in Hg terms.
 */

// Exported for testing.
var INFO_REV_END_MARK = '<<NUCLIDE_REV_END_MARK>>';

exports.INFO_REV_END_MARK = INFO_REV_END_MARK;
// We use `{p1node|short} {p2node|short}` instead of `{parents}`
// because `{parents}` only prints when a node has more than one parent,
// not when a node has one natural parent.
// Reference: `hg help templates`
var NO_NODE_HASH = '000000000000';
var HEAD_MARKER = '@';

var REVISION_INFO_TEMPLATE = '{rev}\n{desc|firstline}\n{author}\n{date|isodate}\n{node|short}\n{branch}\n{phase}\n{bookmarks}\n{remotenames}\n{tags}\n{p1node|short} {p2node|short}\n{ifcontains(rev, revset(\'.\'), \'' + HEAD_MARKER + '\')}\n{desc}\n' + INFO_REV_END_MARK + '\n';

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
  var numberOfRevsBefore = numberOfRevsBefore_;
  if (numberOfRevsBefore < 0) {
    numberOfRevsBefore = 0;
  }
  return expressionForRevisionsBefore((_hgConstants2 || _hgConstants()).HEAD_REVISION_EXPRESSION, numberOfRevsBefore);
}

// Section: Revision Sets

function expressionForCommonAncestor(revision) {
  var commonAncestorExpression = 'ancestor(' + revision + ', ' + (_hgConstants2 || _hgConstants()).HEAD_REVISION_EXPRESSION + ')';
  // shell-escape does not wrap ancestorExpression in quotes without this toString conversion.
  return commonAncestorExpression.toString();
}

function fetchRevisions(revisionExpression, workingDirectory, options) {
  var revisionLogArgs = ['log', '--template', REVISION_INFO_TEMPLATE, '--rev', revisionExpression];
  if (options == null || options.shouldLimit == null || options.shouldLimit) {
    revisionLogArgs.push('--limit', '20');
  }
  var hgOptions = {
    cwd: workingDirectory
  };
  return (0, (_hgUtils2 || _hgUtils()).hgRunCommand)(revisionLogArgs, hgOptions).map(function (stdout) {
    return parseRevisionInfoOutput(stdout);
  }).catch(function (e) {
    (0, (_nuclideLogging2 || _nuclideLogging()).getLogger)().warn('Failed to get revision info for revisions' + (' ' + revisionExpression + ': ' + (e.stderr || e) + ', ' + e.command));
    throw new Error('Could not fetch revision info for revisions: ' + revisionExpression);
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
  var revisionExpression = revisionFrom + '::' + revisionTo;
  return fetchRevisions(revisionExpression, workingDirectory).toPromise();
}

function fetchSmartlogRevisions(workingDirectory) {
  // This will get the `smartlog()` expression revisions
  // and the head revision commits to the nearest public commit parent.
  var revisionExpression = 'smartlog(all) + ancestor(smartlog(all)) + last(::. & public())::.';
  return fetchRevisions(revisionExpression, workingDirectory, { shouldLimit: false }).publish();
}

/**
 * Helper function to `fetchRevisionInfoBetweenRevisions`.
 */

function parseRevisionInfoOutput(revisionsInfoOutput) {
  var revisions = revisionsInfoOutput.split(INFO_REV_END_MARK);
  var revisionInfo = [];
  for (var chunk of revisions) {
    var revisionLines = chunk.trim().split('\n');
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
      parents: splitLine(revisionLines[10]).filter(function (hash) {
        return hash !== NO_NODE_HASH;
      }),
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