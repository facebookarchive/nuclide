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
    var _ref = yield (0, _hgUtils.hgAsyncExecute)(args, options);

    var ancestorRevisionNumber = _ref.stdout;

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
);

exports.fetchCommonAncestorOfHeadAndRevision = fetchCommonAncestorOfHeadAndRevision;

var fetchRevisionInfoBetweenRevisions = _asyncToGenerator(function* (revisionFrom, revisionTo, workingDirectory) {
  var revisionExpression = revisionFrom + '::' + revisionTo;
  var revisionLogArgs = ['log', '--template', REVISION_INFO_TEMPLATE, '--rev', revisionExpression, '--limit', '20'];
  var bookmarksArgs = ['bookmarks'];
  var options = {
    cwd: workingDirectory
  };

  try {
    var _ref2 = yield Promise.all([(0, _hgUtils.hgAsyncExecute)(revisionLogArgs, options), (0, _hgUtils.hgAsyncExecute)(bookmarksArgs, options)]);

    var _ref22 = _slicedToArray(_ref2, 2);

    var revisionsResult = _ref22[0];
    var bookmarksResult = _ref22[1];

    var revisionsInfo = parseRevisionInfoOutput(revisionsResult.stdout);
    var bookmarksInfo = parseBookmarksOutput(bookmarksResult.stdout);
    for (var revisionInfo of revisionsInfo) {
      revisionInfo.bookmarks = bookmarksInfo.get(revisionInfo.id) || [];
    }
    return revisionsInfo;
  } catch (e) {
    logger.warn('Failed to get revision info between two revisions: ', e.stderr || e, e.command);
    throw new Error('Could not fetch revision numbers between the revisions: ' + revisionFrom + ', ' + revisionTo);
  }
}

/**
 * Helper function to `fetchRevisionInfoBetweenRevisions`.
 */
);

exports.fetchRevisionInfoBetweenRevisions = fetchRevisionInfoBetweenRevisions;
exports.parseRevisionInfoOutput = parseRevisionInfoOutput;
exports.parseBookmarksOutput = parseBookmarksOutput;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

var _hgUtils = require('./hg-utils');

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var logger = require('../../nuclide-logging').getLogger();

/**
 * This file contains utilities for getting an expression to specify a certain
 * revision in Hg (i.e. something that can be passed to the '--rev' option of
 * an Hg command).
 * Note: "Head" in this set of helper functions refers to the "current working
 * directory parent" in Hg terms.
 */

// Section: Expression Formation

var HG_CURRENT_WORKING_DIRECTORY_PARENT = '.';

var INFO_ID_PREFIX = 'id:';
var INFO_HASH_PREFIX = 'hash:';
var INFO_TITLE_PREFIX = 'title:';
var INFO_AUTHOR_PREFIX = 'author:';
var INFO_DATE_PREFIX = 'date:';
// Exported for testing.
var INFO_REV_END_MARK = '<<NUCLIDE_REV_END_MARK>>';

exports.INFO_REV_END_MARK = INFO_REV_END_MARK;
var REVISION_INFO_TEMPLATE = INFO_ID_PREFIX + '{rev}\n' + INFO_TITLE_PREFIX + '{desc|firstline}\n' + INFO_AUTHOR_PREFIX + '{author}\n' + INFO_DATE_PREFIX + '{date|isodate}\n' + INFO_HASH_PREFIX + '{node|short}\n{desc}\n' + INFO_REV_END_MARK + '\n';

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

function expressionForRevisionsBeforeHead(numberOfRevsBefore) {
  if (numberOfRevsBefore < 0) {
    numberOfRevsBefore = 0;
  }
  return expressionForRevisionsBefore(HG_CURRENT_WORKING_DIRECTORY_PARENT, numberOfRevsBefore);
}

// Section: Revision Sets

