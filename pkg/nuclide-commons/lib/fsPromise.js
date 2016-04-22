Object.defineProperty(exports, '__esModule', {
  value: true
});

/**
 * Searches upwards through the filesystem from pathToFile to find a file with
 *   fileName.
 * @param fileName The name of the file to find.
 * @param pathToDirectory Where to begin the search. Must be a path to a directory, not a
 *   file.
 * @return directory that contains the nearest file or null.
 */

var findNearestFile = _asyncToGenerator(function* (fileName, pathToDirectory) {
  // TODO(5586355): If this becomes a bottleneck, we should consider memoizing
  // this function. The downside would be that if someone added a closer file
  // with fileName to pathToFile (or deleted the one that was cached), then we
  // would have a bug. This would probably be pretty rare, though.
  var currentPath = _path2['default'].resolve(pathToDirectory);
  do {
    // eslint-disable-line no-constant-condition
    var fileToFind = _path2['default'].join(currentPath, fileName);
    var hasFile = yield exists(fileToFind); // eslint-disable-line babel/no-await-in-loop
    if (hasFile) {
      return currentPath;
    }

    if (isRoot(currentPath)) {
      return null;
    }
    currentPath = _path2['default'].dirname(currentPath);
  } while (true);
});

/**
 * Runs the equivalent of `mkdir -p` with the given path.
 *
 * Like most implementations of mkdirp, if it fails, it is possible that
 * directories were created for some prefix of the given path.
 * @return true if the path was created; false if it already existed.
 */

var mkdirp = _asyncToGenerator(function* (filePath) {
  var isExistingDirectory = yield exists(filePath);
  if (isExistingDirectory) {
    return false;
  } else {
    return new Promise(function (resolve, reject) {
      (0, _mkdirp2['default'])(filePath, function (err) {
        if (err) {
          reject(err);
        } else {
          resolve(true);
        }
      });
    });
  }
}

/**
 * Removes directories even if they are non-empty. Does not fail if the directory doesn't exist.
 */
);

