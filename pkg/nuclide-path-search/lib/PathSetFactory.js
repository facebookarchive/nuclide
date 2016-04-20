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

var _child_process2 = _interopRequireDefault(_child_process);

var _split = require('split');

var _split2 = _interopRequireDefault(_split);

var _nuclideWatchmanHelpers = require('../../nuclide-watchman-helpers');

function getFilesFromCommand(command, args, localDirectory, transform) {
  return new Promise(function (resolve, reject) {
    // Use `spawn` here to process the, possibly huge, output of the file listing.

    var proc = _child_process2['default'].spawn(command, args, { cwd: localDirectory });

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
//# sourceMappingURL=data:application/json;base64,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QztXQUFNLFdBQVcsQ0FBQyxjQUFjLENBQUM7R0FBQSxDQUFDLFNBQ25DLENBQUMsWUFBTTtBQUFFLFVBQU0sSUFBSSxLQUFLLHdDQUFzQyxjQUFjLENBQUcsQ0FBQztHQUFFLENBQUMsQ0FBQztDQUMvRjs7QUFFTSxJQUFNLFFBQVEsR0FBRztBQUN0QixpQkFBZSxFQUFmLGVBQWU7QUFDZixnQkFBYyxFQUFkLGNBQWM7Q0FDZixDQUFDIiwiZmlsZSI6IlBhdGhTZXRGYWN0b3J5LmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IGNoaWxkX3Byb2Nlc3MgZnJvbSAnY2hpbGRfcHJvY2Vzcyc7XG5pbXBvcnQgc3BsaXQgZnJvbSAnc3BsaXQnO1xuXG5pbXBvcnQge1dhdGNobWFuQ2xpZW50fSBmcm9tICcuLi8uLi9udWNsaWRlLXdhdGNobWFuLWhlbHBlcnMnO1xuXG5mdW5jdGlvbiBnZXRGaWxlc0Zyb21Db21tYW5kKFxuICBjb21tYW5kOiBzdHJpbmcsXG4gIGFyZ3M6IEFycmF5PHN0cmluZz4sXG4gIGxvY2FsRGlyZWN0b3J5OiBzdHJpbmcsXG4gIHRyYW5zZm9ybT86IChwYXRoOiBzdHJpbmcpID0+IHN0cmluZyxcbik6IFByb21pc2U8QXJyYXk8c3RyaW5nPj4ge1xuICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgIC8vIFVzZSBgc3Bhd25gIGhlcmUgdG8gcHJvY2VzcyB0aGUsIHBvc3NpYmx5IGh1Z2UsIG91dHB1dCBvZiB0aGUgZmlsZSBsaXN0aW5nLlxuXG4gICAgY29uc3QgcHJvYyA9IGNoaWxkX3Byb2Nlc3Muc3Bhd24oY29tbWFuZCwgYXJncywge2N3ZDogbG9jYWxEaXJlY3Rvcnl9KTtcblxuICAgIHByb2Mub24oJ2Vycm9yJywgcmVqZWN0KTtcblxuICAgIGNvbnN0IGZpbGVQYXRocyA9IFtdO1xuICAgIHByb2Muc3Rkb3V0LnBpcGUoc3BsaXQoKSkub24oJ2RhdGEnLCBmaWxlUGF0aCA9PiB7XG4gICAgICBpZiAodHJhbnNmb3JtKSB7XG4gICAgICAgIGZpbGVQYXRoID0gdHJhbnNmb3JtKGZpbGVQYXRoKTtcbiAgICAgIH1cblxuICAgICAgaWYgKGZpbGVQYXRoICE9PSAnJykge1xuICAgICAgICBmaWxlUGF0aHMucHVzaChmaWxlUGF0aCk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICBsZXQgZXJyb3JTdHJpbmcgPSAnJztcbiAgICBwcm9jLnN0ZGVyci5vbignZGF0YScsIGRhdGEgPT4ge1xuICAgICAgZXJyb3JTdHJpbmcgKz0gZGF0YTtcbiAgICB9KTtcblxuICAgIHByb2Mub24oJ2Nsb3NlJywgY29kZSA9PiB7XG4gICAgICBpZiAoY29kZSA9PT0gMCkge1xuICAgICAgICByZXNvbHZlKGZpbGVQYXRocyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZWplY3QoZXJyb3JTdHJpbmcpO1xuICAgICAgfVxuICAgIH0pO1xuICB9KTtcbn1cblxuZnVuY3Rpb24gZ2V0VHJhY2tlZEhnRmlsZXMobG9jYWxEaXJlY3Rvcnk6IHN0cmluZyk6IFByb21pc2U8QXJyYXk8c3RyaW5nPj4ge1xuICByZXR1cm4gZ2V0RmlsZXNGcm9tQ29tbWFuZChcbiAgICAnaGcnLFxuICAgIFsnbG9jYXRlJywgJy0tZnVsbHBhdGgnLCAnLS1pbmNsdWRlJywgJy4nXSxcbiAgICBsb2NhbERpcmVjdG9yeSxcbiAgICBmaWxlUGF0aCA9PiBmaWxlUGF0aC5zbGljZShsb2NhbERpcmVjdG9yeS5sZW5ndGggKyAxKVxuICApO1xufVxuXG4vKipcbiAqICdVbnRyYWNrZWQnIGZpbGVzIGFyZSBmaWxlcyB0aGF0IGhhdmVuJ3QgYmVlbiBhZGRlZCB0byB0aGUgcmVwbywgYnV0IGhhdmVuJ3RcbiAqIGJlZW4gZXhwbGljaXRseSBoZy1pZ25vcmVkLlxuICovXG5mdW5jdGlvbiBnZXRVbnRyYWNrZWRIZ0ZpbGVzKGxvY2FsRGlyZWN0b3J5OiBzdHJpbmcpOiBQcm9taXNlPEFycmF5PHN0cmluZz4+IHtcbiAgcmV0dXJuIGdldEZpbGVzRnJvbUNvbW1hbmQoXG4gICAgJ2hnJyxcbiAgICAvLyBDYWxsaW5nICdoZyBzdGF0dXMnIHdpdGggYSBwYXRoIGhhcyB0d28gc2lkZS1lZmZlY3RzOlxuICAgIC8vIDEuIEl0IHJldHVybnMgdGhlIHN0YXR1cyBvZiBvbmx5IGZpbGVzIHVuZGVyIHRoZSBnaXZlbiBwYXRoLiBJbiB0aGlzIGNhc2UsXG4gICAgLy8gICAgd2Ugb25seSB3YW50IHRoZSB1bnRyYWNrZWQgZmlsZXMgdW5kZXIgdGhlIGdpdmVuIGxvY2FsRGlyZWN0b3J5LlxuICAgIC8vIDIuIEl0IHJldHVybnMgdGhlIHBhdGhzIHJlbGF0aXZlIHRvIHRoZSBkaXJlY3RvcnkgaW4gd2hpY2ggdGhpcyBjb21tYW5kIGlzXG4gICAgLy8gICAgcnVuLiBUaGlzIGlzIGhhcmQtY29kZWQgdG8gJ2xvY2FsRGlyZWN0b3J5JyBpbiBgZ2V0RmlsZXNGcm9tQ29tbWFuZGAsXG4gICAgLy8gICAgd2hpY2ggaXMgd2hhdCB3ZSB3YW50LlxuICAgIFsnc3RhdHVzJywgJy0tdW5rbm93bicsICctLW5vLXN0YXR1cycgLyogTm8gc3RhdHVzIGNvZGUuICovLCBsb2NhbERpcmVjdG9yeV0sXG4gICAgbG9jYWxEaXJlY3RvcnksXG4gICk7XG59XG5cbi8qKlxuICogQHBhcmFtIGxvY2FsRGlyZWN0b3J5IFRoZSBmdWxsIHBhdGggdG8gYSBkaXJlY3RvcnkuXG4gKiBAcmV0dXJuIElmIGxvY2FsRGlyZWN0b3J5IGlzIHdpdGhpbiBhbiBIZyByZXBvLCByZXR1cm5zIGFuIE9iamVjdCB3aGVyZSB0aGVcbiAqICAga2V5cyBhcmUgZmlsZSBwYXRocyAocmVsYXRpdmUgdG8gdGhlICdsb2NhbERpcmVjdG9yeScpIG9mIHRyYWNrZWQgYW5kIHVudHJhY2tlZFxuICogICBmaWxlcyB3aXRoaW4gdGhhdCBkaXJlY3RvcnksIGJ1dCBub3QgaW5jbHVkaW5nIGlnbm9yZWQgZmlsZXMuIEFsbCB2YWx1ZXNcbiAqICAgYXJlICd0cnVlJy4gSWYgbG9jYWxEaXJlY3RvcnkgaXMgbm90IHdpdGhpbiBhbiBIZyByZXBvLCB0aGUgUHJvbWlzZSByZWplY3RzLlxuICovXG5mdW5jdGlvbiBnZXRGaWxlc0Zyb21IZyhsb2NhbERpcmVjdG9yeTogc3RyaW5nKTogUHJvbWlzZTxBcnJheTxzdHJpbmc+PiB7XG4gIHJldHVybiBQcm9taXNlLmFsbChbZ2V0VHJhY2tlZEhnRmlsZXMobG9jYWxEaXJlY3RvcnkpLCBnZXRVbnRyYWNrZWRIZ0ZpbGVzKGxvY2FsRGlyZWN0b3J5KV0pLnRoZW4oXG4gICAgcmV0dXJuZWRGaWxlcyA9PiB7XG4gICAgICBjb25zdCBbdHJhY2tlZEZpbGVzLCB1bnRyYWNrZWRGaWxlc10gPSByZXR1cm5lZEZpbGVzO1xuICAgICAgcmV0dXJuIHRyYWNrZWRGaWxlcy5jb25jYXQodW50cmFja2VkRmlsZXMpO1xuICAgIH1cbiAgKTtcbn1cblxuZnVuY3Rpb24gZ2V0VHJhY2tlZEdpdEZpbGVzKGxvY2FsRGlyZWN0b3J5OiBzdHJpbmcpOiBQcm9taXNlPEFycmF5PHN0cmluZz4+IHtcbiAgcmV0dXJuIGdldEZpbGVzRnJvbUNvbW1hbmQoJ2dpdCcsIFsnbHMtZmlsZXMnXSwgbG9jYWxEaXJlY3RvcnkpO1xufVxuXG4vKipcbiAqICdVbnRyYWNrZWQnIGZpbGVzIGFyZSBmaWxlcyB0aGF0IGhhdmVuJ3QgYmVlbiBhZGRlZCB0byB0aGUgcmVwbywgYnV0IGhhdmVuJ3RcbiAqIGJlZW4gZXhwbGljaXRseSBnaXQtaWdub3JlZC5cbiAqL1xuZnVuY3Rpb24gZ2V0VW50cmFja2VkR2l0RmlsZXMobG9jYWxEaXJlY3Rvcnk6IHN0cmluZyk6IFByb21pc2U8QXJyYXk8c3RyaW5nPj4ge1xuICAvLyAnLS1vdGhlcnMnIG1lYW5zIHVudHJhY2tlZCBmaWxlcywgYW5kICctLWV4Y2x1ZGUtc3RhbmRhcmQnIGV4Y2x1ZGVzIGlnbm9yZWQgZmlsZXMuXG4gIHJldHVybiBnZXRGaWxlc0Zyb21Db21tYW5kKCdnaXQnLCBbJ2xzLWZpbGVzJywgJy0tZXhjbHVkZS1zdGFuZGFyZCcsICctLW90aGVycyddLCBsb2NhbERpcmVjdG9yeSk7XG59XG5cbi8qKlxuICogQHBhcmFtIGxvY2FsRGlyZWN0b3J5IFRoZSBmdWxsIHBhdGggdG8gYSBkaXJlY3RvcnkuXG4gKiBAcmV0dXJuIElmIGxvY2FsRGlyZWN0b3J5IGlzIHdpdGhpbiBhIEdpdCByZXBvLCByZXR1cm5zIGFuIE9iamVjdCB3aGVyZSB0aGVcbiAqICAga2V5cyBhcmUgZmlsZSBwYXRocyAocmVsYXRpdmUgdG8gdGhlICdsb2NhbERpcmVjdG9yeScpIG9mIHRyYWNrZWQgYW5kIHVudHJhY2tlZFxuICogICBmaWxlcyB3aXRoaW4gdGhhdCBkaXJlY3RvcnksIGJ1dCBub3QgaW5jbHVkaW5nIGlnbm9yZWQgZmlsZXMuIEFsbCB2YWx1ZXNcbiAqICAgYXJlICd0cnVlJy4gSWYgbG9jYWxEaXJlY3RvcnkgaXMgbm90IHdpdGhpbiBhIEdpdCByZXBvLCB0aGUgUHJvbWlzZSByZWplY3RzLlxuICovXG5mdW5jdGlvbiBnZXRGaWxlc0Zyb21HaXQobG9jYWxEaXJlY3Rvcnk6IHN0cmluZyk6IFByb21pc2U8QXJyYXk8c3RyaW5nPj4ge1xuICByZXR1cm4gUHJvbWlzZS5hbGwoXG4gICAgICBbZ2V0VHJhY2tlZEdpdEZpbGVzKGxvY2FsRGlyZWN0b3J5KSwgZ2V0VW50cmFja2VkR2l0RmlsZXMobG9jYWxEaXJlY3RvcnkpXSkudGhlbihcbiAgICByZXR1cm5lZEZpbGVzID0+IHtcbiAgICAgIGNvbnN0IFt0cmFja2VkRmlsZXMsIHVudHJhY2tlZEZpbGVzXSA9IHJldHVybmVkRmlsZXM7XG4gICAgICByZXR1cm4gdHJhY2tlZEZpbGVzLmNvbmNhdCh1bnRyYWNrZWRGaWxlcyk7XG4gICAgfVxuICApO1xufVxuXG5mdW5jdGlvbiBnZXRBbGxGaWxlcyhsb2NhbERpcmVjdG9yeTogc3RyaW5nKTogUHJvbWlzZTxBcnJheTxzdHJpbmc+PiB7XG4gIHJldHVybiBnZXRGaWxlc0Zyb21Db21tYW5kKFxuICAgICAgJ2ZpbmQnLFxuICAgICAgWycuJywgJy10eXBlJywgJ2YnXSxcbiAgICAgIGxvY2FsRGlyZWN0b3J5LFxuICAgICAgLy8gU2xpY2Ugb2ZmIHRoZSBsZWFkaW5nIGAuL2AgdGhhdCBmaW5kIHdpbGwgYWRkIG9uIGhlcmUuXG4gICAgICBmaWxlUGF0aCA9PiBmaWxlUGF0aC5zdWJzdHJpbmcoMikpO1xufVxuXG5hc3luYyBmdW5jdGlvbiBnZXRGaWxlc0Zyb21XYXRjaG1hbihsb2NhbERpcmVjdG9yeTogc3RyaW5nKTogUHJvbWlzZTxBcnJheTxzdHJpbmc+PiB7XG4gIGNvbnN0IHdhdGNobWFuQ2xpZW50ID0gbmV3IFdhdGNobWFuQ2xpZW50KCk7XG4gIHRyeSB7XG4gICAgcmV0dXJuIGF3YWl0IHdhdGNobWFuQ2xpZW50Lmxpc3RGaWxlcyhsb2NhbERpcmVjdG9yeSk7XG4gIH0gZmluYWxseSB7XG4gICAgd2F0Y2htYW5DbGllbnQuZGlzcG9zZSgpO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRQYXRocyhsb2NhbERpcmVjdG9yeTogc3RyaW5nKTogUHJvbWlzZTxBcnJheTxzdHJpbmc+PiB7XG4gIC8vIEF0dGVtcHRzIHRvIGdldCBhIGxpc3Qgb2YgZmlsZXMgcmVsYXRpdmUgdG8gYGxvY2FsRGlyZWN0b3J5YCwgaG9wZWZ1bGx5IGZyb21cbiAgLy8gYSBmYXN0IHNvdXJjZSBjb250cm9sIGluZGV4LlxuICAvLyBUT0RPICh3aWxsaWFtc2MpIG9uY2UgYGB7SEd8R2l0fVJlcG9zaXRvcnlgIGlzIHdvcmtpbmcgaW4gbnVjbGlkZS1zZXJ2ZXIsXG4gIC8vIHVzZSB0aG9zZSBpbnN0ZWFkIHRvIGRldGVybWluZSBWQ1MuXG4gIHJldHVybiBnZXRGaWxlc0Zyb21XYXRjaG1hbihsb2NhbERpcmVjdG9yeSlcbiAgICAgIC5jYXRjaCgoKSA9PiBnZXRGaWxlc0Zyb21IZyhsb2NhbERpcmVjdG9yeSkpXG4gICAgICAuY2F0Y2goKCkgPT4gZ2V0RmlsZXNGcm9tR2l0KGxvY2FsRGlyZWN0b3J5KSlcbiAgICAgIC5jYXRjaCgoKSA9PiBnZXRBbGxGaWxlcyhsb2NhbERpcmVjdG9yeSkpXG4gICAgICAuY2F0Y2goKCkgPT4geyB0aHJvdyBuZXcgRXJyb3IoYEZhaWxlZCB0byBwb3B1bGF0ZSBGaWxlU2VhcmNoIGZvciAke2xvY2FsRGlyZWN0b3J5fWApOyB9KTtcbn1cblxuZXhwb3J0IGNvbnN0IF9fdGVzdF9fID0ge1xuICBnZXRGaWxlc0Zyb21HaXQsXG4gIGdldEZpbGVzRnJvbUhnLFxufTtcbiJdfQ==