function expressionForCommonAncestor(revision) {
  var commonAncestorExpression = 'ancestor(' + revision + ', ' + HG_CURRENT_WORKING_DIRECTORY_PARENT + ')';
  // shell-escape does not wrap ancestorExpression in quotes without this toString conversion.
  return commonAncestorExpression.toString();
}

function parseRevisionInfoOutput(revisionsInfoOutput) {
  var revisions = revisionsInfoOutput.split(INFO_REV_END_MARK);
  var revisionInfo = [];
  for (var chunk of revisions) {
    var revisionLines = chunk.trim().split('\n');
    if (revisionLines.length < 6) {
      continue;
    }
    revisionInfo.push({
      id: parseInt(revisionLines[0].slice(INFO_ID_PREFIX.length), 10),
      title: revisionLines[1].slice(INFO_TITLE_PREFIX.length),
      author: revisionLines[2].slice(INFO_AUTHOR_PREFIX.length),
      date: new Date(revisionLines[3].slice(INFO_DATE_PREFIX.length)),
      hash: revisionLines[4].slice(INFO_HASH_PREFIX.length),
      description: revisionLines.slice(5).join('\n'),
      bookmarks: []
    });
  }
  return revisionInfo;
}

// Capture the local commit id and bookmark name from the `hg bookmarks` output.
var BOOKMARK_MATCH_REGEX = /^ . ([^ ]+)\s+(\d+):([0-9a-f]+)$/;

/**
 * Parse the result of `hg bookmarks` into a `Map` from
 * revision id to a array of bookmark names applied to revision.
 */

