

/**
 * @param repoPath The full path to the repository directory (.hg).
 * @return A promise that resolves to the current bookmark name, if it exists,
 *   or else an empty string.
 */

var fetchCurrentBookmark = _asyncToGenerator(function* (repoPath) {
  var bookmarkFile = path.join(repoPath, 'bookmarks.current');
  var result = undefined;
  try {
    result = yield fsPromise.readFile(bookmarkFile, 'utf-8');
  } catch (e) {
    if (!(e.code === 'ENOENT')) {
      // We expect an error if the bookmark file doesn't exist. Otherwise, the
      // error is unexpected, so log it.
      var logger = require('../../logging').getLogger();
      logger.error(e);
    }
    result = '';
  }
  return result;
});

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _require = require('../../commons');

var fsPromise = _require.fsPromise;

var path = require('path');

module.exports = {
  fetchCurrentBookmark: fetchCurrentBookmark
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImhnLWJvb2ttYXJrLWhlbHBlcnMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7SUFvQmUsb0JBQW9CLHFCQUFuQyxXQUFvQyxRQUFnQixFQUFtQjtBQUNyRSxNQUFNLFlBQVksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxtQkFBbUIsQ0FBQyxDQUFDO0FBQzlELE1BQUksTUFBTSxZQUFBLENBQUM7QUFDWCxNQUFJO0FBQ0YsVUFBTSxHQUFHLE1BQU0sU0FBUyxDQUFDLFFBQVEsQ0FBQyxZQUFZLEVBQUUsT0FBTyxDQUFDLENBQUM7R0FDMUQsQ0FBQyxPQUFPLENBQUMsRUFBRTtBQUNWLFFBQUksRUFBRSxDQUFDLENBQUMsSUFBSSxLQUFLLFFBQVEsQ0FBQSxBQUFDLEVBQUU7OztBQUcxQixVQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsZUFBZSxDQUFDLENBQUMsU0FBUyxFQUFFLENBQUM7QUFDcEQsWUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztLQUNqQjtBQUNELFVBQU0sR0FBRyxFQUFFLENBQUM7R0FDYjtBQUNELFNBQU8sTUFBTSxDQUFDO0NBQ2Y7Ozs7Ozs7Ozs7OztlQXhCbUIsT0FBTyxDQUFDLGVBQWUsQ0FBQzs7SUFBckMsU0FBUyxZQUFULFNBQVM7O0FBQ2hCLElBQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQzs7QUF5QjdCLE1BQU0sQ0FBQyxPQUFPLEdBQUc7QUFDZixzQkFBb0IsRUFBcEIsb0JBQW9CO0NBQ3JCLENBQUMiLCJmaWxlIjoiaGctYm9va21hcmstaGVscGVycy5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmNvbnN0IHtmc1Byb21pc2V9ID0gcmVxdWlyZSgnLi4vLi4vY29tbW9ucycpO1xuY29uc3QgcGF0aCA9IHJlcXVpcmUoJ3BhdGgnKTtcblxuXG4vKipcbiAqIEBwYXJhbSByZXBvUGF0aCBUaGUgZnVsbCBwYXRoIHRvIHRoZSByZXBvc2l0b3J5IGRpcmVjdG9yeSAoLmhnKS5cbiAqIEByZXR1cm4gQSBwcm9taXNlIHRoYXQgcmVzb2x2ZXMgdG8gdGhlIGN1cnJlbnQgYm9va21hcmsgbmFtZSwgaWYgaXQgZXhpc3RzLFxuICogICBvciBlbHNlIGFuIGVtcHR5IHN0cmluZy5cbiAqL1xuYXN5bmMgZnVuY3Rpb24gZmV0Y2hDdXJyZW50Qm9va21hcmsocmVwb1BhdGg6IHN0cmluZyk6IFByb21pc2U8c3RyaW5nPiB7XG4gIGNvbnN0IGJvb2ttYXJrRmlsZSA9IHBhdGguam9pbihyZXBvUGF0aCwgJ2Jvb2ttYXJrcy5jdXJyZW50Jyk7XG4gIGxldCByZXN1bHQ7XG4gIHRyeSB7XG4gICAgcmVzdWx0ID0gYXdhaXQgZnNQcm9taXNlLnJlYWRGaWxlKGJvb2ttYXJrRmlsZSwgJ3V0Zi04Jyk7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICBpZiAoIShlLmNvZGUgPT09ICdFTk9FTlQnKSkge1xuICAgICAgLy8gV2UgZXhwZWN0IGFuIGVycm9yIGlmIHRoZSBib29rbWFyayBmaWxlIGRvZXNuJ3QgZXhpc3QuIE90aGVyd2lzZSwgdGhlXG4gICAgICAvLyBlcnJvciBpcyB1bmV4cGVjdGVkLCBzbyBsb2cgaXQuXG4gICAgICBjb25zdCBsb2dnZXIgPSByZXF1aXJlKCcuLi8uLi9sb2dnaW5nJykuZ2V0TG9nZ2VyKCk7XG4gICAgICBsb2dnZXIuZXJyb3IoZSk7XG4gICAgfVxuICAgIHJlc3VsdCA9ICcnO1xuICB9XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBmZXRjaEN1cnJlbnRCb29rbWFyayxcbn07XG4iXX0=