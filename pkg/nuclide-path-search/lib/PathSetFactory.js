Object.defineProperty(exports, '__esModule', {
  value: true
});

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

var getFilesFromWatchman = _asyncToGenerator(function* (localDirectory) {
  var watchmanClient = new _nuclideWatchmanHelpers.WatchmanClient();
  try {
    return yield watchmanClient.listFiles(localDirectory);
  } finally {
    watchmanClient.dispose();
  }
});

exports.getPaths = getPaths;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _child_process = require('child_process');

var _split = require('split');

var _split2 = _interopRequireDefault(_split);

var _nuclideWatchmanHelpers = require('../../nuclide-watchman-helpers');

function getFilesFromCommand(command, args, localDirectory, transform) {
  return new Promise(function (resolve, reject) {
    // Use `spawn` here to process the, possibly huge, output of the file listing.

    var proc = (0, _child_process.spawn)(command, args, { cwd: localDirectory });

    proc.on('error', reject);

    var filePaths = [];
    proc.stdout.pipe((0, _split2['default'])()).on('data', function (filePath) {
      if (transform) {
        filePath = transform(filePath);
      }

      if (filePath !== '') {
        filePaths.push(filePath);
      }
    });

    var errorString = '';
    proc.stderr.on('data', function (data) {
      errorString += data;
    });

    proc.on('close', function (code) {
      if (code === 0) {
        resolve(filePaths);
      } else {
        reject(errorString);
      }
    });
  });
}

function getTrackedHgFiles(localDirectory) {
  return getFilesFromCommand('hg', ['locate', '--fullpath', '--include', '.'], localDirectory, function (filePath) {
    return filePath.slice(localDirectory.length + 1);
  });
}

/**
 * 'Untracked' files are files that haven't been added to the repo, but haven't
 * been explicitly hg-ignored.
 */
function getUntrackedHgFiles(localDirectory) {
  return getFilesFromCommand('hg',
  // Calling 'hg status' with a path has two side-effects:
  // 1. It returns the status of only files under the given path. In this case,
  //    we only want the untracked files under the given localDirectory.
  // 2. It returns the paths relative to the directory in which this command is
  //    run. This is hard-coded to 'localDirectory' in `getFilesFromCommand`,
  //    which is what we want.
  ['status', '--unknown', '--no-status' /* No status code. */, localDirectory], localDirectory);
}

/**
 * @param localDirectory The full path to a directory.
 * @return If localDirectory is within an Hg repo, returns an Object where the
 *   keys are file paths (relative to the 'localDirectory') of tracked and untracked
 *   files within that directory, but not including ignored files. All values
 *   are 'true'. If localDirectory is not within an Hg repo, the Promise rejects.
 */
function getFilesFromHg(localDirectory) {
  return Promise.all([getTrackedHgFiles(localDirectory), getUntrackedHgFiles(localDirectory)]).then(function (returnedFiles) {
    var _returnedFiles = _slicedToArray(returnedFiles, 2);

    var trackedFiles = _returnedFiles[0];
    var untrackedFiles = _returnedFiles[1];

    return trackedFiles.concat(untrackedFiles);
  });
}

function getTrackedGitFiles(localDirectory) {
  return getFilesFromCommand('git', ['ls-files'], localDirectory);
}

/**
 * 'Untracked' files are files that haven't been added to the repo, but haven't
 * been explicitly git-ignored.
 */
function getUntrackedGitFiles(localDirectory) {
  // '--others' means untracked files, and '--exclude-standard' excludes ignored files.
  return getFilesFromCommand('git', ['ls-files', '--exclude-standard', '--others'], localDirectory);
}

/**
 * @param localDirectory The full path to a directory.
 * @return If localDirectory is within a Git repo, returns an Object where the
 *   keys are file paths (relative to the 'localDirectory') of tracked and untracked
 *   files within that directory, but not including ignored files. All values
 *   are 'true'. If localDirectory is not within a Git repo, the Promise rejects.
 */
function getFilesFromGit(localDirectory) {
  return Promise.all([getTrackedGitFiles(localDirectory), getUntrackedGitFiles(localDirectory)]).then(function (returnedFiles) {
    var _returnedFiles2 = _slicedToArray(returnedFiles, 2);

    var trackedFiles = _returnedFiles2[0];
    var untrackedFiles = _returnedFiles2[1];

    return trackedFiles.concat(untrackedFiles);
  });
}

function getAllFiles(localDirectory) {
  return getFilesFromCommand('find', ['.', '-type', 'f'], localDirectory,
  // Slice off the leading `./` that find will add on here.
  function (filePath) {
    return filePath.substring(2);
  });
}

