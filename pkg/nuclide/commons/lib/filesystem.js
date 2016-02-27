Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.isRoot = isRoot;
exports.tempdir = tempdir;
exports.tempfile = tempfile;

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
  var currentPath = path.resolve(pathToDirectory);
  do {
    // eslint-disable-line no-constant-condition
    var fileToFind = path.join(currentPath, fileName);
    var hasFile = yield exists(fileToFind); // eslint-disable-line babel/no-await-in-loop
    if (hasFile) {
      return currentPath;
    }

    if (isRoot(currentPath)) {
      return null;
    }
    currentPath = path.dirname(currentPath);
  } while (true);
});

exports.findNearestFile = findNearestFile;
exports.exists = exists;

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
      mkdirpLib(filePath, function (err) {
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

exports.mkdirp = mkdirp;

var rmdir = _asyncToGenerator(function* (filePath) {
  return new Promise(function (resolve, reject) {
    rimraf(filePath, function (err) {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
});

exports.rmdir = rmdir;
exports.expandHomeDir = expandHomeDir;

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

exports.isNfs = isNfs;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

var _fsPlus = require('fs-plus');

var _fsPlus2 = _interopRequireDefault(_fsPlus);

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _process = require('./process');

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var path = require('path');
var mkdirpLib = require('mkdirp');
var rimraf = require('rimraf');

function isRoot(filePath) {
  return path.dirname(filePath) === filePath;
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
    require('temp').mkdir(prefix, function (err, dirPath) {
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
    require('temp').open(options, function (err, info) {
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
  } else if (filePath.startsWith('~' + path.sep)) {
    resolvedPath = '' + HOME + filePath.substr(1);
  } else {
    resolvedPath = filePath;
  }
  return resolvedPath;
}

function denodeifyFsMethod(methodName) {
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

var copy = denodeifyFsMethod('copy');
exports.copy = copy;
var chmod = denodeifyFsMethod('chmod');
exports.chmod = chmod;
var lstat = denodeifyFsMethod('lstat');
exports.lstat = lstat;
var mkdir = denodeifyFsMethod('mkdir');
exports.mkdir = mkdir;
var readdir = denodeifyFsMethod('readdir');
exports.readdir = readdir;
var readFile = denodeifyFsMethod('readFile');
exports.readFile = readFile;
var readlink = denodeifyFsMethod('readlink');
exports.readlink = readlink;
var realpath = denodeifyFsMethod('realpath');
exports.realpath = realpath;
var rename = denodeifyFsMethod('rename');
exports.rename = rename;
var stat = denodeifyFsMethod('stat');
exports.stat = stat;
var symlink = denodeifyFsMethod('symlink');
exports.symlink = symlink;
var unlink = denodeifyFsMethod('unlink');
exports.unlink = unlink;
var writeFile = denodeifyFsMethod('writeFile');
exports.writeFile = writeFile;
//# sourceMappingURL=data:application/json;base64,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QUFDekMsSUFBTSxLQUFLLEdBQUcsaUJBQWlCLENBQUMsT0FBTyxDQUFDLENBQUM7O0FBQ3pDLElBQU0sS0FBSyxHQUFHLGlCQUFpQixDQUFDLE9BQU8sQ0FBQyxDQUFDOztBQUN6QyxJQUFNLE9BQU8sR0FBRyxpQkFBaUIsQ0FBQyxTQUFTLENBQUMsQ0FBQzs7QUFDN0MsSUFBTSxRQUFRLEdBQUcsaUJBQWlCLENBQUMsVUFBVSxDQUFDLENBQUM7O0FBQy9DLElBQU0sUUFBUSxHQUFHLGlCQUFpQixDQUFDLFVBQVUsQ0FBQyxDQUFDOztBQUMvQyxJQUFNLFFBQVEsR0FBRyxpQkFBaUIsQ0FBQyxVQUFVLENBQUMsQ0FBQzs7QUFDL0MsSUFBTSxNQUFNLEdBQUcsaUJBQWlCLENBQUMsUUFBUSxDQUFDLENBQUM7O0FBQzNDLElBQU0sSUFBSSxHQUFHLGlCQUFpQixDQUFDLE1BQU0sQ0FBQyxDQUFDOztBQUN2QyxJQUFNLE9BQU8sR0FBRyxpQkFBaUIsQ0FBQyxTQUFTLENBQUMsQ0FBQzs7QUFDN0MsSUFBTSxNQUFNLEdBQUcsaUJBQWlCLENBQUMsUUFBUSxDQUFDLENBQUM7O0FBQzNDLElBQU0sU0FBUyxHQUFHLGlCQUFpQixDQUFDLFdBQVcsQ0FBQyxDQUFDIiwiZmlsZSI6ImZpbGVzeXN0ZW0uanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5jb25zdCBwYXRoID0gcmVxdWlyZSgncGF0aCcpO1xuY29uc3QgbWtkaXJwTGliID0gcmVxdWlyZSgnbWtkaXJwJyk7XG5jb25zdCByaW1yYWYgPSByZXF1aXJlKCdyaW1yYWYnKTtcblxuaW1wb3J0IGZzIGZyb20gJ2ZzLXBsdXMnO1xuaW1wb3J0IGludmFyaWFudCBmcm9tICdhc3NlcnQnO1xuaW1wb3J0IHtjaGVja091dHB1dH0gZnJvbSAnLi9wcm9jZXNzJztcblxuZXhwb3J0IGZ1bmN0aW9uIGlzUm9vdChmaWxlUGF0aDogc3RyaW5nKTogYm9vbGVhbiB7XG4gIHJldHVybiBwYXRoLmRpcm5hbWUoZmlsZVBhdGgpID09PSBmaWxlUGF0aDtcbn1cblxuLyoqXG4gKiBDcmVhdGUgYSB0ZW1wIGRpcmVjdG9yeSB3aXRoIGdpdmVuIHByZWZpeC4gVGhlIGNhbGxlciBpcyByZXNwb25zaWJsZSBmb3IgY2xlYW5pbmcgdXAgdGhlXG4gKiAgIGRyZWN0b3J5LlxuICogQHBhcmFtIHByZWZpeCBvcHRpbmFsIHByZWZpeCBmb3IgdGhlIHRlbXAgZGlyZWN0b3J5IG5hbWUuXG4gKiBAcmV0dXJuIHBhdGggdG8gYSB0ZW1wb3JhcnkgZGlyZWN0b3J5LlxuICovXG5leHBvcnQgZnVuY3Rpb24gdGVtcGRpcihwcmVmaXg6IHN0cmluZyA9ICcnKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICByZXF1aXJlKCd0ZW1wJykubWtkaXIocHJlZml4LCAoZXJyLCBkaXJQYXRoKSA9PiB7XG4gICAgICBpZiAoZXJyKSB7XG4gICAgICAgIHJlamVjdChlcnIpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmVzb2x2ZShkaXJQYXRoKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfSk7XG59XG5cbi8qKlxuICogQHJldHVybiBwYXRoIHRvIGEgdGVtcG9yYXJ5IGZpbGUuIFRoZSBjYWxsZXIgaXMgcmVzcG9uc2libGUgZm9yIGNsZWFuaW5nIHVwXG4gKiAgICAgdGhlIGZpbGUuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB0ZW1wZmlsZShvcHRpb25zOiBhbnkpOiBQcm9taXNlPHN0cmluZz4ge1xuICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgIHJlcXVpcmUoJ3RlbXAnKS5vcGVuKG9wdGlvbnMsIChlcnIsIGluZm8pID0+IHtcbiAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgcmVqZWN0KGVycik7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBmcy5jbG9zZShpbmZvLmZkLCBjbG9zZUVyciA9PiB7XG4gICAgICAgICAgaWYgKGNsb3NlRXJyKSB7XG4gICAgICAgICAgICByZWplY3QoY2xvc2VFcnIpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXNvbHZlKGluZm8ucGF0aCk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfSk7XG59XG5cbi8qKlxuICogU2VhcmNoZXMgdXB3YXJkcyB0aHJvdWdoIHRoZSBmaWxlc3lzdGVtIGZyb20gcGF0aFRvRmlsZSB0byBmaW5kIGEgZmlsZSB3aXRoXG4gKiAgIGZpbGVOYW1lLlxuICogQHBhcmFtIGZpbGVOYW1lIFRoZSBuYW1lIG9mIHRoZSBmaWxlIHRvIGZpbmQuXG4gKiBAcGFyYW0gcGF0aFRvRGlyZWN0b3J5IFdoZXJlIHRvIGJlZ2luIHRoZSBzZWFyY2guIE11c3QgYmUgYSBwYXRoIHRvIGEgZGlyZWN0b3J5LCBub3QgYVxuICogICBmaWxlLlxuICogQHJldHVybiBkaXJlY3RvcnkgdGhhdCBjb250YWlucyB0aGUgbmVhcmVzdCBmaWxlIG9yIG51bGwuXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBmaW5kTmVhcmVzdEZpbGUoZmlsZU5hbWU6IHN0cmluZywgcGF0aFRvRGlyZWN0b3J5OiBzdHJpbmcpOiBQcm9taXNlPD9zdHJpbmc+IHtcbiAgLy8gVE9ETyg1NTg2MzU1KTogSWYgdGhpcyBiZWNvbWVzIGEgYm90dGxlbmVjaywgd2Ugc2hvdWxkIGNvbnNpZGVyIG1lbW9pemluZ1xuICAvLyB0aGlzIGZ1bmN0aW9uLiBUaGUgZG93bnNpZGUgd291bGQgYmUgdGhhdCBpZiBzb21lb25lIGFkZGVkIGEgY2xvc2VyIGZpbGVcbiAgLy8gd2l0aCBmaWxlTmFtZSB0byBwYXRoVG9GaWxlIChvciBkZWxldGVkIHRoZSBvbmUgdGhhdCB3YXMgY2FjaGVkKSwgdGhlbiB3ZVxuICAvLyB3b3VsZCBoYXZlIGEgYnVnLiBUaGlzIHdvdWxkIHByb2JhYmx5IGJlIHByZXR0eSByYXJlLCB0aG91Z2guXG4gIGxldCBjdXJyZW50UGF0aCA9IHBhdGgucmVzb2x2ZShwYXRoVG9EaXJlY3RvcnkpO1xuICBkbyB7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tY29uc3RhbnQtY29uZGl0aW9uXG4gICAgY29uc3QgZmlsZVRvRmluZCA9IHBhdGguam9pbihjdXJyZW50UGF0aCwgZmlsZU5hbWUpO1xuICAgIGNvbnN0IGhhc0ZpbGUgPSBhd2FpdCBleGlzdHMoZmlsZVRvRmluZCk7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgYmFiZWwvbm8tYXdhaXQtaW4tbG9vcFxuICAgIGlmIChoYXNGaWxlKSB7XG4gICAgICByZXR1cm4gY3VycmVudFBhdGg7XG4gICAgfVxuXG4gICAgaWYgKGlzUm9vdChjdXJyZW50UGF0aCkpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBjdXJyZW50UGF0aCA9IHBhdGguZGlybmFtZShjdXJyZW50UGF0aCk7XG4gIH0gd2hpbGUgKHRydWUpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZXhpc3RzKGZpbGVQYXRoOiBzdHJpbmcpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICBmcy5leGlzdHMoZmlsZVBhdGgsIHJlc29sdmUpO1xuICB9KTtcbn1cblxuLyoqXG4gKiBSdW5zIHRoZSBlcXVpdmFsZW50IG9mIGBta2RpciAtcGAgd2l0aCB0aGUgZ2l2ZW4gcGF0aC5cbiAqXG4gKiBMaWtlIG1vc3QgaW1wbGVtZW50YXRpb25zIG9mIG1rZGlycCwgaWYgaXQgZmFpbHMsIGl0IGlzIHBvc3NpYmxlIHRoYXRcbiAqIGRpcmVjdG9yaWVzIHdlcmUgY3JlYXRlZCBmb3Igc29tZSBwcmVmaXggb2YgdGhlIGdpdmVuIHBhdGguXG4gKiBAcmV0dXJuIHRydWUgaWYgdGhlIHBhdGggd2FzIGNyZWF0ZWQ7IGZhbHNlIGlmIGl0IGFscmVhZHkgZXhpc3RlZC5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIG1rZGlycChmaWxlUGF0aDogc3RyaW5nKTogUHJvbWlzZTxib29sZWFuPiB7XG4gIGNvbnN0IGlzRXhpc3RpbmdEaXJlY3RvcnkgPSBhd2FpdCBleGlzdHMoZmlsZVBhdGgpO1xuICBpZiAoaXNFeGlzdGluZ0RpcmVjdG9yeSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgbWtkaXJwTGliKGZpbGVQYXRoLCBlcnIgPT4ge1xuICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgcmVqZWN0KGVycik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmVzb2x2ZSh0cnVlKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cbn1cblxuLyoqXG4gKiBSZW1vdmVzIGRpcmVjdG9yaWVzIGV2ZW4gaWYgdGhleSBhcmUgbm9uLWVtcHR5LiBEb2VzIG5vdCBmYWlsIGlmIHRoZSBkaXJlY3RvcnkgZG9lc24ndCBleGlzdC5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHJtZGlyKGZpbGVQYXRoOiBzdHJpbmcpOiBQcm9taXNlIHtcbiAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICByaW1yYWYoZmlsZVBhdGgsIGVyciA9PiB7XG4gICAgICBpZiAoZXJyKSB7XG4gICAgICAgIHJlamVjdChlcnIpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgfVxuICAgIH0pO1xuICB9KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGV4cGFuZEhvbWVEaXIoZmlsZVBhdGg6IHN0cmluZyk6IHN0cmluZyB7XG4gIGNvbnN0IHtIT01FfSA9IHByb2Nlc3MuZW52O1xuICBsZXQgcmVzb2x2ZWRQYXRoID0gbnVsbDtcbiAgaWYgKGZpbGVQYXRoID09PSAnficpIHtcbiAgICBpbnZhcmlhbnQoSE9NRSAhPSBudWxsKTtcbiAgICByZXNvbHZlZFBhdGggPSBIT01FO1xuICB9IGVsc2UgaWYgKGZpbGVQYXRoLnN0YXJ0c1dpdGgoYH4ke3BhdGguc2VwfWApKSB7XG4gICAgcmVzb2x2ZWRQYXRoID0gYCR7SE9NRX0ke2ZpbGVQYXRoLnN1YnN0cigxKX1gO1xuICB9IGVsc2Uge1xuICAgIHJlc29sdmVkUGF0aCA9IGZpbGVQYXRoO1xuICB9XG4gIHJldHVybiByZXNvbHZlZFBhdGg7XG59XG5cbi8qKiBAcmV0dXJuIHRydWUgb25seSBpZiB3ZSBhcmUgc3VyZSBkaXJlY3RvcnlQYXRoIGlzIG9uIE5GUy4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBpc05mcyhlbnRpdHlQYXRoOiBzdHJpbmcpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgaWYgKHByb2Nlc3MucGxhdGZvcm0gPT09ICdsaW51eCcgfHwgcHJvY2Vzcy5wbGF0Zm9ybSA9PT0gJ2RhcndpbicpIHtcbiAgICBjb25zdCB7c3Rkb3V0LCBleGl0Q29kZX0gPSBhd2FpdCBjaGVja091dHB1dCgnc3RhdCcsIFsnLWYnLCAnLUwnLCAnLWMnLCAnJVQnLCBlbnRpdHlQYXRoXSk7XG4gICAgaWYgKGV4aXRDb2RlID09PSAwKSB7XG4gICAgICByZXR1cm4gc3Rkb3V0LnRyaW0oKSA9PT0gJ25mcyc7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgLy8gVE9ETyBIYW5kbGUgb3RoZXIgcGxhdGZvcm1zICh3aW5kb3dzPyk6IHQ5OTE3NTc2LlxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxufVxuXG4vKipcbiAqIFRha2VzIGEgbWV0aG9kIGZyb20gTm9kZSdzIGZzIG1vZHVsZSBhbmQgcmV0dXJucyBhIFwiZGVub2RlaWZpZWRcIiBlcXVpdmFsZW50LCBpLmUuLCBhbiBhZGFwdGVyXG4gKiB3aXRoIHRoZSBzYW1lIGZ1bmN0aW9uYWxpdHksIGJ1dCByZXR1cm5zIGEgUHJvbWlzZSByYXRoZXIgdGhhbiB0YWtpbmcgYSBjYWxsYmFjay4gVGhpcyBpc24ndFxuICogcXVpdGUgYXMgZWZmaWNpZW50IGFzIFEncyBpbXBsZW1lbnRhdGlvbiBvZiBkZW5vZGVpZnksIGJ1dCBpdCdzIGNvbnNpZGVyYWJseSBsZXNzIGNvZGUuXG4gKi9cbmZ1bmN0aW9uIGRlbm9kZWlmeUZzTWV0aG9kKG1ldGhvZE5hbWU6IHN0cmluZyk6ICgpID0+IFByb21pc2Uge1xuICByZXR1cm4gZnVuY3Rpb24oLi4uYXJncyk6IFByb21pc2Uge1xuICAgIGNvbnN0IG1ldGhvZCA9IGZzW21ldGhvZE5hbWVdO1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBtZXRob2QuYXBwbHkoZnMsIGFyZ3MuY29uY2F0KFtcbiAgICAgICAgKGVyciwgcmVzdWx0KSA9PiBlcnIgPyByZWplY3QoZXJyKSA6IHJlc29sdmUocmVzdWx0KSxcbiAgICAgIF0pKTtcbiAgICB9KTtcbiAgfTtcbn1cblxuZXhwb3J0IGNvbnN0IGNvcHkgPSBkZW5vZGVpZnlGc01ldGhvZCgnY29weScpO1xuZXhwb3J0IGNvbnN0IGNobW9kID0gZGVub2RlaWZ5RnNNZXRob2QoJ2NobW9kJyk7XG5leHBvcnQgY29uc3QgbHN0YXQgPSBkZW5vZGVpZnlGc01ldGhvZCgnbHN0YXQnKTtcbmV4cG9ydCBjb25zdCBta2RpciA9IGRlbm9kZWlmeUZzTWV0aG9kKCdta2RpcicpO1xuZXhwb3J0IGNvbnN0IHJlYWRkaXIgPSBkZW5vZGVpZnlGc01ldGhvZCgncmVhZGRpcicpO1xuZXhwb3J0IGNvbnN0IHJlYWRGaWxlID0gZGVub2RlaWZ5RnNNZXRob2QoJ3JlYWRGaWxlJyk7XG5leHBvcnQgY29uc3QgcmVhZGxpbmsgPSBkZW5vZGVpZnlGc01ldGhvZCgncmVhZGxpbmsnKTtcbmV4cG9ydCBjb25zdCByZWFscGF0aCA9IGRlbm9kZWlmeUZzTWV0aG9kKCdyZWFscGF0aCcpO1xuZXhwb3J0IGNvbnN0IHJlbmFtZSA9IGRlbm9kZWlmeUZzTWV0aG9kKCdyZW5hbWUnKTtcbmV4cG9ydCBjb25zdCBzdGF0ID0gZGVub2RlaWZ5RnNNZXRob2QoJ3N0YXQnKTtcbmV4cG9ydCBjb25zdCBzeW1saW5rID0gZGVub2RlaWZ5RnNNZXRob2QoJ3N5bWxpbmsnKTtcbmV4cG9ydCBjb25zdCB1bmxpbmsgPSBkZW5vZGVpZnlGc01ldGhvZCgndW5saW5rJyk7XG5leHBvcnQgY29uc3Qgd3JpdGVGaWxlID0gZGVub2RlaWZ5RnNNZXRob2QoJ3dyaXRlRmlsZScpO1xuIl19