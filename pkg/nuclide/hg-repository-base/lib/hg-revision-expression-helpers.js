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

// Section: Revision Sets

/**
 * @param revision The revision expression of a revision of interest.
 * @param workingDirectory The working directory of the Hg repository.
 * @return An expression for the common ancestor of the revision of interest and
 * the current Hg head.
 */

var fetchCommonAncestorOfHeadAndRevision = _asyncToGenerator(function* (revision, workingDirectory) {
  var _require = require('../../commons');

  var asyncExecute = _require.asyncExecute;

  var ancestorExpression = 'ancestor(' + revision + ', ' + HG_CURRENT_WORKING_DIRECTORY_PARENT + ')';
  // shell-escape does not wrap ancestorExpression in quotes without this toString conversion.
  ancestorExpression = ancestorExpression.toString();

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImhnLXJldmlzaW9uLWV4cHJlc3Npb24taGVscGVycy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0lBNEVzQixvQ0FBb0MscUJBQW5ELFdBQ0wsUUFBZ0IsRUFDaEIsZ0JBQXdCLEVBQ1A7aUJBQ00sT0FBTyxDQUFDLGVBQWUsQ0FBQzs7TUFBeEMsWUFBWSxZQUFaLFlBQVk7O0FBRW5CLE1BQUksa0JBQWtCLGlCQUFlLFFBQVEsVUFBSyxtQ0FBbUMsTUFBRyxDQUFDOztBQUV6RixvQkFBa0IsR0FBRyxrQkFBa0IsQ0FBQyxRQUFRLEVBQUUsQ0FBQzs7O0FBR25ELE1BQU0sSUFBSSxHQUFHLENBQUMsS0FBSyxFQUFFLFlBQVksRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLGtCQUFrQixDQUFDLENBQUM7QUFDekUsTUFBTSxPQUFPLEdBQUc7QUFDZCxPQUFHLEVBQUUsZ0JBQWdCO0dBQ3RCLENBQUM7O0FBRUYsTUFBSTtlQUN1QyxNQUFNLFlBQVksQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLE9BQU8sQ0FBQzs7UUFBakUsc0JBQXNCLFFBQTlCLE1BQU07O0FBQ2IsV0FBTyxzQkFBc0IsQ0FBQztHQUMvQixDQUFDLE9BQU8sQ0FBQyxFQUFFO0FBQ1YsVUFBTSxDQUFDLElBQUksQ0FBQyxvQ0FBb0MsRUFBRSxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUN2RSxVQUFNLElBQUksS0FBSyxDQUFDLHdEQUF3RCxHQUFHLFFBQVEsQ0FBQyxDQUFDO0dBQ3RGO0NBQ0Y7Ozs7Ozs7Ozs7Ozs7Ozs7O0lBYXFCLGlDQUFpQyxxQkFBaEQsV0FDTCxZQUFvQixFQUNwQixVQUFrQixFQUNsQixnQkFBd0IsRUFDTTtrQkFDUCxPQUFPLENBQUMsZUFBZSxDQUFDOztNQUF4QyxZQUFZLGFBQVosWUFBWTs7QUFFbkIsTUFBTSxrQkFBa0IsR0FBTSxZQUFZLFVBQUssVUFBVSxBQUFFLENBQUM7QUFDNUQsTUFBTSxlQUFlLEdBQUcsQ0FDdEIsS0FBSyxFQUFFLFlBQVksRUFBRSxzQkFBc0IsRUFDM0MsT0FBTyxFQUFFLGtCQUFrQixDQUM1QixDQUFDO0FBQ0YsTUFBTSxhQUFhLEdBQUcsQ0FBQyxXQUFXLENBQUMsQ0FBQztBQUNwQyxNQUFNLE9BQU8sR0FBRztBQUNkLE9BQUcsRUFBRSxnQkFBZ0I7R0FDdEIsQ0FBQzs7QUFFRixNQUFJO2dCQUN5QyxNQUFNLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FDM0QsWUFBWSxDQUFDLElBQUksRUFBRSxlQUFlLEVBQUUsT0FBTyxDQUFDLEVBQzVDLFlBQVksQ0FBQyxJQUFJLEVBQUUsYUFBYSxFQUFFLE9BQU8sQ0FBQyxDQUMzQyxDQUFDOzs7O1FBSEssZUFBZTtRQUFFLGVBQWU7O0FBSXZDLFFBQU0sYUFBYSxHQUFHLHVCQUF1QixDQUFDLGVBQWUsQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUN0RSxRQUFNLGFBQWEsR0FBRyxvQkFBb0IsQ0FBQyxlQUFlLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDbkUsU0FBSyxJQUFNLFlBQVksSUFBSSxhQUFhLEVBQUU7QUFDeEMsa0JBQVksQ0FBQyxTQUFTLEdBQUcsYUFBYSxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsRUFBRSxDQUFDLElBQUksRUFBRSxDQUFDO0tBQ25FO0FBQ0QsV0FBTyxhQUFhLENBQUM7R0FDdEIsQ0FBQyxPQUFPLENBQUMsRUFBRTtBQUNWLFVBQU0sQ0FBQyxJQUFJLENBQUMscURBQXFELEVBQUUsQ0FBQyxDQUFDLE1BQU0sSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBQzdGLFVBQU0sSUFBSSxLQUFLLDhEQUM4QyxZQUFZLFVBQUssVUFBVSxDQUN2RixDQUFDO0dBQ0g7Q0FDRjs7Ozs7Ozs7Ozs7Ozs7O3NCQXJJcUIsUUFBUTs7OztBQUU5QixJQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsZUFBZSxDQUFDLENBQUMsU0FBUyxFQUFFLENBQUM7Ozs7Ozs7Ozs7OztBQVlwRCxJQUFNLG1DQUFtQyxHQUFHLEdBQUcsQ0FBQzs7QUFFaEQsSUFBTSxjQUFjLEdBQUcsS0FBSyxDQUFDO0FBQzdCLElBQU0sZ0JBQWdCLEdBQUcsT0FBTyxDQUFDO0FBQ2pDLElBQU0saUJBQWlCLEdBQUcsUUFBUSxDQUFDO0FBQ25DLElBQU0sa0JBQWtCLEdBQUcsU0FBUyxDQUFDO0FBQ3JDLElBQU0sZ0JBQWdCLEdBQUcsT0FBTyxDQUFDOztBQUVqQyxJQUFNLHNCQUFzQixHQUFNLGNBQWMsZUFDOUMsaUJBQWlCLDBCQUNqQixrQkFBa0Isa0JBQ2xCLGdCQUFnQix3QkFDaEIsZ0JBQWdCLHFCQUVqQixDQUFDOzs7Ozs7Ozs7QUFTRixTQUFTLDRCQUE0QixDQUNuQyxrQkFBMEIsRUFDMUIsa0JBQTBCLEVBQ2xCO0FBQ1IsTUFBSSxrQkFBa0IsS0FBSyxDQUFDLEVBQUU7QUFDNUIsV0FBTyxrQkFBa0IsQ0FBQztHQUMzQixNQUFNO0FBQ0wsV0FBTyxrQkFBa0IsR0FBRyxHQUFHLEdBQUcsa0JBQWtCLENBQUMsUUFBUSxFQUFFLENBQUM7R0FDakU7Q0FDRjs7QUFFTSxTQUFTLGdDQUFnQyxDQUFDLGtCQUEwQixFQUFVO0FBQ25GLE1BQUksa0JBQWtCLEdBQUcsQ0FBQyxFQUFFO0FBQzFCLHNCQUFrQixHQUFHLENBQUMsQ0FBQztHQUN4QjtBQUNELFNBQU8sNEJBQTRCLENBQUMsbUNBQW1DLEVBQUUsa0JBQWtCLENBQUMsQ0FBQztDQUM5Rjs7QUFxRk0sU0FBUyx1QkFBdUIsQ0FBQyxtQkFBMkIsRUFBdUI7QUFDeEYsTUFBTSxTQUFTLEdBQUcsbUJBQW1CLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQ3BELE1BQU0sWUFBWSxHQUFHLEVBQUUsQ0FBQztBQUN4QixPQUFLLElBQU0sS0FBSyxJQUFJLFNBQVMsRUFBRTtBQUM3QixRQUFNLGFBQWEsR0FBRyxLQUFLLENBQUMsSUFBSSxFQUFFLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQy9DLFFBQUksYUFBYSxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7QUFDOUIsZUFBUztLQUNWO0FBQ0QsZ0JBQVksQ0FBQyxJQUFJLENBQUM7QUFDaEIsUUFBRSxFQUFFLFFBQVEsQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLGNBQWMsQ0FBQyxNQUFNLENBQUMsRUFBRSxFQUFFLENBQUM7QUFDL0QsV0FBSyxFQUFFLGFBQWEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsaUJBQWlCLENBQUMsTUFBTSxDQUFDO0FBQ3ZELFlBQU0sRUFBRSxhQUFhLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLGtCQUFrQixDQUFDLE1BQU0sQ0FBQztBQUN6RCxVQUFJLEVBQUUsSUFBSSxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUMvRCxVQUFJLEVBQUUsYUFBYSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLENBQUM7QUFDckQsZUFBUyxFQUFFLEVBQUU7S0FDZCxDQUFDLENBQUM7R0FDSjtBQUNELFNBQU8sWUFBWSxDQUFDO0NBQ3JCOzs7QUFHRCxJQUFNLG9CQUFvQixHQUFHLGtDQUFrQyxDQUFDOzs7Ozs7O0FBTXpELFNBQVMsb0JBQW9CLENBQUMsZUFBdUIsRUFBOEI7QUFDeEYsTUFBTSxjQUFjLEdBQUcsZUFBZSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNuRCxNQUFNLGtCQUFrQixHQUFHLElBQUksR0FBRyxFQUFFLENBQUM7QUFDckMsT0FBSyxJQUFNLFlBQVksSUFBSSxjQUFjLEVBQUU7QUFDekMsUUFBTSxLQUFLLEdBQUcsb0JBQW9CLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDO0FBQ3RELFFBQUksS0FBSyxJQUFJLElBQUksRUFBRTtBQUNqQixlQUFTO0tBQ1Y7O2dDQUMwQyxLQUFLOztRQUF2QyxjQUFjO1FBQUUsY0FBYzs7QUFDdkMsUUFBTSxRQUFRLEdBQUcsUUFBUSxDQUFDLGNBQWMsRUFBRSxFQUFFLENBQUMsQ0FBQztBQUM5QyxRQUFJLENBQUMsa0JBQWtCLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxFQUFFO0FBQ3JDLHdCQUFrQixDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsRUFBRSxDQUFDLENBQUM7S0FDdEM7QUFDRCxRQUFNLFNBQVMsR0FBRyxrQkFBa0IsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDbkQsNkJBQVUsU0FBUyxJQUFJLElBQUksQ0FBQyxDQUFDO0FBQzdCLGFBQVMsQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUM7R0FDaEM7QUFDRCxTQUFPLGtCQUFrQixDQUFDO0NBQzNCIiwiZmlsZSI6ImhnLXJldmlzaW9uLWV4cHJlc3Npb24taGVscGVycy5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtSZXZpc2lvbkluZm99IGZyb20gJy4vaGctY29uc3RhbnRzJztcblxuaW1wb3J0IGludmFyaWFudCBmcm9tICdhc3NlcnQnO1xuXG5jb25zdCBsb2dnZXIgPSByZXF1aXJlKCcuLi8uLi9sb2dnaW5nJykuZ2V0TG9nZ2VyKCk7XG5cbi8qKlxuICogVGhpcyBmaWxlIGNvbnRhaW5zIHV0aWxpdGllcyBmb3IgZ2V0dGluZyBhbiBleHByZXNzaW9uIHRvIHNwZWNpZnkgYSBjZXJ0YWluXG4gKiByZXZpc2lvbiBpbiBIZyAoaS5lLiBzb21ldGhpbmcgdGhhdCBjYW4gYmUgcGFzc2VkIHRvIHRoZSAnLS1yZXYnIG9wdGlvbiBvZlxuICogYW4gSGcgY29tbWFuZCkuXG4gKiBOb3RlOiBcIkhlYWRcIiBpbiB0aGlzIHNldCBvZiBoZWxwZXIgZnVuY3Rpb25zIHJlZmVycyB0byB0aGUgXCJjdXJyZW50IHdvcmtpbmdcbiAqIGRpcmVjdG9yeSBwYXJlbnRcIiBpbiBIZyB0ZXJtcy5cbiAqL1xuXG4vLyBTZWN0aW9uOiBFeHByZXNzaW9uIEZvcm1hdGlvblxuXG5jb25zdCBIR19DVVJSRU5UX1dPUktJTkdfRElSRUNUT1JZX1BBUkVOVCA9ICcuJztcblxuY29uc3QgSU5GT19JRF9QUkVGSVggPSAnaWQ6JztcbmNvbnN0IElORk9fSEFTSF9QUkVGSVggPSAnaGFzaDonO1xuY29uc3QgSU5GT19USVRMRV9QUkVGSVggPSAndGl0bGU6JztcbmNvbnN0IElORk9fQVVUSE9SX1BSRUZJWCA9ICdhdXRob3I6JztcbmNvbnN0IElORk9fREFURV9QUkVGSVggPSAnZGF0ZTonO1xuXG5jb25zdCBSRVZJU0lPTl9JTkZPX1RFTVBMQVRFID0gYCR7SU5GT19JRF9QUkVGSVh9e3Jldn1cbiR7SU5GT19USVRMRV9QUkVGSVh9e2Rlc2N8Zmlyc3RsaW5lfVxuJHtJTkZPX0FVVEhPUl9QUkVGSVh9e2F1dGhvcn1cbiR7SU5GT19EQVRFX1BSRUZJWH17ZGF0ZXxpc29kYXRlfVxuJHtJTkZPX0hBU0hfUFJFRklYfXtub2RlfHNob3J0fVxuXG5gO1xuXG4vKipcbiAqIEBwYXJhbSByZXZpc2lvbkV4cHJlc3Npb24gQW4gZXhwcmVzc2lvbiB0aGF0IGNhbiBiZSBwYXNzZWQgdG8gaGcgYXMgYW4gYXJndW1lbnRcbiAqIHRvIHRoZSAnLS1yZXYnIG9wdGlvbi5cbiAqIEBwYXJhbSBudW1iZXJPZlJldnNCZWZvcmUgVGhlIG51bWJlciBvZiByZXZpc2lvbnMgYmVmb3JlIHRoZSBjdXJyZW50IHJldmlzaW9uXG4gKiB0aGF0IHlvdSB3YW50IGEgcmV2aXNpb24gZXhwcmVzc2lvbiBmb3IuIFBhc3NpbmcgMCBoZXJlIHdpbGwgc2ltcGx5IHJldHVybiAncmV2aXNpb25FeHByZXNzaW9uJy5cbiAqIEByZXR1cm4gQW4gZXhwcmVzc2lvbiBmb3IgdGhlICdudW1iZXJPZlJldnNCZWZvcmUndGggcmV2aXNpb24gYmVmb3JlIHRoZSBnaXZlbiByZXZpc2lvbi5cbiAqL1xuZnVuY3Rpb24gZXhwcmVzc2lvbkZvclJldmlzaW9uc0JlZm9yZShcbiAgcmV2aXNpb25FeHByZXNzaW9uOiBzdHJpbmcsXG4gIG51bWJlck9mUmV2c0JlZm9yZTogbnVtYmVyLFxuKTogc3RyaW5nIHtcbiAgaWYgKG51bWJlck9mUmV2c0JlZm9yZSA9PT0gMCkge1xuICAgIHJldHVybiByZXZpc2lvbkV4cHJlc3Npb247XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIHJldmlzaW9uRXhwcmVzc2lvbiArICd+JyArIG51bWJlck9mUmV2c0JlZm9yZS50b1N0cmluZygpO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBleHByZXNzaW9uRm9yUmV2aXNpb25zQmVmb3JlSGVhZChudW1iZXJPZlJldnNCZWZvcmU6IG51bWJlcik6IHN0cmluZyB7XG4gIGlmIChudW1iZXJPZlJldnNCZWZvcmUgPCAwKSB7XG4gICAgbnVtYmVyT2ZSZXZzQmVmb3JlID0gMDtcbiAgfVxuICByZXR1cm4gZXhwcmVzc2lvbkZvclJldmlzaW9uc0JlZm9yZShIR19DVVJSRU5UX1dPUktJTkdfRElSRUNUT1JZX1BBUkVOVCwgbnVtYmVyT2ZSZXZzQmVmb3JlKTtcbn1cblxuLy8gU2VjdGlvbjogUmV2aXNpb24gU2V0c1xuXG4vKipcbiAqIEBwYXJhbSByZXZpc2lvbiBUaGUgcmV2aXNpb24gZXhwcmVzc2lvbiBvZiBhIHJldmlzaW9uIG9mIGludGVyZXN0LlxuICogQHBhcmFtIHdvcmtpbmdEaXJlY3RvcnkgVGhlIHdvcmtpbmcgZGlyZWN0b3J5IG9mIHRoZSBIZyByZXBvc2l0b3J5LlxuICogQHJldHVybiBBbiBleHByZXNzaW9uIGZvciB0aGUgY29tbW9uIGFuY2VzdG9yIG9mIHRoZSByZXZpc2lvbiBvZiBpbnRlcmVzdCBhbmRcbiAqIHRoZSBjdXJyZW50IEhnIGhlYWQuXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBmZXRjaENvbW1vbkFuY2VzdG9yT2ZIZWFkQW5kUmV2aXNpb24oXG4gIHJldmlzaW9uOiBzdHJpbmcsXG4gIHdvcmtpbmdEaXJlY3Rvcnk6IHN0cmluZyxcbik6IFByb21pc2U8c3RyaW5nPiB7XG4gIGNvbnN0IHthc3luY0V4ZWN1dGV9ID0gcmVxdWlyZSgnLi4vLi4vY29tbW9ucycpO1xuXG4gIGxldCBhbmNlc3RvckV4cHJlc3Npb24gPSBgYW5jZXN0b3IoJHtyZXZpc2lvbn0sICR7SEdfQ1VSUkVOVF9XT1JLSU5HX0RJUkVDVE9SWV9QQVJFTlR9KWA7XG4gIC8vIHNoZWxsLWVzY2FwZSBkb2VzIG5vdCB3cmFwIGFuY2VzdG9yRXhwcmVzc2lvbiBpbiBxdW90ZXMgd2l0aG91dCB0aGlzIHRvU3RyaW5nIGNvbnZlcnNpb24uXG4gIGFuY2VzdG9yRXhwcmVzc2lvbiA9IGFuY2VzdG9yRXhwcmVzc2lvbi50b1N0cmluZygpO1xuXG4gIC8vIHNoZWxsLWVzY2FwZSBkb2VzIG5vdCB3cmFwICd7cmV2fScgaW4gcXVvdGVzIHVubGVzcyBpdCBpcyBkb3VibGUtcXVvdGVkLlxuICBjb25zdCBhcmdzID0gWydsb2cnLCAnLS10ZW1wbGF0ZScsICd7cmV2fScsICctLXJldicsIGFuY2VzdG9yRXhwcmVzc2lvbl07XG4gIGNvbnN0IG9wdGlvbnMgPSB7XG4gICAgY3dkOiB3b3JraW5nRGlyZWN0b3J5LFxuICB9O1xuXG4gIHRyeSB7XG4gICAgY29uc3Qge3N0ZG91dDogYW5jZXN0b3JSZXZpc2lvbk51bWJlcn0gPSBhd2FpdCBhc3luY0V4ZWN1dGUoJ2hnJywgYXJncywgb3B0aW9ucyk7XG4gICAgcmV0dXJuIGFuY2VzdG9yUmV2aXNpb25OdW1iZXI7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICBsb2dnZXIud2FybignRmFpbGVkIHRvIGdldCBoZyBjb21tb24gYW5jZXN0b3I6ICcsIGUuc3RkZXJyLCBlLmNvbW1hbmQpO1xuICAgIHRocm93IG5ldyBFcnJvcignQ291bGQgbm90IGZldGNoIGNvbW1vbiBhbmNlc3RvciBvZiBoZWFkIGFuZCByZXZpc2lvbjogJyArIHJldmlzaW9uKTtcbiAgfVxufVxuXG4vKipcbiAqIEBwYXJhbSByZXZpc2lvbkZyb20gVGhlIHJldmlzaW9uIGV4cHJlc3Npb24gb2YgdGhlIFwic3RhcnRcIiAob2xkZXIpIHJldmlzaW9uLlxuICogQHBhcmFtIHJldmlzaW9uVG8gVGhlIHJldmlzaW9uIGV4cHJlc3Npb24gb2YgdGhlIFwiZW5kXCIgKG5ld2VyKSByZXZpc2lvbi5cbiAqIEBwYXJhbSB3b3JraW5nRGlyZWN0b3J5IFRoZSB3b3JraW5nIGRpcmVjdG9yeSBvZiB0aGUgSGcgcmVwb3NpdG9yeS5cbiAqIEByZXR1cm4gQW4gYXJyYXkgb2YgcmV2aXNpb24gaW5mbyBiZXR3ZWVuIHJldmlzaW9uRnJvbSBhbmRcbiAqICAgcmV2aXNpb25UbywgcGx1cyByZXZpc2lvbkZyb20gYW5kIHJldmlzaW9uVG87XG4gKiBcIkJldHdlZW5cIiBtZWFucyB0aGF0IHJldmlzaW9uRnJvbSBpcyBhbiBhbmNlc3RvciBvZiwgYW5kXG4gKiAgIHJldmlzaW9uVG8gaXMgYSBkZXNjZW5kYW50IG9mLlxuICogRm9yIGVhY2ggUmV2aXNpb25JbmZvLCB0aGUgYGJvb2ttYXJrc2AgZmllbGQgd2lsbCBjb250YWluIHRoZSBsaXN0XG4gKiBvZiBib29rbWFyayBuYW1lcyBhcHBsaWVkIHRvIHRoYXQgcmV2aXNpb24uXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBmZXRjaFJldmlzaW9uSW5mb0JldHdlZW5SZXZpc2lvbnMoXG4gIHJldmlzaW9uRnJvbTogc3RyaW5nLFxuICByZXZpc2lvblRvOiBzdHJpbmcsXG4gIHdvcmtpbmdEaXJlY3Rvcnk6IHN0cmluZyxcbik6IFByb21pc2U8QXJyYXk8UmV2aXNpb25JbmZvPj4ge1xuICBjb25zdCB7YXN5bmNFeGVjdXRlfSA9IHJlcXVpcmUoJy4uLy4uL2NvbW1vbnMnKTtcblxuICBjb25zdCByZXZpc2lvbkV4cHJlc3Npb24gPSBgJHtyZXZpc2lvbkZyb219Ojoke3JldmlzaW9uVG99YDtcbiAgY29uc3QgcmV2aXNpb25Mb2dBcmdzID0gW1xuICAgICdsb2cnLCAnLS10ZW1wbGF0ZScsIFJFVklTSU9OX0lORk9fVEVNUExBVEUsXG4gICAgJy0tcmV2JywgcmV2aXNpb25FeHByZXNzaW9uLFxuICBdO1xuICBjb25zdCBib29rbWFya3NBcmdzID0gWydib29rbWFya3MnXTtcbiAgY29uc3Qgb3B0aW9ucyA9IHtcbiAgICBjd2Q6IHdvcmtpbmdEaXJlY3RvcnksXG4gIH07XG5cbiAgdHJ5IHtcbiAgICBjb25zdCBbcmV2aXNpb25zUmVzdWx0LCBib29rbWFya3NSZXN1bHRdID0gYXdhaXQgUHJvbWlzZS5hbGwoW1xuICAgICAgYXN5bmNFeGVjdXRlKCdoZycsIHJldmlzaW9uTG9nQXJncywgb3B0aW9ucyksXG4gICAgICBhc3luY0V4ZWN1dGUoJ2hnJywgYm9va21hcmtzQXJncywgb3B0aW9ucyksXG4gICAgXSk7XG4gICAgY29uc3QgcmV2aXNpb25zSW5mbyA9IHBhcnNlUmV2aXNpb25JbmZvT3V0cHV0KHJldmlzaW9uc1Jlc3VsdC5zdGRvdXQpO1xuICAgIGNvbnN0IGJvb2ttYXJrc0luZm8gPSBwYXJzZUJvb2ttYXJrc091dHB1dChib29rbWFya3NSZXN1bHQuc3Rkb3V0KTtcbiAgICBmb3IgKGNvbnN0IHJldmlzaW9uSW5mbyBvZiByZXZpc2lvbnNJbmZvKSB7XG4gICAgICByZXZpc2lvbkluZm8uYm9va21hcmtzID0gYm9va21hcmtzSW5mby5nZXQocmV2aXNpb25JbmZvLmlkKSB8fCBbXTtcbiAgICB9XG4gICAgcmV0dXJuIHJldmlzaW9uc0luZm87XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICBsb2dnZXIud2FybignRmFpbGVkIHRvIGdldCByZXZpc2lvbiBpbmZvIGJldHdlZW4gdHdvIHJldmlzaW9uczogJywgZS5zdGRlcnIgfHwgZSwgZS5jb21tYW5kKTtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICBgQ291bGQgbm90IGZldGNoIHJldmlzaW9uIG51bWJlcnMgYmV0d2VlbiB0aGUgcmV2aXNpb25zOiAke3JldmlzaW9uRnJvbX0sICR7cmV2aXNpb25Ub31gXG4gICAgKTtcbiAgfVxufVxuXG4vKipcbiAqIEhlbHBlciBmdW5jdGlvbiB0byBgZmV0Y2hSZXZpc2lvbkluZm9CZXR3ZWVuUmV2aXNpb25zYC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlUmV2aXNpb25JbmZvT3V0cHV0KHJldmlzaW9uc0luZm9PdXRwdXQ6IHN0cmluZyk6IEFycmF5PFJldmlzaW9uSW5mbz4ge1xuICBjb25zdCByZXZpc2lvbnMgPSByZXZpc2lvbnNJbmZvT3V0cHV0LnNwbGl0KCdcXG5cXG4nKTtcbiAgY29uc3QgcmV2aXNpb25JbmZvID0gW107XG4gIGZvciAoY29uc3QgY2h1bmsgb2YgcmV2aXNpb25zKSB7XG4gICAgY29uc3QgcmV2aXNpb25MaW5lcyA9IGNodW5rLnRyaW0oKS5zcGxpdCgnXFxuJyk7XG4gICAgaWYgKHJldmlzaW9uTGluZXMubGVuZ3RoICE9PSA1KSB7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG4gICAgcmV2aXNpb25JbmZvLnB1c2goe1xuICAgICAgaWQ6IHBhcnNlSW50KHJldmlzaW9uTGluZXNbMF0uc2xpY2UoSU5GT19JRF9QUkVGSVgubGVuZ3RoKSwgMTApLFxuICAgICAgdGl0bGU6IHJldmlzaW9uTGluZXNbMV0uc2xpY2UoSU5GT19USVRMRV9QUkVGSVgubGVuZ3RoKSxcbiAgICAgIGF1dGhvcjogcmV2aXNpb25MaW5lc1syXS5zbGljZShJTkZPX0FVVEhPUl9QUkVGSVgubGVuZ3RoKSxcbiAgICAgIGRhdGU6IG5ldyBEYXRlKHJldmlzaW9uTGluZXNbM10uc2xpY2UoSU5GT19EQVRFX1BSRUZJWC5sZW5ndGgpKSxcbiAgICAgIGhhc2g6IHJldmlzaW9uTGluZXNbNF0uc2xpY2UoSU5GT19IQVNIX1BSRUZJWC5sZW5ndGgpLFxuICAgICAgYm9va21hcmtzOiBbXSxcbiAgICB9KTtcbiAgfVxuICByZXR1cm4gcmV2aXNpb25JbmZvO1xufVxuXG4vLyBDYXB0dXJlIHRoZSBsb2NhbCBjb21taXQgaWQgYW5kIGJvb2ttYXJrIG5hbWUgZnJvbSB0aGUgYGhnIGJvb2ttYXJrc2Agb3V0cHV0LlxuY29uc3QgQk9PS01BUktfTUFUQ0hfUkVHRVggPSAvXiAuIChbXiBdKylcXHMrKFxcZCspOihbMC05YS1mXSspJC87XG5cbi8qKlxuICogUGFyc2UgdGhlIHJlc3VsdCBvZiBgaGcgYm9va21hcmtzYCBpbnRvIGEgYE1hcGAgZnJvbVxuICogcmV2aXNpb24gaWQgdG8gYSBhcnJheSBvZiBib29rbWFyayBuYW1lcyBhcHBsaWVkIHRvIHJldmlzaW9uLlxuICovXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VCb29rbWFya3NPdXRwdXQoYm9va21hcmtzT3V0cHV0OiBzdHJpbmcpOiBNYXA8bnVtYmVyLCBBcnJheTxzdHJpbmc+PiB7XG4gIGNvbnN0IGJvb2ttYXJrc0xpbmVzID0gYm9va21hcmtzT3V0cHV0LnNwbGl0KCdcXG4nKTtcbiAgY29uc3QgY29tbWl0c1RvQm9va21hcmtzID0gbmV3IE1hcCgpO1xuICBmb3IgKGNvbnN0IGJvb2ttYXJrTGluZSBvZiBib29rbWFya3NMaW5lcykge1xuICAgIGNvbnN0IG1hdGNoID0gQk9PS01BUktfTUFUQ0hfUkVHRVguZXhlYyhib29rbWFya0xpbmUpO1xuICAgIGlmIChtYXRjaCA9PSBudWxsKSB7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG4gICAgY29uc3QgWywgYm9va21hcmtTdHJpbmcsIGNvbW1pdElkU3RyaW5nXSA9IG1hdGNoO1xuICAgIGNvbnN0IGNvbW1pdElkID0gcGFyc2VJbnQoY29tbWl0SWRTdHJpbmcsIDEwKTtcbiAgICBpZiAoIWNvbW1pdHNUb0Jvb2ttYXJrcy5oYXMoY29tbWl0SWQpKSB7XG4gICAgICBjb21taXRzVG9Cb29rbWFya3Muc2V0KGNvbW1pdElkLCBbXSk7XG4gICAgfVxuICAgIGNvbnN0IGJvb2ttYXJrcyA9IGNvbW1pdHNUb0Jvb2ttYXJrcy5nZXQoY29tbWl0SWQpO1xuICAgIGludmFyaWFudChib29rbWFya3MgIT0gbnVsbCk7XG4gICAgYm9va21hcmtzLnB1c2goYm9va21hcmtTdHJpbmcpO1xuICB9XG4gIHJldHVybiBjb21taXRzVG9Cb29rbWFya3M7XG59XG4iXX0=