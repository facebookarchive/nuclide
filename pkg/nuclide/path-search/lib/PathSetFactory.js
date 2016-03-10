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
});

exports.getPaths = getPaths;

/**
 * Creates a `PathSet` with the contents of the specified directory.
 */

var createPathSet = _asyncToGenerator(function* (localDirectory) {
  var paths = yield getPaths(localDirectory);
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
//# sourceMappingURL=data:application/json;base64,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RUFBRSxPQUFPLEVBQUUsR0FBRyxDQUFDLEVBQ25CLGNBQWM7O0FBRWQsWUFBQSxRQUFRO1dBQUksUUFBUSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7R0FBQSxDQUFDLENBQUM7Q0FDeEM7O0FBZ0JNLFNBQVMsUUFBUSxDQUFDLGNBQXNCLEVBQStCOzs7OztBQUs1RSxTQUFPLG9CQUFvQixDQUFDLGNBQWMsQ0FBQyxTQUNqQyxDQUFDO1dBQU0sY0FBYyxDQUFDLGNBQWMsQ0FBQztHQUFBLENBQUMsU0FDdEMsQ0FBQztXQUFNLGVBQWUsQ0FBQyxjQUFjLENBQUM7R0FBQSxDQUFDLFNBQ3ZDLENBQUM7V0FBTSxXQUFXLENBQUMsY0FBYyxDQUFDO0dBQUEsQ0FBQyxTQUNuQyxDQUFDLFlBQU07QUFBRSxVQUFNLElBQUksS0FBSyx3Q0FBc0MsY0FBYyxDQUFHLENBQUM7R0FBRSxDQUFDLENBQUM7Q0FDL0Y7O0FBVU0sSUFBTSxRQUFRLEdBQUc7QUFDdEIsaUJBQWUsRUFBZixlQUFlO0FBQ2YsZ0JBQWMsRUFBZCxjQUFjO0NBQ2YsQ0FBQyIsImZpbGUiOiJQYXRoU2V0RmFjdG9yeS5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbi8qKlxuICogQW4gT2JqZWN0IHdoZXJlIHRoZSBrZXlzIGFyZSBmaWxlIHBhdGhzIChyZWxhdGl2ZSB0byBhIGNlcnRhaW4gZGlyZWN0b3J5KSxcbiAqIGFuZCB0aGUgdmFsdWVzIGFyZSBib29sZWFucy4gSW4gcHJhY3RpY2UsIGFsbCB0aGUgdmFsdWVzIGFyZSAndHJ1ZScuXG4gKi9cbnR5cGUgRmlsZVBhdGhzUHNldWRvU2V0ID0ge1trZXk6IHN0cmluZ106IGJvb2xlYW59O1xuXG5pbXBvcnQge3NwYXdufSBmcm9tICdjaGlsZF9wcm9jZXNzJztcbmltcG9ydCBzcGxpdCBmcm9tICdzcGxpdCc7XG5cbmltcG9ydCBQYXRoU2V0IGZyb20gJy4vUGF0aFNldCc7XG5pbXBvcnQge1dhdGNobWFuQ2xpZW50fSBmcm9tICcuLi8uLi93YXRjaG1hbi1oZWxwZXJzJztcblxuZnVuY3Rpb24gZ2V0RmlsZXNGcm9tQ29tbWFuZChcbiAgICBjb21tYW5kOiBzdHJpbmcsXG4gICAgYXJnczogQXJyYXk8c3RyaW5nPixcbiAgICBsb2NhbERpcmVjdG9yeTogc3RyaW5nLFxuICAgIHRyYW5zZm9ybT86IChwYXRoOiBzdHJpbmcpID0+IHN0cmluZyk6IFByb21pc2U8RmlsZVBhdGhzUHNldWRvU2V0PiB7XG4gIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgLy8gVXNlIGBzcGF3bmAgaGVyZSB0byBwcm9jZXNzIHRoZSwgcG9zc2libHkgaHVnZSwgb3V0cHV0IG9mIHRoZSBmaWxlIGxpc3RpbmcuXG5cbiAgICBjb25zdCBwcm9jID0gc3Bhd24oY29tbWFuZCwgYXJncywge2N3ZDogbG9jYWxEaXJlY3Rvcnl9KTtcblxuICAgIHByb2Mub24oJ2Vycm9yJywgcmVqZWN0KTtcblxuICAgIGNvbnN0IGZpbGVQYXRocyA9IHt9O1xuICAgIHByb2Muc3Rkb3V0LnBpcGUoc3BsaXQoKSkub24oJ2RhdGEnLCBmaWxlUGF0aCA9PiB7XG4gICAgICBpZiAodHJhbnNmb3JtKSB7XG4gICAgICAgIGZpbGVQYXRoID0gdHJhbnNmb3JtKGZpbGVQYXRoKTtcbiAgICAgIH1cblxuICAgICAgaWYgKGZpbGVQYXRoICE9PSAnJykge1xuICAgICAgICBmaWxlUGF0aHNbZmlsZVBhdGhdID0gdHJ1ZTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIGxldCBlcnJvclN0cmluZyA9ICcnO1xuICAgIHByb2Muc3RkZXJyLm9uKCdkYXRhJywgZGF0YSA9PiB7XG4gICAgICBlcnJvclN0cmluZyArPSBkYXRhO1xuICAgIH0pO1xuXG4gICAgcHJvYy5vbignY2xvc2UnLCBjb2RlID0+IHtcbiAgICAgIGlmIChjb2RlID09PSAwKSB7XG4gICAgICAgIHJlc29sdmUoZmlsZVBhdGhzKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJlamVjdChlcnJvclN0cmluZyk7XG4gICAgICB9XG4gICAgfSk7XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBnZXRUcmFja2VkSGdGaWxlcyhsb2NhbERpcmVjdG9yeTogc3RyaW5nKTogUHJvbWlzZTxGaWxlUGF0aHNQc2V1ZG9TZXQ+IHtcbiAgcmV0dXJuIGdldEZpbGVzRnJvbUNvbW1hbmQoXG4gICAgJ2hnJyxcbiAgICBbJ2xvY2F0ZScsICctLWZ1bGxwYXRoJywgJy0taW5jbHVkZScsICcuJ10sXG4gICAgbG9jYWxEaXJlY3RvcnksXG4gICAgZmlsZVBhdGggPT4gZmlsZVBhdGguc2xpY2UobG9jYWxEaXJlY3RvcnkubGVuZ3RoICsgMSlcbiAgKTtcbn1cblxuLyoqXG4gKiAnVW50cmFja2VkJyBmaWxlcyBhcmUgZmlsZXMgdGhhdCBoYXZlbid0IGJlZW4gYWRkZWQgdG8gdGhlIHJlcG8sIGJ1dCBoYXZlbid0XG4gKiBiZWVuIGV4cGxpY2l0bHkgaGctaWdub3JlZC5cbiAqL1xuZnVuY3Rpb24gZ2V0VW50cmFja2VkSGdGaWxlcyhsb2NhbERpcmVjdG9yeTogc3RyaW5nKTogUHJvbWlzZTxGaWxlUGF0aHNQc2V1ZG9TZXQ+IHtcbiAgcmV0dXJuIGdldEZpbGVzRnJvbUNvbW1hbmQoXG4gICAgJ2hnJyxcbiAgICAvLyBDYWxsaW5nICdoZyBzdGF0dXMnIHdpdGggYSBwYXRoIGhhcyB0d28gc2lkZS1lZmZlY3RzOlxuICAgIC8vIDEuIEl0IHJldHVybnMgdGhlIHN0YXR1cyBvZiBvbmx5IGZpbGVzIHVuZGVyIHRoZSBnaXZlbiBwYXRoLiBJbiB0aGlzIGNhc2UsXG4gICAgLy8gICAgd2Ugb25seSB3YW50IHRoZSB1bnRyYWNrZWQgZmlsZXMgdW5kZXIgdGhlIGdpdmVuIGxvY2FsRGlyZWN0b3J5LlxuICAgIC8vIDIuIEl0IHJldHVybnMgdGhlIHBhdGhzIHJlbGF0aXZlIHRvIHRoZSBkaXJlY3RvcnkgaW4gd2hpY2ggdGhpcyBjb21tYW5kIGlzXG4gICAgLy8gICAgcnVuLiBUaGlzIGlzIGhhcmQtY29kZWQgdG8gJ2xvY2FsRGlyZWN0b3J5JyBpbiBgZ2V0RmlsZXNGcm9tQ29tbWFuZGAsXG4gICAgLy8gICAgd2hpY2ggaXMgd2hhdCB3ZSB3YW50LlxuICAgIFsnc3RhdHVzJywgJy0tdW5rbm93bicsICctLW5vLXN0YXR1cycgLyogTm8gc3RhdHVzIGNvZGUuICovLCBsb2NhbERpcmVjdG9yeV0sXG4gICAgbG9jYWxEaXJlY3RvcnksXG4gICk7XG59XG5cbi8qKlxuICogQHBhcmFtIGxvY2FsRGlyZWN0b3J5IFRoZSBmdWxsIHBhdGggdG8gYSBkaXJlY3RvcnkuXG4gKiBAcmV0dXJuIElmIGxvY2FsRGlyZWN0b3J5IGlzIHdpdGhpbiBhbiBIZyByZXBvLCByZXR1cm5zIGFuIE9iamVjdCB3aGVyZSB0aGVcbiAqICAga2V5cyBhcmUgZmlsZSBwYXRocyAocmVsYXRpdmUgdG8gdGhlICdsb2NhbERpcmVjdG9yeScpIG9mIHRyYWNrZWQgYW5kIHVudHJhY2tlZFxuICogICBmaWxlcyB3aXRoaW4gdGhhdCBkaXJlY3RvcnksIGJ1dCBub3QgaW5jbHVkaW5nIGlnbm9yZWQgZmlsZXMuIEFsbCB2YWx1ZXNcbiAqICAgYXJlICd0cnVlJy4gSWYgbG9jYWxEaXJlY3RvcnkgaXMgbm90IHdpdGhpbiBhbiBIZyByZXBvLCB0aGUgUHJvbWlzZSByZWplY3RzLlxuICovXG5mdW5jdGlvbiBnZXRGaWxlc0Zyb21IZyhsb2NhbERpcmVjdG9yeTogc3RyaW5nKTogUHJvbWlzZTxGaWxlUGF0aHNQc2V1ZG9TZXQ+IHtcbiAgcmV0dXJuIFByb21pc2UuYWxsKFtnZXRUcmFja2VkSGdGaWxlcyhsb2NhbERpcmVjdG9yeSksIGdldFVudHJhY2tlZEhnRmlsZXMobG9jYWxEaXJlY3RvcnkpXSkudGhlbihcbiAgICByZXR1cm5lZEZpbGVzID0+IHtcbiAgICAgIGNvbnN0IFt0cmFja2VkRmlsZXMsIHVudHJhY2tlZEZpbGVzXSA9IHJldHVybmVkRmlsZXM7XG4gICAgICByZXR1cm4gey4uLnRyYWNrZWRGaWxlcywgLi4udW50cmFja2VkRmlsZXN9O1xuICAgIH1cbiAgKTtcbn1cblxuZnVuY3Rpb24gZ2V0VHJhY2tlZEdpdEZpbGVzKGxvY2FsRGlyZWN0b3J5OiBzdHJpbmcpOiBQcm9taXNlPEZpbGVQYXRoc1BzZXVkb1NldD4ge1xuICByZXR1cm4gZ2V0RmlsZXNGcm9tQ29tbWFuZCgnZ2l0JywgWydscy1maWxlcyddLCBsb2NhbERpcmVjdG9yeSk7XG59XG5cbi8qKlxuICogJ1VudHJhY2tlZCcgZmlsZXMgYXJlIGZpbGVzIHRoYXQgaGF2ZW4ndCBiZWVuIGFkZGVkIHRvIHRoZSByZXBvLCBidXQgaGF2ZW4ndFxuICogYmVlbiBleHBsaWNpdGx5IGdpdC1pZ25vcmVkLlxuICovXG5mdW5jdGlvbiBnZXRVbnRyYWNrZWRHaXRGaWxlcyhsb2NhbERpcmVjdG9yeTogc3RyaW5nKTogUHJvbWlzZTxGaWxlUGF0aHNQc2V1ZG9TZXQ+IHtcbiAgLy8gJy0tb3RoZXJzJyBtZWFucyB1bnRyYWNrZWQgZmlsZXMsIGFuZCAnLS1leGNsdWRlLXN0YW5kYXJkJyBleGNsdWRlcyBpZ25vcmVkIGZpbGVzLlxuICByZXR1cm4gZ2V0RmlsZXNGcm9tQ29tbWFuZCgnZ2l0JywgWydscy1maWxlcycsICctLWV4Y2x1ZGUtc3RhbmRhcmQnLCAnLS1vdGhlcnMnXSwgbG9jYWxEaXJlY3RvcnkpO1xufVxuXG4vKipcbiAqIEBwYXJhbSBsb2NhbERpcmVjdG9yeSBUaGUgZnVsbCBwYXRoIHRvIGEgZGlyZWN0b3J5LlxuICogQHJldHVybiBJZiBsb2NhbERpcmVjdG9yeSBpcyB3aXRoaW4gYSBHaXQgcmVwbywgcmV0dXJucyBhbiBPYmplY3Qgd2hlcmUgdGhlXG4gKiAgIGtleXMgYXJlIGZpbGUgcGF0aHMgKHJlbGF0aXZlIHRvIHRoZSAnbG9jYWxEaXJlY3RvcnknKSBvZiB0cmFja2VkIGFuZCB1bnRyYWNrZWRcbiAqICAgZmlsZXMgd2l0aGluIHRoYXQgZGlyZWN0b3J5LCBidXQgbm90IGluY2x1ZGluZyBpZ25vcmVkIGZpbGVzLiBBbGwgdmFsdWVzXG4gKiAgIGFyZSAndHJ1ZScuIElmIGxvY2FsRGlyZWN0b3J5IGlzIG5vdCB3aXRoaW4gYSBHaXQgcmVwbywgdGhlIFByb21pc2UgcmVqZWN0cy5cbiAqL1xuZnVuY3Rpb24gZ2V0RmlsZXNGcm9tR2l0KGxvY2FsRGlyZWN0b3J5OiBzdHJpbmcpOiBQcm9taXNlPEZpbGVQYXRoc1BzZXVkb1NldD4ge1xuICByZXR1cm4gUHJvbWlzZS5hbGwoXG4gICAgICBbZ2V0VHJhY2tlZEdpdEZpbGVzKGxvY2FsRGlyZWN0b3J5KSwgZ2V0VW50cmFja2VkR2l0RmlsZXMobG9jYWxEaXJlY3RvcnkpXSkudGhlbihcbiAgICByZXR1cm5lZEZpbGVzID0+IHtcbiAgICAgIGNvbnN0IFt0cmFja2VkRmlsZXMsIHVudHJhY2tlZEZpbGVzXSA9IHJldHVybmVkRmlsZXM7XG4gICAgICByZXR1cm4gey4uLnRyYWNrZWRGaWxlcywgLi4udW50cmFja2VkRmlsZXN9O1xuICAgIH1cbiAgKTtcbn1cblxuZnVuY3Rpb24gZ2V0QWxsRmlsZXMobG9jYWxEaXJlY3Rvcnk6IHN0cmluZyk6IFByb21pc2U8RmlsZVBhdGhzUHNldWRvU2V0PiB7XG4gIHJldHVybiBnZXRGaWxlc0Zyb21Db21tYW5kKFxuICAgICAgJ2ZpbmQnLFxuICAgICAgWycuJywgJy10eXBlJywgJ2YnXSxcbiAgICAgIGxvY2FsRGlyZWN0b3J5LFxuICAgICAgLy8gU2xpY2Ugb2ZmIHRoZSBsZWFkaW5nIGAuL2AgdGhhdCBmaW5kIHdpbGwgYWRkIG9uIGhlcmUuXG4gICAgICBmaWxlUGF0aCA9PiBmaWxlUGF0aC5zdWJzdHJpbmcoMikpO1xufVxuXG5hc3luYyBmdW5jdGlvbiBnZXRGaWxlc0Zyb21XYXRjaG1hbihsb2NhbERpcmVjdG9yeTogc3RyaW5nKTogUHJvbWlzZTxGaWxlUGF0aHNQc2V1ZG9TZXQ+IHtcbiAgY29uc3Qgd2F0Y2htYW5DbGllbnQgPSBuZXcgV2F0Y2htYW5DbGllbnQoKTtcbiAgdHJ5IHtcbiAgICBjb25zdCBmaWxlcyA9IGF3YWl0IHdhdGNobWFuQ2xpZW50Lmxpc3RGaWxlcyhsb2NhbERpcmVjdG9yeSk7XG4gICAgY29uc3QgZmlsZVBhdGhzID0ge307XG4gICAgZm9yIChjb25zdCBmaWxlIG9mIGZpbGVzKSB7XG4gICAgICBmaWxlUGF0aHNbZmlsZV0gPSB0cnVlO1xuICAgIH1cbiAgICByZXR1cm4gZmlsZVBhdGhzO1xuICB9IGZpbmFsbHkge1xuICAgIHdhdGNobWFuQ2xpZW50LmRpc3Bvc2UoKTtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0UGF0aHMobG9jYWxEaXJlY3Rvcnk6IHN0cmluZyk6IFByb21pc2U8RmlsZVBhdGhzUHNldWRvU2V0PiB7XG4gIC8vIEF0dGVtcHRzIHRvIGdldCBhIGxpc3Qgb2YgZmlsZXMgcmVsYXRpdmUgdG8gYGxvY2FsRGlyZWN0b3J5YCwgaG9wZWZ1bGx5IGZyb21cbiAgLy8gYSBmYXN0IHNvdXJjZSBjb250cm9sIGluZGV4LlxuICAvLyBUT0RPICh3aWxsaWFtc2MpIG9uY2UgYGB7SEd8R2l0fVJlcG9zaXRvcnlgIGlzIHdvcmtpbmcgaW4gbnVjbGlkZS1zZXJ2ZXIsXG4gIC8vIHVzZSB0aG9zZSBpbnN0ZWFkIHRvIGRldGVybWluZSBWQ1MuXG4gIHJldHVybiBnZXRGaWxlc0Zyb21XYXRjaG1hbihsb2NhbERpcmVjdG9yeSlcbiAgICAgIC5jYXRjaCgoKSA9PiBnZXRGaWxlc0Zyb21IZyhsb2NhbERpcmVjdG9yeSkpXG4gICAgICAuY2F0Y2goKCkgPT4gZ2V0RmlsZXNGcm9tR2l0KGxvY2FsRGlyZWN0b3J5KSlcbiAgICAgIC5jYXRjaCgoKSA9PiBnZXRBbGxGaWxlcyhsb2NhbERpcmVjdG9yeSkpXG4gICAgICAuY2F0Y2goKCkgPT4geyB0aHJvdyBuZXcgRXJyb3IoYEZhaWxlZCB0byBwb3B1bGF0ZSBGaWxlU2VhcmNoIGZvciAke2xvY2FsRGlyZWN0b3J5fWApOyB9KTtcbn1cblxuLyoqXG4gKiBDcmVhdGVzIGEgYFBhdGhTZXRgIHdpdGggdGhlIGNvbnRlbnRzIG9mIHRoZSBzcGVjaWZpZWQgZGlyZWN0b3J5LlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gY3JlYXRlUGF0aFNldChsb2NhbERpcmVjdG9yeTogc3RyaW5nKTogUHJvbWlzZTxQYXRoU2V0PiB7XG4gIGNvbnN0IHBhdGhzID0gYXdhaXQgZ2V0UGF0aHMobG9jYWxEaXJlY3RvcnkpO1xuICByZXR1cm4gbmV3IFBhdGhTZXQoe3BhdGhzfSk7XG59XG5cbmV4cG9ydCBjb25zdCBfX3Rlc3RfXyA9IHtcbiAgZ2V0RmlsZXNGcm9tR2l0LFxuICBnZXRGaWxlc0Zyb21IZyxcbn07XG4iXX0=