var rmdir = _asyncToGenerator(function* (filePath) {
  return new Promise(function (resolve, reject) {
    (0, _rimraf2['default'])(filePath, function (err) {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
});

/** @return true only if we are sure directoryPath is on NFS. */

var isNfs = _asyncToGenerator(function* (entityPath) {
  if (process.platform === 'linux' || process.platform === 'darwin') {
    var _ref = yield (0, _process.checkOutput)('stat', ['-f', '-L', '-c', '%T', entityPath]);

    var stdout = _ref.stdout;
    var exitCode = _ref.exitCode;

    if (exitCode === 0) {
      return stdout.trim() === 'nfs';
    } else {
      return false;
    }
  } else {
    // TODO Handle other platforms (windows?): t9917576.
    return false;
  }
}

/**
 * Takes a method from Node's fs module and returns a "denodeified" equivalent, i.e., an adapter
 * with the same functionality, but returns a Promise rather than taking a callback. This isn't
 * quite as efficient as Q's implementation of denodeify, but it's considerably less code.
 */
);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _fsPlus = require('fs-plus');

var _fsPlus2 = _interopRequireDefault(_fsPlus);

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _mkdirp = require('mkdirp');

var _mkdirp2 = _interopRequireDefault(_mkdirp);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _rimraf = require('rimraf');

var _rimraf2 = _interopRequireDefault(_rimraf);

var _temp = require('temp');

var _temp2 = _interopRequireDefault(_temp);

var _process = require('./process');

function isRoot(filePath) {
  return _path2['default'].dirname(filePath) === filePath;
}

/**
 * Create a temp directory with given prefix. The caller is responsible for cleaning up the
 *   drectory.
 * @param prefix optinal prefix for the temp directory name.
 * @return path to a temporary directory.
 */
function tempdir() {
  var prefix = arguments.length <= 0 || arguments[0] === undefined ? '' : arguments[0];

  return new Promise(function (resolve, reject) {
    _temp2['default'].mkdir(prefix, function (err, dirPath) {
      if (err) {
        reject(err);
      } else {
        resolve(dirPath);
      }
    });
  });
}

/**
 * @return path to a temporary file. The caller is responsible for cleaning up
 *     the file.
 */
function tempfile(options) {
  return new Promise(function (resolve, reject) {
    _temp2['default'].open(options, function (err, info) {
      if (err) {
        reject(err);
      } else {
        _fsPlus2['default'].close(info.fd, function (closeErr) {
          if (closeErr) {
            reject(closeErr);
          } else {
            resolve(info.path);
          }
        });
      }
    });
  });
}

function getCommonAncestorDirectory(filePaths) {
  var commonDirectoryPath = _path2['default'].dirname(filePaths[0]);
  while (filePaths.some(function (filePath) {
    return !filePath.startsWith(commonDirectoryPath);
  })) {
    commonDirectoryPath = _path2['default'].dirname(commonDirectoryPath);
  }
  return commonDirectoryPath;
}

function exists(filePath) {
  return new Promise(function (resolve, reject) {
    _fsPlus2['default'].exists(filePath, resolve);
  });
}

function expandHomeDir(filePath) {
  var HOME = process.env.HOME;

  var resolvedPath = null;
  if (filePath === '~') {
    (0, _assert2['default'])(HOME != null);
    resolvedPath = HOME;
  } else if (filePath.startsWith('~' + _path2['default'].sep)) {
    resolvedPath = '' + HOME + filePath.substr(1);
  } else {
    resolvedPath = filePath;
  }
  return resolvedPath;
}function _denodeifyFsMethod(methodName) {
  return function () {
    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    var method = _fsPlus2['default'][methodName];
    return new Promise(function (resolve, reject) {
      method.apply(_fsPlus2['default'], args.concat([function (err, result) {
        return err ? reject(err) : resolve(result);
      }]));
    });
  };
}

var fsPromise = {
  isRoot: isRoot,
  tempdir: tempdir,
  tempfile: tempfile,
  findNearestFile: findNearestFile,
  getCommonAncestorDirectory: getCommonAncestorDirectory,
  exists: exists,
  mkdirp: mkdirp,
  rmdir: rmdir,
  expandHomeDir: expandHomeDir,
  isNfs: isNfs,

  copy: _denodeifyFsMethod('copy'),
  chmod: _denodeifyFsMethod('chmod'),
  lstat: _denodeifyFsMethod('lstat'),
  mkdir: _denodeifyFsMethod('mkdir'),
  readdir: _denodeifyFsMethod('readdir'),
  readFile: _denodeifyFsMethod('readFile'),
  readlink: _denodeifyFsMethod('readlink'),
  realpath: _denodeifyFsMethod('realpath'),
  rename: _denodeifyFsMethod('rename'),
  stat: _denodeifyFsMethod('stat'),
  symlink: _denodeifyFsMethod('symlink'),
  unlink: _denodeifyFsMethod('unlink'),
  writeFile: _denodeifyFsMethod('writeFile')
};
exports.fsPromise = fsPromise;
//# sourceMappingURL=data:application/json;base64,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QUFDO0dBQ0osQ0FBQztDQUNIOztBQUVNLElBQU0sU0FBUyxHQUFHO0FBQ3ZCLFFBQU0sRUFBTixNQUFNO0FBQ04sU0FBTyxFQUFQLE9BQU87QUFDUCxVQUFRLEVBQVIsUUFBUTtBQUNSLGlCQUFlLEVBQWYsZUFBZTtBQUNmLDRCQUEwQixFQUExQiwwQkFBMEI7QUFDMUIsUUFBTSxFQUFOLE1BQU07QUFDTixRQUFNLEVBQU4sTUFBTTtBQUNOLE9BQUssRUFBTCxLQUFLO0FBQ0wsZUFBYSxFQUFiLGFBQWE7QUFDYixPQUFLLEVBQUwsS0FBSzs7QUFFTCxNQUFJLEVBQUUsa0JBQWtCLENBQUMsTUFBTSxDQUFDO0FBQ2hDLE9BQUssRUFBRSxrQkFBa0IsQ0FBQyxPQUFPLENBQUM7QUFDbEMsT0FBSyxFQUFFLGtCQUFrQixDQUFDLE9BQU8sQ0FBQztBQUNsQyxPQUFLLEVBQUUsa0JBQWtCLENBQUMsT0FBTyxDQUFDO0FBQ2xDLFNBQU8sRUFBRSxrQkFBa0IsQ0FBQyxTQUFTLENBQUM7QUFDdEMsVUFBUSxFQUFFLGtCQUFrQixDQUFDLFVBQVUsQ0FBQztBQUN4QyxVQUFRLEVBQUUsa0JBQWtCLENBQUMsVUFBVSxDQUFDO0FBQ3hDLFVBQVEsRUFBRSxrQkFBa0IsQ0FBQyxVQUFVLENBQUM7QUFDeEMsUUFBTSxFQUFFLGtCQUFrQixDQUFDLFFBQVEsQ0FBQztBQUNwQyxNQUFJLEVBQUUsa0JBQWtCLENBQUMsTUFBTSxDQUFDO0FBQ2hDLFNBQU8sRUFBRSxrQkFBa0IsQ0FBQyxTQUFTLENBQUM7QUFDdEMsUUFBTSxFQUFFLGtCQUFrQixDQUFDLFFBQVEsQ0FBQztBQUNwQyxXQUFTLEVBQUUsa0JBQWtCLENBQUMsV0FBVyxDQUFDO0NBQzNDLENBQUMiLCJmaWxlIjoiZnNQcm9taXNlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IGZzIGZyb20gJ2ZzLXBsdXMnO1xuaW1wb3J0IGludmFyaWFudCBmcm9tICdhc3NlcnQnO1xuaW1wb3J0IG1rZGlycExpYiBmcm9tICdta2RpcnAnO1xuaW1wb3J0IHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgcmltcmFmIGZyb20gJ3JpbXJhZic7XG5pbXBvcnQgdGVtcCBmcm9tICd0ZW1wJztcbmltcG9ydCB7Y2hlY2tPdXRwdXR9IGZyb20gJy4vcHJvY2Vzcyc7XG5cbmZ1bmN0aW9uIGlzUm9vdChmaWxlUGF0aDogc3RyaW5nKTogYm9vbGVhbiB7XG4gIHJldHVybiBwYXRoLmRpcm5hbWUoZmlsZVBhdGgpID09PSBmaWxlUGF0aDtcbn1cblxuLyoqXG4gKiBDcmVhdGUgYSB0ZW1wIGRpcmVjdG9yeSB3aXRoIGdpdmVuIHByZWZpeC4gVGhlIGNhbGxlciBpcyByZXNwb25zaWJsZSBmb3IgY2xlYW5pbmcgdXAgdGhlXG4gKiAgIGRyZWN0b3J5LlxuICogQHBhcmFtIHByZWZpeCBvcHRpbmFsIHByZWZpeCBmb3IgdGhlIHRlbXAgZGlyZWN0b3J5IG5hbWUuXG4gKiBAcmV0dXJuIHBhdGggdG8gYSB0ZW1wb3JhcnkgZGlyZWN0b3J5LlxuICovXG5mdW5jdGlvbiB0ZW1wZGlyKHByZWZpeDogc3RyaW5nID0gJycpOiBQcm9taXNlPHN0cmluZz4ge1xuICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgIHRlbXAubWtkaXIocHJlZml4LCAoZXJyLCBkaXJQYXRoKSA9PiB7XG4gICAgICBpZiAoZXJyKSB7XG4gICAgICAgIHJlamVjdChlcnIpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmVzb2x2ZShkaXJQYXRoKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfSk7XG59XG5cbi8qKlxuICogQHJldHVybiBwYXRoIHRvIGEgdGVtcG9yYXJ5IGZpbGUuIFRoZSBjYWxsZXIgaXMgcmVzcG9uc2libGUgZm9yIGNsZWFuaW5nIHVwXG4gKiAgICAgdGhlIGZpbGUuXG4gKi9cbmZ1bmN0aW9uIHRlbXBmaWxlKG9wdGlvbnM6IGFueSk6IFByb21pc2U8c3RyaW5nPiB7XG4gIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgdGVtcC5vcGVuKG9wdGlvbnMsIChlcnIsIGluZm8pID0+IHtcbiAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgcmVqZWN0KGVycik7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBmcy5jbG9zZShpbmZvLmZkLCBjbG9zZUVyciA9PiB7XG4gICAgICAgICAgaWYgKGNsb3NlRXJyKSB7XG4gICAgICAgICAgICByZWplY3QoY2xvc2VFcnIpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXNvbHZlKGluZm8ucGF0aCk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfSk7XG59XG5cbi8qKlxuICogU2VhcmNoZXMgdXB3YXJkcyB0aHJvdWdoIHRoZSBmaWxlc3lzdGVtIGZyb20gcGF0aFRvRmlsZSB0byBmaW5kIGEgZmlsZSB3aXRoXG4gKiAgIGZpbGVOYW1lLlxuICogQHBhcmFtIGZpbGVOYW1lIFRoZSBuYW1lIG9mIHRoZSBmaWxlIHRvIGZpbmQuXG4gKiBAcGFyYW0gcGF0aFRvRGlyZWN0b3J5IFdoZXJlIHRvIGJlZ2luIHRoZSBzZWFyY2guIE11c3QgYmUgYSBwYXRoIHRvIGEgZGlyZWN0b3J5LCBub3QgYVxuICogICBmaWxlLlxuICogQHJldHVybiBkaXJlY3RvcnkgdGhhdCBjb250YWlucyB0aGUgbmVhcmVzdCBmaWxlIG9yIG51bGwuXG4gKi9cbmFzeW5jIGZ1bmN0aW9uIGZpbmROZWFyZXN0RmlsZShmaWxlTmFtZTogc3RyaW5nLCBwYXRoVG9EaXJlY3Rvcnk6IHN0cmluZyk6IFByb21pc2U8P3N0cmluZz4ge1xuICAvLyBUT0RPKDU1ODYzNTUpOiBJZiB0aGlzIGJlY29tZXMgYSBib3R0bGVuZWNrLCB3ZSBzaG91bGQgY29uc2lkZXIgbWVtb2l6aW5nXG4gIC8vIHRoaXMgZnVuY3Rpb24uIFRoZSBkb3duc2lkZSB3b3VsZCBiZSB0aGF0IGlmIHNvbWVvbmUgYWRkZWQgYSBjbG9zZXIgZmlsZVxuICAvLyB3aXRoIGZpbGVOYW1lIHRvIHBhdGhUb0ZpbGUgKG9yIGRlbGV0ZWQgdGhlIG9uZSB0aGF0IHdhcyBjYWNoZWQpLCB0aGVuIHdlXG4gIC8vIHdvdWxkIGhhdmUgYSBidWcuIFRoaXMgd291bGQgcHJvYmFibHkgYmUgcHJldHR5IHJhcmUsIHRob3VnaC5cbiAgbGV0IGN1cnJlbnRQYXRoID0gcGF0aC5yZXNvbHZlKHBhdGhUb0RpcmVjdG9yeSk7XG4gIGRvIHsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby1jb25zdGFudC1jb25kaXRpb25cbiAgICBjb25zdCBmaWxlVG9GaW5kID0gcGF0aC5qb2luKGN1cnJlbnRQYXRoLCBmaWxlTmFtZSk7XG4gICAgY29uc3QgaGFzRmlsZSA9IGF3YWl0IGV4aXN0cyhmaWxlVG9GaW5kKTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBiYWJlbC9uby1hd2FpdC1pbi1sb29wXG4gICAgaWYgKGhhc0ZpbGUpIHtcbiAgICAgIHJldHVybiBjdXJyZW50UGF0aDtcbiAgICB9XG5cbiAgICBpZiAoaXNSb290KGN1cnJlbnRQYXRoKSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGN1cnJlbnRQYXRoID0gcGF0aC5kaXJuYW1lKGN1cnJlbnRQYXRoKTtcbiAgfSB3aGlsZSAodHJ1ZSk7XG59XG5cbmZ1bmN0aW9uIGdldENvbW1vbkFuY2VzdG9yRGlyZWN0b3J5KGZpbGVQYXRoczogQXJyYXk8c3RyaW5nPik6IHN0cmluZyB7XG4gIGxldCBjb21tb25EaXJlY3RvcnlQYXRoID0gcGF0aC5kaXJuYW1lKGZpbGVQYXRoc1swXSk7XG4gIHdoaWxlIChmaWxlUGF0aHMuc29tZShmaWxlUGF0aCA9PiAhZmlsZVBhdGguc3RhcnRzV2l0aChjb21tb25EaXJlY3RvcnlQYXRoKSkpIHtcbiAgICBjb21tb25EaXJlY3RvcnlQYXRoID0gcGF0aC5kaXJuYW1lKGNvbW1vbkRpcmVjdG9yeVBhdGgpO1xuICB9XG4gIHJldHVybiBjb21tb25EaXJlY3RvcnlQYXRoO1xufVxuXG5cbmZ1bmN0aW9uIGV4aXN0cyhmaWxlUGF0aDogc3RyaW5nKTogUHJvbWlzZTxib29sZWFuPiB7XG4gIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgZnMuZXhpc3RzKGZpbGVQYXRoLCByZXNvbHZlKTtcbiAgfSk7XG59XG5cbi8qKlxuICogUnVucyB0aGUgZXF1aXZhbGVudCBvZiBgbWtkaXIgLXBgIHdpdGggdGhlIGdpdmVuIHBhdGguXG4gKlxuICogTGlrZSBtb3N0IGltcGxlbWVudGF0aW9ucyBvZiBta2RpcnAsIGlmIGl0IGZhaWxzLCBpdCBpcyBwb3NzaWJsZSB0aGF0XG4gKiBkaXJlY3RvcmllcyB3ZXJlIGNyZWF0ZWQgZm9yIHNvbWUgcHJlZml4IG9mIHRoZSBnaXZlbiBwYXRoLlxuICogQHJldHVybiB0cnVlIGlmIHRoZSBwYXRoIHdhcyBjcmVhdGVkOyBmYWxzZSBpZiBpdCBhbHJlYWR5IGV4aXN0ZWQuXG4gKi9cbmFzeW5jIGZ1bmN0aW9uIG1rZGlycChmaWxlUGF0aDogc3RyaW5nKTogUHJvbWlzZTxib29sZWFuPiB7XG4gIGNvbnN0IGlzRXhpc3RpbmdEaXJlY3RvcnkgPSBhd2FpdCBleGlzdHMoZmlsZVBhdGgpO1xuICBpZiAoaXNFeGlzdGluZ0RpcmVjdG9yeSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgbWtkaXJwTGliKGZpbGVQYXRoLCBlcnIgPT4ge1xuICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgcmVqZWN0KGVycik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmVzb2x2ZSh0cnVlKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cbn1cblxuLyoqXG4gKiBSZW1vdmVzIGRpcmVjdG9yaWVzIGV2ZW4gaWYgdGhleSBhcmUgbm9uLWVtcHR5LiBEb2VzIG5vdCBmYWlsIGlmIHRoZSBkaXJlY3RvcnkgZG9lc24ndCBleGlzdC5cbiAqL1xuYXN5bmMgZnVuY3Rpb24gcm1kaXIoZmlsZVBhdGg6IHN0cmluZyk6IFByb21pc2Uge1xuICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgIHJpbXJhZihmaWxlUGF0aCwgZXJyID0+IHtcbiAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgcmVqZWN0KGVycik7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXNvbHZlKCk7XG4gICAgICB9XG4gICAgfSk7XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBleHBhbmRIb21lRGlyKGZpbGVQYXRoOiBzdHJpbmcpOiBzdHJpbmcge1xuICBjb25zdCB7SE9NRX0gPSBwcm9jZXNzLmVudjtcbiAgbGV0IHJlc29sdmVkUGF0aCA9IG51bGw7XG4gIGlmIChmaWxlUGF0aCA9PT0gJ34nKSB7XG4gICAgaW52YXJpYW50KEhPTUUgIT0gbnVsbCk7XG4gICAgcmVzb2x2ZWRQYXRoID0gSE9NRTtcbiAgfSBlbHNlIGlmIChmaWxlUGF0aC5zdGFydHNXaXRoKGB+JHtwYXRoLnNlcH1gKSkge1xuICAgIHJlc29sdmVkUGF0aCA9IGAke0hPTUV9JHtmaWxlUGF0aC5zdWJzdHIoMSl9YDtcbiAgfSBlbHNlIHtcbiAgICByZXNvbHZlZFBhdGggPSBmaWxlUGF0aDtcbiAgfVxuICByZXR1cm4gcmVzb2x2ZWRQYXRoO1xufVxuXG4vKiogQHJldHVybiB0cnVlIG9ubHkgaWYgd2UgYXJlIHN1cmUgZGlyZWN0b3J5UGF0aCBpcyBvbiBORlMuICovXG5hc3luYyBmdW5jdGlvbiBpc05mcyhlbnRpdHlQYXRoOiBzdHJpbmcpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgaWYgKHByb2Nlc3MucGxhdGZvcm0gPT09ICdsaW51eCcgfHwgcHJvY2Vzcy5wbGF0Zm9ybSA9PT0gJ2RhcndpbicpIHtcbiAgICBjb25zdCB7c3Rkb3V0LCBleGl0Q29kZX0gPSBhd2FpdCBjaGVja091dHB1dCgnc3RhdCcsIFsnLWYnLCAnLUwnLCAnLWMnLCAnJVQnLCBlbnRpdHlQYXRoXSk7XG4gICAgaWYgKGV4aXRDb2RlID09PSAwKSB7XG4gICAgICByZXR1cm4gc3Rkb3V0LnRyaW0oKSA9PT0gJ25mcyc7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgLy8gVE9ETyBIYW5kbGUgb3RoZXIgcGxhdGZvcm1zICh3aW5kb3dzPyk6IHQ5OTE3NTc2LlxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxufVxuXG4vKipcbiAqIFRha2VzIGEgbWV0aG9kIGZyb20gTm9kZSdzIGZzIG1vZHVsZSBhbmQgcmV0dXJucyBhIFwiZGVub2RlaWZpZWRcIiBlcXVpdmFsZW50LCBpLmUuLCBhbiBhZGFwdGVyXG4gKiB3aXRoIHRoZSBzYW1lIGZ1bmN0aW9uYWxpdHksIGJ1dCByZXR1cm5zIGEgUHJvbWlzZSByYXRoZXIgdGhhbiB0YWtpbmcgYSBjYWxsYmFjay4gVGhpcyBpc24ndFxuICogcXVpdGUgYXMgZWZmaWNpZW50IGFzIFEncyBpbXBsZW1lbnRhdGlvbiBvZiBkZW5vZGVpZnksIGJ1dCBpdCdzIGNvbnNpZGVyYWJseSBsZXNzIGNvZGUuXG4gKi9cbmZ1bmN0aW9uIF9kZW5vZGVpZnlGc01ldGhvZChtZXRob2ROYW1lOiBzdHJpbmcpOiAoKSA9PiBQcm9taXNlIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKC4uLmFyZ3MpOiBQcm9taXNlIHtcbiAgICBjb25zdCBtZXRob2QgPSBmc1ttZXRob2ROYW1lXTtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgbWV0aG9kLmFwcGx5KGZzLCBhcmdzLmNvbmNhdChbXG4gICAgICAgIChlcnIsIHJlc3VsdCkgPT4gZXJyID8gcmVqZWN0KGVycikgOiByZXNvbHZlKHJlc3VsdCksXG4gICAgICBdKSk7XG4gICAgfSk7XG4gIH07XG59XG5cbmV4cG9ydCBjb25zdCBmc1Byb21pc2UgPSB7XG4gIGlzUm9vdCxcbiAgdGVtcGRpcixcbiAgdGVtcGZpbGUsXG4gIGZpbmROZWFyZXN0RmlsZSxcbiAgZ2V0Q29tbW9uQW5jZXN0b3JEaXJlY3RvcnksXG4gIGV4aXN0cyxcbiAgbWtkaXJwLFxuICBybWRpcixcbiAgZXhwYW5kSG9tZURpcixcbiAgaXNOZnMsXG5cbiAgY29weTogX2Rlbm9kZWlmeUZzTWV0aG9kKCdjb3B5JyksXG4gIGNobW9kOiBfZGVub2RlaWZ5RnNNZXRob2QoJ2NobW9kJyksXG4gIGxzdGF0OiBfZGVub2RlaWZ5RnNNZXRob2QoJ2xzdGF0JyksXG4gIG1rZGlyOiBfZGVub2RlaWZ5RnNNZXRob2QoJ21rZGlyJyksXG4gIHJlYWRkaXI6IF9kZW5vZGVpZnlGc01ldGhvZCgncmVhZGRpcicpLFxuICByZWFkRmlsZTogX2Rlbm9kZWlmeUZzTWV0aG9kKCdyZWFkRmlsZScpLFxuICByZWFkbGluazogX2Rlbm9kZWlmeUZzTWV0aG9kKCdyZWFkbGluaycpLFxuICByZWFscGF0aDogX2Rlbm9kZWlmeUZzTWV0aG9kKCdyZWFscGF0aCcpLFxuICByZW5hbWU6IF9kZW5vZGVpZnlGc01ldGhvZCgncmVuYW1lJyksXG4gIHN0YXQ6IF9kZW5vZGVpZnlGc01ldGhvZCgnc3RhdCcpLFxuICBzeW1saW5rOiBfZGVub2RlaWZ5RnNNZXRob2QoJ3N5bWxpbmsnKSxcbiAgdW5saW5rOiBfZGVub2RlaWZ5RnNNZXRob2QoJ3VubGluaycpLFxuICB3cml0ZUZpbGU6IF9kZW5vZGVpZnlGc01ldGhvZCgnd3JpdGVGaWxlJyksXG59O1xuIl19