Object.defineProperty(exports, '__esModule', {
  value: true
});

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var getFilesFromWatchman = _asyncToGenerator(function* (localDirectory) {
  var watchmanClient = new _watchmanHelpers.WatchmanClient();
  try {
    var files = yield watchmanClient.listFiles(localDirectory);
    var filePaths = {};
    for (var file of files) {
      filePaths[file] = true;
    }
    return filePaths;
  } finally {
    watchmanClient.dispose();
  }
}

/**
 * Creates a `PathSet` with the contents of the specified directory.
 */
);

var createPathSet = _asyncToGenerator(function* (localDirectory) {
  // Attempts to get a list of files relative to `localDirectory`, hopefully from
  // a fast source control index.
  // TODO (williamsc) once ``{HG|Git}Repository` is working in nuclide-server,
  // use those instead to determine VCS.
  var paths = yield getFilesFromWatchman(localDirectory)['catch'](function () {
    return getFilesFromHg(localDirectory);
  })['catch'](function () {
    return getFilesFromGit(localDirectory);
  })['catch'](function () {
    return getAllFiles(localDirectory);
  })['catch'](function () {
    throw new Error('Failed to populate FileSearch for ' + localDirectory);
  });
  return new _PathSet2['default']({ paths: paths });
});

exports.createPathSet = createPathSet;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

var _child_process = require('child_process');

var _split = require('split');

var _split2 = _interopRequireDefault(_split);

var _PathSet = require('./PathSet');

var _PathSet2 = _interopRequireDefault(_PathSet);

var _watchmanHelpers = require('../../watchman-helpers');

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
}

