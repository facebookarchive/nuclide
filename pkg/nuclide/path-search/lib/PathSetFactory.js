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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlBhdGhTZXRGYWN0b3J5LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztJQWlKc0IsYUFBYSxxQkFBNUIsV0FBNkIsY0FBc0IsRUFBb0I7Ozs7O0FBSzVFLE1BQU0sS0FBSyxHQUFHLE1BQU0sY0FBYyxDQUFDLGNBQWMsQ0FBQyxTQUN4QyxDQUFDO1dBQU0sZUFBZSxDQUFDLGNBQWMsQ0FBQztHQUFBLENBQUMsU0FDdkMsQ0FBQztXQUFNLFdBQVcsQ0FBQyxjQUFjLENBQUM7R0FBQSxDQUFDLFNBQ25DLENBQUMsWUFBTTtBQUFFLFVBQU0sSUFBSSxLQUFLLHdDQUFzQyxjQUFjLENBQUcsQ0FBQztHQUFFLENBQUMsQ0FBQztBQUM5RixTQUFPLHlCQUFZLEVBQUMsS0FBSyxFQUFMLEtBQUssRUFBQyxDQUFDLENBQUM7Q0FDN0I7Ozs7Ozs7OzZCQTFJbUIsZUFBZTs7cUJBQ2pCLE9BQU87Ozs7dUJBRUwsV0FBVzs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFFL0IsU0FBUyxtQkFBbUIsQ0FDeEIsT0FBZSxFQUNmLElBQW1CLEVBQ25CLGNBQXNCLEVBQ3RCLFNBQW9DLEVBQStCO0FBQ3JFLFNBQU8sSUFBSSxPQUFPLENBQUMsVUFBQyxPQUFPLEVBQUUsTUFBTSxFQUFLOzs7QUFHdEMsUUFBTSxJQUFJLEdBQUcsMEJBQU0sT0FBTyxFQUFFLElBQUksRUFBRSxFQUFDLEdBQUcsRUFBRSxjQUFjLEVBQUMsQ0FBQyxDQUFDOztBQUV6RCxRQUFJLENBQUMsRUFBRSxDQUFDLE9BQU8sRUFBRSxNQUFNLENBQUMsQ0FBQzs7QUFFekIsUUFBTSxTQUFTLEdBQUcsRUFBRSxDQUFDO0FBQ3JCLFFBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLHlCQUFPLENBQUMsQ0FBQyxFQUFFLENBQUMsTUFBTSxFQUFFLFVBQUEsUUFBUSxFQUFJO0FBQy9DLFVBQUksU0FBUyxFQUFFO0FBQ2IsZ0JBQVEsR0FBRyxTQUFTLENBQUMsUUFBUSxDQUFDLENBQUM7T0FDaEM7O0FBRUQsVUFBSSxRQUFRLEtBQUssRUFBRSxFQUFFO0FBQ25CLGlCQUFTLENBQUMsUUFBUSxDQUFDLEdBQUcsSUFBSSxDQUFDO09BQzVCO0tBQ0YsQ0FBQyxDQUFDOztBQUVILFFBQUksV0FBVyxHQUFHLEVBQUUsQ0FBQztBQUNyQixRQUFJLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxNQUFNLEVBQUUsVUFBQSxJQUFJLEVBQUk7QUFDN0IsaUJBQVcsSUFBSSxJQUFJLENBQUM7S0FDckIsQ0FBQyxDQUFDOztBQUVILFFBQUksQ0FBQyxFQUFFLENBQUMsT0FBTyxFQUFFLFVBQUEsSUFBSSxFQUFJO0FBQ3ZCLFVBQUksSUFBSSxLQUFLLENBQUMsRUFBRTtBQUNkLGVBQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQztPQUNwQixNQUFNO0FBQ0wsY0FBTSxDQUFDLFdBQVcsQ0FBQyxDQUFDO09BQ3JCO0tBQ0YsQ0FBQyxDQUFDO0dBQ0osQ0FBQyxDQUFDO0NBQ0o7O0FBRUQsU0FBUyxpQkFBaUIsQ0FBQyxjQUFzQixFQUErQjtBQUM5RSxTQUFPLG1CQUFtQixDQUN4QixJQUFJLEVBQ0osQ0FBQyxRQUFRLEVBQUUsWUFBWSxFQUFFLFdBQVcsRUFBRSxHQUFHLENBQUMsRUFDMUMsY0FBYyxFQUNkLFVBQUEsUUFBUTtXQUFJLFFBQVEsQ0FBQyxLQUFLLENBQUMsY0FBYyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7R0FBQSxDQUN0RCxDQUFDO0NBQ0g7Ozs7OztBQU1ELFNBQVMsbUJBQW1CLENBQUMsY0FBc0IsRUFBK0I7QUFDaEYsU0FBTyxtQkFBbUIsQ0FDeEIsSUFBSTs7Ozs7OztBQU9KLEdBQUMsUUFBUSxFQUFFLFdBQVcsRUFBRSxhQUFhLHdCQUF3QixjQUFjLENBQUMsRUFDNUUsY0FBYyxDQUNmLENBQUM7Q0FDSDs7Ozs7Ozs7O0FBU0QsU0FBUyxjQUFjLENBQUMsY0FBc0IsRUFBK0I7QUFDM0UsU0FBTyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsaUJBQWlCLENBQUMsY0FBYyxDQUFDLEVBQUUsbUJBQW1CLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FDL0YsVUFBQSxhQUFhLEVBQUk7d0NBQ3dCLGFBQWE7O1FBQTdDLFlBQVk7UUFBRSxjQUFjOztBQUNuQyx3QkFBVyxZQUFZLEVBQUssY0FBYyxFQUFFO0dBQzdDLENBQ0YsQ0FBQztDQUNIOztBQUVELFNBQVMsa0JBQWtCLENBQUMsY0FBc0IsRUFBK0I7QUFDL0UsU0FBTyxtQkFBbUIsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxVQUFVLENBQUMsRUFBRSxjQUFjLENBQUMsQ0FBQztDQUNqRTs7Ozs7O0FBTUQsU0FBUyxvQkFBb0IsQ0FBQyxjQUFzQixFQUErQjs7QUFFakYsU0FBTyxtQkFBbUIsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxVQUFVLEVBQUUsb0JBQW9CLEVBQUUsVUFBVSxDQUFDLEVBQUUsY0FBYyxDQUFDLENBQUM7Q0FDbkc7Ozs7Ozs7OztBQVNELFNBQVMsZUFBZSxDQUFDLGNBQXNCLEVBQStCO0FBQzVFLFNBQU8sT0FBTyxDQUFDLEdBQUcsQ0FDZCxDQUFDLGtCQUFrQixDQUFDLGNBQWMsQ0FBQyxFQUFFLG9CQUFvQixDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQ2xGLFVBQUEsYUFBYSxFQUFJO3lDQUN3QixhQUFhOztRQUE3QyxZQUFZO1FBQUUsY0FBYzs7QUFDbkMsd0JBQVcsWUFBWSxFQUFLLGNBQWMsRUFBRTtHQUM3QyxDQUNGLENBQUM7Q0FDSDs7QUFFRCxTQUFTLFdBQVcsQ0FBQyxjQUFzQixFQUErQjtBQUN4RSxTQUFPLG1CQUFtQixDQUN0QixNQUFNLEVBQ04sQ0FBQyxHQUFHLEVBQUUsT0FBTyxFQUFFLEdBQUcsQ0FBQyxFQUNuQixjQUFjOztBQUVkLFlBQUEsUUFBUTtXQUFJLFFBQVEsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDO0dBQUEsQ0FBQyxDQUFDO0NBQ3hDLEFBaUJNLElBQU0sUUFBUSxHQUFHO0FBQ3RCLGlCQUFlLEVBQWYsZUFBZTtBQUNmLGdCQUFjLEVBQWQsY0FBYztDQUNmLENBQUMiLCJmaWxlIjoiUGF0aFNldEZhY3RvcnkuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG4vKipcbiAqIEFuIE9iamVjdCB3aGVyZSB0aGUga2V5cyBhcmUgZmlsZSBwYXRocyAocmVsYXRpdmUgdG8gYSBjZXJ0YWluIGRpcmVjdG9yeSksXG4gKiBhbmQgdGhlIHZhbHVlcyBhcmUgYm9vbGVhbnMuIEluIHByYWN0aWNlLCBhbGwgdGhlIHZhbHVlcyBhcmUgJ3RydWUnLlxuICovXG50eXBlIEZpbGVQYXRoc1BzZXVkb1NldCA9IHtba2V5OiBzdHJpbmddOiBib29sZWFufTtcblxuaW1wb3J0IHtzcGF3bn0gZnJvbSAnY2hpbGRfcHJvY2Vzcyc7XG5pbXBvcnQgc3BsaXQgZnJvbSAnc3BsaXQnO1xuXG5pbXBvcnQgUGF0aFNldCBmcm9tICcuL1BhdGhTZXQnO1xuXG5mdW5jdGlvbiBnZXRGaWxlc0Zyb21Db21tYW5kKFxuICAgIGNvbW1hbmQ6IHN0cmluZyxcbiAgICBhcmdzOiBBcnJheTxzdHJpbmc+LFxuICAgIGxvY2FsRGlyZWN0b3J5OiBzdHJpbmcsXG4gICAgdHJhbnNmb3JtPzogKHBhdGg6IHN0cmluZykgPT4gc3RyaW5nKTogUHJvbWlzZTxGaWxlUGF0aHNQc2V1ZG9TZXQ+IHtcbiAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAvLyBVc2UgYHNwYXduYCBoZXJlIHRvIHByb2Nlc3MgdGhlLCBwb3NzaWJseSBodWdlLCBvdXRwdXQgb2YgdGhlIGZpbGUgbGlzdGluZy5cblxuICAgIGNvbnN0IHByb2MgPSBzcGF3bihjb21tYW5kLCBhcmdzLCB7Y3dkOiBsb2NhbERpcmVjdG9yeX0pO1xuXG4gICAgcHJvYy5vbignZXJyb3InLCByZWplY3QpO1xuXG4gICAgY29uc3QgZmlsZVBhdGhzID0ge307XG4gICAgcHJvYy5zdGRvdXQucGlwZShzcGxpdCgpKS5vbignZGF0YScsIGZpbGVQYXRoID0+IHtcbiAgICAgIGlmICh0cmFuc2Zvcm0pIHtcbiAgICAgICAgZmlsZVBhdGggPSB0cmFuc2Zvcm0oZmlsZVBhdGgpO1xuICAgICAgfVxuXG4gICAgICBpZiAoZmlsZVBhdGggIT09ICcnKSB7XG4gICAgICAgIGZpbGVQYXRoc1tmaWxlUGF0aF0gPSB0cnVlO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgbGV0IGVycm9yU3RyaW5nID0gJyc7XG4gICAgcHJvYy5zdGRlcnIub24oJ2RhdGEnLCBkYXRhID0+IHtcbiAgICAgIGVycm9yU3RyaW5nICs9IGRhdGE7XG4gICAgfSk7XG5cbiAgICBwcm9jLm9uKCdjbG9zZScsIGNvZGUgPT4ge1xuICAgICAgaWYgKGNvZGUgPT09IDApIHtcbiAgICAgICAgcmVzb2x2ZShmaWxlUGF0aHMpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmVqZWN0KGVycm9yU3RyaW5nKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIGdldFRyYWNrZWRIZ0ZpbGVzKGxvY2FsRGlyZWN0b3J5OiBzdHJpbmcpOiBQcm9taXNlPEZpbGVQYXRoc1BzZXVkb1NldD4ge1xuICByZXR1cm4gZ2V0RmlsZXNGcm9tQ29tbWFuZChcbiAgICAnaGcnLFxuICAgIFsnbG9jYXRlJywgJy0tZnVsbHBhdGgnLCAnLS1pbmNsdWRlJywgJy4nXSxcbiAgICBsb2NhbERpcmVjdG9yeSxcbiAgICBmaWxlUGF0aCA9PiBmaWxlUGF0aC5zbGljZShsb2NhbERpcmVjdG9yeS5sZW5ndGggKyAxKVxuICApO1xufVxuXG4vKipcbiAqICdVbnRyYWNrZWQnIGZpbGVzIGFyZSBmaWxlcyB0aGF0IGhhdmVuJ3QgYmVlbiBhZGRlZCB0byB0aGUgcmVwbywgYnV0IGhhdmVuJ3RcbiAqIGJlZW4gZXhwbGljaXRseSBoZy1pZ25vcmVkLlxuICovXG5mdW5jdGlvbiBnZXRVbnRyYWNrZWRIZ0ZpbGVzKGxvY2FsRGlyZWN0b3J5OiBzdHJpbmcpOiBQcm9taXNlPEZpbGVQYXRoc1BzZXVkb1NldD4ge1xuICByZXR1cm4gZ2V0RmlsZXNGcm9tQ29tbWFuZChcbiAgICAnaGcnLFxuICAgIC8vIENhbGxpbmcgJ2hnIHN0YXR1cycgd2l0aCBhIHBhdGggaGFzIHR3byBzaWRlLWVmZmVjdHM6XG4gICAgLy8gMS4gSXQgcmV0dXJucyB0aGUgc3RhdHVzIG9mIG9ubHkgZmlsZXMgdW5kZXIgdGhlIGdpdmVuIHBhdGguIEluIHRoaXMgY2FzZSxcbiAgICAvLyAgICB3ZSBvbmx5IHdhbnQgdGhlIHVudHJhY2tlZCBmaWxlcyB1bmRlciB0aGUgZ2l2ZW4gbG9jYWxEaXJlY3RvcnkuXG4gICAgLy8gMi4gSXQgcmV0dXJucyB0aGUgcGF0aHMgcmVsYXRpdmUgdG8gdGhlIGRpcmVjdG9yeSBpbiB3aGljaCB0aGlzIGNvbW1hbmQgaXNcbiAgICAvLyAgICBydW4uIFRoaXMgaXMgaGFyZC1jb2RlZCB0byAnbG9jYWxEaXJlY3RvcnknIGluIGBnZXRGaWxlc0Zyb21Db21tYW5kYCxcbiAgICAvLyAgICB3aGljaCBpcyB3aGF0IHdlIHdhbnQuXG4gICAgWydzdGF0dXMnLCAnLS11bmtub3duJywgJy0tbm8tc3RhdHVzJyAvKiBObyBzdGF0dXMgY29kZS4gKi8sIGxvY2FsRGlyZWN0b3J5XSxcbiAgICBsb2NhbERpcmVjdG9yeSxcbiAgKTtcbn1cblxuLyoqXG4gKiBAcGFyYW0gbG9jYWxEaXJlY3RvcnkgVGhlIGZ1bGwgcGF0aCB0byBhIGRpcmVjdG9yeS5cbiAqIEByZXR1cm4gSWYgbG9jYWxEaXJlY3RvcnkgaXMgd2l0aGluIGFuIEhnIHJlcG8sIHJldHVybnMgYW4gT2JqZWN0IHdoZXJlIHRoZVxuICogICBrZXlzIGFyZSBmaWxlIHBhdGhzIChyZWxhdGl2ZSB0byB0aGUgJ2xvY2FsRGlyZWN0b3J5Jykgb2YgdHJhY2tlZCBhbmQgdW50cmFja2VkXG4gKiAgIGZpbGVzIHdpdGhpbiB0aGF0IGRpcmVjdG9yeSwgYnV0IG5vdCBpbmNsdWRpbmcgaWdub3JlZCBmaWxlcy4gQWxsIHZhbHVlc1xuICogICBhcmUgJ3RydWUnLiBJZiBsb2NhbERpcmVjdG9yeSBpcyBub3Qgd2l0aGluIGFuIEhnIHJlcG8sIHRoZSBQcm9taXNlIHJlamVjdHMuXG4gKi9cbmZ1bmN0aW9uIGdldEZpbGVzRnJvbUhnKGxvY2FsRGlyZWN0b3J5OiBzdHJpbmcpOiBQcm9taXNlPEZpbGVQYXRoc1BzZXVkb1NldD4ge1xuICByZXR1cm4gUHJvbWlzZS5hbGwoW2dldFRyYWNrZWRIZ0ZpbGVzKGxvY2FsRGlyZWN0b3J5KSwgZ2V0VW50cmFja2VkSGdGaWxlcyhsb2NhbERpcmVjdG9yeSldKS50aGVuKFxuICAgIHJldHVybmVkRmlsZXMgPT4ge1xuICAgICAgY29uc3QgW3RyYWNrZWRGaWxlcywgdW50cmFja2VkRmlsZXNdID0gcmV0dXJuZWRGaWxlcztcbiAgICAgIHJldHVybiB7Li4udHJhY2tlZEZpbGVzLCAuLi51bnRyYWNrZWRGaWxlc307XG4gICAgfVxuICApO1xufVxuXG5mdW5jdGlvbiBnZXRUcmFja2VkR2l0RmlsZXMobG9jYWxEaXJlY3Rvcnk6IHN0cmluZyk6IFByb21pc2U8RmlsZVBhdGhzUHNldWRvU2V0PiB7XG4gIHJldHVybiBnZXRGaWxlc0Zyb21Db21tYW5kKCdnaXQnLCBbJ2xzLWZpbGVzJ10sIGxvY2FsRGlyZWN0b3J5KTtcbn1cblxuLyoqXG4gKiAnVW50cmFja2VkJyBmaWxlcyBhcmUgZmlsZXMgdGhhdCBoYXZlbid0IGJlZW4gYWRkZWQgdG8gdGhlIHJlcG8sIGJ1dCBoYXZlbid0XG4gKiBiZWVuIGV4cGxpY2l0bHkgZ2l0LWlnbm9yZWQuXG4gKi9cbmZ1bmN0aW9uIGdldFVudHJhY2tlZEdpdEZpbGVzKGxvY2FsRGlyZWN0b3J5OiBzdHJpbmcpOiBQcm9taXNlPEZpbGVQYXRoc1BzZXVkb1NldD4ge1xuICAvLyAnLS1vdGhlcnMnIG1lYW5zIHVudHJhY2tlZCBmaWxlcywgYW5kICctLWV4Y2x1ZGUtc3RhbmRhcmQnIGV4Y2x1ZGVzIGlnbm9yZWQgZmlsZXMuXG4gIHJldHVybiBnZXRGaWxlc0Zyb21Db21tYW5kKCdnaXQnLCBbJ2xzLWZpbGVzJywgJy0tZXhjbHVkZS1zdGFuZGFyZCcsICctLW90aGVycyddLCBsb2NhbERpcmVjdG9yeSk7XG59XG5cbi8qKlxuICogQHBhcmFtIGxvY2FsRGlyZWN0b3J5IFRoZSBmdWxsIHBhdGggdG8gYSBkaXJlY3RvcnkuXG4gKiBAcmV0dXJuIElmIGxvY2FsRGlyZWN0b3J5IGlzIHdpdGhpbiBhIEdpdCByZXBvLCByZXR1cm5zIGFuIE9iamVjdCB3aGVyZSB0aGVcbiAqICAga2V5cyBhcmUgZmlsZSBwYXRocyAocmVsYXRpdmUgdG8gdGhlICdsb2NhbERpcmVjdG9yeScpIG9mIHRyYWNrZWQgYW5kIHVudHJhY2tlZFxuICogICBmaWxlcyB3aXRoaW4gdGhhdCBkaXJlY3RvcnksIGJ1dCBub3QgaW5jbHVkaW5nIGlnbm9yZWQgZmlsZXMuIEFsbCB2YWx1ZXNcbiAqICAgYXJlICd0cnVlJy4gSWYgbG9jYWxEaXJlY3RvcnkgaXMgbm90IHdpdGhpbiBhIEdpdCByZXBvLCB0aGUgUHJvbWlzZSByZWplY3RzLlxuICovXG5mdW5jdGlvbiBnZXRGaWxlc0Zyb21HaXQobG9jYWxEaXJlY3Rvcnk6IHN0cmluZyk6IFByb21pc2U8RmlsZVBhdGhzUHNldWRvU2V0PiB7XG4gIHJldHVybiBQcm9taXNlLmFsbChcbiAgICAgIFtnZXRUcmFja2VkR2l0RmlsZXMobG9jYWxEaXJlY3RvcnkpLCBnZXRVbnRyYWNrZWRHaXRGaWxlcyhsb2NhbERpcmVjdG9yeSldKS50aGVuKFxuICAgIHJldHVybmVkRmlsZXMgPT4ge1xuICAgICAgY29uc3QgW3RyYWNrZWRGaWxlcywgdW50cmFja2VkRmlsZXNdID0gcmV0dXJuZWRGaWxlcztcbiAgICAgIHJldHVybiB7Li4udHJhY2tlZEZpbGVzLCAuLi51bnRyYWNrZWRGaWxlc307XG4gICAgfVxuICApO1xufVxuXG5mdW5jdGlvbiBnZXRBbGxGaWxlcyhsb2NhbERpcmVjdG9yeTogc3RyaW5nKTogUHJvbWlzZTxGaWxlUGF0aHNQc2V1ZG9TZXQ+IHtcbiAgcmV0dXJuIGdldEZpbGVzRnJvbUNvbW1hbmQoXG4gICAgICAnZmluZCcsXG4gICAgICBbJy4nLCAnLXR5cGUnLCAnZiddLFxuICAgICAgbG9jYWxEaXJlY3RvcnksXG4gICAgICAvLyBTbGljZSBvZmYgdGhlIGxlYWRpbmcgYC4vYCB0aGF0IGZpbmQgd2lsbCBhZGQgb24gaGVyZS5cbiAgICAgIGZpbGVQYXRoID0+IGZpbGVQYXRoLnN1YnN0cmluZygyKSk7XG59XG5cbi8qKlxuICogQ3JlYXRlcyBhIGBQYXRoU2V0YCB3aXRoIHRoZSBjb250ZW50cyBvZiB0aGUgc3BlY2lmaWVkIGRpcmVjdG9yeS5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGNyZWF0ZVBhdGhTZXQobG9jYWxEaXJlY3Rvcnk6IHN0cmluZyk6IFByb21pc2U8UGF0aFNldD4ge1xuICAvLyBBdHRlbXB0cyB0byBnZXQgYSBsaXN0IG9mIGZpbGVzIHJlbGF0aXZlIHRvIGBsb2NhbERpcmVjdG9yeWAsIGhvcGVmdWxseSBmcm9tXG4gIC8vIGEgZmFzdCBzb3VyY2UgY29udHJvbCBpbmRleC5cbiAgLy8gVE9ETyAod2lsbGlhbXNjKSBvbmNlIGBge0hHfEdpdH1SZXBvc2l0b3J5YCBpcyB3b3JraW5nIGluIG51Y2xpZGUtc2VydmVyLFxuICAvLyB1c2UgdGhvc2UgaW5zdGVhZCB0byBkZXRlcm1pbmUgVkNTLlxuICBjb25zdCBwYXRocyA9IGF3YWl0IGdldEZpbGVzRnJvbUhnKGxvY2FsRGlyZWN0b3J5KVxuICAgICAgLmNhdGNoKCgpID0+IGdldEZpbGVzRnJvbUdpdChsb2NhbERpcmVjdG9yeSkpXG4gICAgICAuY2F0Y2goKCkgPT4gZ2V0QWxsRmlsZXMobG9jYWxEaXJlY3RvcnkpKVxuICAgICAgLmNhdGNoKCgpID0+IHsgdGhyb3cgbmV3IEVycm9yKGBGYWlsZWQgdG8gcG9wdWxhdGUgRmlsZVNlYXJjaCBmb3IgJHtsb2NhbERpcmVjdG9yeX1gKTsgfSk7XG4gIHJldHVybiBuZXcgUGF0aFNldCh7cGF0aHN9KTtcbn1cblxuZXhwb3J0IGNvbnN0IF9fdGVzdF9fID0ge1xuICBnZXRGaWxlc0Zyb21HaXQsXG4gIGdldEZpbGVzRnJvbUhnLFxufTtcbiJdfQ==