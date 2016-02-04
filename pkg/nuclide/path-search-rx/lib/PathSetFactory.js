Object.defineProperty(exports, '__esModule', {
  value: true
});

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

/**
 * Creates a `PathSet` with the contents of the specified directory.
 */

var createPathSet = _asyncToGenerator(function* (localDirectory) {
  // Attempts to get a list of files relative to `localDirectory`, hopefully from
  // a fast source control index.
  // TODO (williamsc) once ``{HG|Git}Repository` is working in nuclide-server,
  // use those instead to determine VCS.
  var paths = yield getFilesFromHg(localDirectory)['catch'](function () {
    return getFilesFromGit(localDirectory);
  })['catch'](function () {
    return getAllFiles(localDirectory);
  })['catch'](function () {
    throw new Error('Failed to populate FileSearch for ' + localDirectory);
  });
  return new _LazyPathSet2['default']({ paths: paths });
});

exports.createPathSet = createPathSet;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

var _child_process = require('child_process');

var _split = require('split');

var _split2 = _interopRequireDefault(_split);

var _LazyPathSet = require('./LazyPathSet');

var _LazyPathSet2 = _interopRequireDefault(_LazyPathSet);

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

/**
 * An Object where the keys are file paths (relative to a certain directory),
 * and the values are booleans. In practice, all the values are 'true'.
 */