var __test__ = {
  getFilesFromGit: getFilesFromGit,
  getFilesFromHg: getFilesFromHg
};
exports.__test__ = __test__;
//# sourceMappingURL=data:application/json;base64,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QUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FDbEYsVUFBQSxhQUFhLEVBQUk7eUNBQ3dCLGFBQWE7O1FBQTdDLFlBQVk7UUFBRSxjQUFjOztBQUNuQyx3QkFBVyxZQUFZLEVBQUssY0FBYyxFQUFFO0dBQzdDLENBQ0YsQ0FBQztDQUNIOztBQUVELFNBQVMsV0FBVyxDQUFDLGNBQXNCLEVBQStCO0FBQ3hFLFNBQU8sbUJBQW1CLENBQ3RCLE1BQU0sRUFDTixDQUFDLEdBQUcsRUFBRSxPQUFPLEVBQUUsR0FBRyxDQUFDLEVBQ25CLGNBQWM7O0FBRWQsWUFBQSxRQUFRO1dBQUksUUFBUSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7R0FBQSxDQUFDLENBQUM7Q0FDeEM7O0FBZ0NNLElBQU0sUUFBUSxHQUFHO0FBQ3RCLGlCQUFlLEVBQWYsZUFBZTtBQUNmLGdCQUFjLEVBQWQsY0FBYztDQUNmLENBQUMiLCJmaWxlIjoiUGF0aFNldEZhY3RvcnkuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG4vKipcbiAqIEFuIE9iamVjdCB3aGVyZSB0aGUga2V5cyBhcmUgZmlsZSBwYXRocyAocmVsYXRpdmUgdG8gYSBjZXJ0YWluIGRpcmVjdG9yeSksXG4gKiBhbmQgdGhlIHZhbHVlcyBhcmUgYm9vbGVhbnMuIEluIHByYWN0aWNlLCBhbGwgdGhlIHZhbHVlcyBhcmUgJ3RydWUnLlxuICovXG50eXBlIEZpbGVQYXRoc1BzZXVkb1NldCA9IHtba2V5OiBzdHJpbmddOiBib29sZWFufTtcblxuaW1wb3J0IHtzcGF3bn0gZnJvbSAnY2hpbGRfcHJvY2Vzcyc7XG5pbXBvcnQgc3BsaXQgZnJvbSAnc3BsaXQnO1xuXG5pbXBvcnQgUGF0aFNldCBmcm9tICcuL1BhdGhTZXQnO1xuaW1wb3J0IHtXYXRjaG1hbkNsaWVudH0gZnJvbSAnLi4vLi4vd2F0Y2htYW4taGVscGVycyc7XG5cbmZ1bmN0aW9uIGdldEZpbGVzRnJvbUNvbW1hbmQoXG4gICAgY29tbWFuZDogc3RyaW5nLFxuICAgIGFyZ3M6IEFycmF5PHN0cmluZz4sXG4gICAgbG9jYWxEaXJlY3Rvcnk6IHN0cmluZyxcbiAgICB0cmFuc2Zvcm0/OiAocGF0aDogc3RyaW5nKSA9PiBzdHJpbmcpOiBQcm9taXNlPEZpbGVQYXRoc1BzZXVkb1NldD4ge1xuICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgIC8vIFVzZSBgc3Bhd25gIGhlcmUgdG8gcHJvY2VzcyB0aGUsIHBvc3NpYmx5IGh1Z2UsIG91dHB1dCBvZiB0aGUgZmlsZSBsaXN0aW5nLlxuXG4gICAgY29uc3QgcHJvYyA9IHNwYXduKGNvbW1hbmQsIGFyZ3MsIHtjd2Q6IGxvY2FsRGlyZWN0b3J5fSk7XG5cbiAgICBwcm9jLm9uKCdlcnJvcicsIHJlamVjdCk7XG5cbiAgICBjb25zdCBmaWxlUGF0aHMgPSB7fTtcbiAgICBwcm9jLnN0ZG91dC5waXBlKHNwbGl0KCkpLm9uKCdkYXRhJywgZmlsZVBhdGggPT4ge1xuICAgICAgaWYgKHRyYW5zZm9ybSkge1xuICAgICAgICBmaWxlUGF0aCA9IHRyYW5zZm9ybShmaWxlUGF0aCk7XG4gICAgICB9XG5cbiAgICAgIGlmIChmaWxlUGF0aCAhPT0gJycpIHtcbiAgICAgICAgZmlsZVBhdGhzW2ZpbGVQYXRoXSA9IHRydWU7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICBsZXQgZXJyb3JTdHJpbmcgPSAnJztcbiAgICBwcm9jLnN0ZGVyci5vbignZGF0YScsIGRhdGEgPT4ge1xuICAgICAgZXJyb3JTdHJpbmcgKz0gZGF0YTtcbiAgICB9KTtcblxuICAgIHByb2Mub24oJ2Nsb3NlJywgY29kZSA9PiB7XG4gICAgICBpZiAoY29kZSA9PT0gMCkge1xuICAgICAgICByZXNvbHZlKGZpbGVQYXRocyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZWplY3QoZXJyb3JTdHJpbmcpO1xuICAgICAgfVxuICAgIH0pO1xuICB9KTtcbn1cblxuZnVuY3Rpb24gZ2V0VHJhY2tlZEhnRmlsZXMobG9jYWxEaXJlY3Rvcnk6IHN0cmluZyk6IFByb21pc2U8RmlsZVBhdGhzUHNldWRvU2V0PiB7XG4gIHJldHVybiBnZXRGaWxlc0Zyb21Db21tYW5kKFxuICAgICdoZycsXG4gICAgWydsb2NhdGUnLCAnLS1mdWxscGF0aCcsICctLWluY2x1ZGUnLCAnLiddLFxuICAgIGxvY2FsRGlyZWN0b3J5LFxuICAgIGZpbGVQYXRoID0+IGZpbGVQYXRoLnNsaWNlKGxvY2FsRGlyZWN0b3J5Lmxlbmd0aCArIDEpXG4gICk7XG59XG5cbi8qKlxuICogJ1VudHJhY2tlZCcgZmlsZXMgYXJlIGZpbGVzIHRoYXQgaGF2ZW4ndCBiZWVuIGFkZGVkIHRvIHRoZSByZXBvLCBidXQgaGF2ZW4ndFxuICogYmVlbiBleHBsaWNpdGx5IGhnLWlnbm9yZWQuXG4gKi9cbmZ1bmN0aW9uIGdldFVudHJhY2tlZEhnRmlsZXMobG9jYWxEaXJlY3Rvcnk6IHN0cmluZyk6IFByb21pc2U8RmlsZVBhdGhzUHNldWRvU2V0PiB7XG4gIHJldHVybiBnZXRGaWxlc0Zyb21Db21tYW5kKFxuICAgICdoZycsXG4gICAgLy8gQ2FsbGluZyAnaGcgc3RhdHVzJyB3aXRoIGEgcGF0aCBoYXMgdHdvIHNpZGUtZWZmZWN0czpcbiAgICAvLyAxLiBJdCByZXR1cm5zIHRoZSBzdGF0dXMgb2Ygb25seSBmaWxlcyB1bmRlciB0aGUgZ2l2ZW4gcGF0aC4gSW4gdGhpcyBjYXNlLFxuICAgIC8vICAgIHdlIG9ubHkgd2FudCB0aGUgdW50cmFja2VkIGZpbGVzIHVuZGVyIHRoZSBnaXZlbiBsb2NhbERpcmVjdG9yeS5cbiAgICAvLyAyLiBJdCByZXR1cm5zIHRoZSBwYXRocyByZWxhdGl2ZSB0byB0aGUgZGlyZWN0b3J5IGluIHdoaWNoIHRoaXMgY29tbWFuZCBpc1xuICAgIC8vICAgIHJ1bi4gVGhpcyBpcyBoYXJkLWNvZGVkIHRvICdsb2NhbERpcmVjdG9yeScgaW4gYGdldEZpbGVzRnJvbUNvbW1hbmRgLFxuICAgIC8vICAgIHdoaWNoIGlzIHdoYXQgd2Ugd2FudC5cbiAgICBbJ3N0YXR1cycsICctLXVua25vd24nLCAnLS1uby1zdGF0dXMnIC8qIE5vIHN0YXR1cyBjb2RlLiAqLywgbG9jYWxEaXJlY3RvcnldLFxuICAgIGxvY2FsRGlyZWN0b3J5LFxuICApO1xufVxuXG4vKipcbiAqIEBwYXJhbSBsb2NhbERpcmVjdG9yeSBUaGUgZnVsbCBwYXRoIHRvIGEgZGlyZWN0b3J5LlxuICogQHJldHVybiBJZiBsb2NhbERpcmVjdG9yeSBpcyB3aXRoaW4gYW4gSGcgcmVwbywgcmV0dXJucyBhbiBPYmplY3Qgd2hlcmUgdGhlXG4gKiAgIGtleXMgYXJlIGZpbGUgcGF0aHMgKHJlbGF0aXZlIHRvIHRoZSAnbG9jYWxEaXJlY3RvcnknKSBvZiB0cmFja2VkIGFuZCB1bnRyYWNrZWRcbiAqICAgZmlsZXMgd2l0aGluIHRoYXQgZGlyZWN0b3J5LCBidXQgbm90IGluY2x1ZGluZyBpZ25vcmVkIGZpbGVzLiBBbGwgdmFsdWVzXG4gKiAgIGFyZSAndHJ1ZScuIElmIGxvY2FsRGlyZWN0b3J5IGlzIG5vdCB3aXRoaW4gYW4gSGcgcmVwbywgdGhlIFByb21pc2UgcmVqZWN0cy5cbiAqL1xuZnVuY3Rpb24gZ2V0RmlsZXNGcm9tSGcobG9jYWxEaXJlY3Rvcnk6IHN0cmluZyk6IFByb21pc2U8RmlsZVBhdGhzUHNldWRvU2V0PiB7XG4gIHJldHVybiBQcm9taXNlLmFsbChbZ2V0VHJhY2tlZEhnRmlsZXMobG9jYWxEaXJlY3RvcnkpLCBnZXRVbnRyYWNrZWRIZ0ZpbGVzKGxvY2FsRGlyZWN0b3J5KV0pLnRoZW4oXG4gICAgcmV0dXJuZWRGaWxlcyA9PiB7XG4gICAgICBjb25zdCBbdHJhY2tlZEZpbGVzLCB1bnRyYWNrZWRGaWxlc10gPSByZXR1cm5lZEZpbGVzO1xuICAgICAgcmV0dXJuIHsuLi50cmFja2VkRmlsZXMsIC4uLnVudHJhY2tlZEZpbGVzfTtcbiAgICB9XG4gICk7XG59XG5cbmZ1bmN0aW9uIGdldFRyYWNrZWRHaXRGaWxlcyhsb2NhbERpcmVjdG9yeTogc3RyaW5nKTogUHJvbWlzZTxGaWxlUGF0aHNQc2V1ZG9TZXQ+IHtcbiAgcmV0dXJuIGdldEZpbGVzRnJvbUNvbW1hbmQoJ2dpdCcsIFsnbHMtZmlsZXMnXSwgbG9jYWxEaXJlY3RvcnkpO1xufVxuXG4vKipcbiAqICdVbnRyYWNrZWQnIGZpbGVzIGFyZSBmaWxlcyB0aGF0IGhhdmVuJ3QgYmVlbiBhZGRlZCB0byB0aGUgcmVwbywgYnV0IGhhdmVuJ3RcbiAqIGJlZW4gZXhwbGljaXRseSBnaXQtaWdub3JlZC5cbiAqL1xuZnVuY3Rpb24gZ2V0VW50cmFja2VkR2l0RmlsZXMobG9jYWxEaXJlY3Rvcnk6IHN0cmluZyk6IFByb21pc2U8RmlsZVBhdGhzUHNldWRvU2V0PiB7XG4gIC8vICctLW90aGVycycgbWVhbnMgdW50cmFja2VkIGZpbGVzLCBhbmQgJy0tZXhjbHVkZS1zdGFuZGFyZCcgZXhjbHVkZXMgaWdub3JlZCBmaWxlcy5cbiAgcmV0dXJuIGdldEZpbGVzRnJvbUNvbW1hbmQoJ2dpdCcsIFsnbHMtZmlsZXMnLCAnLS1leGNsdWRlLXN0YW5kYXJkJywgJy0tb3RoZXJzJ10sIGxvY2FsRGlyZWN0b3J5KTtcbn1cblxuLyoqXG4gKiBAcGFyYW0gbG9jYWxEaXJlY3RvcnkgVGhlIGZ1bGwgcGF0aCB0byBhIGRpcmVjdG9yeS5cbiAqIEByZXR1cm4gSWYgbG9jYWxEaXJlY3RvcnkgaXMgd2l0aGluIGEgR2l0IHJlcG8sIHJldHVybnMgYW4gT2JqZWN0IHdoZXJlIHRoZVxuICogICBrZXlzIGFyZSBmaWxlIHBhdGhzIChyZWxhdGl2ZSB0byB0aGUgJ2xvY2FsRGlyZWN0b3J5Jykgb2YgdHJhY2tlZCBhbmQgdW50cmFja2VkXG4gKiAgIGZpbGVzIHdpdGhpbiB0aGF0IGRpcmVjdG9yeSwgYnV0IG5vdCBpbmNsdWRpbmcgaWdub3JlZCBmaWxlcy4gQWxsIHZhbHVlc1xuICogICBhcmUgJ3RydWUnLiBJZiBsb2NhbERpcmVjdG9yeSBpcyBub3Qgd2l0aGluIGEgR2l0IHJlcG8sIHRoZSBQcm9taXNlIHJlamVjdHMuXG4gKi9cbmZ1bmN0aW9uIGdldEZpbGVzRnJvbUdpdChsb2NhbERpcmVjdG9yeTogc3RyaW5nKTogUHJvbWlzZTxGaWxlUGF0aHNQc2V1ZG9TZXQ+IHtcbiAgcmV0dXJuIFByb21pc2UuYWxsKFxuICAgICAgW2dldFRyYWNrZWRHaXRGaWxlcyhsb2NhbERpcmVjdG9yeSksIGdldFVudHJhY2tlZEdpdEZpbGVzKGxvY2FsRGlyZWN0b3J5KV0pLnRoZW4oXG4gICAgcmV0dXJuZWRGaWxlcyA9PiB7XG4gICAgICBjb25zdCBbdHJhY2tlZEZpbGVzLCB1bnRyYWNrZWRGaWxlc10gPSByZXR1cm5lZEZpbGVzO1xuICAgICAgcmV0dXJuIHsuLi50cmFja2VkRmlsZXMsIC4uLnVudHJhY2tlZEZpbGVzfTtcbiAgICB9XG4gICk7XG59XG5cbmZ1bmN0aW9uIGdldEFsbEZpbGVzKGxvY2FsRGlyZWN0b3J5OiBzdHJpbmcpOiBQcm9taXNlPEZpbGVQYXRoc1BzZXVkb1NldD4ge1xuICByZXR1cm4gZ2V0RmlsZXNGcm9tQ29tbWFuZChcbiAgICAgICdmaW5kJyxcbiAgICAgIFsnLicsICctdHlwZScsICdmJ10sXG4gICAgICBsb2NhbERpcmVjdG9yeSxcbiAgICAgIC8vIFNsaWNlIG9mZiB0aGUgbGVhZGluZyBgLi9gIHRoYXQgZmluZCB3aWxsIGFkZCBvbiBoZXJlLlxuICAgICAgZmlsZVBhdGggPT4gZmlsZVBhdGguc3Vic3RyaW5nKDIpKTtcbn1cblxuYXN5bmMgZnVuY3Rpb24gZ2V0RmlsZXNGcm9tV2F0Y2htYW4obG9jYWxEaXJlY3Rvcnk6IHN0cmluZyk6IFByb21pc2U8RmlsZVBhdGhzUHNldWRvU2V0PiB7XG4gIGNvbnN0IHdhdGNobWFuQ2xpZW50ID0gbmV3IFdhdGNobWFuQ2xpZW50KCk7XG4gIHRyeSB7XG4gICAgY29uc3QgZmlsZXMgPSBhd2FpdCB3YXRjaG1hbkNsaWVudC5saXN0RmlsZXMobG9jYWxEaXJlY3RvcnkpO1xuICAgIGNvbnN0IGZpbGVQYXRocyA9IHt9O1xuICAgIGZvciAoY29uc3QgZmlsZSBvZiBmaWxlcykge1xuICAgICAgZmlsZVBhdGhzW2ZpbGVdID0gdHJ1ZTtcbiAgICB9XG4gICAgcmV0dXJuIGZpbGVQYXRocztcbiAgfSBmaW5hbGx5IHtcbiAgICB3YXRjaG1hbkNsaWVudC5kaXNwb3NlKCk7XG4gIH1cbn1cblxuLyoqXG4gKiBDcmVhdGVzIGEgYFBhdGhTZXRgIHdpdGggdGhlIGNvbnRlbnRzIG9mIHRoZSBzcGVjaWZpZWQgZGlyZWN0b3J5LlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gY3JlYXRlUGF0aFNldChsb2NhbERpcmVjdG9yeTogc3RyaW5nKTogUHJvbWlzZTxQYXRoU2V0PiB7XG4gIC8vIEF0dGVtcHRzIHRvIGdldCBhIGxpc3Qgb2YgZmlsZXMgcmVsYXRpdmUgdG8gYGxvY2FsRGlyZWN0b3J5YCwgaG9wZWZ1bGx5IGZyb21cbiAgLy8gYSBmYXN0IHNvdXJjZSBjb250cm9sIGluZGV4LlxuICAvLyBUT0RPICh3aWxsaWFtc2MpIG9uY2UgYGB7SEd8R2l0fVJlcG9zaXRvcnlgIGlzIHdvcmtpbmcgaW4gbnVjbGlkZS1zZXJ2ZXIsXG4gIC8vIHVzZSB0aG9zZSBpbnN0ZWFkIHRvIGRldGVybWluZSBWQ1MuXG4gIGNvbnN0IHBhdGhzID0gYXdhaXQgZ2V0RmlsZXNGcm9tV2F0Y2htYW4obG9jYWxEaXJlY3RvcnkpXG4gICAgICAuY2F0Y2goKCkgPT4gZ2V0RmlsZXNGcm9tSGcobG9jYWxEaXJlY3RvcnkpKVxuICAgICAgLmNhdGNoKCgpID0+IGdldEZpbGVzRnJvbUdpdChsb2NhbERpcmVjdG9yeSkpXG4gICAgICAuY2F0Y2goKCkgPT4gZ2V0QWxsRmlsZXMobG9jYWxEaXJlY3RvcnkpKVxuICAgICAgLmNhdGNoKCgpID0+IHsgdGhyb3cgbmV3IEVycm9yKGBGYWlsZWQgdG8gcG9wdWxhdGUgRmlsZVNlYXJjaCBmb3IgJHtsb2NhbERpcmVjdG9yeX1gKTsgfSk7XG4gIHJldHVybiBuZXcgUGF0aFNldCh7cGF0aHN9KTtcbn1cblxuZXhwb3J0IGNvbnN0IF9fdGVzdF9fID0ge1xuICBnZXRGaWxlc0Zyb21HaXQsXG4gIGdldEZpbGVzRnJvbUhnLFxufTtcbiJdfQ==