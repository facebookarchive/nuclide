

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
    var hasFile = yield exists(fileToFind);
    if (hasFile) {
      return currentPath;
    }

    if (isRoot(currentPath)) {
      return null;
    }
    currentPath = path.dirname(currentPath);
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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var fs = require('fs');
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
        fs.close(info.fd, function (closeErr) {
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
    fs.exists(filePath, resolve);
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

/**
 * Takes a method from Node's fs module and returns a "denodeified" equivalent, i.e., an adapter
 * with the same functionality, but returns a Promise rather than taking a callback. This isn't
 * quite as efficient as Q's implementation of denodeify, but it's considerably less code.
 */
function denodeifyFsMethod(methodName) {
  return function () {
    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    var method = fs[methodName];
    return new Promise(function (resolve, reject) {
      method.apply(fs, args.concat([function (err, result) {
        return err ? reject(err) : resolve(result);
      }]));
    });
  };
}

module.exports = {
  chmod: denodeifyFsMethod('chmod'),
  exists: exists,
  findNearestFile: findNearestFile,
  isRoot: isRoot,
  lstat: denodeifyFsMethod('lstat'),
  mkdir: denodeifyFsMethod('mkdir'),
  mkdirp: mkdirp,
  readdir: denodeifyFsMethod('readdir'),
  readFile: denodeifyFsMethod('readFile'),
  readlink: denodeifyFsMethod('readlink'),
  realpath: denodeifyFsMethod('realpath'),
  rename: denodeifyFsMethod('rename'),
  rmdir: rmdir,
  stat: denodeifyFsMethod('stat'),
  symlink: denodeifyFsMethod('symlink'),
  tempdir: tempdir,
  tempfile: tempfile,
  unlink: denodeifyFsMethod('unlink'),
  writeFile: denodeifyFsMethod('writeFile'),
  expandHomeDir: expandHomeDir
};
//# sourceMappingURL=data:application/json;base64,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U0FBTyxFQUFFLGlCQUFpQixDQUFDLFNBQVMsQ0FBQztBQUNyQyxTQUFPLEVBQVAsT0FBTztBQUNQLFVBQVEsRUFBUixRQUFRO0FBQ1IsUUFBTSxFQUFFLGlCQUFpQixDQUFDLFFBQVEsQ0FBQztBQUNuQyxXQUFTLEVBQUUsaUJBQWlCLENBQUMsV0FBVyxDQUFDO0FBQ3pDLGVBQWEsRUFBYixhQUFhO0NBQ2QsQ0FBQyIsImZpbGUiOiJmaWxlc3lzdGVtLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuY29uc3QgZnMgPSByZXF1aXJlKCdmcycpO1xuY29uc3QgcGF0aCA9IHJlcXVpcmUoJ3BhdGgnKTtcbmNvbnN0IG1rZGlycExpYiA9IHJlcXVpcmUoJ21rZGlycCcpO1xuY29uc3QgcmltcmFmID0gcmVxdWlyZSgncmltcmFmJyk7XG5cbmltcG9ydCBpbnZhcmlhbnQgZnJvbSAnYXNzZXJ0JztcblxuZnVuY3Rpb24gaXNSb290KGZpbGVQYXRoOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgcmV0dXJuIHBhdGguZGlybmFtZShmaWxlUGF0aCkgPT09IGZpbGVQYXRoO1xufVxuXG4vKipcbiAqIENyZWF0ZSBhIHRlbXAgZGlyZWN0b3J5IHdpdGggZ2l2ZW4gcHJlZml4LiBUaGUgY2FsbGVyIGlzIHJlc3BvbnNpYmxlIGZvciBjbGVhbmluZyB1cCB0aGVcbiAqICAgZHJlY3RvcnkuXG4gKiBAcGFyYW0gcHJlZml4IG9wdGluYWwgcHJlZml4IGZvciB0aGUgdGVtcCBkaXJlY3RvcnkgbmFtZS5cbiAqIEByZXR1cm4gcGF0aCB0byBhIHRlbXBvcmFyeSBkaXJlY3RvcnkuXG4gKi9cbmZ1bmN0aW9uIHRlbXBkaXIocHJlZml4OiBzdHJpbmcgPSAnJyk6IFByb21pc2U8c3RyaW5nPiB7XG4gIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgcmVxdWlyZSgndGVtcCcpLm1rZGlyKHByZWZpeCwgKGVyciwgZGlyUGF0aCkgPT4ge1xuICAgICAgaWYgKGVycikge1xuICAgICAgICByZWplY3QoZXJyKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJlc29sdmUoZGlyUGF0aCk7XG4gICAgICB9XG4gICAgfSk7XG4gIH0pO1xufVxuXG4vKipcbiAqIEByZXR1cm4gcGF0aCB0byBhIHRlbXBvcmFyeSBmaWxlLiBUaGUgY2FsbGVyIGlzIHJlc3BvbnNpYmxlIGZvciBjbGVhbmluZyB1cFxuICogICAgIHRoZSBmaWxlLlxuICovXG5mdW5jdGlvbiB0ZW1wZmlsZShvcHRpb25zOiBhbnkpOiBQcm9taXNlPHN0cmluZz4ge1xuICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgIHJlcXVpcmUoJ3RlbXAnKS5vcGVuKG9wdGlvbnMsIChlcnIsIGluZm8pID0+IHtcbiAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgcmVqZWN0KGVycik7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBmcy5jbG9zZShpbmZvLmZkLCBjbG9zZUVyciA9PiB7XG4gICAgICAgICAgaWYgKGNsb3NlRXJyKSB7XG4gICAgICAgICAgICByZWplY3QoY2xvc2VFcnIpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXNvbHZlKGluZm8ucGF0aCk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfSk7XG59XG5cbi8qKlxuICogU2VhcmNoZXMgdXB3YXJkcyB0aHJvdWdoIHRoZSBmaWxlc3lzdGVtIGZyb20gcGF0aFRvRmlsZSB0byBmaW5kIGEgZmlsZSB3aXRoXG4gKiAgIGZpbGVOYW1lLlxuICogQHBhcmFtIGZpbGVOYW1lIFRoZSBuYW1lIG9mIHRoZSBmaWxlIHRvIGZpbmQuXG4gKiBAcGFyYW0gcGF0aFRvRGlyZWN0b3J5IFdoZXJlIHRvIGJlZ2luIHRoZSBzZWFyY2guIE11c3QgYmUgYSBwYXRoIHRvIGEgZGlyZWN0b3J5LCBub3QgYVxuICogICBmaWxlLlxuICogQHJldHVybiBkaXJlY3RvcnkgdGhhdCBjb250YWlucyB0aGUgbmVhcmVzdCBmaWxlIG9yIG51bGwuXG4gKi9cbmFzeW5jIGZ1bmN0aW9uIGZpbmROZWFyZXN0RmlsZShmaWxlTmFtZTogc3RyaW5nLCBwYXRoVG9EaXJlY3Rvcnk6IHN0cmluZyk6IFByb21pc2U8P3N0cmluZz4ge1xuICAvLyBUT0RPKDU1ODYzNTUpOiBJZiB0aGlzIGJlY29tZXMgYSBib3R0bGVuZWNrLCB3ZSBzaG91bGQgY29uc2lkZXIgbWVtb2l6aW5nXG4gIC8vIHRoaXMgZnVuY3Rpb24uIFRoZSBkb3duc2lkZSB3b3VsZCBiZSB0aGF0IGlmIHNvbWVvbmUgYWRkZWQgYSBjbG9zZXIgZmlsZVxuICAvLyB3aXRoIGZpbGVOYW1lIHRvIHBhdGhUb0ZpbGUgKG9yIGRlbGV0ZWQgdGhlIG9uZSB0aGF0IHdhcyBjYWNoZWQpLCB0aGVuIHdlXG4gIC8vIHdvdWxkIGhhdmUgYSBidWcuIFRoaXMgd291bGQgcHJvYmFibHkgYmUgcHJldHR5IHJhcmUsIHRob3VnaC5cbiAgbGV0IGN1cnJlbnRQYXRoID0gcGF0aC5yZXNvbHZlKHBhdGhUb0RpcmVjdG9yeSk7XG4gIGRvIHsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby1jb25zdGFudC1jb25kaXRpb25cbiAgICBjb25zdCBmaWxlVG9GaW5kID0gcGF0aC5qb2luKGN1cnJlbnRQYXRoLCBmaWxlTmFtZSk7XG4gICAgY29uc3QgaGFzRmlsZSA9IGF3YWl0IGV4aXN0cyhmaWxlVG9GaW5kKTtcbiAgICBpZiAoaGFzRmlsZSkge1xuICAgICAgcmV0dXJuIGN1cnJlbnRQYXRoO1xuICAgIH1cblxuICAgIGlmIChpc1Jvb3QoY3VycmVudFBhdGgpKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgY3VycmVudFBhdGggPSBwYXRoLmRpcm5hbWUoY3VycmVudFBhdGgpO1xuICB9IHdoaWxlICh0cnVlKTtcbn1cblxuZnVuY3Rpb24gZXhpc3RzKGZpbGVQYXRoOiBzdHJpbmcpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICBmcy5leGlzdHMoZmlsZVBhdGgsIHJlc29sdmUpO1xuICB9KTtcbn1cblxuLyoqXG4gKiBSdW5zIHRoZSBlcXVpdmFsZW50IG9mIGBta2RpciAtcGAgd2l0aCB0aGUgZ2l2ZW4gcGF0aC5cbiAqXG4gKiBMaWtlIG1vc3QgaW1wbGVtZW50YXRpb25zIG9mIG1rZGlycCwgaWYgaXQgZmFpbHMsIGl0IGlzIHBvc3NpYmxlIHRoYXRcbiAqIGRpcmVjdG9yaWVzIHdlcmUgY3JlYXRlZCBmb3Igc29tZSBwcmVmaXggb2YgdGhlIGdpdmVuIHBhdGguXG4gKiBAcmV0dXJuIHRydWUgaWYgdGhlIHBhdGggd2FzIGNyZWF0ZWQ7IGZhbHNlIGlmIGl0IGFscmVhZHkgZXhpc3RlZC5cbiAqL1xuYXN5bmMgZnVuY3Rpb24gbWtkaXJwKGZpbGVQYXRoOiBzdHJpbmcpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgY29uc3QgaXNFeGlzdGluZ0RpcmVjdG9yeSA9IGF3YWl0IGV4aXN0cyhmaWxlUGF0aCk7XG4gIGlmIChpc0V4aXN0aW5nRGlyZWN0b3J5KSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBta2RpcnBMaWIoZmlsZVBhdGgsIChlcnIpID0+IHtcbiAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgIHJlamVjdChlcnIpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJlc29sdmUodHJ1ZSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG59XG5cbi8qKlxuICogUmVtb3ZlcyBkaXJlY3RvcmllcyBldmVuIGlmIHRoZXkgYXJlIG5vbi1lbXB0eS4gRG9lcyBub3QgZmFpbCBpZiB0aGUgZGlyZWN0b3J5IGRvZXNuJ3QgZXhpc3QuXG4gKi9cbmFzeW5jIGZ1bmN0aW9uIHJtZGlyKGZpbGVQYXRoOiBzdHJpbmcpOiBQcm9taXNlIHtcbiAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICByaW1yYWYoZmlsZVBhdGgsIChlcnIpID0+IHtcbiAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgcmVqZWN0KGVycik7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXNvbHZlKCk7XG4gICAgICB9XG4gICAgfSk7XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBleHBhbmRIb21lRGlyKGZpbGVQYXRoOiBzdHJpbmcpOiBzdHJpbmcge1xuICBjb25zdCB7SE9NRX0gPSBwcm9jZXNzLmVudjtcbiAgbGV0IHJlc29sdmVkUGF0aCA9IG51bGw7XG4gIGlmIChmaWxlUGF0aCA9PT0gJ34nKSB7XG4gICAgaW52YXJpYW50KEhPTUUgIT0gbnVsbCk7XG4gICAgcmVzb2x2ZWRQYXRoID0gSE9NRTtcbiAgfSBlbHNlIGlmIChmaWxlUGF0aC5zdGFydHNXaXRoKGB+JHtwYXRoLnNlcH1gKSkge1xuICAgIHJlc29sdmVkUGF0aCA9IGAke0hPTUV9JHtmaWxlUGF0aC5zdWJzdHIoMSl9YDtcbiAgfSBlbHNlIHtcbiAgICByZXNvbHZlZFBhdGggPSBmaWxlUGF0aDtcbiAgfVxuICByZXR1cm4gcmVzb2x2ZWRQYXRoO1xufVxuXG4vKipcbiAqIFRha2VzIGEgbWV0aG9kIGZyb20gTm9kZSdzIGZzIG1vZHVsZSBhbmQgcmV0dXJucyBhIFwiZGVub2RlaWZpZWRcIiBlcXVpdmFsZW50LCBpLmUuLCBhbiBhZGFwdGVyXG4gKiB3aXRoIHRoZSBzYW1lIGZ1bmN0aW9uYWxpdHksIGJ1dCByZXR1cm5zIGEgUHJvbWlzZSByYXRoZXIgdGhhbiB0YWtpbmcgYSBjYWxsYmFjay4gVGhpcyBpc24ndFxuICogcXVpdGUgYXMgZWZmaWNpZW50IGFzIFEncyBpbXBsZW1lbnRhdGlvbiBvZiBkZW5vZGVpZnksIGJ1dCBpdCdzIGNvbnNpZGVyYWJseSBsZXNzIGNvZGUuXG4gKi9cbmZ1bmN0aW9uIGRlbm9kZWlmeUZzTWV0aG9kKG1ldGhvZE5hbWU6IHN0cmluZyk6ICgpID0+IFByb21pc2Uge1xuICByZXR1cm4gZnVuY3Rpb24oLi4uYXJncyk6IFByb21pc2Uge1xuICAgIGNvbnN0IG1ldGhvZCA9IGZzW21ldGhvZE5hbWVdO1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBtZXRob2QuYXBwbHkoZnMsIGFyZ3MuY29uY2F0KFtcbiAgICAgICAgKGVyciwgcmVzdWx0KSA9PiBlcnIgPyByZWplY3QoZXJyKSA6IHJlc29sdmUocmVzdWx0KSxcbiAgICAgIF0pKTtcbiAgICB9KTtcbiAgfTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGNobW9kOiBkZW5vZGVpZnlGc01ldGhvZCgnY2htb2QnKSxcbiAgZXhpc3RzLFxuICBmaW5kTmVhcmVzdEZpbGUsXG4gIGlzUm9vdCxcbiAgbHN0YXQ6IGRlbm9kZWlmeUZzTWV0aG9kKCdsc3RhdCcpLFxuICBta2RpcjogZGVub2RlaWZ5RnNNZXRob2QoJ21rZGlyJyksXG4gIG1rZGlycCxcbiAgcmVhZGRpcjogZGVub2RlaWZ5RnNNZXRob2QoJ3JlYWRkaXInKSxcbiAgcmVhZEZpbGU6IGRlbm9kZWlmeUZzTWV0aG9kKCdyZWFkRmlsZScpLFxuICByZWFkbGluazogZGVub2RlaWZ5RnNNZXRob2QoJ3JlYWRsaW5rJyksXG4gIHJlYWxwYXRoOiBkZW5vZGVpZnlGc01ldGhvZCgncmVhbHBhdGgnKSxcbiAgcmVuYW1lOiBkZW5vZGVpZnlGc01ldGhvZCgncmVuYW1lJyksXG4gIHJtZGlyLFxuICBzdGF0OiBkZW5vZGVpZnlGc01ldGhvZCgnc3RhdCcpLFxuICBzeW1saW5rOiBkZW5vZGVpZnlGc01ldGhvZCgnc3ltbGluaycpLFxuICB0ZW1wZGlyLFxuICB0ZW1wZmlsZSxcbiAgdW5saW5rOiBkZW5vZGVpZnlGc01ldGhvZCgndW5saW5rJyksXG4gIHdyaXRlRmlsZTogZGVub2RlaWZ5RnNNZXRob2QoJ3dyaXRlRmlsZScpLFxuICBleHBhbmRIb21lRGlyLFxufTtcbiJdfQ==