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
  var _require = require('../../nuclide-commons');

  var asyncExecute = _require.asyncExecute;

  var ancestorExpression = expressionForCommonAncestor(revision);
  // shell-escape does not wrap '{rev}' in quotes unless it is double-quoted.
  var args = ['log', '--template', '{rev}', '--rev', ancestorExpression];
  var options = {
    cwd: workingDirectory
  };

  try {
    var _ref = yield asyncExecute('hg', args, options);

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
  var _require2 = require('../../nuclide-commons');

  var asyncExecute = _require2.asyncExecute;

  var revisionExpression = revisionFrom + '::' + revisionTo;
  var revisionLogArgs = ['log', '--template', REVISION_INFO_TEMPLATE, '--rev', revisionExpression];
  var bookmarksArgs = ['bookmarks'];
  var options = {
    cwd: workingDirectory
  };

  try {
    var _ref2 = yield Promise.all([asyncExecute('hg', revisionLogArgs, options), asyncExecute('hg', bookmarksArgs, options)]);

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImhnLXJldmlzaW9uLWV4cHJlc3Npb24taGVscGVycy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7SUFxRnNCLG9DQUFvQyxxQkFBbkQsV0FDTCxRQUFnQixFQUNoQixnQkFBd0IsRUFDUDtpQkFDTSxPQUFPLENBQUMsdUJBQXVCLENBQUM7O01BQWhELFlBQVksWUFBWixZQUFZOztBQUVuQixNQUFNLGtCQUFrQixHQUFHLDJCQUEyQixDQUFDLFFBQVEsQ0FBQyxDQUFDOztBQUVqRSxNQUFNLElBQUksR0FBRyxDQUFDLEtBQUssRUFBRSxZQUFZLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxrQkFBa0IsQ0FBQyxDQUFDO0FBQ3pFLE1BQU0sT0FBTyxHQUFHO0FBQ2QsT0FBRyxFQUFFLGdCQUFnQjtHQUN0QixDQUFDOztBQUVGLE1BQUk7ZUFDdUMsTUFBTSxZQUFZLENBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxPQUFPLENBQUM7O1FBQWpFLHNCQUFzQixRQUE5QixNQUFNOztBQUNiLFdBQU8sc0JBQXNCLENBQUM7R0FDL0IsQ0FBQyxPQUFPLENBQUMsRUFBRTtBQUNWLFVBQU0sQ0FBQyxJQUFJLENBQUMsb0NBQW9DLEVBQUUsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUM7QUFDdkUsVUFBTSxJQUFJLEtBQUssQ0FBQyx3REFBd0QsR0FBRyxRQUFRLENBQUMsQ0FBQztHQUN0RjtDQUNGOzs7Ozs7Ozs7Ozs7Ozs7OztJQWFxQixpQ0FBaUMscUJBQWhELFdBQ0wsWUFBb0IsRUFDcEIsVUFBa0IsRUFDbEIsZ0JBQXdCLEVBQ007a0JBQ1AsT0FBTyxDQUFDLHVCQUF1QixDQUFDOztNQUFoRCxZQUFZLGFBQVosWUFBWTs7QUFFbkIsTUFBTSxrQkFBa0IsR0FBTSxZQUFZLFVBQUssVUFBVSxBQUFFLENBQUM7QUFDNUQsTUFBTSxlQUFlLEdBQUcsQ0FDdEIsS0FBSyxFQUFFLFlBQVksRUFB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LElBQUksR0FBRyxFQUFFLENBQUM7QUFDckMsT0FBSyxJQUFNLFlBQVksSUFBSSxjQUFjLEVBQUU7QUFDekMsUUFBTSxLQUFLLEdBQUcsb0JBQW9CLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDO0FBQ3RELFFBQUksS0FBSyxJQUFJLElBQUksRUFBRTtBQUNqQixlQUFTO0tBQ1Y7O2dDQUMwQyxLQUFLOztRQUF2QyxjQUFjO1FBQUUsY0FBYzs7QUFDdkMsUUFBTSxRQUFRLEdBQUcsUUFBUSxDQUFDLGNBQWMsRUFBRSxFQUFFLENBQUMsQ0FBQztBQUM5QyxRQUFJLENBQUMsa0JBQWtCLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxFQUFFO0FBQ3JDLHdCQUFrQixDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsRUFBRSxDQUFDLENBQUM7S0FDdEM7QUFDRCxRQUFNLFNBQVMsR0FBRyxrQkFBa0IsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDbkQsNkJBQVUsU0FBUyxJQUFJLElBQUksQ0FBQyxDQUFDO0FBQzdCLGFBQVMsQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUM7R0FDaEM7QUFDRCxTQUFPLGtCQUFrQixDQUFDO0NBQzNCIiwiZmlsZSI6ImhnLXJldmlzaW9uLWV4cHJlc3Npb24taGVscGVycy5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtSZXZpc2lvbkluZm99IGZyb20gJy4vSGdTZXJ2aWNlJztcblxuaW1wb3J0IGludmFyaWFudCBmcm9tICdhc3NlcnQnO1xuXG5jb25zdCBsb2dnZXIgPSByZXF1aXJlKCcuLi8uLi9udWNsaWRlLWxvZ2dpbmcnKS5nZXRMb2dnZXIoKTtcblxuLyoqXG4gKiBUaGlzIGZpbGUgY29udGFpbnMgdXRpbGl0aWVzIGZvciBnZXR0aW5nIGFuIGV4cHJlc3Npb24gdG8gc3BlY2lmeSBhIGNlcnRhaW5cbiAqIHJldmlzaW9uIGluIEhnIChpLmUuIHNvbWV0aGluZyB0aGF0IGNhbiBiZSBwYXNzZWQgdG8gdGhlICctLXJldicgb3B0aW9uIG9mXG4gKiBhbiBIZyBjb21tYW5kKS5cbiAqIE5vdGU6IFwiSGVhZFwiIGluIHRoaXMgc2V0IG9mIGhlbHBlciBmdW5jdGlvbnMgcmVmZXJzIHRvIHRoZSBcImN1cnJlbnQgd29ya2luZ1xuICogZGlyZWN0b3J5IHBhcmVudFwiIGluIEhnIHRlcm1zLlxuICovXG5cbi8vIFNlY3Rpb246IEV4cHJlc3Npb24gRm9ybWF0aW9uXG5cbmNvbnN0IEhHX0NVUlJFTlRfV09SS0lOR19ESVJFQ1RPUllfUEFSRU5UID0gJy4nO1xuXG5jb25zdCBJTkZPX0lEX1BSRUZJWCA9ICdpZDonO1xuY29uc3QgSU5GT19IQVNIX1BSRUZJWCA9ICdoYXNoOic7XG5jb25zdCBJTkZPX1RJVExFX1BSRUZJWCA9ICd0aXRsZTonO1xuY29uc3QgSU5GT19BVVRIT1JfUFJFRklYID0gJ2F1dGhvcjonO1xuY29uc3QgSU5GT19EQVRFX1BSRUZJWCA9ICdkYXRlOic7XG4vLyBFeHBvcnRlZCBmb3IgdGVzdGluZy5cbmV4cG9ydCBjb25zdCBJTkZPX1JFVl9FTkRfTUFSSyA9ICc8PE5VQ0xJREVfUkVWX0VORF9NQVJLPj4nO1xuXG5jb25zdCBSRVZJU0lPTl9JTkZPX1RFTVBMQVRFID0gYCR7SU5GT19JRF9QUkVGSVh9e3Jldn1cbiR7SU5GT19USVRMRV9QUkVGSVh9e2Rlc2N8Zmlyc3RsaW5lfVxuJHtJTkZPX0FVVEhPUl9QUkVGSVh9e2F1dGhvcn1cbiR7SU5GT19EQVRFX1BSRUZJWH17ZGF0ZXxpc29kYXRlfVxuJHtJTkZPX0hBU0hfUFJFRklYfXtub2RlfHNob3J0fVxue2Rlc2N9XG4ke0lORk9fUkVWX0VORF9NQVJLfVxuYDtcblxuLyoqXG4gKiBAcGFyYW0gcmV2aXNpb25FeHByZXNzaW9uIEFuIGV4cHJlc3Npb24gdGhhdCBjYW4gYmUgcGFzc2VkIHRvIGhnIGFzIGFuIGFyZ3VtZW50XG4gKiB0byB0aGUgJy0tcmV2JyBvcHRpb24uXG4gKiBAcGFyYW0gbnVtYmVyT2ZSZXZzQmVmb3JlIFRoZSBudW1iZXIgb2YgcmV2aXNpb25zIGJlZm9yZSB0aGUgY3VycmVudCByZXZpc2lvblxuICogdGhhdCB5b3Ugd2FudCBhIHJldmlzaW9uIGV4cHJlc3Npb24gZm9yLiBQYXNzaW5nIDAgaGVyZSB3aWxsIHNpbXBseSByZXR1cm4gJ3JldmlzaW9uRXhwcmVzc2lvbicuXG4gKiBAcmV0dXJuIEFuIGV4cHJlc3Npb24gZm9yIHRoZSAnbnVtYmVyT2ZSZXZzQmVmb3JlJ3RoIHJldmlzaW9uIGJlZm9yZSB0aGUgZ2l2ZW4gcmV2aXNpb24uXG4gKi9cbmZ1bmN0aW9uIGV4cHJlc3Npb25Gb3JSZXZpc2lvbnNCZWZvcmUoXG4gIHJldmlzaW9uRXhwcmVzc2lvbjogc3RyaW5nLFxuICBudW1iZXJPZlJldnNCZWZvcmU6IG51bWJlcixcbik6IHN0cmluZyB7XG4gIGlmIChudW1iZXJPZlJldnNCZWZvcmUgPT09IDApIHtcbiAgICByZXR1cm4gcmV2aXNpb25FeHByZXNzaW9uO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiByZXZpc2lvbkV4cHJlc3Npb24gKyAnficgKyBudW1iZXJPZlJldnNCZWZvcmUudG9TdHJpbmcoKTtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gZXhwcmVzc2lvbkZvclJldmlzaW9uc0JlZm9yZUhlYWQobnVtYmVyT2ZSZXZzQmVmb3JlOiBudW1iZXIpOiBzdHJpbmcge1xuICBpZiAobnVtYmVyT2ZSZXZzQmVmb3JlIDwgMCkge1xuICAgIG51bWJlck9mUmV2c0JlZm9yZSA9IDA7XG4gIH1cbiAgcmV0dXJuIGV4cHJlc3Npb25Gb3JSZXZpc2lvbnNCZWZvcmUoSEdfQ1VSUkVOVF9XT1JLSU5HX0RJUkVDVE9SWV9QQVJFTlQsIG51bWJlck9mUmV2c0JlZm9yZSk7XG59XG5cbi8vIFNlY3Rpb246IFJldmlzaW9uIFNldHNcblxuZXhwb3J0IGZ1bmN0aW9uIGV4cHJlc3Npb25Gb3JDb21tb25BbmNlc3RvcihyZXZpc2lvbjogc3RyaW5nKTogc3RyaW5nIHtcbiAgY29uc3QgY29tbW9uQW5jZXN0b3JFeHByZXNzaW9uID0gYGFuY2VzdG9yKCR7cmV2aXNpb259LCAke0hHX0NVUlJFTlRfV09SS0lOR19ESVJFQ1RPUllfUEFSRU5UfSlgO1xuICAvLyBzaGVsbC1lc2NhcGUgZG9lcyBub3Qgd3JhcCBhbmNlc3RvckV4cHJlc3Npb24gaW4gcXVvdGVzIHdpdGhvdXQgdGhpcyB0b1N0cmluZyBjb252ZXJzaW9uLlxuICByZXR1cm4gY29tbW9uQW5jZXN0b3JFeHByZXNzaW9uLnRvU3RyaW5nKCk7XG59XG5cbi8qKlxuICogQHBhcmFtIHJldmlzaW9uIFRoZSByZXZpc2lvbiBleHByZXNzaW9uIG9mIGEgcmV2aXNpb24gb2YgaW50ZXJlc3QuXG4gKiBAcGFyYW0gd29ya2luZ0RpcmVjdG9yeSBUaGUgd29ya2luZyBkaXJlY3Rvcnkgb2YgdGhlIEhnIHJlcG9zaXRvcnkuXG4gKiBAcmV0dXJuIEFuIGV4cHJlc3Npb24gZm9yIHRoZSBjb21tb24gYW5jZXN0b3Igb2YgdGhlIHJldmlzaW9uIG9mIGludGVyZXN0IGFuZFxuICogdGhlIGN1cnJlbnQgSGcgaGVhZC5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGZldGNoQ29tbW9uQW5jZXN0b3JPZkhlYWRBbmRSZXZpc2lvbihcbiAgcmV2aXNpb246IHN0cmluZyxcbiAgd29ya2luZ0RpcmVjdG9yeTogc3RyaW5nLFxuKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgY29uc3Qge2FzeW5jRXhlY3V0ZX0gPSByZXF1aXJlKCcuLi8uLi9udWNsaWRlLWNvbW1vbnMnKTtcblxuICBjb25zdCBhbmNlc3RvckV4cHJlc3Npb24gPSBleHByZXNzaW9uRm9yQ29tbW9uQW5jZXN0b3IocmV2aXNpb24pO1xuICAvLyBzaGVsbC1lc2NhcGUgZG9lcyBub3Qgd3JhcCAne3Jldn0nIGluIHF1b3RlcyB1bmxlc3MgaXQgaXMgZG91YmxlLXF1b3RlZC5cbiAgY29uc3QgYXJncyA9IFsnbG9nJywgJy0tdGVtcGxhdGUnLCAne3Jldn0nLCAnLS1yZXYnLCBhbmNlc3RvckV4cHJlc3Npb25dO1xuICBjb25zdCBvcHRpb25zID0ge1xuICAgIGN3ZDogd29ya2luZ0RpcmVjdG9yeSxcbiAgfTtcblxuICB0cnkge1xuICAgIGNvbnN0IHtzdGRvdXQ6IGFuY2VzdG9yUmV2aXNpb25OdW1iZXJ9ID0gYXdhaXQgYXN5bmNFeGVjdXRlKCdoZycsIGFyZ3MsIG9wdGlvbnMpO1xuICAgIHJldHVybiBhbmNlc3RvclJldmlzaW9uTnVtYmVyO1xuICB9IGNhdGNoIChlKSB7XG4gICAgbG9nZ2VyLndhcm4oJ0ZhaWxlZCB0byBnZXQgaGcgY29tbW9uIGFuY2VzdG9yOiAnLCBlLnN0ZGVyciwgZS5jb21tYW5kKTtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0NvdWxkIG5vdCBmZXRjaCBjb21tb24gYW5jZXN0b3Igb2YgaGVhZCBhbmQgcmV2aXNpb246ICcgKyByZXZpc2lvbik7XG4gIH1cbn1cblxuLyoqXG4gKiBAcGFyYW0gcmV2aXNpb25Gcm9tIFRoZSByZXZpc2lvbiBleHByZXNzaW9uIG9mIHRoZSBcInN0YXJ0XCIgKG9sZGVyKSByZXZpc2lvbi5cbiAqIEBwYXJhbSByZXZpc2lvblRvIFRoZSByZXZpc2lvbiBleHByZXNzaW9uIG9mIHRoZSBcImVuZFwiIChuZXdlcikgcmV2aXNpb24uXG4gKiBAcGFyYW0gd29ya2luZ0RpcmVjdG9yeSBUaGUgd29ya2luZyBkaXJlY3Rvcnkgb2YgdGhlIEhnIHJlcG9zaXRvcnkuXG4gKiBAcmV0dXJuIEFuIGFycmF5IG9mIHJldmlzaW9uIGluZm8gYmV0d2VlbiByZXZpc2lvbkZyb20gYW5kXG4gKiAgIHJldmlzaW9uVG8sIHBsdXMgcmV2aXNpb25Gcm9tIGFuZCByZXZpc2lvblRvO1xuICogXCJCZXR3ZWVuXCIgbWVhbnMgdGhhdCByZXZpc2lvbkZyb20gaXMgYW4gYW5jZXN0b3Igb2YsIGFuZFxuICogICByZXZpc2lvblRvIGlzIGEgZGVzY2VuZGFudCBvZi5cbiAqIEZvciBlYWNoIFJldmlzaW9uSW5mbywgdGhlIGBib29rbWFya3NgIGZpZWxkIHdpbGwgY29udGFpbiB0aGUgbGlzdFxuICogb2YgYm9va21hcmsgbmFtZXMgYXBwbGllZCB0byB0aGF0IHJldmlzaW9uLlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZmV0Y2hSZXZpc2lvbkluZm9CZXR3ZWVuUmV2aXNpb25zKFxuICByZXZpc2lvbkZyb206IHN0cmluZyxcbiAgcmV2aXNpb25Ubzogc3RyaW5nLFxuICB3b3JraW5nRGlyZWN0b3J5OiBzdHJpbmcsXG4pOiBQcm9taXNlPEFycmF5PFJldmlzaW9uSW5mbz4+IHtcbiAgY29uc3Qge2FzeW5jRXhlY3V0ZX0gPSByZXF1aXJlKCcuLi8uLi9udWNsaWRlLWNvbW1vbnMnKTtcblxuICBjb25zdCByZXZpc2lvbkV4cHJlc3Npb24gPSBgJHtyZXZpc2lvbkZyb219Ojoke3JldmlzaW9uVG99YDtcbiAgY29uc3QgcmV2aXNpb25Mb2dBcmdzID0gW1xuICAgICdsb2cnLCAnLS10ZW1wbGF0ZScsIFJFVklTSU9OX0lORk9fVEVNUExBVEUsXG4gICAgJy0tcmV2JywgcmV2aXNpb25FeHByZXNzaW9uLFxuICBdO1xuICBjb25zdCBib29rbWFya3NBcmdzID0gWydib29rbWFya3MnXTtcbiAgY29uc3Qgb3B0aW9ucyA9IHtcbiAgICBjd2Q6IHdvcmtpbmdEaXJlY3RvcnksXG4gIH07XG5cbiAgdHJ5IHtcbiAgICBjb25zdCBbcmV2aXNpb25zUmVzdWx0LCBib29rbWFya3NSZXN1bHRdID0gYXdhaXQgUHJvbWlzZS5hbGwoW1xuICAgICAgYXN5bmNFeGVjdXRlKCdoZycsIHJldmlzaW9uTG9nQXJncywgb3B0aW9ucyksXG4gICAgICBhc3luY0V4ZWN1dGUoJ2hnJywgYm9va21hcmtzQXJncywgb3B0aW9ucyksXG4gICAgXSk7XG4gICAgY29uc3QgcmV2aXNpb25zSW5mbyA9IHBhcnNlUmV2aXNpb25JbmZvT3V0cHV0KHJldmlzaW9uc1Jlc3VsdC5zdGRvdXQpO1xuICAgIGNvbnN0IGJvb2ttYXJrc0luZm8gPSBwYXJzZUJvb2ttYXJrc091dHB1dChib29rbWFya3NSZXN1bHQuc3Rkb3V0KTtcbiAgICBmb3IgKGNvbnN0IHJldmlzaW9uSW5mbyBvZiByZXZpc2lvbnNJbmZvKSB7XG4gICAgICByZXZpc2lvbkluZm8uYm9va21hcmtzID0gYm9va21hcmtzSW5mby5nZXQocmV2aXNpb25JbmZvLmlkKSB8fCBbXTtcbiAgICB9XG4gICAgcmV0dXJuIHJldmlzaW9uc0luZm87XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICBsb2dnZXIud2FybignRmFpbGVkIHRvIGdldCByZXZpc2lvbiBpbmZvIGJldHdlZW4gdHdvIHJldmlzaW9uczogJywgZS5zdGRlcnIgfHwgZSwgZS5jb21tYW5kKTtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICBgQ291bGQgbm90IGZldGNoIHJldmlzaW9uIG51bWJlcnMgYmV0d2VlbiB0aGUgcmV2aXNpb25zOiAke3JldmlzaW9uRnJvbX0sICR7cmV2aXNpb25Ub31gXG4gICAgKTtcbiAgfVxufVxuXG4vKipcbiAqIEhlbHBlciBmdW5jdGlvbiB0byBgZmV0Y2hSZXZpc2lvbkluZm9CZXR3ZWVuUmV2aXNpb25zYC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlUmV2aXNpb25JbmZvT3V0cHV0KHJldmlzaW9uc0luZm9PdXRwdXQ6IHN0cmluZyk6IEFycmF5PFJldmlzaW9uSW5mbz4ge1xuICBjb25zdCByZXZpc2lvbnMgPSByZXZpc2lvbnNJbmZvT3V0cHV0LnNwbGl0KElORk9fUkVWX0VORF9NQVJLKTtcbiAgY29uc3QgcmV2aXNpb25JbmZvID0gW107XG4gIGZvciAoY29uc3QgY2h1bmsgb2YgcmV2aXNpb25zKSB7XG4gICAgY29uc3QgcmV2aXNpb25MaW5lcyA9IGNodW5rLnRyaW0oKS5zcGxpdCgnXFxuJyk7XG4gICAgaWYgKHJldmlzaW9uTGluZXMubGVuZ3RoIDwgNikge1xuICAgICAgY29udGludWU7XG4gICAgfVxuICAgIHJldmlzaW9uSW5mby5wdXNoKHtcbiAgICAgIGlkOiBwYXJzZUludChyZXZpc2lvbkxpbmVzWzBdLnNsaWNlKElORk9fSURfUFJFRklYLmxlbmd0aCksIDEwKSxcbiAgICAgIHRpdGxlOiByZXZpc2lvbkxpbmVzWzFdLnNsaWNlKElORk9fVElUTEVfUFJFRklYLmxlbmd0aCksXG4gICAgICBhdXRob3I6IHJldmlzaW9uTGluZXNbMl0uc2xpY2UoSU5GT19BVVRIT1JfUFJFRklYLmxlbmd0aCksXG4gICAgICBkYXRlOiBuZXcgRGF0ZShyZXZpc2lvbkxpbmVzWzNdLnNsaWNlKElORk9fREFURV9QUkVGSVgubGVuZ3RoKSksXG4gICAgICBoYXNoOiByZXZpc2lvbkxpbmVzWzRdLnNsaWNlKElORk9fSEFTSF9QUkVGSVgubGVuZ3RoKSxcbiAgICAgIGRlc2NyaXB0aW9uOiByZXZpc2lvbkxpbmVzLnNsaWNlKDUpLmpvaW4oJ1xcbicpLFxuICAgICAgYm9va21hcmtzOiBbXSxcbiAgICB9KTtcbiAgfVxuICByZXR1cm4gcmV2aXNpb25JbmZvO1xufVxuXG4vLyBDYXB0dXJlIHRoZSBsb2NhbCBjb21taXQgaWQgYW5kIGJvb2ttYXJrIG5hbWUgZnJvbSB0aGUgYGhnIGJvb2ttYXJrc2Agb3V0cHV0LlxuY29uc3QgQk9PS01BUktfTUFUQ0hfUkVHRVggPSAvXiAuIChbXiBdKylcXHMrKFxcZCspOihbMC05YS1mXSspJC87XG5cbi8qKlxuICogUGFyc2UgdGhlIHJlc3VsdCBvZiBgaGcgYm9va21hcmtzYCBpbnRvIGEgYE1hcGAgZnJvbVxuICogcmV2aXNpb24gaWQgdG8gYSBhcnJheSBvZiBib29rbWFyayBuYW1lcyBhcHBsaWVkIHRvIHJldmlzaW9uLlxuICovXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VCb29rbWFya3NPdXRwdXQoYm9va21hcmtzT3V0cHV0OiBzdHJpbmcpOiBNYXA8bnVtYmVyLCBBcnJheTxzdHJpbmc+PiB7XG4gIGNvbnN0IGJvb2ttYXJrc0xpbmVzID0gYm9va21hcmtzT3V0cHV0LnNwbGl0KCdcXG4nKTtcbiAgY29uc3QgY29tbWl0c1RvQm9va21hcmtzID0gbmV3IE1hcCgpO1xuICBmb3IgKGNvbnN0IGJvb2ttYXJrTGluZSBvZiBib29rbWFya3NMaW5lcykge1xuICAgIGNvbnN0IG1hdGNoID0gQk9PS01BUktfTUFUQ0hfUkVHRVguZXhlYyhib29rbWFya0xpbmUpO1xuICAgIGlmIChtYXRjaCA9PSBudWxsKSB7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG4gICAgY29uc3QgWywgYm9va21hcmtTdHJpbmcsIGNvbW1pdElkU3RyaW5nXSA9IG1hdGNoO1xuICAgIGNvbnN0IGNvbW1pdElkID0gcGFyc2VJbnQoY29tbWl0SWRTdHJpbmcsIDEwKTtcbiAgICBpZiAoIWNvbW1pdHNUb0Jvb2ttYXJrcy5oYXMoY29tbWl0SWQpKSB7XG4gICAgICBjb21taXRzVG9Cb29rbWFya3Muc2V0KGNvbW1pdElkLCBbXSk7XG4gICAgfVxuICAgIGNvbnN0IGJvb2ttYXJrcyA9IGNvbW1pdHNUb0Jvb2ttYXJrcy5nZXQoY29tbWl0SWQpO1xuICAgIGludmFyaWFudChib29rbWFya3MgIT0gbnVsbCk7XG4gICAgYm9va21hcmtzLnB1c2goYm9va21hcmtTdHJpbmcpO1xuICB9XG4gIHJldHVybiBjb21taXRzVG9Cb29rbWFya3M7XG59XG4iXX0=