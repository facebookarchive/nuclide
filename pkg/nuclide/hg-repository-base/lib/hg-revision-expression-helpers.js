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
  var _require = require('../../commons');

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
  var _require2 = require('../../commons');

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

var logger = require('../../logging').getLogger();

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

var REVISION_INFO_TEMPLATE = INFO_ID_PREFIX + '{rev}\n' + INFO_TITLE_PREFIX + '{desc|firstline}\n' + INFO_AUTHOR_PREFIX + '{author}\n' + INFO_DATE_PREFIX + '{date|isodate}\n' + INFO_HASH_PREFIX + '{node|short}\n\n';

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
  var revisions = revisionsInfoOutput.split('\n\n');
  var revisionInfo = [];
  for (var chunk of revisions) {
    var revisionLines = chunk.trim().split('\n');
    if (revisionLines.length !== 5) {
      continue;
    }
    revisionInfo.push({
      id: parseInt(revisionLines[0].slice(INFO_ID_PREFIX.length), 10),
      title: revisionLines[1].slice(INFO_TITLE_PREFIX.length),
      author: revisionLines[2].slice(INFO_AUTHOR_PREFIX.length),
      date: new Date(revisionLines[3].slice(INFO_DATE_PREFIX.length)),
      hash: revisionLines[4].slice(INFO_HASH_PREFIX.length),
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImhnLXJldmlzaW9uLWV4cHJlc3Npb24taGVscGVycy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7SUFrRnNCLG9DQUFvQyxxQkFBbkQsV0FDTCxRQUFnQixFQUNoQixnQkFBd0IsRUFDUDtpQkFDTSxPQUFPLENBQUMsZUFBZSxDQUFDOztNQUF4QyxZQUFZLFlBQVosWUFBWTs7QUFFbkIsTUFBTSxrQkFBa0IsR0FBRywyQkFBMkIsQ0FBQyxRQUFRLENBQUMsQ0FBQzs7QUFFakUsTUFBTSxJQUFJLEdBQUcsQ0FBQyxLQUFLLEVBQUUsWUFBWSxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsa0JBQWtCLENBQUMsQ0FBQztBQUN6RSxNQUFNLE9BQU8sR0FBRztBQUNkLE9BQUcsRUFBRSxnQkFBZ0I7R0FDdEIsQ0FBQzs7QUFFRixNQUFJO2VBQ3VDLE1BQU0sWUFBWSxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsT0FBTyxDQUFDOztRQUFqRSxzQkFBc0IsUUFBOUIsTUFBTTs7QUFDYixXQUFPLHNCQUFzQixDQUFDO0dBQy9CLENBQUMsT0FBTyxDQUFDLEVBQUU7QUFDVixVQUFNLENBQUMsSUFBSSxDQUFDLG9DQUFvQyxFQUFFLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBQ3ZFLFVBQU0sSUFBSSxLQUFLLENBQUMsd0RBQXdELEdBQUcsUUFBUSxDQUFDLENBQUM7R0FDdEY7Q0FDRjs7Ozs7Ozs7Ozs7Ozs7Ozs7SUFhcUIsaUNBQWlDLHFCQUFoRCxXQUNMLFlBQW9CLEVBQ3BCLFVBQWtCLEVBQ2xCLGdCQUF3QixFQUNNO2tCQUNQLE9BQU8sQ0FBQyxlQUFlLENBQUM7O01BQXhDLFlBQVksYUFBWixZQUFZOztBQUVuQixNQUFNLGtCQUFrQixHQUFNLFlBQVksVUFBSyxVQUFVLEFBQUUsQ0FBQztBQUM1RCxNQUFNLGVBQWUsR0FBRyxDQUN0QixLQUFLLEVBQUUsWUFBWSxFQUFFLHNC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LElBQUksSUFBSSxFQUFFO0FBQ2pCLGVBQVM7S0FDVjs7Z0NBQzBDLEtBQUs7O1FBQXZDLGNBQWM7UUFBRSxjQUFjOztBQUN2QyxRQUFNLFFBQVEsR0FBRyxRQUFRLENBQUMsY0FBYyxFQUFFLEVBQUUsQ0FBQyxDQUFDO0FBQzlDLFFBQUksQ0FBQyxrQkFBa0IsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLEVBQUU7QUFDckMsd0JBQWtCLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxFQUFFLENBQUMsQ0FBQztLQUN0QztBQUNELFFBQU0sU0FBUyxHQUFHLGtCQUFrQixDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUNuRCw2QkFBVSxTQUFTLElBQUksSUFBSSxDQUFDLENBQUM7QUFDN0IsYUFBUyxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQztHQUNoQztBQUNELFNBQU8sa0JBQWtCLENBQUM7Q0FDM0IiLCJmaWxlIjoiaGctcmV2aXNpb24tZXhwcmVzc2lvbi1oZWxwZXJzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUge1JldmlzaW9uSW5mb30gZnJvbSAnLi9oZy1jb25zdGFudHMnO1xuXG5pbXBvcnQgaW52YXJpYW50IGZyb20gJ2Fzc2VydCc7XG5cbmNvbnN0IGxvZ2dlciA9IHJlcXVpcmUoJy4uLy4uL2xvZ2dpbmcnKS5nZXRMb2dnZXIoKTtcblxuLyoqXG4gKiBUaGlzIGZpbGUgY29udGFpbnMgdXRpbGl0aWVzIGZvciBnZXR0aW5nIGFuIGV4cHJlc3Npb24gdG8gc3BlY2lmeSBhIGNlcnRhaW5cbiAqIHJldmlzaW9uIGluIEhnIChpLmUuIHNvbWV0aGluZyB0aGF0IGNhbiBiZSBwYXNzZWQgdG8gdGhlICctLXJldicgb3B0aW9uIG9mXG4gKiBhbiBIZyBjb21tYW5kKS5cbiAqIE5vdGU6IFwiSGVhZFwiIGluIHRoaXMgc2V0IG9mIGhlbHBlciBmdW5jdGlvbnMgcmVmZXJzIHRvIHRoZSBcImN1cnJlbnQgd29ya2luZ1xuICogZGlyZWN0b3J5IHBhcmVudFwiIGluIEhnIHRlcm1zLlxuICovXG5cbi8vIFNlY3Rpb246IEV4cHJlc3Npb24gRm9ybWF0aW9uXG5cbmNvbnN0IEhHX0NVUlJFTlRfV09SS0lOR19ESVJFQ1RPUllfUEFSRU5UID0gJy4nO1xuXG5jb25zdCBJTkZPX0lEX1BSRUZJWCA9ICdpZDonO1xuY29uc3QgSU5GT19IQVNIX1BSRUZJWCA9ICdoYXNoOic7XG5jb25zdCBJTkZPX1RJVExFX1BSRUZJWCA9ICd0aXRsZTonO1xuY29uc3QgSU5GT19BVVRIT1JfUFJFRklYID0gJ2F1dGhvcjonO1xuY29uc3QgSU5GT19EQVRFX1BSRUZJWCA9ICdkYXRlOic7XG5cbmNvbnN0IFJFVklTSU9OX0lORk9fVEVNUExBVEUgPSBgJHtJTkZPX0lEX1BSRUZJWH17cmV2fVxuJHtJTkZPX1RJVExFX1BSRUZJWH17ZGVzY3xmaXJzdGxpbmV9XG4ke0lORk9fQVVUSE9SX1BSRUZJWH17YXV0aG9yfVxuJHtJTkZPX0RBVEVfUFJFRklYfXtkYXRlfGlzb2RhdGV9XG4ke0lORk9fSEFTSF9QUkVGSVh9e25vZGV8c2hvcnR9XG5cbmA7XG5cbi8qKlxuICogQHBhcmFtIHJldmlzaW9uRXhwcmVzc2lvbiBBbiBleHByZXNzaW9uIHRoYXQgY2FuIGJlIHBhc3NlZCB0byBoZyBhcyBhbiBhcmd1bWVudFxuICogdG8gdGhlICctLXJldicgb3B0aW9uLlxuICogQHBhcmFtIG51bWJlck9mUmV2c0JlZm9yZSBUaGUgbnVtYmVyIG9mIHJldmlzaW9ucyBiZWZvcmUgdGhlIGN1cnJlbnQgcmV2aXNpb25cbiAqIHRoYXQgeW91IHdhbnQgYSByZXZpc2lvbiBleHByZXNzaW9uIGZvci4gUGFzc2luZyAwIGhlcmUgd2lsbCBzaW1wbHkgcmV0dXJuICdyZXZpc2lvbkV4cHJlc3Npb24nLlxuICogQHJldHVybiBBbiBleHByZXNzaW9uIGZvciB0aGUgJ251bWJlck9mUmV2c0JlZm9yZSd0aCByZXZpc2lvbiBiZWZvcmUgdGhlIGdpdmVuIHJldmlzaW9uLlxuICovXG5mdW5jdGlvbiBleHByZXNzaW9uRm9yUmV2aXNpb25zQmVmb3JlKFxuICByZXZpc2lvbkV4cHJlc3Npb246IHN0cmluZyxcbiAgbnVtYmVyT2ZSZXZzQmVmb3JlOiBudW1iZXIsXG4pOiBzdHJpbmcge1xuICBpZiAobnVtYmVyT2ZSZXZzQmVmb3JlID09PSAwKSB7XG4gICAgcmV0dXJuIHJldmlzaW9uRXhwcmVzc2lvbjtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gcmV2aXNpb25FeHByZXNzaW9uICsgJ34nICsgbnVtYmVyT2ZSZXZzQmVmb3JlLnRvU3RyaW5nKCk7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGV4cHJlc3Npb25Gb3JSZXZpc2lvbnNCZWZvcmVIZWFkKG51bWJlck9mUmV2c0JlZm9yZTogbnVtYmVyKTogc3RyaW5nIHtcbiAgaWYgKG51bWJlck9mUmV2c0JlZm9yZSA8IDApIHtcbiAgICBudW1iZXJPZlJldnNCZWZvcmUgPSAwO1xuICB9XG4gIHJldHVybiBleHByZXNzaW9uRm9yUmV2aXNpb25zQmVmb3JlKEhHX0NVUlJFTlRfV09SS0lOR19ESVJFQ1RPUllfUEFSRU5ULCBudW1iZXJPZlJldnNCZWZvcmUpO1xufVxuXG4vLyBTZWN0aW9uOiBSZXZpc2lvbiBTZXRzXG5cbmV4cG9ydCBmdW5jdGlvbiBleHByZXNzaW9uRm9yQ29tbW9uQW5jZXN0b3IocmV2aXNpb246IHN0cmluZyk6IHN0cmluZyB7XG4gIGNvbnN0IGNvbW1vbkFuY2VzdG9yRXhwcmVzc2lvbiA9IGBhbmNlc3Rvcigke3JldmlzaW9ufSwgJHtIR19DVVJSRU5UX1dPUktJTkdfRElSRUNUT1JZX1BBUkVOVH0pYDtcbiAgLy8gc2hlbGwtZXNjYXBlIGRvZXMgbm90IHdyYXAgYW5jZXN0b3JFeHByZXNzaW9uIGluIHF1b3RlcyB3aXRob3V0IHRoaXMgdG9TdHJpbmcgY29udmVyc2lvbi5cbiAgcmV0dXJuIGNvbW1vbkFuY2VzdG9yRXhwcmVzc2lvbi50b1N0cmluZygpO1xufVxuXG4vKipcbiAqIEBwYXJhbSByZXZpc2lvbiBUaGUgcmV2aXNpb24gZXhwcmVzc2lvbiBvZiBhIHJldmlzaW9uIG9mIGludGVyZXN0LlxuICogQHBhcmFtIHdvcmtpbmdEaXJlY3RvcnkgVGhlIHdvcmtpbmcgZGlyZWN0b3J5IG9mIHRoZSBIZyByZXBvc2l0b3J5LlxuICogQHJldHVybiBBbiBleHByZXNzaW9uIGZvciB0aGUgY29tbW9uIGFuY2VzdG9yIG9mIHRoZSByZXZpc2lvbiBvZiBpbnRlcmVzdCBhbmRcbiAqIHRoZSBjdXJyZW50IEhnIGhlYWQuXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBmZXRjaENvbW1vbkFuY2VzdG9yT2ZIZWFkQW5kUmV2aXNpb24oXG4gIHJldmlzaW9uOiBzdHJpbmcsXG4gIHdvcmtpbmdEaXJlY3Rvcnk6IHN0cmluZyxcbik6IFByb21pc2U8c3RyaW5nPiB7XG4gIGNvbnN0IHthc3luY0V4ZWN1dGV9ID0gcmVxdWlyZSgnLi4vLi4vY29tbW9ucycpO1xuXG4gIGNvbnN0IGFuY2VzdG9yRXhwcmVzc2lvbiA9IGV4cHJlc3Npb25Gb3JDb21tb25BbmNlc3RvcihyZXZpc2lvbik7XG4gIC8vIHNoZWxsLWVzY2FwZSBkb2VzIG5vdCB3cmFwICd7cmV2fScgaW4gcXVvdGVzIHVubGVzcyBpdCBpcyBkb3VibGUtcXVvdGVkLlxuICBjb25zdCBhcmdzID0gWydsb2cnLCAnLS10ZW1wbGF0ZScsICd7cmV2fScsICctLXJldicsIGFuY2VzdG9yRXhwcmVzc2lvbl07XG4gIGNvbnN0IG9wdGlvbnMgPSB7XG4gICAgY3dkOiB3b3JraW5nRGlyZWN0b3J5LFxuICB9O1xuXG4gIHRyeSB7XG4gICAgY29uc3Qge3N0ZG91dDogYW5jZXN0b3JSZXZpc2lvbk51bWJlcn0gPSBhd2FpdCBhc3luY0V4ZWN1dGUoJ2hnJywgYXJncywgb3B0aW9ucyk7XG4gICAgcmV0dXJuIGFuY2VzdG9yUmV2aXNpb25OdW1iZXI7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICBsb2dnZXIud2FybignRmFpbGVkIHRvIGdldCBoZyBjb21tb24gYW5jZXN0b3I6ICcsIGUuc3RkZXJyLCBlLmNvbW1hbmQpO1xuICAgIHRocm93IG5ldyBFcnJvcignQ291bGQgbm90IGZldGNoIGNvbW1vbiBhbmNlc3RvciBvZiBoZWFkIGFuZCByZXZpc2lvbjogJyArIHJldmlzaW9uKTtcbiAgfVxufVxuXG4vKipcbiAqIEBwYXJhbSByZXZpc2lvbkZyb20gVGhlIHJldmlzaW9uIGV4cHJlc3Npb24gb2YgdGhlIFwic3RhcnRcIiAob2xkZXIpIHJldmlzaW9uLlxuICogQHBhcmFtIHJldmlzaW9uVG8gVGhlIHJldmlzaW9uIGV4cHJlc3Npb24gb2YgdGhlIFwiZW5kXCIgKG5ld2VyKSByZXZpc2lvbi5cbiAqIEBwYXJhbSB3b3JraW5nRGlyZWN0b3J5IFRoZSB3b3JraW5nIGRpcmVjdG9yeSBvZiB0aGUgSGcgcmVwb3NpdG9yeS5cbiAqIEByZXR1cm4gQW4gYXJyYXkgb2YgcmV2aXNpb24gaW5mbyBiZXR3ZWVuIHJldmlzaW9uRnJvbSBhbmRcbiAqICAgcmV2aXNpb25UbywgcGx1cyByZXZpc2lvbkZyb20gYW5kIHJldmlzaW9uVG87XG4gKiBcIkJldHdlZW5cIiBtZWFucyB0aGF0IHJldmlzaW9uRnJvbSBpcyBhbiBhbmNlc3RvciBvZiwgYW5kXG4gKiAgIHJldmlzaW9uVG8gaXMgYSBkZXNjZW5kYW50IG9mLlxuICogRm9yIGVhY2ggUmV2aXNpb25JbmZvLCB0aGUgYGJvb2ttYXJrc2AgZmllbGQgd2lsbCBjb250YWluIHRoZSBsaXN0XG4gKiBvZiBib29rbWFyayBuYW1lcyBhcHBsaWVkIHRvIHRoYXQgcmV2aXNpb24uXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBmZXRjaFJldmlzaW9uSW5mb0JldHdlZW5SZXZpc2lvbnMoXG4gIHJldmlzaW9uRnJvbTogc3RyaW5nLFxuICByZXZpc2lvblRvOiBzdHJpbmcsXG4gIHdvcmtpbmdEaXJlY3Rvcnk6IHN0cmluZyxcbik6IFByb21pc2U8QXJyYXk8UmV2aXNpb25JbmZvPj4ge1xuICBjb25zdCB7YXN5bmNFeGVjdXRlfSA9IHJlcXVpcmUoJy4uLy4uL2NvbW1vbnMnKTtcblxuICBjb25zdCByZXZpc2lvbkV4cHJlc3Npb24gPSBgJHtyZXZpc2lvbkZyb219Ojoke3JldmlzaW9uVG99YDtcbiAgY29uc3QgcmV2aXNpb25Mb2dBcmdzID0gW1xuICAgICdsb2cnLCAnLS10ZW1wbGF0ZScsIFJFVklTSU9OX0lORk9fVEVNUExBVEUsXG4gICAgJy0tcmV2JywgcmV2aXNpb25FeHByZXNzaW9uLFxuICBdO1xuICBjb25zdCBib29rbWFya3NBcmdzID0gWydib29rbWFya3MnXTtcbiAgY29uc3Qgb3B0aW9ucyA9IHtcbiAgICBjd2Q6IHdvcmtpbmdEaXJlY3RvcnksXG4gIH07XG5cbiAgdHJ5IHtcbiAgICBjb25zdCBbcmV2aXNpb25zUmVzdWx0LCBib29rbWFya3NSZXN1bHRdID0gYXdhaXQgUHJvbWlzZS5hbGwoW1xuICAgICAgYXN5bmNFeGVjdXRlKCdoZycsIHJldmlzaW9uTG9nQXJncywgb3B0aW9ucyksXG4gICAgICBhc3luY0V4ZWN1dGUoJ2hnJywgYm9va21hcmtzQXJncywgb3B0aW9ucyksXG4gICAgXSk7XG4gICAgY29uc3QgcmV2aXNpb25zSW5mbyA9IHBhcnNlUmV2aXNpb25JbmZvT3V0cHV0KHJldmlzaW9uc1Jlc3VsdC5zdGRvdXQpO1xuICAgIGNvbnN0IGJvb2ttYXJrc0luZm8gPSBwYXJzZUJvb2ttYXJrc091dHB1dChib29rbWFya3NSZXN1bHQuc3Rkb3V0KTtcbiAgICBmb3IgKGNvbnN0IHJldmlzaW9uSW5mbyBvZiByZXZpc2lvbnNJbmZvKSB7XG4gICAgICByZXZpc2lvbkluZm8uYm9va21hcmtzID0gYm9va21hcmtzSW5mby5nZXQocmV2aXNpb25JbmZvLmlkKSB8fCBbXTtcbiAgICB9XG4gICAgcmV0dXJuIHJldmlzaW9uc0luZm87XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICBsb2dnZXIud2FybignRmFpbGVkIHRvIGdldCByZXZpc2lvbiBpbmZvIGJldHdlZW4gdHdvIHJldmlzaW9uczogJywgZS5zdGRlcnIgfHwgZSwgZS5jb21tYW5kKTtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICBgQ291bGQgbm90IGZldGNoIHJldmlzaW9uIG51bWJlcnMgYmV0d2VlbiB0aGUgcmV2aXNpb25zOiAke3JldmlzaW9uRnJvbX0sICR7cmV2aXNpb25Ub31gXG4gICAgKTtcbiAgfVxufVxuXG4vKipcbiAqIEhlbHBlciBmdW5jdGlvbiB0byBgZmV0Y2hSZXZpc2lvbkluZm9CZXR3ZWVuUmV2aXNpb25zYC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlUmV2aXNpb25JbmZvT3V0cHV0KHJldmlzaW9uc0luZm9PdXRwdXQ6IHN0cmluZyk6IEFycmF5PFJldmlzaW9uSW5mbz4ge1xuICBjb25zdCByZXZpc2lvbnMgPSByZXZpc2lvbnNJbmZvT3V0cHV0LnNwbGl0KCdcXG5cXG4nKTtcbiAgY29uc3QgcmV2aXNpb25JbmZvID0gW107XG4gIGZvciAoY29uc3QgY2h1bmsgb2YgcmV2aXNpb25zKSB7XG4gICAgY29uc3QgcmV2aXNpb25MaW5lcyA9IGNodW5rLnRyaW0oKS5zcGxpdCgnXFxuJyk7XG4gICAgaWYgKHJldmlzaW9uTGluZXMubGVuZ3RoICE9PSA1KSB7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG4gICAgcmV2aXNpb25JbmZvLnB1c2goe1xuICAgICAgaWQ6IHBhcnNlSW50KHJldmlzaW9uTGluZXNbMF0uc2xpY2UoSU5GT19JRF9QUkVGSVgubGVuZ3RoKSwgMTApLFxuICAgICAgdGl0bGU6IHJldmlzaW9uTGluZXNbMV0uc2xpY2UoSU5GT19USVRMRV9QUkVGSVgubGVuZ3RoKSxcbiAgICAgIGF1dGhvcjogcmV2aXNpb25MaW5lc1syXS5zbGljZShJTkZPX0FVVEhPUl9QUkVGSVgubGVuZ3RoKSxcbiAgICAgIGRhdGU6IG5ldyBEYXRlKHJldmlzaW9uTGluZXNbM10uc2xpY2UoSU5GT19EQVRFX1BSRUZJWC5sZW5ndGgpKSxcbiAgICAgIGhhc2g6IHJldmlzaW9uTGluZXNbNF0uc2xpY2UoSU5GT19IQVNIX1BSRUZJWC5sZW5ndGgpLFxuICAgICAgYm9va21hcmtzOiBbXSxcbiAgICB9KTtcbiAgfVxuICByZXR1cm4gcmV2aXNpb25JbmZvO1xufVxuXG4vLyBDYXB0dXJlIHRoZSBsb2NhbCBjb21taXQgaWQgYW5kIGJvb2ttYXJrIG5hbWUgZnJvbSB0aGUgYGhnIGJvb2ttYXJrc2Agb3V0cHV0LlxuY29uc3QgQk9PS01BUktfTUFUQ0hfUkVHRVggPSAvXiAuIChbXiBdKylcXHMrKFxcZCspOihbMC05YS1mXSspJC87XG5cbi8qKlxuICogUGFyc2UgdGhlIHJlc3VsdCBvZiBgaGcgYm9va21hcmtzYCBpbnRvIGEgYE1hcGAgZnJvbVxuICogcmV2aXNpb24gaWQgdG8gYSBhcnJheSBvZiBib29rbWFyayBuYW1lcyBhcHBsaWVkIHRvIHJldmlzaW9uLlxuICovXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VCb29rbWFya3NPdXRwdXQoYm9va21hcmtzT3V0cHV0OiBzdHJpbmcpOiBNYXA8bnVtYmVyLCBBcnJheTxzdHJpbmc+PiB7XG4gIGNvbnN0IGJvb2ttYXJrc0xpbmVzID0gYm9va21hcmtzT3V0cHV0LnNwbGl0KCdcXG4nKTtcbiAgY29uc3QgY29tbWl0c1RvQm9va21hcmtzID0gbmV3IE1hcCgpO1xuICBmb3IgKGNvbnN0IGJvb2ttYXJrTGluZSBvZiBib29rbWFya3NMaW5lcykge1xuICAgIGNvbnN0IG1hdGNoID0gQk9PS01BUktfTUFUQ0hfUkVHRVguZXhlYyhib29rbWFya0xpbmUpO1xuICAgIGlmIChtYXRjaCA9PSBudWxsKSB7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG4gICAgY29uc3QgWywgYm9va21hcmtTdHJpbmcsIGNvbW1pdElkU3RyaW5nXSA9IG1hdGNoO1xuICAgIGNvbnN0IGNvbW1pdElkID0gcGFyc2VJbnQoY29tbWl0SWRTdHJpbmcsIDEwKTtcbiAgICBpZiAoIWNvbW1pdHNUb0Jvb2ttYXJrcy5oYXMoY29tbWl0SWQpKSB7XG4gICAgICBjb21taXRzVG9Cb29rbWFya3Muc2V0KGNvbW1pdElkLCBbXSk7XG4gICAgfVxuICAgIGNvbnN0IGJvb2ttYXJrcyA9IGNvbW1pdHNUb0Jvb2ttYXJrcy5nZXQoY29tbWl0SWQpO1xuICAgIGludmFyaWFudChib29rbWFya3MgIT0gbnVsbCk7XG4gICAgYm9va21hcmtzLnB1c2goYm9va21hcmtTdHJpbmcpO1xuICB9XG4gIHJldHVybiBjb21taXRzVG9Cb29rbWFya3M7XG59XG4iXX0=