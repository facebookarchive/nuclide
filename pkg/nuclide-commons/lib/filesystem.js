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
exports.getCommonAncestorDirectory = getCommonAncestorDirectory;
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

function getCommonAncestorDirectory(filePaths) {
  var commonDirectoryPath = path.dirname(filePaths[0]);
  while (filePaths.some(function (filePath) {
    return !filePath.startsWith(commonDirectoryPath);
  })) {
    commonDirectoryPath = path.dirname(commonDirectoryPath);
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
//# sourceMappingURL=data:application/json;base64,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Ki9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmNvbnN0IHBhdGggPSByZXF1aXJlKCdwYXRoJyk7XG5jb25zdCBta2RpcnBMaWIgPSByZXF1aXJlKCdta2RpcnAnKTtcbmNvbnN0IHJpbXJhZiA9IHJlcXVpcmUoJ3JpbXJhZicpO1xuXG5pbXBvcnQgZnMgZnJvbSAnZnMtcGx1cyc7XG5pbXBvcnQgaW52YXJpYW50IGZyb20gJ2Fzc2VydCc7XG5pbXBvcnQge2NoZWNrT3V0cHV0fSBmcm9tICcuL3Byb2Nlc3MnO1xuXG5leHBvcnQgZnVuY3Rpb24gaXNSb290KGZpbGVQYXRoOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgcmV0dXJuIHBhdGguZGlybmFtZShmaWxlUGF0aCkgPT09IGZpbGVQYXRoO1xufVxuXG4vKipcbiAqIENyZWF0ZSBhIHRlbXAgZGlyZWN0b3J5IHdpdGggZ2l2ZW4gcHJlZml4LiBUaGUgY2FsbGVyIGlzIHJlc3BvbnNpYmxlIGZvciBjbGVhbmluZyB1cCB0aGVcbiAqICAgZHJlY3RvcnkuXG4gKiBAcGFyYW0gcHJlZml4IG9wdGluYWwgcHJlZml4IGZvciB0aGUgdGVtcCBkaXJlY3RvcnkgbmFtZS5cbiAqIEByZXR1cm4gcGF0aCB0byBhIHRlbXBvcmFyeSBkaXJlY3RvcnkuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB0ZW1wZGlyKHByZWZpeDogc3RyaW5nID0gJycpOiBQcm9taXNlPHN0cmluZz4ge1xuICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgIHJlcXVpcmUoJ3RlbXAnKS5ta2RpcihwcmVmaXgsIChlcnIsIGRpclBhdGgpID0+IHtcbiAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgcmVqZWN0KGVycik7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXNvbHZlKGRpclBhdGgpO1xuICAgICAgfVxuICAgIH0pO1xuICB9KTtcbn1cblxuLyoqXG4gKiBAcmV0dXJuIHBhdGggdG8gYSB0ZW1wb3JhcnkgZmlsZS4gVGhlIGNhbGxlciBpcyByZXNwb25zaWJsZSBmb3IgY2xlYW5pbmcgdXBcbiAqICAgICB0aGUgZmlsZS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHRlbXBmaWxlKG9wdGlvbnM6IGFueSk6IFByb21pc2U8c3RyaW5nPiB7XG4gIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgcmVxdWlyZSgndGVtcCcpLm9wZW4ob3B0aW9ucywgKGVyciwgaW5mbykgPT4ge1xuICAgICAgaWYgKGVycikge1xuICAgICAgICByZWplY3QoZXJyKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGZzLmNsb3NlKGluZm8uZmQsIGNsb3NlRXJyID0+IHtcbiAgICAgICAgICBpZiAoY2xvc2VFcnIpIHtcbiAgICAgICAgICAgIHJlamVjdChjbG9zZUVycik7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJlc29sdmUoaW5mby5wYXRoKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH0pO1xuICB9KTtcbn1cblxuLyoqXG4gKiBTZWFyY2hlcyB1cHdhcmRzIHRocm91Z2ggdGhlIGZpbGVzeXN0ZW0gZnJvbSBwYXRoVG9GaWxlIHRvIGZpbmQgYSBmaWxlIHdpdGhcbiAqICAgZmlsZU5hbWUuXG4gKiBAcGFyYW0gZmlsZU5hbWUgVGhlIG5hbWUgb2YgdGhlIGZpbGUgdG8gZmluZC5cbiAqIEBwYXJhbSBwYXRoVG9EaXJlY3RvcnkgV2hlcmUgdG8gYmVnaW4gdGhlIHNlYXJjaC4gTXVzdCBiZSBhIHBhdGggdG8gYSBkaXJlY3RvcnksIG5vdCBhXG4gKiAgIGZpbGUuXG4gKiBAcmV0dXJuIGRpcmVjdG9yeSB0aGF0IGNvbnRhaW5zIHRoZSBuZWFyZXN0IGZpbGUgb3IgbnVsbC5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGZpbmROZWFyZXN0RmlsZShmaWxlTmFtZTogc3RyaW5nLCBwYXRoVG9EaXJlY3Rvcnk6IHN0cmluZyk6IFByb21pc2U8P3N0cmluZz4ge1xuICAvLyBUT0RPKDU1ODYzNTUpOiBJZiB0aGlzIGJlY29tZXMgYSBib3R0bGVuZWNrLCB3ZSBzaG91bGQgY29uc2lkZXIgbWVtb2l6aW5nXG4gIC8vIHRoaXMgZnVuY3Rpb24uIFRoZSBkb3duc2lkZSB3b3VsZCBiZSB0aGF0IGlmIHNvbWVvbmUgYWRkZWQgYSBjbG9zZXIgZmlsZVxuICAvLyB3aXRoIGZpbGVOYW1lIHRvIHBhdGhUb0ZpbGUgKG9yIGRlbGV0ZWQgdGhlIG9uZSB0aGF0IHdhcyBjYWNoZWQpLCB0aGVuIHdlXG4gIC8vIHdvdWxkIGhhdmUgYSBidWcuIFRoaXMgd291bGQgcHJvYmFibHkgYmUgcHJldHR5IHJhcmUsIHRob3VnaC5cbiAgbGV0IGN1cnJlbnRQYXRoID0gcGF0aC5yZXNvbHZlKHBhdGhUb0RpcmVjdG9yeSk7XG4gIGRvIHsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby1jb25zdGFudC1jb25kaXRpb25cbiAgICBjb25zdCBmaWxlVG9GaW5kID0gcGF0aC5qb2luKGN1cnJlbnRQYXRoLCBmaWxlTmFtZSk7XG4gICAgY29uc3QgaGFzRmlsZSA9IGF3YWl0IGV4aXN0cyhmaWxlVG9GaW5kKTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBiYWJlbC9uby1hd2FpdC1pbi1sb29wXG4gICAgaWYgKGhhc0ZpbGUpIHtcbiAgICAgIHJldHVybiBjdXJyZW50UGF0aDtcbiAgICB9XG5cbiAgICBpZiAoaXNSb290KGN1cnJlbnRQYXRoKSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGN1cnJlbnRQYXRoID0gcGF0aC5kaXJuYW1lKGN1cnJlbnRQYXRoKTtcbiAgfSB3aGlsZSAodHJ1ZSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRDb21tb25BbmNlc3RvckRpcmVjdG9yeShmaWxlUGF0aHM6IEFycmF5PHN0cmluZz4pOiBzdHJpbmcge1xuICBsZXQgY29tbW9uRGlyZWN0b3J5UGF0aCA9IHBhdGguZGlybmFtZShmaWxlUGF0aHNbMF0pO1xuICB3aGlsZSAoZmlsZVBhdGhzLnNvbWUoZmlsZVBhdGggPT4gIWZpbGVQYXRoLnN0YXJ0c1dpdGgoY29tbW9uRGlyZWN0b3J5UGF0aCkpKSB7XG4gICAgY29tbW9uRGlyZWN0b3J5UGF0aCA9IHBhdGguZGlybmFtZShjb21tb25EaXJlY3RvcnlQYXRoKTtcbiAgfVxuICByZXR1cm4gY29tbW9uRGlyZWN0b3J5UGF0aDtcbn1cblxuXG5leHBvcnQgZnVuY3Rpb24gZXhpc3RzKGZpbGVQYXRoOiBzdHJpbmcpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICBmcy5leGlzdHMoZmlsZVBhdGgsIHJlc29sdmUpO1xuICB9KTtcbn1cblxuLyoqXG4gKiBSdW5zIHRoZSBlcXVpdmFsZW50IG9mIGBta2RpciAtcGAgd2l0aCB0aGUgZ2l2ZW4gcGF0aC5cbiAqXG4gKiBMaWtlIG1vc3QgaW1wbGVtZW50YXRpb25zIG9mIG1rZGlycCwgaWYgaXQgZmFpbHMsIGl0IGlzIHBvc3NpYmxlIHRoYXRcbiAqIGRpcmVjdG9yaWVzIHdlcmUgY3JlYXRlZCBmb3Igc29tZSBwcmVmaXggb2YgdGhlIGdpdmVuIHBhdGguXG4gKiBAcmV0dXJuIHRydWUgaWYgdGhlIHBhdGggd2FzIGNyZWF0ZWQ7IGZhbHNlIGlmIGl0IGFscmVhZHkgZXhpc3RlZC5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIG1rZGlycChmaWxlUGF0aDogc3RyaW5nKTogUHJvbWlzZTxib29sZWFuPiB7XG4gIGNvbnN0IGlzRXhpc3RpbmdEaXJlY3RvcnkgPSBhd2FpdCBleGlzdHMoZmlsZVBhdGgpO1xuICBpZiAoaXNFeGlzdGluZ0RpcmVjdG9yeSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgbWtkaXJwTGliKGZpbGVQYXRoLCBlcnIgPT4ge1xuICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgcmVqZWN0KGVycik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmVzb2x2ZSh0cnVlKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cbn1cblxuLyoqXG4gKiBSZW1vdmVzIGRpcmVjdG9yaWVzIGV2ZW4gaWYgdGhleSBhcmUgbm9uLWVtcHR5LiBEb2VzIG5vdCBmYWlsIGlmIHRoZSBkaXJlY3RvcnkgZG9lc24ndCBleGlzdC5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHJtZGlyKGZpbGVQYXRoOiBzdHJpbmcpOiBQcm9taXNlIHtcbiAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICByaW1yYWYoZmlsZVBhdGgsIGVyciA9PiB7XG4gICAgICBpZiAoZXJyKSB7XG4gICAgICAgIHJlamVjdChlcnIpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgfVxuICAgIH0pO1xuICB9KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGV4cGFuZEhvbWVEaXIoZmlsZVBhdGg6IHN0cmluZyk6IHN0cmluZyB7XG4gIGNvbnN0IHtIT01FfSA9IHByb2Nlc3MuZW52O1xuICBsZXQgcmVzb2x2ZWRQYXRoID0gbnVsbDtcbiAgaWYgKGZpbGVQYXRoID09PSAnficpIHtcbiAgICBpbnZhcmlhbnQoSE9NRSAhPSBudWxsKTtcbiAgICByZXNvbHZlZFBhdGggPSBIT01FO1xuICB9IGVsc2UgaWYgKGZpbGVQYXRoLnN0YXJ0c1dpdGgoYH4ke3BhdGguc2VwfWApKSB7XG4gICAgcmVzb2x2ZWRQYXRoID0gYCR7SE9NRX0ke2ZpbGVQYXRoLnN1YnN0cigxKX1gO1xuICB9IGVsc2Uge1xuICAgIHJlc29sdmVkUGF0aCA9IGZpbGVQYXRoO1xuICB9XG4gIHJldHVybiByZXNvbHZlZFBhdGg7XG59XG5cbi8qKiBAcmV0dXJuIHRydWUgb25seSBpZiB3ZSBhcmUgc3VyZSBkaXJlY3RvcnlQYXRoIGlzIG9uIE5GUy4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBpc05mcyhlbnRpdHlQYXRoOiBzdHJpbmcpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgaWYgKHByb2Nlc3MucGxhdGZvcm0gPT09ICdsaW51eCcgfHwgcHJvY2Vzcy5wbGF0Zm9ybSA9PT0gJ2RhcndpbicpIHtcbiAgICBjb25zdCB7c3Rkb3V0LCBleGl0Q29kZX0gPSBhd2FpdCBjaGVja091dHB1dCgnc3RhdCcsIFsnLWYnLCAnLUwnLCAnLWMnLCAnJVQnLCBlbnRpdHlQYXRoXSk7XG4gICAgaWYgKGV4aXRDb2RlID09PSAwKSB7XG4gICAgICByZXR1cm4gc3Rkb3V0LnRyaW0oKSA9PT0gJ25mcyc7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgLy8gVE9ETyBIYW5kbGUgb3RoZXIgcGxhdGZvcm1zICh3aW5kb3dzPyk6IHQ5OTE3NTc2LlxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxufVxuXG4vKipcbiAqIFRha2VzIGEgbWV0aG9kIGZyb20gTm9kZSdzIGZzIG1vZHVsZSBhbmQgcmV0dXJucyBhIFwiZGVub2RlaWZpZWRcIiBlcXVpdmFsZW50LCBpLmUuLCBhbiBhZGFwdGVyXG4gKiB3aXRoIHRoZSBzYW1lIGZ1bmN0aW9uYWxpdHksIGJ1dCByZXR1cm5zIGEgUHJvbWlzZSByYXRoZXIgdGhhbiB0YWtpbmcgYSBjYWxsYmFjay4gVGhpcyBpc24ndFxuICogcXVpdGUgYXMgZWZmaWNpZW50IGFzIFEncyBpbXBsZW1lbnRhdGlvbiBvZiBkZW5vZGVpZnksIGJ1dCBpdCdzIGNvbnNpZGVyYWJseSBsZXNzIGNvZGUuXG4gKi9cbmZ1bmN0aW9uIGRlbm9kZWlmeUZzTWV0aG9kKG1ldGhvZE5hbWU6IHN0cmluZyk6ICgpID0+IFByb21pc2Uge1xuICByZXR1cm4gZnVuY3Rpb24oLi4uYXJncyk6IFByb21pc2Uge1xuICAgIGNvbnN0IG1ldGhvZCA9IGZzW21ldGhvZE5hbWVdO1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBtZXRob2QuYXBwbHkoZnMsIGFyZ3MuY29uY2F0KFtcbiAgICAgICAgKGVyciwgcmVzdWx0KSA9PiBlcnIgPyByZWplY3QoZXJyKSA6IHJlc29sdmUocmVzdWx0KSxcbiAgICAgIF0pKTtcbiAgICB9KTtcbiAgfTtcbn1cblxuZXhwb3J0IGNvbnN0IGNvcHkgPSBkZW5vZGVpZnlGc01ldGhvZCgnY29weScpO1xuZXhwb3J0IGNvbnN0IGNobW9kID0gZGVub2RlaWZ5RnNNZXRob2QoJ2NobW9kJyk7XG5leHBvcnQgY29uc3QgbHN0YXQgPSBkZW5vZGVpZnlGc01ldGhvZCgnbHN0YXQnKTtcbmV4cG9ydCBjb25zdCBta2RpciA9IGRlbm9kZWlmeUZzTWV0aG9kKCdta2RpcicpO1xuZXhwb3J0IGNvbnN0IHJlYWRkaXIgPSBkZW5vZGVpZnlGc01ldGhvZCgncmVhZGRpcicpO1xuZXhwb3J0IGNvbnN0IHJlYWRGaWxlID0gZGVub2RlaWZ5RnNNZXRob2QoJ3JlYWRGaWxlJyk7XG5leHBvcnQgY29uc3QgcmVhZGxpbmsgPSBkZW5vZGVpZnlGc01ldGhvZCgncmVhZGxpbmsnKTtcbmV4cG9ydCBjb25zdCByZWFscGF0aCA9IGRlbm9kZWlmeUZzTWV0aG9kKCdyZWFscGF0aCcpO1xuZXhwb3J0IGNvbnN0IHJlbmFtZSA9IGRlbm9kZWlmeUZzTWV0aG9kKCdyZW5hbWUnKTtcbmV4cG9ydCBjb25zdCBzdGF0ID0gZGVub2RlaWZ5RnNNZXRob2QoJ3N0YXQnKTtcbmV4cG9ydCBjb25zdCBzeW1saW5rID0gZGVub2RlaWZ5RnNNZXRob2QoJ3N5bWxpbmsnKTtcbmV4cG9ydCBjb25zdCB1bmxpbmsgPSBkZW5vZGVpZnlGc01ldGhvZCgndW5saW5rJyk7XG5leHBvcnQgY29uc3Qgd3JpdGVGaWxlID0gZGVub2RlaWZ5RnNNZXRob2QoJ3dyaXRlRmlsZScpO1xuIl19