function parseBookmarksOutput(bookmarksOutput) {
  var bookmarksLines = bookmarksOutput.split('\n');
  var commitsToBookmarks = new Map();
  for (var bookmarkLine of bookmarksLines) {
    var match = BOOKMARK_MATCH_REGEX.exec(bookmarkLine);
    if (match == null) {
      continue;
    }

    var _match = _slicedToArray(match, 3);

    var bookmarkString = _match[1];
    var commitIdString = _match[2];

    var commitId = parseInt(commitIdString, 10);
    if (!commitsToBookmarks.has(commitId)) {
      commitsToBookmarks.set(commitId, []);
    }
    var bookmarks = commitsToBookmarks.get(commitId);
    (0, _assert2['default'])(bookmarks != null);
    bookmarks.push(bookmarkString);
  }
  return commitsToBookmarks;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImhnLXJldmlzaW9uLWV4cHJlc3Npb24taGVscGVycy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7SUFzRnNCLG9DQUFvQyxxQkFBbkQsV0FDTCxRQUFnQixFQUNoQixnQkFBd0IsRUFDUDtBQUNqQixNQUFNLGtCQUFrQixHQUFHLDJCQUEyQixDQUFDLFFBQVEsQ0FBQyxDQUFDOztBQUVqRSxNQUFNLElBQUksR0FBRyxDQUNYLEtBQUssRUFDTCxZQUFZLEVBQUUsT0FBTyxFQUNyQixPQUFPLEVBQUUsa0JBQWtCLEVBQzNCLFNBQVMsRUFBRSxHQUFHLENBQ2YsQ0FBQztBQUNGLE1BQU0sT0FBTyxHQUFHO0FBQ2QsT0FBRyxFQUFFLGdCQUFnQjtHQUN0QixDQUFDOztBQUVGLE1BQUk7ZUFDdUMsTUFBTSw2QkFBZSxJQUFJLEVBQUUsT0FBTyxDQUFDOztRQUE3RCxzQkFBc0IsUUFBOUIsTUFBTTs7QUFDYixXQUFPLHNCQUFzQixDQUFDO0dBQy9CLENBQUMsT0FBTyxDQUFDLEVBQUU7QUFDVixVQUFNLENBQUMsSUFBSSxDQUFDLG9DQUFvQyxFQUFFLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBQ3ZFLFVBQU0sSUFBSSxLQUFLLENBQUMsd0RBQXdELEdBQUcsUUFBUSxDQUFDLENBQUM7R0FDdEY7Q0FDRjs7Ozs7Ozs7Ozs7Ozs7Ozs7SUFhcUIsaUNBQWlDLHFCQUFoRCxXQUNMLFlBQW9CLEVBQ3BCLFVBQWtCLEVBQ2xCLGdCQUF3QixFQUNNO0FBQzlCLE1BQU0sa0JBQWtCLEdBQU0sWUFBWSxVQUFLLFVBQVUsQUFBRSxDQUFDO0FBQzVELE1BQU0sZUFBZSxHQUFHLENBQ3RCLEtBQUssRUFBRSxZQUFZLEVBQUUsc0JBQXNCLEVBQzNDLE9BQU8sRUFBRSxrQkFBa0IsRUFDM0IsU0FBUyxFQUFFLElBQUksQ0FDaEIsQ0FBQztBQUNGLE1BQU0sYUFBYSxHQUFHLENBQUMsV0FBVyxD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LElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQztBQUN0RCxRQUFJLEtBQUssSUFBSSxJQUFJLEVBQUU7QUFDakIsZUFBUztLQUNWOztnQ0FDMEMsS0FBSzs7UUFBdkMsY0FBYztRQUFFLGNBQWM7O0FBQ3ZDLFFBQU0sUUFBUSxHQUFHLFFBQVEsQ0FBQyxjQUFjLEVBQUUsRUFBRSxDQUFDLENBQUM7QUFDOUMsUUFBSSxDQUFDLGtCQUFrQixDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsRUFBRTtBQUNyQyx3QkFBa0IsQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLEVBQUUsQ0FBQyxDQUFDO0tBQ3RDO0FBQ0QsUUFBTSxTQUFTLEdBQUcsa0JBQWtCLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQ25ELDZCQUFVLFNBQVMsSUFBSSxJQUFJLENBQUMsQ0FBQztBQUM3QixhQUFTLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDO0dBQ2hDO0FBQ0QsU0FBTyxrQkFBa0IsQ0FBQztDQUMzQiIsImZpbGUiOiJoZy1yZXZpc2lvbi1leHByZXNzaW9uLWhlbHBlcnMuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSB7UmV2aXNpb25JbmZvfSBmcm9tICcuL0hnU2VydmljZSc7XG5cbmltcG9ydCB7aGdBc3luY0V4ZWN1dGV9IGZyb20gJy4vaGctdXRpbHMnO1xuaW1wb3J0IGludmFyaWFudCBmcm9tICdhc3NlcnQnO1xuXG5jb25zdCBsb2dnZXIgPSByZXF1aXJlKCcuLi8uLi9udWNsaWRlLWxvZ2dpbmcnKS5nZXRMb2dnZXIoKTtcblxuLyoqXG4gKiBUaGlzIGZpbGUgY29udGFpbnMgdXRpbGl0aWVzIGZvciBnZXR0aW5nIGFuIGV4cHJlc3Npb24gdG8gc3BlY2lmeSBhIGNlcnRhaW5cbiAqIHJldmlzaW9uIGluIEhnIChpLmUuIHNvbWV0aGluZyB0aGF0IGNhbiBiZSBwYXNzZWQgdG8gdGhlICctLXJldicgb3B0aW9uIG9mXG4gKiBhbiBIZyBjb21tYW5kKS5cbiAqIE5vdGU6IFwiSGVhZFwiIGluIHRoaXMgc2V0IG9mIGhlbHBlciBmdW5jdGlvbnMgcmVmZXJzIHRvIHRoZSBcImN1cnJlbnQgd29ya2luZ1xuICogZGlyZWN0b3J5IHBhcmVudFwiIGluIEhnIHRlcm1zLlxuICovXG5cbi8vIFNlY3Rpb246IEV4cHJlc3Npb24gRm9ybWF0aW9uXG5cbmNvbnN0IEhHX0NVUlJFTlRfV09SS0lOR19ESVJFQ1RPUllfUEFSRU5UID0gJy4nO1xuXG5jb25zdCBJTkZPX0lEX1BSRUZJWCA9ICdpZDonO1xuY29uc3QgSU5GT19IQVNIX1BSRUZJWCA9ICdoYXNoOic7XG5jb25zdCBJTkZPX1RJVExFX1BSRUZJWCA9ICd0aXRsZTonO1xuY29uc3QgSU5GT19BVVRIT1JfUFJFRklYID0gJ2F1dGhvcjonO1xuY29uc3QgSU5GT19EQVRFX1BSRUZJWCA9ICdkYXRlOic7XG4vLyBFeHBvcnRlZCBmb3IgdGVzdGluZy5cbmV4cG9ydCBjb25zdCBJTkZPX1JFVl9FTkRfTUFSSyA9ICc8PE5VQ0xJREVfUkVWX0VORF9NQVJLPj4nO1xuXG5jb25zdCBSRVZJU0lPTl9JTkZPX1RFTVBMQVRFID0gYCR7SU5GT19JRF9QUkVGSVh9e3Jldn1cbiR7SU5GT19USVRMRV9QUkVGSVh9e2Rlc2N8Zmlyc3RsaW5lfVxuJHtJTkZPX0FVVEhPUl9QUkVGSVh9e2F1dGhvcn1cbiR7SU5GT19EQVRFX1BSRUZJWH17ZGF0ZXxpc29kYXRlfVxuJHtJTkZPX0hBU0hfUFJFRklYfXtub2RlfHNob3J0fVxue2Rlc2N9XG4ke0lORk9fUkVWX0VORF9NQVJLfVxuYDtcblxuLyoqXG4gKiBAcGFyYW0gcmV2aXNpb25FeHByZXNzaW9uIEFuIGV4cHJlc3Npb24gdGhhdCBjYW4gYmUgcGFzc2VkIHRvIGhnIGFzIGFuIGFyZ3VtZW50XG4gKiB0byB0aGUgJy0tcmV2JyBvcHRpb24uXG4gKiBAcGFyYW0gbnVtYmVyT2ZSZXZzQmVmb3JlIFRoZSBudW1iZXIgb2YgcmV2aXNpb25zIGJlZm9yZSB0aGUgY3VycmVudCByZXZpc2lvblxuICogdGhhdCB5b3Ugd2FudCBhIHJldmlzaW9uIGV4cHJlc3Npb24gZm9yLiBQYXNzaW5nIDAgaGVyZSB3aWxsIHNpbXBseSByZXR1cm4gJ3JldmlzaW9uRXhwcmVzc2lvbicuXG4gKiBAcmV0dXJuIEFuIGV4cHJlc3Npb24gZm9yIHRoZSAnbnVtYmVyT2ZSZXZzQmVmb3JlJ3RoIHJldmlzaW9uIGJlZm9yZSB0aGUgZ2l2ZW4gcmV2aXNpb24uXG4gKi9cbmZ1bmN0aW9uIGV4cHJlc3Npb25Gb3JSZXZpc2lvbnNCZWZvcmUoXG4gIHJldmlzaW9uRXhwcmVzc2lvbjogc3RyaW5nLFxuICBudW1iZXJPZlJldnNCZWZvcmU6IG51bWJlcixcbik6IHN0cmluZyB7XG4gIGlmIChudW1iZXJPZlJldnNCZWZvcmUgPT09IDApIHtcbiAgICByZXR1cm4gcmV2aXNpb25FeHByZXNzaW9uO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiByZXZpc2lvbkV4cHJlc3Npb24gKyAnficgKyBudW1iZXJPZlJldnNCZWZvcmUudG9TdHJpbmcoKTtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gZXhwcmVzc2lvbkZvclJldmlzaW9uc0JlZm9yZUhlYWQobnVtYmVyT2ZSZXZzQmVmb3JlOiBudW1iZXIpOiBzdHJpbmcge1xuICBpZiAobnVtYmVyT2ZSZXZzQmVmb3JlIDwgMCkge1xuICAgIG51bWJlck9mUmV2c0JlZm9yZSA9IDA7XG4gIH1cbiAgcmV0dXJuIGV4cHJlc3Npb25Gb3JSZXZpc2lvbnNCZWZvcmUoSEdfQ1VSUkVOVF9XT1JLSU5HX0RJUkVDVE9SWV9QQVJFTlQsIG51bWJlck9mUmV2c0JlZm9yZSk7XG59XG5cbi8vIFNlY3Rpb246IFJldmlzaW9uIFNldHNcblxuZXhwb3J0IGZ1bmN0aW9uIGV4cHJlc3Npb25Gb3JDb21tb25BbmNlc3RvcihyZXZpc2lvbjogc3RyaW5nKTogc3RyaW5nIHtcbiAgY29uc3QgY29tbW9uQW5jZXN0b3JFeHByZXNzaW9uID0gYGFuY2VzdG9yKCR7cmV2aXNpb259LCAke0hHX0NVUlJFTlRfV09SS0lOR19ESVJFQ1RPUllfUEFSRU5UfSlgO1xuICAvLyBzaGVsbC1lc2NhcGUgZG9lcyBub3Qgd3JhcCBhbmNlc3RvckV4cHJlc3Npb24gaW4gcXVvdGVzIHdpdGhvdXQgdGhpcyB0b1N0cmluZyBjb252ZXJzaW9uLlxuICByZXR1cm4gY29tbW9uQW5jZXN0b3JFeHByZXNzaW9uLnRvU3RyaW5nKCk7XG59XG5cbi8qKlxuICogQHBhcmFtIHJldmlzaW9uIFRoZSByZXZpc2lvbiBleHByZXNzaW9uIG9mIGEgcmV2aXNpb24gb2YgaW50ZXJlc3QuXG4gKiBAcGFyYW0gd29ya2luZ0RpcmVjdG9yeSBUaGUgd29ya2luZyBkaXJlY3Rvcnkgb2YgdGhlIEhnIHJlcG9zaXRvcnkuXG4gKiBAcmV0dXJuIEFuIGV4cHJlc3Npb24gZm9yIHRoZSBjb21tb24gYW5jZXN0b3Igb2YgdGhlIHJldmlzaW9uIG9mIGludGVyZXN0IGFuZFxuICogdGhlIGN1cnJlbnQgSGcgaGVhZC5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGZldGNoQ29tbW9uQW5jZXN0b3JPZkhlYWRBbmRSZXZpc2lvbihcbiAgcmV2aXNpb246IHN0cmluZyxcbiAgd29ya2luZ0RpcmVjdG9yeTogc3RyaW5nLFxuKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgY29uc3QgYW5jZXN0b3JFeHByZXNzaW9uID0gZXhwcmVzc2lvbkZvckNvbW1vbkFuY2VzdG9yKHJldmlzaW9uKTtcbiAgLy8gc2hlbGwtZXNjYXBlIGRvZXMgbm90IHdyYXAgJ3tyZXZ9JyBpbiBxdW90ZXMgdW5sZXNzIGl0IGlzIGRvdWJsZS1xdW90ZWQuXG4gIGNvbnN0IGFyZ3MgPSBbXG4gICAgJ2xvZycsXG4gICAgJy0tdGVtcGxhdGUnLCAne3Jldn0nLFxuICAgICctLXJldicsIGFuY2VzdG9yRXhwcmVzc2lvbixcbiAgICAnLS1saW1pdCcsICcxJyxcbiAgXTtcbiAgY29uc3Qgb3B0aW9ucyA9IHtcbiAgICBjd2Q6IHdvcmtpbmdEaXJlY3RvcnksXG4gIH07XG5cbiAgdHJ5IHtcbiAgICBjb25zdCB7c3Rkb3V0OiBhbmNlc3RvclJldmlzaW9uTnVtYmVyfSA9IGF3YWl0IGhnQXN5bmNFeGVjdXRlKGFyZ3MsIG9wdGlvbnMpO1xuICAgIHJldHVybiBhbmNlc3RvclJldmlzaW9uTnVtYmVyO1xuICB9IGNhdGNoIChlKSB7XG4gICAgbG9nZ2VyLndhcm4oJ0ZhaWxlZCB0byBnZXQgaGcgY29tbW9uIGFuY2VzdG9yOiAnLCBlLnN0ZGVyciwgZS5jb21tYW5kKTtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0NvdWxkIG5vdCBmZXRjaCBjb21tb24gYW5jZXN0b3Igb2YgaGVhZCBhbmQgcmV2aXNpb246ICcgKyByZXZpc2lvbik7XG4gIH1cbn1cblxuLyoqXG4gKiBAcGFyYW0gcmV2aXNpb25Gcm9tIFRoZSByZXZpc2lvbiBleHByZXNzaW9uIG9mIHRoZSBcInN0YXJ0XCIgKG9sZGVyKSByZXZpc2lvbi5cbiAqIEBwYXJhbSByZXZpc2lvblRvIFRoZSByZXZpc2lvbiBleHByZXNzaW9uIG9mIHRoZSBcImVuZFwiIChuZXdlcikgcmV2aXNpb24uXG4gKiBAcGFyYW0gd29ya2luZ0RpcmVjdG9yeSBUaGUgd29ya2luZyBkaXJlY3Rvcnkgb2YgdGhlIEhnIHJlcG9zaXRvcnkuXG4gKiBAcmV0dXJuIEFuIGFycmF5IG9mIHJldmlzaW9uIGluZm8gYmV0d2VlbiByZXZpc2lvbkZyb20gYW5kXG4gKiAgIHJldmlzaW9uVG8sIHBsdXMgcmV2aXNpb25Gcm9tIGFuZCByZXZpc2lvblRvO1xuICogXCJCZXR3ZWVuXCIgbWVhbnMgdGhhdCByZXZpc2lvbkZyb20gaXMgYW4gYW5jZXN0b3Igb2YsIGFuZFxuICogICByZXZpc2lvblRvIGlzIGEgZGVzY2VuZGFudCBvZi5cbiAqIEZvciBlYWNoIFJldmlzaW9uSW5mbywgdGhlIGBib29rbWFya3NgIGZpZWxkIHdpbGwgY29udGFpbiB0aGUgbGlzdFxuICogb2YgYm9va21hcmsgbmFtZXMgYXBwbGllZCB0byB0aGF0IHJldmlzaW9uLlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZmV0Y2hSZXZpc2lvbkluZm9CZXR3ZWVuUmV2aXNpb25zKFxuICByZXZpc2lvbkZyb206IHN0cmluZyxcbiAgcmV2aXNpb25Ubzogc3RyaW5nLFxuICB3b3JraW5nRGlyZWN0b3J5OiBzdHJpbmcsXG4pOiBQcm9taXNlPEFycmF5PFJldmlzaW9uSW5mbz4+IHtcbiAgY29uc3QgcmV2aXNpb25FeHByZXNzaW9uID0gYCR7cmV2aXNpb25Gcm9tfTo6JHtyZXZpc2lvblRvfWA7XG4gIGNvbnN0IHJldmlzaW9uTG9nQXJncyA9IFtcbiAgICAnbG9nJywgJy0tdGVtcGxhdGUnLCBSRVZJU0lPTl9JTkZPX1RFTVBMQVRFLFxuICAgICctLXJldicsIHJldmlzaW9uRXhwcmVzc2lvbixcbiAgICAnLS1saW1pdCcsICcyMCcsXG4gIF07XG4gIGNvbnN0IGJvb2ttYXJrc0FyZ3MgPSBbJ2Jvb2ttYXJrcyddO1xuICBjb25zdCBvcHRpb25zID0ge1xuICAgIGN3ZDogd29ya2luZ0RpcmVjdG9yeSxcbiAgfTtcblxuICB0cnkge1xuICAgIGNvbnN0IFtyZXZpc2lvbnNSZXN1bHQsIGJvb2ttYXJrc1Jlc3VsdF0gPSBhd2FpdCBQcm9taXNlLmFsbChbXG4gICAgICBoZ0FzeW5jRXhlY3V0ZShyZXZpc2lvbkxvZ0FyZ3MsIG9wdGlvbnMpLFxuICAgICAgaGdBc3luY0V4ZWN1dGUoYm9va21hcmtzQXJncywgb3B0aW9ucyksXG4gICAgXSk7XG4gICAgY29uc3QgcmV2aXNpb25zSW5mbyA9IHBhcnNlUmV2aXNpb25JbmZvT3V0cHV0KHJldmlzaW9uc1Jlc3VsdC5zdGRvdXQpO1xuICAgIGNvbnN0IGJvb2ttYXJrc0luZm8gPSBwYXJzZUJvb2ttYXJrc091dHB1dChib29rbWFya3NSZXN1bHQuc3Rkb3V0KTtcbiAgICBmb3IgKGNvbnN0IHJldmlzaW9uSW5mbyBvZiByZXZpc2lvbnNJbmZvKSB7XG4gICAgICByZXZpc2lvbkluZm8uYm9va21hcmtzID0gYm9va21hcmtzSW5mby5nZXQocmV2aXNpb25JbmZvLmlkKSB8fCBbXTtcbiAgICB9XG4gICAgcmV0dXJuIHJldmlzaW9uc0luZm87XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICBsb2dnZXIud2FybignRmFpbGVkIHRvIGdldCByZXZpc2lvbiBpbmZvIGJldHdlZW4gdHdvIHJldmlzaW9uczogJywgZS5zdGRlcnIgfHwgZSwgZS5jb21tYW5kKTtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICBgQ291bGQgbm90IGZldGNoIHJldmlzaW9uIG51bWJlcnMgYmV0d2VlbiB0aGUgcmV2aXNpb25zOiAke3JldmlzaW9uRnJvbX0sICR7cmV2aXNpb25Ub31gXG4gICAgKTtcbiAgfVxufVxuXG4vKipcbiAqIEhlbHBlciBmdW5jdGlvbiB0byBgZmV0Y2hSZXZpc2lvbkluZm9CZXR3ZWVuUmV2aXNpb25zYC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlUmV2aXNpb25JbmZvT3V0cHV0KHJldmlzaW9uc0luZm9PdXRwdXQ6IHN0cmluZyk6IEFycmF5PFJldmlzaW9uSW5mbz4ge1xuICBjb25zdCByZXZpc2lvbnMgPSByZXZpc2lvbnNJbmZvT3V0cHV0LnNwbGl0KElORk9fUkVWX0VORF9NQVJLKTtcbiAgY29uc3QgcmV2aXNpb25JbmZvID0gW107XG4gIGZvciAoY29uc3QgY2h1bmsgb2YgcmV2aXNpb25zKSB7XG4gICAgY29uc3QgcmV2aXNpb25MaW5lcyA9IGNodW5rLnRyaW0oKS5zcGxpdCgnXFxuJyk7XG4gICAgaWYgKHJldmlzaW9uTGluZXMubGVuZ3RoIDwgNikge1xuICAgICAgY29udGludWU7XG4gICAgfVxuICAgIHJldmlzaW9uSW5mby5wdXNoKHtcbiAgICAgIGlkOiBwYXJzZUludChyZXZpc2lvbkxpbmVzWzBdLnNsaWNlKElORk9fSURfUFJFRklYLmxlbmd0aCksIDEwKSxcbiAgICAgIHRpdGxlOiByZXZpc2lvbkxpbmVzWzFdLnNsaWNlKElORk9fVElUTEVfUFJFRklYLmxlbmd0aCksXG4gICAgICBhdXRob3I6IHJldmlzaW9uTGluZXNbMl0uc2xpY2UoSU5GT19BVVRIT1JfUFJFRklYLmxlbmd0aCksXG4gICAgICBkYXRlOiBuZXcgRGF0ZShyZXZpc2lvbkxpbmVzWzNdLnNsaWNlKElORk9fREFURV9QUkVGSVgubGVuZ3RoKSksXG4gICAgICBoYXNoOiByZXZpc2lvbkxpbmVzWzRdLnNsaWNlKElORk9fSEFTSF9QUkVGSVgubGVuZ3RoKSxcbiAgICAgIGRlc2NyaXB0aW9uOiByZXZpc2lvbkxpbmVzLnNsaWNlKDUpLmpvaW4oJ1xcbicpLFxuICAgICAgYm9va21hcmtzOiBbXSxcbiAgICB9KTtcbiAgfVxuICByZXR1cm4gcmV2aXNpb25JbmZvO1xufVxuXG4vLyBDYXB0dXJlIHRoZSBsb2NhbCBjb21taXQgaWQgYW5kIGJvb2ttYXJrIG5hbWUgZnJvbSB0aGUgYGhnIGJvb2ttYXJrc2Agb3V0cHV0LlxuY29uc3QgQk9PS01BUktfTUFUQ0hfUkVHRVggPSAvXiAuIChbXiBdKylcXHMrKFxcZCspOihbMC05YS1mXSspJC87XG5cbi8qKlxuICogUGFyc2UgdGhlIHJlc3VsdCBvZiBgaGcgYm9va21hcmtzYCBpbnRvIGEgYE1hcGAgZnJvbVxuICogcmV2aXNpb24gaWQgdG8gYSBhcnJheSBvZiBib29rbWFyayBuYW1lcyBhcHBsaWVkIHRvIHJldmlzaW9uLlxuICovXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VCb29rbWFya3NPdXRwdXQoYm9va21hcmtzT3V0cHV0OiBzdHJpbmcpOiBNYXA8bnVtYmVyLCBBcnJheTxzdHJpbmc+PiB7XG4gIGNvbnN0IGJvb2ttYXJrc0xpbmVzID0gYm9va21hcmtzT3V0cHV0LnNwbGl0KCdcXG4nKTtcbiAgY29uc3QgY29tbWl0c1RvQm9va21hcmtzID0gbmV3IE1hcCgpO1xuICBmb3IgKGNvbnN0IGJvb2ttYXJrTGluZSBvZiBib29rbWFya3NMaW5lcykge1xuICAgIGNvbnN0IG1hdGNoID0gQk9PS01BUktfTUFUQ0hfUkVHRVguZXhlYyhib29rbWFya0xpbmUpO1xuICAgIGlmIChtYXRjaCA9PSBudWxsKSB7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG4gICAgY29uc3QgWywgYm9va21hcmtTdHJpbmcsIGNvbW1pdElkU3RyaW5nXSA9IG1hdGNoO1xuICAgIGNvbnN0IGNvbW1pdElkID0gcGFyc2VJbnQoY29tbWl0SWRTdHJpbmcsIDEwKTtcbiAgICBpZiAoIWNvbW1pdHNUb0Jvb2ttYXJrcy5oYXMoY29tbWl0SWQpKSB7XG4gICAgICBjb21taXRzVG9Cb29rbWFya3Muc2V0KGNvbW1pdElkLCBbXSk7XG4gICAgfVxuICAgIGNvbnN0IGJvb2ttYXJrcyA9IGNvbW1pdHNUb0Jvb2ttYXJrcy5nZXQoY29tbWl0SWQpO1xuICAgIGludmFyaWFudChib29rbWFya3MgIT0gbnVsbCk7XG4gICAgYm9va21hcmtzLnB1c2goYm9va21hcmtTdHJpbmcpO1xuICB9XG4gIHJldHVybiBjb21taXRzVG9Cb29rbWFya3M7XG59XG4iXX0=