function getPaths(localDirectory) {
  // Attempts to get a list of files relative to `localDirectory`, hopefully from
  // a fast source control index.
  // TODO (williamsc) once ``{HG|Git}Repository` is working in nuclide-server,
  // use those instead to determine VCS.
  return getFilesFromWatchman(localDirectory)['catch'](function () {
    return getFilesFromHg(localDirectory);
  })['catch'](function () {
    return getFilesFromGit(localDirectory);
  })['catch'](function () {
    return getAllFiles(localDirectory);
  })['catch'](function () {
    throw new Error('Failed to populate FileSearch for ' + localDirectory);
  });
}

var __test__ = {
  getFilesFromGit: getFilesFromGit,
  getFilesFromHg: getFilesFromHg
};
exports.__test__ = __test__;
//# sourceMappingURL=data:application/json;base64,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Q0FBQyxjQUFjLENBQUM7R0FBQSxDQUFDLFNBQ25DLENBQUMsWUFBTTtBQUFFLFVBQU0sSUFBSSxLQUFLLHdDQUFzQyxjQUFjLENBQUcsQ0FBQztHQUFFLENBQUMsQ0FBQztDQUMvRjs7QUFFTSxJQUFNLFFBQVEsR0FBRztBQUN0QixpQkFBZSxFQUFmLGVBQWU7QUFDZixnQkFBYyxFQUFkLGNBQWM7Q0FDZixDQUFDIiwiZmlsZSI6IlBhdGhTZXRGYWN0b3J5LmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHtzcGF3bn0gZnJvbSAnY2hpbGRfcHJvY2Vzcyc7XG5pbXBvcnQgc3BsaXQgZnJvbSAnc3BsaXQnO1xuXG5pbXBvcnQge1dhdGNobWFuQ2xpZW50fSBmcm9tICcuLi8uLi9udWNsaWRlLXdhdGNobWFuLWhlbHBlcnMnO1xuXG5mdW5jdGlvbiBnZXRGaWxlc0Zyb21Db21tYW5kKFxuICBjb21tYW5kOiBzdHJpbmcsXG4gIGFyZ3M6IEFycmF5PHN0cmluZz4sXG4gIGxvY2FsRGlyZWN0b3J5OiBzdHJpbmcsXG4gIHRyYW5zZm9ybT86IChwYXRoOiBzdHJpbmcpID0+IHN0cmluZyxcbik6IFByb21pc2U8QXJyYXk8c3RyaW5nPj4ge1xuICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgIC8vIFVzZSBgc3Bhd25gIGhlcmUgdG8gcHJvY2VzcyB0aGUsIHBvc3NpYmx5IGh1Z2UsIG91dHB1dCBvZiB0aGUgZmlsZSBsaXN0aW5nLlxuXG4gICAgY29uc3QgcHJvYyA9IHNwYXduKGNvbW1hbmQsIGFyZ3MsIHtjd2Q6IGxvY2FsRGlyZWN0b3J5fSk7XG5cbiAgICBwcm9jLm9uKCdlcnJvcicsIHJlamVjdCk7XG5cbiAgICBjb25zdCBmaWxlUGF0aHMgPSBbXTtcbiAgICBwcm9jLnN0ZG91dC5waXBlKHNwbGl0KCkpLm9uKCdkYXRhJywgZmlsZVBhdGggPT4ge1xuICAgICAgaWYgKHRyYW5zZm9ybSkge1xuICAgICAgICBmaWxlUGF0aCA9IHRyYW5zZm9ybShmaWxlUGF0aCk7XG4gICAgICB9XG5cbiAgICAgIGlmIChmaWxlUGF0aCAhPT0gJycpIHtcbiAgICAgICAgZmlsZVBhdGhzLnB1c2goZmlsZVBhdGgpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgbGV0IGVycm9yU3RyaW5nID0gJyc7XG4gICAgcHJvYy5zdGRlcnIub24oJ2RhdGEnLCBkYXRhID0+IHtcbiAgICAgIGVycm9yU3RyaW5nICs9IGRhdGE7XG4gICAgfSk7XG5cbiAgICBwcm9jLm9uKCdjbG9zZScsIGNvZGUgPT4ge1xuICAgICAgaWYgKGNvZGUgPT09IDApIHtcbiAgICAgICAgcmVzb2x2ZShmaWxlUGF0aHMpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmVqZWN0KGVycm9yU3RyaW5nKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIGdldFRyYWNrZWRIZ0ZpbGVzKGxvY2FsRGlyZWN0b3J5OiBzdHJpbmcpOiBQcm9taXNlPEFycmF5PHN0cmluZz4+IHtcbiAgcmV0dXJuIGdldEZpbGVzRnJvbUNvbW1hbmQoXG4gICAgJ2hnJyxcbiAgICBbJ2xvY2F0ZScsICctLWZ1bGxwYXRoJywgJy0taW5jbHVkZScsICcuJ10sXG4gICAgbG9jYWxEaXJlY3RvcnksXG4gICAgZmlsZVBhdGggPT4gZmlsZVBhdGguc2xpY2UobG9jYWxEaXJlY3RvcnkubGVuZ3RoICsgMSlcbiAgKTtcbn1cblxuLyoqXG4gKiAnVW50cmFja2VkJyBmaWxlcyBhcmUgZmlsZXMgdGhhdCBoYXZlbid0IGJlZW4gYWRkZWQgdG8gdGhlIHJlcG8sIGJ1dCBoYXZlbid0XG4gKiBiZWVuIGV4cGxpY2l0bHkgaGctaWdub3JlZC5cbiAqL1xuZnVuY3Rpb24gZ2V0VW50cmFja2VkSGdGaWxlcyhsb2NhbERpcmVjdG9yeTogc3RyaW5nKTogUHJvbWlzZTxBcnJheTxzdHJpbmc+PiB7XG4gIHJldHVybiBnZXRGaWxlc0Zyb21Db21tYW5kKFxuICAgICdoZycsXG4gICAgLy8gQ2FsbGluZyAnaGcgc3RhdHVzJyB3aXRoIGEgcGF0aCBoYXMgdHdvIHNpZGUtZWZmZWN0czpcbiAgICAvLyAxLiBJdCByZXR1cm5zIHRoZSBzdGF0dXMgb2Ygb25seSBmaWxlcyB1bmRlciB0aGUgZ2l2ZW4gcGF0aC4gSW4gdGhpcyBjYXNlLFxuICAgIC8vICAgIHdlIG9ubHkgd2FudCB0aGUgdW50cmFja2VkIGZpbGVzIHVuZGVyIHRoZSBnaXZlbiBsb2NhbERpcmVjdG9yeS5cbiAgICAvLyAyLiBJdCByZXR1cm5zIHRoZSBwYXRocyByZWxhdGl2ZSB0byB0aGUgZGlyZWN0b3J5IGluIHdoaWNoIHRoaXMgY29tbWFuZCBpc1xuICAgIC8vICAgIHJ1bi4gVGhpcyBpcyBoYXJkLWNvZGVkIHRvICdsb2NhbERpcmVjdG9yeScgaW4gYGdldEZpbGVzRnJvbUNvbW1hbmRgLFxuICAgIC8vICAgIHdoaWNoIGlzIHdoYXQgd2Ugd2FudC5cbiAgICBbJ3N0YXR1cycsICctLXVua25vd24nLCAnLS1uby1zdGF0dXMnIC8qIE5vIHN0YXR1cyBjb2RlLiAqLywgbG9jYWxEaXJlY3RvcnldLFxuICAgIGxvY2FsRGlyZWN0b3J5LFxuICApO1xufVxuXG4vKipcbiAqIEBwYXJhbSBsb2NhbERpcmVjdG9yeSBUaGUgZnVsbCBwYXRoIHRvIGEgZGlyZWN0b3J5LlxuICogQHJldHVybiBJZiBsb2NhbERpcmVjdG9yeSBpcyB3aXRoaW4gYW4gSGcgcmVwbywgcmV0dXJucyBhbiBPYmplY3Qgd2hlcmUgdGhlXG4gKiAgIGtleXMgYXJlIGZpbGUgcGF0aHMgKHJlbGF0aXZlIHRvIHRoZSAnbG9jYWxEaXJlY3RvcnknKSBvZiB0cmFja2VkIGFuZCB1bnRyYWNrZWRcbiAqICAgZmlsZXMgd2l0aGluIHRoYXQgZGlyZWN0b3J5LCBidXQgbm90IGluY2x1ZGluZyBpZ25vcmVkIGZpbGVzLiBBbGwgdmFsdWVzXG4gKiAgIGFyZSAndHJ1ZScuIElmIGxvY2FsRGlyZWN0b3J5IGlzIG5vdCB3aXRoaW4gYW4gSGcgcmVwbywgdGhlIFByb21pc2UgcmVqZWN0cy5cbiAqL1xuZnVuY3Rpb24gZ2V0RmlsZXNGcm9tSGcobG9jYWxEaXJlY3Rvcnk6IHN0cmluZyk6IFByb21pc2U8QXJyYXk8c3RyaW5nPj4ge1xuICByZXR1cm4gUHJvbWlzZS5hbGwoW2dldFRyYWNrZWRIZ0ZpbGVzKGxvY2FsRGlyZWN0b3J5KSwgZ2V0VW50cmFja2VkSGdGaWxlcyhsb2NhbERpcmVjdG9yeSldKS50aGVuKFxuICAgIHJldHVybmVkRmlsZXMgPT4ge1xuICAgICAgY29uc3QgW3RyYWNrZWRGaWxlcywgdW50cmFja2VkRmlsZXNdID0gcmV0dXJuZWRGaWxlcztcbiAgICAgIHJldHVybiB0cmFja2VkRmlsZXMuY29uY2F0KHVudHJhY2tlZEZpbGVzKTtcbiAgICB9XG4gICk7XG59XG5cbmZ1bmN0aW9uIGdldFRyYWNrZWRHaXRGaWxlcyhsb2NhbERpcmVjdG9yeTogc3RyaW5nKTogUHJvbWlzZTxBcnJheTxzdHJpbmc+PiB7XG4gIHJldHVybiBnZXRGaWxlc0Zyb21Db21tYW5kKCdnaXQnLCBbJ2xzLWZpbGVzJ10sIGxvY2FsRGlyZWN0b3J5KTtcbn1cblxuLyoqXG4gKiAnVW50cmFja2VkJyBmaWxlcyBhcmUgZmlsZXMgdGhhdCBoYXZlbid0IGJlZW4gYWRkZWQgdG8gdGhlIHJlcG8sIGJ1dCBoYXZlbid0XG4gKiBiZWVuIGV4cGxpY2l0bHkgZ2l0LWlnbm9yZWQuXG4gKi9cbmZ1bmN0aW9uIGdldFVudHJhY2tlZEdpdEZpbGVzKGxvY2FsRGlyZWN0b3J5OiBzdHJpbmcpOiBQcm9taXNlPEFycmF5PHN0cmluZz4+IHtcbiAgLy8gJy0tb3RoZXJzJyBtZWFucyB1bnRyYWNrZWQgZmlsZXMsIGFuZCAnLS1leGNsdWRlLXN0YW5kYXJkJyBleGNsdWRlcyBpZ25vcmVkIGZpbGVzLlxuICByZXR1cm4gZ2V0RmlsZXNGcm9tQ29tbWFuZCgnZ2l0JywgWydscy1maWxlcycsICctLWV4Y2x1ZGUtc3RhbmRhcmQnLCAnLS1vdGhlcnMnXSwgbG9jYWxEaXJlY3RvcnkpO1xufVxuXG4vKipcbiAqIEBwYXJhbSBsb2NhbERpcmVjdG9yeSBUaGUgZnVsbCBwYXRoIHRvIGEgZGlyZWN0b3J5LlxuICogQHJldHVybiBJZiBsb2NhbERpcmVjdG9yeSBpcyB3aXRoaW4gYSBHaXQgcmVwbywgcmV0dXJucyBhbiBPYmplY3Qgd2hlcmUgdGhlXG4gKiAgIGtleXMgYXJlIGZpbGUgcGF0aHMgKHJlbGF0aXZlIHRvIHRoZSAnbG9jYWxEaXJlY3RvcnknKSBvZiB0cmFja2VkIGFuZCB1bnRyYWNrZWRcbiAqICAgZmlsZXMgd2l0aGluIHRoYXQgZGlyZWN0b3J5LCBidXQgbm90IGluY2x1ZGluZyBpZ25vcmVkIGZpbGVzLiBBbGwgdmFsdWVzXG4gKiAgIGFyZSAndHJ1ZScuIElmIGxvY2FsRGlyZWN0b3J5IGlzIG5vdCB3aXRoaW4gYSBHaXQgcmVwbywgdGhlIFByb21pc2UgcmVqZWN0cy5cbiAqL1xuZnVuY3Rpb24gZ2V0RmlsZXNGcm9tR2l0KGxvY2FsRGlyZWN0b3J5OiBzdHJpbmcpOiBQcm9taXNlPEFycmF5PHN0cmluZz4+IHtcbiAgcmV0dXJuIFByb21pc2UuYWxsKFxuICAgICAgW2dldFRyYWNrZWRHaXRGaWxlcyhsb2NhbERpcmVjdG9yeSksIGdldFVudHJhY2tlZEdpdEZpbGVzKGxvY2FsRGlyZWN0b3J5KV0pLnRoZW4oXG4gICAgcmV0dXJuZWRGaWxlcyA9PiB7XG4gICAgICBjb25zdCBbdHJhY2tlZEZpbGVzLCB1bnRyYWNrZWRGaWxlc10gPSByZXR1cm5lZEZpbGVzO1xuICAgICAgcmV0dXJuIHRyYWNrZWRGaWxlcy5jb25jYXQodW50cmFja2VkRmlsZXMpO1xuICAgIH1cbiAgKTtcbn1cblxuZnVuY3Rpb24gZ2V0QWxsRmlsZXMobG9jYWxEaXJlY3Rvcnk6IHN0cmluZyk6IFByb21pc2U8QXJyYXk8c3RyaW5nPj4ge1xuICByZXR1cm4gZ2V0RmlsZXNGcm9tQ29tbWFuZChcbiAgICAgICdmaW5kJyxcbiAgICAgIFsnLicsICctdHlwZScsICdmJ10sXG4gICAgICBsb2NhbERpcmVjdG9yeSxcbiAgICAgIC8vIFNsaWNlIG9mZiB0aGUgbGVhZGluZyBgLi9gIHRoYXQgZmluZCB3aWxsIGFkZCBvbiBoZXJlLlxuICAgICAgZmlsZVBhdGggPT4gZmlsZVBhdGguc3Vic3RyaW5nKDIpKTtcbn1cblxuYXN5bmMgZnVuY3Rpb24gZ2V0RmlsZXNGcm9tV2F0Y2htYW4obG9jYWxEaXJlY3Rvcnk6IHN0cmluZyk6IFByb21pc2U8QXJyYXk8c3RyaW5nPj4ge1xuICBjb25zdCB3YXRjaG1hbkNsaWVudCA9IG5ldyBXYXRjaG1hbkNsaWVudCgpO1xuICB0cnkge1xuICAgIHJldHVybiBhd2FpdCB3YXRjaG1hbkNsaWVudC5saXN0RmlsZXMobG9jYWxEaXJlY3RvcnkpO1xuICB9IGZpbmFsbHkge1xuICAgIHdhdGNobWFuQ2xpZW50LmRpc3Bvc2UoKTtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0UGF0aHMobG9jYWxEaXJlY3Rvcnk6IHN0cmluZyk6IFByb21pc2U8QXJyYXk8c3RyaW5nPj4ge1xuICAvLyBBdHRlbXB0cyB0byBnZXQgYSBsaXN0IG9mIGZpbGVzIHJlbGF0aXZlIHRvIGBsb2NhbERpcmVjdG9yeWAsIGhvcGVmdWxseSBmcm9tXG4gIC8vIGEgZmFzdCBzb3VyY2UgY29udHJvbCBpbmRleC5cbiAgLy8gVE9ETyAod2lsbGlhbXNjKSBvbmNlIGBge0hHfEdpdH1SZXBvc2l0b3J5YCBpcyB3b3JraW5nIGluIG51Y2xpZGUtc2VydmVyLFxuICAvLyB1c2UgdGhvc2UgaW5zdGVhZCB0byBkZXRlcm1pbmUgVkNTLlxuICByZXR1cm4gZ2V0RmlsZXNGcm9tV2F0Y2htYW4obG9jYWxEaXJlY3RvcnkpXG4gICAgICAuY2F0Y2goKCkgPT4gZ2V0RmlsZXNGcm9tSGcobG9jYWxEaXJlY3RvcnkpKVxuICAgICAgLmNhdGNoKCgpID0+IGdldEZpbGVzRnJvbUdpdChsb2NhbERpcmVjdG9yeSkpXG4gICAgICAuY2F0Y2goKCkgPT4gZ2V0QWxsRmlsZXMobG9jYWxEaXJlY3RvcnkpKVxuICAgICAgLmNhdGNoKCgpID0+IHsgdGhyb3cgbmV3IEVycm9yKGBGYWlsZWQgdG8gcG9wdWxhdGUgRmlsZVNlYXJjaCBmb3IgJHtsb2NhbERpcmVjdG9yeX1gKTsgfSk7XG59XG5cbmV4cG9ydCBjb25zdCBfX3Rlc3RfXyA9IHtcbiAgZ2V0RmlsZXNGcm9tR2l0LFxuICBnZXRGaWxlc0Zyb21IZyxcbn07XG4iXX0=