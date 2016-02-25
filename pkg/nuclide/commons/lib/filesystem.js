

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
}function denodeifyFsMethod(methodName) {
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

module.exports = {
  copy: denodeifyFsMethod('copy'),
  chmod: denodeifyFsMethod('chmod'),
  exists: exists,
  findNearestFile: findNearestFile,
  isRoot: isRoot,
  isNfs: isNfs,
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
//# sourceMappingURL=data:application/json;base64,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TTtBQUNOLGlCQUFlLEVBQWYsZUFBZTtBQUNmLFFBQU0sRUFBTixNQUFNO0FBQ04sT0FBSyxFQUFMLEtBQUs7QUFDTCxPQUFLLEVBQUUsaUJBQWlCLENBQUMsT0FBTyxDQUFDO0FBQ2pDLE9BQUssRUFBRSxpQkFBaUIsQ0FBQyxPQUFPLENBQUM7QUFDakMsUUFBTSxFQUFOLE1BQU07QUFDTixTQUFPLEVBQUUsaUJBQWlCLENBQUMsU0FBUyxDQUFDO0FBQ3JDLFVBQVEsRUFBRSxpQkFBaUIsQ0FBQyxVQUFVLENBQUM7QUFDdkMsVUFBUSxFQUFFLGlCQUFpQixDQUFDLFVBQVUsQ0FBQztBQUN2QyxVQUFRLEVBQUUsaUJBQWlCLENBQUMsVUFBVSxDQUFDO0FBQ3ZDLFFBQU0sRUFBRSxpQkFBaUIsQ0FBQyxRQUFRLENBQUM7QUFDbkMsT0FBSyxFQUFMLEtBQUs7QUFDTCxNQUFJLEVBQUUsaUJBQWlCLENBQUMsTUFBTSxDQUFDO0FBQy9CLFNBQU8sRUFBRSxpQkFBaUIsQ0FBQyxTQUFTLENBQUM7QUFDckMsU0FBTyxFQUFQLE9BQU87QUFDUCxVQUFRLEVBQVIsUUFBUTtBQUNSLFFBQU0sRUFBRSxpQkFBaUIsQ0FBQyxRQUFRLENBQUM7QUFDbkMsV0FBUyxFQUFFLGlCQUFpQixDQUFDLFdBQVcsQ0FBQztBQUN6QyxlQUFhLEVBQWIsYUFBYTtDQUNkLENBQUMiLCJmaWxlIjoiZmlsZXN5c3RlbS5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmNvbnN0IHBhdGggPSByZXF1aXJlKCdwYXRoJyk7XG5jb25zdCBta2RpcnBMaWIgPSByZXF1aXJlKCdta2RpcnAnKTtcbmNvbnN0IHJpbXJhZiA9IHJlcXVpcmUoJ3JpbXJhZicpO1xuXG5pbXBvcnQgZnMgZnJvbSAnZnMtcGx1cyc7XG5pbXBvcnQgaW52YXJpYW50IGZyb20gJ2Fzc2VydCc7XG5pbXBvcnQge2NoZWNrT3V0cHV0fSBmcm9tICcuL3Byb2Nlc3MnO1xuXG5mdW5jdGlvbiBpc1Jvb3QoZmlsZVBhdGg6IHN0cmluZyk6IGJvb2xlYW4ge1xuICByZXR1cm4gcGF0aC5kaXJuYW1lKGZpbGVQYXRoKSA9PT0gZmlsZVBhdGg7XG59XG5cbi8qKlxuICogQ3JlYXRlIGEgdGVtcCBkaXJlY3Rvcnkgd2l0aCBnaXZlbiBwcmVmaXguIFRoZSBjYWxsZXIgaXMgcmVzcG9uc2libGUgZm9yIGNsZWFuaW5nIHVwIHRoZVxuICogICBkcmVjdG9yeS5cbiAqIEBwYXJhbSBwcmVmaXggb3B0aW5hbCBwcmVmaXggZm9yIHRoZSB0ZW1wIGRpcmVjdG9yeSBuYW1lLlxuICogQHJldHVybiBwYXRoIHRvIGEgdGVtcG9yYXJ5IGRpcmVjdG9yeS5cbiAqL1xuZnVuY3Rpb24gdGVtcGRpcihwcmVmaXg6IHN0cmluZyA9ICcnKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICByZXF1aXJlKCd0ZW1wJykubWtkaXIocHJlZml4LCAoZXJyLCBkaXJQYXRoKSA9PiB7XG4gICAgICBpZiAoZXJyKSB7XG4gICAgICAgIHJlamVjdChlcnIpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmVzb2x2ZShkaXJQYXRoKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfSk7XG59XG5cbi8qKlxuICogQHJldHVybiBwYXRoIHRvIGEgdGVtcG9yYXJ5IGZpbGUuIFRoZSBjYWxsZXIgaXMgcmVzcG9uc2libGUgZm9yIGNsZWFuaW5nIHVwXG4gKiAgICAgdGhlIGZpbGUuXG4gKi9cbmZ1bmN0aW9uIHRlbXBmaWxlKG9wdGlvbnM6IGFueSk6IFByb21pc2U8c3RyaW5nPiB7XG4gIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgcmVxdWlyZSgndGVtcCcpLm9wZW4ob3B0aW9ucywgKGVyciwgaW5mbykgPT4ge1xuICAgICAgaWYgKGVycikge1xuICAgICAgICByZWplY3QoZXJyKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGZzLmNsb3NlKGluZm8uZmQsIGNsb3NlRXJyID0+IHtcbiAgICAgICAgICBpZiAoY2xvc2VFcnIpIHtcbiAgICAgICAgICAgIHJlamVjdChjbG9zZUVycik7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJlc29sdmUoaW5mby5wYXRoKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH0pO1xuICB9KTtcbn1cblxuLyoqXG4gKiBTZWFyY2hlcyB1cHdhcmRzIHRocm91Z2ggdGhlIGZpbGVzeXN0ZW0gZnJvbSBwYXRoVG9GaWxlIHRvIGZpbmQgYSBmaWxlIHdpdGhcbiAqICAgZmlsZU5hbWUuXG4gKiBAcGFyYW0gZmlsZU5hbWUgVGhlIG5hbWUgb2YgdGhlIGZpbGUgdG8gZmluZC5cbiAqIEBwYXJhbSBwYXRoVG9EaXJlY3RvcnkgV2hlcmUgdG8gYmVnaW4gdGhlIHNlYXJjaC4gTXVzdCBiZSBhIHBhdGggdG8gYSBkaXJlY3RvcnksIG5vdCBhXG4gKiAgIGZpbGUuXG4gKiBAcmV0dXJuIGRpcmVjdG9yeSB0aGF0IGNvbnRhaW5zIHRoZSBuZWFyZXN0IGZpbGUgb3IgbnVsbC5cbiAqL1xuYXN5bmMgZnVuY3Rpb24gZmluZE5lYXJlc3RGaWxlKGZpbGVOYW1lOiBzdHJpbmcsIHBhdGhUb0RpcmVjdG9yeTogc3RyaW5nKTogUHJvbWlzZTw/c3RyaW5nPiB7XG4gIC8vIFRPRE8oNTU4NjM1NSk6IElmIHRoaXMgYmVjb21lcyBhIGJvdHRsZW5lY2ssIHdlIHNob3VsZCBjb25zaWRlciBtZW1vaXppbmdcbiAgLy8gdGhpcyBmdW5jdGlvbi4gVGhlIGRvd25zaWRlIHdvdWxkIGJlIHRoYXQgaWYgc29tZW9uZSBhZGRlZCBhIGNsb3NlciBmaWxlXG4gIC8vIHdpdGggZmlsZU5hbWUgdG8gcGF0aFRvRmlsZSAob3IgZGVsZXRlZCB0aGUgb25lIHRoYXQgd2FzIGNhY2hlZCksIHRoZW4gd2VcbiAgLy8gd291bGQgaGF2ZSBhIGJ1Zy4gVGhpcyB3b3VsZCBwcm9iYWJseSBiZSBwcmV0dHkgcmFyZSwgdGhvdWdoLlxuICBsZXQgY3VycmVudFBhdGggPSBwYXRoLnJlc29sdmUocGF0aFRvRGlyZWN0b3J5KTtcbiAgZG8geyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLWNvbnN0YW50LWNvbmRpdGlvblxuICAgIGNvbnN0IGZpbGVUb0ZpbmQgPSBwYXRoLmpvaW4oY3VycmVudFBhdGgsIGZpbGVOYW1lKTtcbiAgICBjb25zdCBoYXNGaWxlID0gYXdhaXQgZXhpc3RzKGZpbGVUb0ZpbmQpOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIGJhYmVsL25vLWF3YWl0LWluLWxvb3BcbiAgICBpZiAoaGFzRmlsZSkge1xuICAgICAgcmV0dXJuIGN1cnJlbnRQYXRoO1xuICAgIH1cblxuICAgIGlmIChpc1Jvb3QoY3VycmVudFBhdGgpKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgY3VycmVudFBhdGggPSBwYXRoLmRpcm5hbWUoY3VycmVudFBhdGgpO1xuICB9IHdoaWxlICh0cnVlKTtcbn1cblxuZnVuY3Rpb24gZXhpc3RzKGZpbGVQYXRoOiBzdHJpbmcpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICBmcy5leGlzdHMoZmlsZVBhdGgsIHJlc29sdmUpO1xuICB9KTtcbn1cblxuLyoqXG4gKiBSdW5zIHRoZSBlcXVpdmFsZW50IG9mIGBta2RpciAtcGAgd2l0aCB0aGUgZ2l2ZW4gcGF0aC5cbiAqXG4gKiBMaWtlIG1vc3QgaW1wbGVtZW50YXRpb25zIG9mIG1rZGlycCwgaWYgaXQgZmFpbHMsIGl0IGlzIHBvc3NpYmxlIHRoYXRcbiAqIGRpcmVjdG9yaWVzIHdlcmUgY3JlYXRlZCBmb3Igc29tZSBwcmVmaXggb2YgdGhlIGdpdmVuIHBhdGguXG4gKiBAcmV0dXJuIHRydWUgaWYgdGhlIHBhdGggd2FzIGNyZWF0ZWQ7IGZhbHNlIGlmIGl0IGFscmVhZHkgZXhpc3RlZC5cbiAqL1xuYXN5bmMgZnVuY3Rpb24gbWtkaXJwKGZpbGVQYXRoOiBzdHJpbmcpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgY29uc3QgaXNFeGlzdGluZ0RpcmVjdG9yeSA9IGF3YWl0IGV4aXN0cyhmaWxlUGF0aCk7XG4gIGlmIChpc0V4aXN0aW5nRGlyZWN0b3J5KSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBta2RpcnBMaWIoZmlsZVBhdGgsIGVyciA9PiB7XG4gICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICByZWplY3QoZXJyKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXNvbHZlKHRydWUpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxufVxuXG4vKipcbiAqIFJlbW92ZXMgZGlyZWN0b3JpZXMgZXZlbiBpZiB0aGV5IGFyZSBub24tZW1wdHkuIERvZXMgbm90IGZhaWwgaWYgdGhlIGRpcmVjdG9yeSBkb2Vzbid0IGV4aXN0LlxuICovXG5hc3luYyBmdW5jdGlvbiBybWRpcihmaWxlUGF0aDogc3RyaW5nKTogUHJvbWlzZSB7XG4gIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgcmltcmFmKGZpbGVQYXRoLCBlcnIgPT4ge1xuICAgICAgaWYgKGVycikge1xuICAgICAgICByZWplY3QoZXJyKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJlc29sdmUoKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIGV4cGFuZEhvbWVEaXIoZmlsZVBhdGg6IHN0cmluZyk6IHN0cmluZyB7XG4gIGNvbnN0IHtIT01FfSA9IHByb2Nlc3MuZW52O1xuICBsZXQgcmVzb2x2ZWRQYXRoID0gbnVsbDtcbiAgaWYgKGZpbGVQYXRoID09PSAnficpIHtcbiAgICBpbnZhcmlhbnQoSE9NRSAhPSBudWxsKTtcbiAgICByZXNvbHZlZFBhdGggPSBIT01FO1xuICB9IGVsc2UgaWYgKGZpbGVQYXRoLnN0YXJ0c1dpdGgoYH4ke3BhdGguc2VwfWApKSB7XG4gICAgcmVzb2x2ZWRQYXRoID0gYCR7SE9NRX0ke2ZpbGVQYXRoLnN1YnN0cigxKX1gO1xuICB9IGVsc2Uge1xuICAgIHJlc29sdmVkUGF0aCA9IGZpbGVQYXRoO1xuICB9XG4gIHJldHVybiByZXNvbHZlZFBhdGg7XG59XG5cbi8qKiBAcmV0dXJuIHRydWUgb25seSBpZiB3ZSBhcmUgc3VyZSBkaXJlY3RvcnlQYXRoIGlzIG9uIE5GUy4gKi9cbmFzeW5jIGZ1bmN0aW9uIGlzTmZzKGVudGl0eVBhdGg6IHN0cmluZyk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICBpZiAocHJvY2Vzcy5wbGF0Zm9ybSA9PT0gJ2xpbnV4JyB8fCBwcm9jZXNzLnBsYXRmb3JtID09PSAnZGFyd2luJykge1xuICAgIGNvbnN0IHtzdGRvdXQsIGV4aXRDb2RlfSA9IGF3YWl0IGNoZWNrT3V0cHV0KCdzdGF0JywgWyctZicsICctTCcsICctYycsICclVCcsIGVudGl0eVBhdGhdKTtcbiAgICBpZiAoZXhpdENvZGUgPT09IDApIHtcbiAgICAgIHJldHVybiBzdGRvdXQudHJpbSgpID09PSAnbmZzJztcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICAvLyBUT0RPIEhhbmRsZSBvdGhlciBwbGF0Zm9ybXMgKHdpbmRvd3M/KTogdDk5MTc1NzYuXG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG59XG5cbi8qKlxuICogVGFrZXMgYSBtZXRob2QgZnJvbSBOb2RlJ3MgZnMgbW9kdWxlIGFuZCByZXR1cm5zIGEgXCJkZW5vZGVpZmllZFwiIGVxdWl2YWxlbnQsIGkuZS4sIGFuIGFkYXB0ZXJcbiAqIHdpdGggdGhlIHNhbWUgZnVuY3Rpb25hbGl0eSwgYnV0IHJldHVybnMgYSBQcm9taXNlIHJhdGhlciB0aGFuIHRha2luZyBhIGNhbGxiYWNrLiBUaGlzIGlzbid0XG4gKiBxdWl0ZSBhcyBlZmZpY2llbnQgYXMgUSdzIGltcGxlbWVudGF0aW9uIG9mIGRlbm9kZWlmeSwgYnV0IGl0J3MgY29uc2lkZXJhYmx5IGxlc3MgY29kZS5cbiAqL1xuZnVuY3Rpb24gZGVub2RlaWZ5RnNNZXRob2QobWV0aG9kTmFtZTogc3RyaW5nKTogKCkgPT4gUHJvbWlzZSB7XG4gIHJldHVybiBmdW5jdGlvbiguLi5hcmdzKTogUHJvbWlzZSB7XG4gICAgY29uc3QgbWV0aG9kID0gZnNbbWV0aG9kTmFtZV07XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIG1ldGhvZC5hcHBseShmcywgYXJncy5jb25jYXQoW1xuICAgICAgICAoZXJyLCByZXN1bHQpID0+IGVyciA/IHJlamVjdChlcnIpIDogcmVzb2x2ZShyZXN1bHQpLFxuICAgICAgXSkpO1xuICAgIH0pO1xuICB9O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgY29weTogZGVub2RlaWZ5RnNNZXRob2QoJ2NvcHknKSxcbiAgY2htb2Q6IGRlbm9kZWlmeUZzTWV0aG9kKCdjaG1vZCcpLFxuICBleGlzdHMsXG4gIGZpbmROZWFyZXN0RmlsZSxcbiAgaXNSb290LFxuICBpc05mcyxcbiAgbHN0YXQ6IGRlbm9kZWlmeUZzTWV0aG9kKCdsc3RhdCcpLFxuICBta2RpcjogZGVub2RlaWZ5RnNNZXRob2QoJ21rZGlyJyksXG4gIG1rZGlycCxcbiAgcmVhZGRpcjogZGVub2RlaWZ5RnNNZXRob2QoJ3JlYWRkaXInKSxcbiAgcmVhZEZpbGU6IGRlbm9kZWlmeUZzTWV0aG9kKCdyZWFkRmlsZScpLFxuICByZWFkbGluazogZGVub2RlaWZ5RnNNZXRob2QoJ3JlYWRsaW5rJyksXG4gIHJlYWxwYXRoOiBkZW5vZGVpZnlGc01ldGhvZCgncmVhbHBhdGgnKSxcbiAgcmVuYW1lOiBkZW5vZGVpZnlGc01ldGhvZCgncmVuYW1lJyksXG4gIHJtZGlyLFxuICBzdGF0OiBkZW5vZGVpZnlGc01ldGhvZCgnc3RhdCcpLFxuICBzeW1saW5rOiBkZW5vZGVpZnlGc01ldGhvZCgnc3ltbGluaycpLFxuICB0ZW1wZGlyLFxuICB0ZW1wZmlsZSxcbiAgdW5saW5rOiBkZW5vZGVpZnlGc01ldGhvZCgndW5saW5rJyksXG4gIHdyaXRlRmlsZTogZGVub2RlaWZ5RnNNZXRob2QoJ3dyaXRlRmlsZScpLFxuICBleHBhbmRIb21lRGlyLFxufTtcbiJdfQ==