function getFilesFromCommand(command, args, localDirectory, transform) {
  return new Promise(function (resolve, reject) {
    // Use `spawn` here to process the, possibly huge, output of the file listing.

    var proc = (0, _child_process.spawn)(command, args, { cwd: localDirectory });

    proc.on('error', reject);

    var filePaths = {};
    proc.stdout.pipe((0, _split2['default'])()).on('data', function (filePath) {
      if (transform) {
        filePath = transform(filePath);
      }

      if (filePath !== '') {
        filePaths[filePath] = true;
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

    return _extends({}, trackedFiles, untrackedFiles);
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

    return _extends({}, trackedFiles, untrackedFiles);
  });
}

function getAllFiles(localDirectory) {
  return getFilesFromCommand('find', ['.', '-type', 'f'], localDirectory,
  // Slice off the leading `./` that find will add on here.
  function (filePath) {
    return filePath.substring(2);
  });
}var __test__ = {
  getFilesFromGit: getFilesFromGit,
  getFilesFromHg: getFilesFromHg
};
exports.__test__ = __test__;
//# sourceMappingURL=data:application/json;base64,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IiwiZmlsZSI6IlBhdGhTZXRGYWN0b3J5LmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuLyoqXG4gKiBBbiBPYmplY3Qgd2hlcmUgdGhlIGtleXMgYXJlIGZpbGUgcGF0aHMgKHJlbGF0aXZlIHRvIGEgY2VydGFpbiBkaXJlY3RvcnkpLFxuICogYW5kIHRoZSB2YWx1ZXMgYXJlIGJvb2xlYW5zLiBJbiBwcmFjdGljZSwgYWxsIHRoZSB2YWx1ZXMgYXJlICd0cnVlJy5cbiAqL1xudHlwZSBGaWxlUGF0aHNQc2V1ZG9TZXQgPSB7W2tleTogc3RyaW5nXTogYm9vbGVhbn07XG5cbmltcG9ydCB7c3Bhd259IGZyb20gJ2NoaWxkX3Byb2Nlc3MnO1xuaW1wb3J0IHNwbGl0IGZyb20gJ3NwbGl0JztcblxuaW1wb3J0IExhenlQYXRoU2V0IGZyb20gJy4vTGF6eVBhdGhTZXQnO1xuXG5mdW5jdGlvbiBnZXRGaWxlc0Zyb21Db21tYW5kKFxuICAgIGNvbW1hbmQ6IHN0cmluZyxcbiAgICBhcmdzOiBBcnJheTxzdHJpbmc+LFxuICAgIGxvY2FsRGlyZWN0b3J5OiBzdHJpbmcsXG4gICAgdHJhbnNmb3JtPzogKHBhdGg6IHN0cmluZykgPT4gc3RyaW5nKTogUHJvbWlzZTxGaWxlUGF0aHNQc2V1ZG9TZXQ+IHtcbiAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAvLyBVc2UgYHNwYXduYCBoZXJlIHRvIHByb2Nlc3MgdGhlLCBwb3NzaWJseSBodWdlLCBvdXRwdXQgb2YgdGhlIGZpbGUgbGlzdGluZy5cblxuICAgIGNvbnN0IHByb2MgPSBzcGF3bihjb21tYW5kLCBhcmdzLCB7Y3dkOiBsb2NhbERpcmVjdG9yeX0pO1xuXG4gICAgcHJvYy5vbignZXJyb3InLCByZWplY3QpO1xuXG4gICAgY29uc3QgZmlsZVBhdGhzID0ge307XG4gICAgcHJvYy5zdGRvdXQucGlwZShzcGxpdCgpKS5vbignZGF0YScsIChmaWxlUGF0aCkgPT4ge1xuICAgICAgaWYgKHRyYW5zZm9ybSkge1xuICAgICAgICBmaWxlUGF0aCA9IHRyYW5zZm9ybShmaWxlUGF0aCk7XG4gICAgICB9XG5cbiAgICAgIGlmIChmaWxlUGF0aCAhPT0gJycpIHtcbiAgICAgICAgZmlsZVBhdGhzW2ZpbGVQYXRoXSA9IHRydWU7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICBsZXQgZXJyb3JTdHJpbmcgPSAnJztcbiAgICBwcm9jLnN0ZGVyci5vbignZGF0YScsIChkYXRhKSA9PiB7XG4gICAgICBlcnJvclN0cmluZyArPSBkYXRhO1xuICAgIH0pO1xuXG4gICAgcHJvYy5vbignY2xvc2UnLCAoY29kZSkgPT4ge1xuICAgICAgaWYgKGNvZGUgPT09IDApIHtcbiAgICAgICAgcmVzb2x2ZShmaWxlUGF0aHMpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmVqZWN0KGVycm9yU3RyaW5nKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIGdldFRyYWNrZWRIZ0ZpbGVzKGxvY2FsRGlyZWN0b3J5OiBzdHJpbmcpOiBQcm9taXNlPEZpbGVQYXRoc1BzZXVkb1NldD4ge1xuICByZXR1cm4gZ2V0RmlsZXNGcm9tQ29tbWFuZChcbiAgICAnaGcnLFxuICAgIFsnbG9jYXRlJywgJy0tZnVsbHBhdGgnLCAnLS1pbmNsdWRlJywgJy4nXSxcbiAgICBsb2NhbERpcmVjdG9yeSxcbiAgICBmaWxlUGF0aCA9PiBmaWxlUGF0aC5zbGljZShsb2NhbERpcmVjdG9yeS5sZW5ndGggKyAxKVxuICApO1xufVxuXG4vKipcbiAqICdVbnRyYWNrZWQnIGZpbGVzIGFyZSBmaWxlcyB0aGF0IGhhdmVuJ3QgYmVlbiBhZGRlZCB0byB0aGUgcmVwbywgYnV0IGhhdmVuJ3RcbiAqIGJlZW4gZXhwbGljaXRseSBoZy1pZ25vcmVkLlxuICovXG5mdW5jdGlvbiBnZXRVbnRyYWNrZWRIZ0ZpbGVzKGxvY2FsRGlyZWN0b3J5OiBzdHJpbmcpOiBQcm9taXNlPEZpbGVQYXRoc1BzZXVkb1NldD4ge1xuICByZXR1cm4gZ2V0RmlsZXNGcm9tQ29tbWFuZChcbiAgICAnaGcnLFxuICAgIC8vIENhbGxpbmcgJ2hnIHN0YXR1cycgd2l0aCBhIHBhdGggaGFzIHR3byBzaWRlLWVmZmVjdHM6XG4gICAgLy8gMS4gSXQgcmV0dXJucyB0aGUgc3RhdHVzIG9mIG9ubHkgZmlsZXMgdW5kZXIgdGhlIGdpdmVuIHBhdGguIEluIHRoaXMgY2FzZSxcbiAgICAvLyAgICB3ZSBvbmx5IHdhbnQgdGhlIHVudHJhY2tlZCBmaWxlcyB1bmRlciB0aGUgZ2l2ZW4gbG9jYWxEaXJlY3RvcnkuXG4gICAgLy8gMi4gSXQgcmV0dXJucyB0aGUgcGF0aHMgcmVsYXRpdmUgdG8gdGhlIGRpcmVjdG9yeSBpbiB3aGljaCB0aGlzIGNvbW1hbmQgaXNcbiAgICAvLyAgICBydW4uIFRoaXMgaXMgaGFyZC1jb2RlZCB0byAnbG9jYWxEaXJlY3RvcnknIGluIGBnZXRGaWxlc0Zyb21Db21tYW5kYCxcbiAgICAvLyAgICB3aGljaCBpcyB3aGF0IHdlIHdhbnQuXG4gICAgWydzdGF0dXMnLCAnLS11bmtub3duJywgJy0tbm8tc3RhdHVzJyAvKiBObyBzdGF0dXMgY29kZS4gKi8sIGxvY2FsRGlyZWN0b3J5XSxcbiAgICBsb2NhbERpcmVjdG9yeSxcbiAgKTtcbn1cblxuLyoqXG4gKiBAcGFyYW0gbG9jYWxEaXJlY3RvcnkgVGhlIGZ1bGwgcGF0aCB0byBhIGRpcmVjdG9yeS5cbiAqIEByZXR1cm4gSWYgbG9jYWxEaXJlY3RvcnkgaXMgd2l0aGluIGFuIEhnIHJlcG8sIHJldHVybnMgYW4gT2JqZWN0IHdoZXJlIHRoZVxuICogICBrZXlzIGFyZSBmaWxlIHBhdGhzIChyZWxhdGl2ZSB0byB0aGUgJ2xvY2FsRGlyZWN0b3J5Jykgb2YgdHJhY2tlZCBhbmQgdW50cmFja2VkXG4gKiAgIGZpbGVzIHdpdGhpbiB0aGF0IGRpcmVjdG9yeSwgYnV0IG5vdCBpbmNsdWRpbmcgaWdub3JlZCBmaWxlcy4gQWxsIHZhbHVlc1xuICogICBhcmUgJ3RydWUnLiBJZiBsb2NhbERpcmVjdG9yeSBpcyBub3Qgd2l0aGluIGFuIEhnIHJlcG8sIHRoZSBQcm9taXNlIHJlamVjdHMuXG4gKi9cbmZ1bmN0aW9uIGdldEZpbGVzRnJvbUhnKGxvY2FsRGlyZWN0b3J5OiBzdHJpbmcpOiBQcm9taXNlPEZpbGVQYXRoc1BzZXVkb1NldD4ge1xuICByZXR1cm4gUHJvbWlzZS5hbGwoW2dldFRyYWNrZWRIZ0ZpbGVzKGxvY2FsRGlyZWN0b3J5KSwgZ2V0VW50cmFja2VkSGdGaWxlcyhsb2NhbERpcmVjdG9yeSldKS50aGVuKFxuICAgIChyZXR1cm5lZEZpbGVzKSA9PiB7XG4gICAgICBjb25zdCBbdHJhY2tlZEZpbGVzLCB1bnRyYWNrZWRGaWxlc10gPSByZXR1cm5lZEZpbGVzO1xuICAgICAgcmV0dXJuIHsuLi50cmFja2VkRmlsZXMsIC4uLnVudHJhY2tlZEZpbGVzfTtcbiAgICB9XG4gICk7XG59XG5cbmZ1bmN0aW9uIGdldFRyYWNrZWRHaXRGaWxlcyhsb2NhbERpcmVjdG9yeTogc3RyaW5nKTogUHJvbWlzZTxGaWxlUGF0aHNQc2V1ZG9TZXQ+IHtcbiAgcmV0dXJuIGdldEZpbGVzRnJvbUNvbW1hbmQoJ2dpdCcsIFsnbHMtZmlsZXMnXSwgbG9jYWxEaXJlY3RvcnkpO1xufVxuXG4vKipcbiAqICdVbnRyYWNrZWQnIGZpbGVzIGFyZSBmaWxlcyB0aGF0IGhhdmVuJ3QgYmVlbiBhZGRlZCB0byB0aGUgcmVwbywgYnV0IGhhdmVuJ3RcbiAqIGJlZW4gZXhwbGljaXRseSBnaXQtaWdub3JlZC5cbiAqL1xuZnVuY3Rpb24gZ2V0VW50cmFja2VkR2l0RmlsZXMobG9jYWxEaXJlY3Rvcnk6IHN0cmluZyk6IFByb21pc2U8RmlsZVBhdGhzUHNldWRvU2V0PiB7XG4gIC8vICctLW90aGVycycgbWVhbnMgdW50cmFja2VkIGZpbGVzLCBhbmQgJy0tZXhjbHVkZS1zdGFuZGFyZCcgZXhjbHVkZXMgaWdub3JlZCBmaWxlcy5cbiAgcmV0dXJuIGdldEZpbGVzRnJvbUNvbW1hbmQoJ2dpdCcsIFsnbHMtZmlsZXMnLCAnLS1leGNsdWRlLXN0YW5kYXJkJywgJy0tb3RoZXJzJ10sIGxvY2FsRGlyZWN0b3J5KTtcbn1cblxuLyoqXG4gKiBAcGFyYW0gbG9jYWxEaXJlY3RvcnkgVGhlIGZ1bGwgcGF0aCB0byBhIGRpcmVjdG9yeS5cbiAqIEByZXR1cm4gSWYgbG9jYWxEaXJlY3RvcnkgaXMgd2l0aGluIGEgR2l0IHJlcG8sIHJldHVybnMgYW4gT2JqZWN0IHdoZXJlIHRoZVxuICogICBrZXlzIGFyZSBmaWxlIHBhdGhzIChyZWxhdGl2ZSB0byB0aGUgJ2xvY2FsRGlyZWN0b3J5Jykgb2YgdHJhY2tlZCBhbmQgdW50cmFja2VkXG4gKiAgIGZpbGVzIHdpdGhpbiB0aGF0IGRpcmVjdG9yeSwgYnV0IG5vdCBpbmNsdWRpbmcgaWdub3JlZCBmaWxlcy4gQWxsIHZhbHVlc1xuICogICBhcmUgJ3RydWUnLiBJZiBsb2NhbERpcmVjdG9yeSBpcyBub3Qgd2l0aGluIGEgR2l0IHJlcG8sIHRoZSBQcm9taXNlIHJlamVjdHMuXG4gKi9cbmZ1bmN0aW9uIGdldEZpbGVzRnJvbUdpdChsb2NhbERpcmVjdG9yeTogc3RyaW5nKTogUHJvbWlzZTxGaWxlUGF0aHNQc2V1ZG9TZXQ+IHtcbiAgcmV0dXJuIFByb21pc2UuYWxsKFxuICAgICAgW2dldFRyYWNrZWRHaXRGaWxlcyhsb2NhbERpcmVjdG9yeSksIGdldFVudHJhY2tlZEdpdEZpbGVzKGxvY2FsRGlyZWN0b3J5KV0pLnRoZW4oXG4gICAgKHJldHVybmVkRmlsZXMpID0+IHtcbiAgICAgIGNvbnN0IFt0cmFja2VkRmlsZXMsIHVudHJhY2tlZEZpbGVzXSA9IHJldHVybmVkRmlsZXM7XG4gICAgICByZXR1cm4gey4uLnRyYWNrZWRGaWxlcywgLi4udW50cmFja2VkRmlsZXN9O1xuICAgIH1cbiAgKTtcbn1cblxuZnVuY3Rpb24gZ2V0QWxsRmlsZXMobG9jYWxEaXJlY3Rvcnk6IHN0cmluZyk6IFByb21pc2U8RmlsZVBhdGhzUHNldWRvU2V0PiB7XG4gIHJldHVybiBnZXRGaWxlc0Zyb21Db21tYW5kKFxuICAgICAgJ2ZpbmQnLFxuICAgICAgWycuJywgJy10eXBlJywgJ2YnXSxcbiAgICAgIGxvY2FsRGlyZWN0b3J5LFxuICAgICAgLy8gU2xpY2Ugb2ZmIHRoZSBsZWFkaW5nIGAuL2AgdGhhdCBmaW5kIHdpbGwgYWRkIG9uIGhlcmUuXG4gICAgICBmaWxlUGF0aCA9PiBmaWxlUGF0aC5zdWJzdHJpbmcoMikpO1xufVxuXG4vKipcbiAqIENyZWF0ZXMgYSBgUGF0aFNldGAgd2l0aCB0aGUgY29udGVudHMgb2YgdGhlIHNwZWNpZmllZCBkaXJlY3RvcnkuXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBjcmVhdGVQYXRoU2V0KGxvY2FsRGlyZWN0b3J5OiBzdHJpbmcpOiBQcm9taXNlPExhenlQYXRoU2V0PiB7XG4gIC8vIEF0dGVtcHRzIHRvIGdldCBhIGxpc3Qgb2YgZmlsZXMgcmVsYXRpdmUgdG8gYGxvY2FsRGlyZWN0b3J5YCwgaG9wZWZ1bGx5IGZyb21cbiAgLy8gYSBmYXN0IHNvdXJjZSBjb250cm9sIGluZGV4LlxuICAvLyBUT0RPICh3aWxsaWFtc2MpIG9uY2UgYGB7SEd8R2l0fVJlcG9zaXRvcnlgIGlzIHdvcmtpbmcgaW4gbnVjbGlkZS1zZXJ2ZXIsXG4gIC8vIHVzZSB0aG9zZSBpbnN0ZWFkIHRvIGRldGVybWluZSBWQ1MuXG4gIGNvbnN0IHBhdGhzID0gYXdhaXQgZ2V0RmlsZXNGcm9tSGcobG9jYWxEaXJlY3RvcnkpXG4gICAgICAuY2F0Y2goKCkgPT4gZ2V0RmlsZXNGcm9tR2l0KGxvY2FsRGlyZWN0b3J5KSlcbiAgICAgIC5jYXRjaCgoKSA9PiBnZXRBbGxGaWxlcyhsb2NhbERpcmVjdG9yeSkpXG4gICAgICAuY2F0Y2goKCkgPT4geyB0aHJvdyBuZXcgRXJyb3IoYEZhaWxlZCB0byBwb3B1bGF0ZSBGaWxlU2VhcmNoIGZvciAke2xvY2FsRGlyZWN0b3J5fWApOyB9KTtcbiAgcmV0dXJuIG5ldyBMYXp5UGF0aFNldCh7cGF0aHN9KTtcbn1cblxuZXhwb3J0IGNvbnN0IF9fdGVzdF9fID0ge1xuICBnZXRGaWxlc0Zyb21HaXQsXG4gIGdldEZpbGVzRnJvbUhnLFxufTtcbiJdfQ==