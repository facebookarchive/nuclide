Object.defineProperty(exports, '__esModule', {
  value: true
});

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

var getFilesFromWatchman = _asyncToGenerator(function* (localDirectory) {
  var watchmanClient = new _watchmanHelpers.WatchmanClient();
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

var _watchmanHelpers = require('../../watchman-helpers');

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
//# sourceMappingURL=data:application/json;base64,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Q0FBQyxjQUFjLENBQUM7R0FBQSxDQUFDLFNBQ25DLENBQUMsWUFBTTtBQUFFLFVBQU0sSUFBSSxLQUFLLHdDQUFzQyxjQUFjLENBQUcsQ0FBQztHQUFFLENBQUMsQ0FBQztDQUMvRjs7QUFFTSxJQUFNLFFBQVEsR0FBRztBQUN0QixpQkFBZSxFQUFmLGVBQWU7QUFDZixnQkFBYyxFQUFkLGNBQWM7Q0FDZixDQUFDIiwiZmlsZSI6IlBhdGhTZXRGYWN0b3J5LmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHtzcGF3bn0gZnJvbSAnY2hpbGRfcHJvY2Vzcyc7XG5pbXBvcnQgc3BsaXQgZnJvbSAnc3BsaXQnO1xuXG5pbXBvcnQge1dhdGNobWFuQ2xpZW50fSBmcm9tICcuLi8uLi93YXRjaG1hbi1oZWxwZXJzJztcblxuZnVuY3Rpb24gZ2V0RmlsZXNGcm9tQ29tbWFuZChcbiAgY29tbWFuZDogc3RyaW5nLFxuICBhcmdzOiBBcnJheTxzdHJpbmc+LFxuICBsb2NhbERpcmVjdG9yeTogc3RyaW5nLFxuICB0cmFuc2Zvcm0/OiAocGF0aDogc3RyaW5nKSA9PiBzdHJpbmcsXG4pOiBQcm9taXNlPEFycmF5PHN0cmluZz4+IHtcbiAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAvLyBVc2UgYHNwYXduYCBoZXJlIHRvIHByb2Nlc3MgdGhlLCBwb3NzaWJseSBodWdlLCBvdXRwdXQgb2YgdGhlIGZpbGUgbGlzdGluZy5cblxuICAgIGNvbnN0IHByb2MgPSBzcGF3bihjb21tYW5kLCBhcmdzLCB7Y3dkOiBsb2NhbERpcmVjdG9yeX0pO1xuXG4gICAgcHJvYy5vbignZXJyb3InLCByZWplY3QpO1xuXG4gICAgY29uc3QgZmlsZVBhdGhzID0gW107XG4gICAgcHJvYy5zdGRvdXQucGlwZShzcGxpdCgpKS5vbignZGF0YScsIGZpbGVQYXRoID0+IHtcbiAgICAgIGlmICh0cmFuc2Zvcm0pIHtcbiAgICAgICAgZmlsZVBhdGggPSB0cmFuc2Zvcm0oZmlsZVBhdGgpO1xuICAgICAgfVxuXG4gICAgICBpZiAoZmlsZVBhdGggIT09ICcnKSB7XG4gICAgICAgIGZpbGVQYXRocy5wdXNoKGZpbGVQYXRoKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIGxldCBlcnJvclN0cmluZyA9ICcnO1xuICAgIHByb2Muc3RkZXJyLm9uKCdkYXRhJywgZGF0YSA9PiB7XG4gICAgICBlcnJvclN0cmluZyArPSBkYXRhO1xuICAgIH0pO1xuXG4gICAgcHJvYy5vbignY2xvc2UnLCBjb2RlID0+IHtcbiAgICAgIGlmIChjb2RlID09PSAwKSB7XG4gICAgICAgIHJlc29sdmUoZmlsZVBhdGhzKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJlamVjdChlcnJvclN0cmluZyk7XG4gICAgICB9XG4gICAgfSk7XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBnZXRUcmFja2VkSGdGaWxlcyhsb2NhbERpcmVjdG9yeTogc3RyaW5nKTogUHJvbWlzZTxBcnJheTxzdHJpbmc+PiB7XG4gIHJldHVybiBnZXRGaWxlc0Zyb21Db21tYW5kKFxuICAgICdoZycsXG4gICAgWydsb2NhdGUnLCAnLS1mdWxscGF0aCcsICctLWluY2x1ZGUnLCAnLiddLFxuICAgIGxvY2FsRGlyZWN0b3J5LFxuICAgIGZpbGVQYXRoID0+IGZpbGVQYXRoLnNsaWNlKGxvY2FsRGlyZWN0b3J5Lmxlbmd0aCArIDEpXG4gICk7XG59XG5cbi8qKlxuICogJ1VudHJhY2tlZCcgZmlsZXMgYXJlIGZpbGVzIHRoYXQgaGF2ZW4ndCBiZWVuIGFkZGVkIHRvIHRoZSByZXBvLCBidXQgaGF2ZW4ndFxuICogYmVlbiBleHBsaWNpdGx5IGhnLWlnbm9yZWQuXG4gKi9cbmZ1bmN0aW9uIGdldFVudHJhY2tlZEhnRmlsZXMobG9jYWxEaXJlY3Rvcnk6IHN0cmluZyk6IFByb21pc2U8QXJyYXk8c3RyaW5nPj4ge1xuICByZXR1cm4gZ2V0RmlsZXNGcm9tQ29tbWFuZChcbiAgICAnaGcnLFxuICAgIC8vIENhbGxpbmcgJ2hnIHN0YXR1cycgd2l0aCBhIHBhdGggaGFzIHR3byBzaWRlLWVmZmVjdHM6XG4gICAgLy8gMS4gSXQgcmV0dXJucyB0aGUgc3RhdHVzIG9mIG9ubHkgZmlsZXMgdW5kZXIgdGhlIGdpdmVuIHBhdGguIEluIHRoaXMgY2FzZSxcbiAgICAvLyAgICB3ZSBvbmx5IHdhbnQgdGhlIHVudHJhY2tlZCBmaWxlcyB1bmRlciB0aGUgZ2l2ZW4gbG9jYWxEaXJlY3RvcnkuXG4gICAgLy8gMi4gSXQgcmV0dXJucyB0aGUgcGF0aHMgcmVsYXRpdmUgdG8gdGhlIGRpcmVjdG9yeSBpbiB3aGljaCB0aGlzIGNvbW1hbmQgaXNcbiAgICAvLyAgICBydW4uIFRoaXMgaXMgaGFyZC1jb2RlZCB0byAnbG9jYWxEaXJlY3RvcnknIGluIGBnZXRGaWxlc0Zyb21Db21tYW5kYCxcbiAgICAvLyAgICB3aGljaCBpcyB3aGF0IHdlIHdhbnQuXG4gICAgWydzdGF0dXMnLCAnLS11bmtub3duJywgJy0tbm8tc3RhdHVzJyAvKiBObyBzdGF0dXMgY29kZS4gKi8sIGxvY2FsRGlyZWN0b3J5XSxcbiAgICBsb2NhbERpcmVjdG9yeSxcbiAgKTtcbn1cblxuLyoqXG4gKiBAcGFyYW0gbG9jYWxEaXJlY3RvcnkgVGhlIGZ1bGwgcGF0aCB0byBhIGRpcmVjdG9yeS5cbiAqIEByZXR1cm4gSWYgbG9jYWxEaXJlY3RvcnkgaXMgd2l0aGluIGFuIEhnIHJlcG8sIHJldHVybnMgYW4gT2JqZWN0IHdoZXJlIHRoZVxuICogICBrZXlzIGFyZSBmaWxlIHBhdGhzIChyZWxhdGl2ZSB0byB0aGUgJ2xvY2FsRGlyZWN0b3J5Jykgb2YgdHJhY2tlZCBhbmQgdW50cmFja2VkXG4gKiAgIGZpbGVzIHdpdGhpbiB0aGF0IGRpcmVjdG9yeSwgYnV0IG5vdCBpbmNsdWRpbmcgaWdub3JlZCBmaWxlcy4gQWxsIHZhbHVlc1xuICogICBhcmUgJ3RydWUnLiBJZiBsb2NhbERpcmVjdG9yeSBpcyBub3Qgd2l0aGluIGFuIEhnIHJlcG8sIHRoZSBQcm9taXNlIHJlamVjdHMuXG4gKi9cbmZ1bmN0aW9uIGdldEZpbGVzRnJvbUhnKGxvY2FsRGlyZWN0b3J5OiBzdHJpbmcpOiBQcm9taXNlPEFycmF5PHN0cmluZz4+IHtcbiAgcmV0dXJuIFByb21pc2UuYWxsKFtnZXRUcmFja2VkSGdGaWxlcyhsb2NhbERpcmVjdG9yeSksIGdldFVudHJhY2tlZEhnRmlsZXMobG9jYWxEaXJlY3RvcnkpXSkudGhlbihcbiAgICByZXR1cm5lZEZpbGVzID0+IHtcbiAgICAgIGNvbnN0IFt0cmFja2VkRmlsZXMsIHVudHJhY2tlZEZpbGVzXSA9IHJldHVybmVkRmlsZXM7XG4gICAgICByZXR1cm4gdHJhY2tlZEZpbGVzLmNvbmNhdCh1bnRyYWNrZWRGaWxlcyk7XG4gICAgfVxuICApO1xufVxuXG5mdW5jdGlvbiBnZXRUcmFja2VkR2l0RmlsZXMobG9jYWxEaXJlY3Rvcnk6IHN0cmluZyk6IFByb21pc2U8QXJyYXk8c3RyaW5nPj4ge1xuICByZXR1cm4gZ2V0RmlsZXNGcm9tQ29tbWFuZCgnZ2l0JywgWydscy1maWxlcyddLCBsb2NhbERpcmVjdG9yeSk7XG59XG5cbi8qKlxuICogJ1VudHJhY2tlZCcgZmlsZXMgYXJlIGZpbGVzIHRoYXQgaGF2ZW4ndCBiZWVuIGFkZGVkIHRvIHRoZSByZXBvLCBidXQgaGF2ZW4ndFxuICogYmVlbiBleHBsaWNpdGx5IGdpdC1pZ25vcmVkLlxuICovXG5mdW5jdGlvbiBnZXRVbnRyYWNrZWRHaXRGaWxlcyhsb2NhbERpcmVjdG9yeTogc3RyaW5nKTogUHJvbWlzZTxBcnJheTxzdHJpbmc+PiB7XG4gIC8vICctLW90aGVycycgbWVhbnMgdW50cmFja2VkIGZpbGVzLCBhbmQgJy0tZXhjbHVkZS1zdGFuZGFyZCcgZXhjbHVkZXMgaWdub3JlZCBmaWxlcy5cbiAgcmV0dXJuIGdldEZpbGVzRnJvbUNvbW1hbmQoJ2dpdCcsIFsnbHMtZmlsZXMnLCAnLS1leGNsdWRlLXN0YW5kYXJkJywgJy0tb3RoZXJzJ10sIGxvY2FsRGlyZWN0b3J5KTtcbn1cblxuLyoqXG4gKiBAcGFyYW0gbG9jYWxEaXJlY3RvcnkgVGhlIGZ1bGwgcGF0aCB0byBhIGRpcmVjdG9yeS5cbiAqIEByZXR1cm4gSWYgbG9jYWxEaXJlY3RvcnkgaXMgd2l0aGluIGEgR2l0IHJlcG8sIHJldHVybnMgYW4gT2JqZWN0IHdoZXJlIHRoZVxuICogICBrZXlzIGFyZSBmaWxlIHBhdGhzIChyZWxhdGl2ZSB0byB0aGUgJ2xvY2FsRGlyZWN0b3J5Jykgb2YgdHJhY2tlZCBhbmQgdW50cmFja2VkXG4gKiAgIGZpbGVzIHdpdGhpbiB0aGF0IGRpcmVjdG9yeSwgYnV0IG5vdCBpbmNsdWRpbmcgaWdub3JlZCBmaWxlcy4gQWxsIHZhbHVlc1xuICogICBhcmUgJ3RydWUnLiBJZiBsb2NhbERpcmVjdG9yeSBpcyBub3Qgd2l0aGluIGEgR2l0IHJlcG8sIHRoZSBQcm9taXNlIHJlamVjdHMuXG4gKi9cbmZ1bmN0aW9uIGdldEZpbGVzRnJvbUdpdChsb2NhbERpcmVjdG9yeTogc3RyaW5nKTogUHJvbWlzZTxBcnJheTxzdHJpbmc+PiB7XG4gIHJldHVybiBQcm9taXNlLmFsbChcbiAgICAgIFtnZXRUcmFja2VkR2l0RmlsZXMobG9jYWxEaXJlY3RvcnkpLCBnZXRVbnRyYWNrZWRHaXRGaWxlcyhsb2NhbERpcmVjdG9yeSldKS50aGVuKFxuICAgIHJldHVybmVkRmlsZXMgPT4ge1xuICAgICAgY29uc3QgW3RyYWNrZWRGaWxlcywgdW50cmFja2VkRmlsZXNdID0gcmV0dXJuZWRGaWxlcztcbiAgICAgIHJldHVybiB0cmFja2VkRmlsZXMuY29uY2F0KHVudHJhY2tlZEZpbGVzKTtcbiAgICB9XG4gICk7XG59XG5cbmZ1bmN0aW9uIGdldEFsbEZpbGVzKGxvY2FsRGlyZWN0b3J5OiBzdHJpbmcpOiBQcm9taXNlPEFycmF5PHN0cmluZz4+IHtcbiAgcmV0dXJuIGdldEZpbGVzRnJvbUNvbW1hbmQoXG4gICAgICAnZmluZCcsXG4gICAgICBbJy4nLCAnLXR5cGUnLCAnZiddLFxuICAgICAgbG9jYWxEaXJlY3RvcnksXG4gICAgICAvLyBTbGljZSBvZmYgdGhlIGxlYWRpbmcgYC4vYCB0aGF0IGZpbmQgd2lsbCBhZGQgb24gaGVyZS5cbiAgICAgIGZpbGVQYXRoID0+IGZpbGVQYXRoLnN1YnN0cmluZygyKSk7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGdldEZpbGVzRnJvbVdhdGNobWFuKGxvY2FsRGlyZWN0b3J5OiBzdHJpbmcpOiBQcm9taXNlPEFycmF5PHN0cmluZz4+IHtcbiAgY29uc3Qgd2F0Y2htYW5DbGllbnQgPSBuZXcgV2F0Y2htYW5DbGllbnQoKTtcbiAgdHJ5IHtcbiAgICByZXR1cm4gYXdhaXQgd2F0Y2htYW5DbGllbnQubGlzdEZpbGVzKGxvY2FsRGlyZWN0b3J5KTtcbiAgfSBmaW5hbGx5IHtcbiAgICB3YXRjaG1hbkNsaWVudC5kaXNwb3NlKCk7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldFBhdGhzKGxvY2FsRGlyZWN0b3J5OiBzdHJpbmcpOiBQcm9taXNlPEFycmF5PHN0cmluZz4+IHtcbiAgLy8gQXR0ZW1wdHMgdG8gZ2V0IGEgbGlzdCBvZiBmaWxlcyByZWxhdGl2ZSB0byBgbG9jYWxEaXJlY3RvcnlgLCBob3BlZnVsbHkgZnJvbVxuICAvLyBhIGZhc3Qgc291cmNlIGNvbnRyb2wgaW5kZXguXG4gIC8vIFRPRE8gKHdpbGxpYW1zYykgb25jZSBgYHtIR3xHaXR9UmVwb3NpdG9yeWAgaXMgd29ya2luZyBpbiBudWNsaWRlLXNlcnZlcixcbiAgLy8gdXNlIHRob3NlIGluc3RlYWQgdG8gZGV0ZXJtaW5lIFZDUy5cbiAgcmV0dXJuIGdldEZpbGVzRnJvbVdhdGNobWFuKGxvY2FsRGlyZWN0b3J5KVxuICAgICAgLmNhdGNoKCgpID0+IGdldEZpbGVzRnJvbUhnKGxvY2FsRGlyZWN0b3J5KSlcbiAgICAgIC5jYXRjaCgoKSA9PiBnZXRGaWxlc0Zyb21HaXQobG9jYWxEaXJlY3RvcnkpKVxuICAgICAgLmNhdGNoKCgpID0+IGdldEFsbEZpbGVzKGxvY2FsRGlyZWN0b3J5KSlcbiAgICAgIC5jYXRjaCgoKSA9PiB7IHRocm93IG5ldyBFcnJvcihgRmFpbGVkIHRvIHBvcHVsYXRlIEZpbGVTZWFyY2ggZm9yICR7bG9jYWxEaXJlY3Rvcnl9YCk7IH0pO1xufVxuXG5leHBvcnQgY29uc3QgX190ZXN0X18gPSB7XG4gIGdldEZpbGVzRnJvbUdpdCxcbiAgZ2V0RmlsZXNGcm9tSGcsXG59O1xuIl19