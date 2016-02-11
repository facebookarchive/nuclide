

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

var _process = require('./process');

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
}function denodeifyFsMethod(methodName) {
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
//# sourceMappingURL=data:application/json;base64,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akMsUUFBTSxFQUFOLE1BQU07QUFDTixpQkFBZSxFQUFmLGVBQWU7QUFDZixRQUFNLEVBQU4sTUFBTTtBQUNOLE9BQUssRUFBTCxLQUFLO0FBQ0wsT0FBSyxFQUFFLGlCQUFpQixDQUFDLE9BQU8sQ0FBQztBQUNqQyxPQUFLLEVBQUUsaUJBQWlCLENBQUMsT0FBTyxDQUFDO0FBQ2pDLFFBQU0sRUFBTixNQUFNO0FBQ04sU0FBTyxFQUFFLGlCQUFpQixDQUFDLFNBQVMsQ0FBQztBQUNyQyxVQUFRLEVBQUUsaUJBQWlCLENBQUMsVUFBVSxDQUFDO0FBQ3ZDLFVBQVEsRUFBRSxpQkFBaUIsQ0FBQyxVQUFVLENBQUM7QUFDdkMsVUFBUSxFQUFFLGlCQUFpQixDQUFDLFVBQVUsQ0FBQztBQUN2QyxRQUFNLEVBQUUsaUJBQWlCLENBQUMsUUFBUSxDQUFDO0FBQ25DLE9BQUssRUFBTCxLQUFLO0FBQ0wsTUFBSSxFQUFFLGlCQUFpQixDQUFDLE1BQU0sQ0FBQztBQUMvQixTQUFPLEVBQUUsaUJBQWlCLENBQUMsU0FBUyxDQUFDO0FBQ3JDLFNBQU8sRUFBUCxPQUFPO0FBQ1AsVUFBUSxFQUFSLFFBQVE7QUFDUixRQUFNLEVBQUUsaUJBQWlCLENBQUMsUUFBUSxDQUFDO0FBQ25DLFdBQVMsRUFBRSxpQkFBaUIsQ0FBQyxXQUFXLENBQUM7QUFDekMsZUFBYSxFQUFiLGFBQWE7Q0FDZCxDQUFDIiwiZmlsZSI6ImZpbGVzeXN0ZW0uanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5jb25zdCBmcyA9IHJlcXVpcmUoJ2ZzJyk7XG5jb25zdCBwYXRoID0gcmVxdWlyZSgncGF0aCcpO1xuY29uc3QgbWtkaXJwTGliID0gcmVxdWlyZSgnbWtkaXJwJyk7XG5jb25zdCByaW1yYWYgPSByZXF1aXJlKCdyaW1yYWYnKTtcblxuaW1wb3J0IHtjaGVja091dHB1dH0gZnJvbSAnLi9wcm9jZXNzJztcbmltcG9ydCBpbnZhcmlhbnQgZnJvbSAnYXNzZXJ0JztcblxuZnVuY3Rpb24gaXNSb290KGZpbGVQYXRoOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgcmV0dXJuIHBhdGguZGlybmFtZShmaWxlUGF0aCkgPT09IGZpbGVQYXRoO1xufVxuXG4vKipcbiAqIENyZWF0ZSBhIHRlbXAgZGlyZWN0b3J5IHdpdGggZ2l2ZW4gcHJlZml4LiBUaGUgY2FsbGVyIGlzIHJlc3BvbnNpYmxlIGZvciBjbGVhbmluZyB1cCB0aGVcbiAqICAgZHJlY3RvcnkuXG4gKiBAcGFyYW0gcHJlZml4IG9wdGluYWwgcHJlZml4IGZvciB0aGUgdGVtcCBkaXJlY3RvcnkgbmFtZS5cbiAqIEByZXR1cm4gcGF0aCB0byBhIHRlbXBvcmFyeSBkaXJlY3RvcnkuXG4gKi9cbmZ1bmN0aW9uIHRlbXBkaXIocHJlZml4OiBzdHJpbmcgPSAnJyk6IFByb21pc2U8c3RyaW5nPiB7XG4gIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgcmVxdWlyZSgndGVtcCcpLm1rZGlyKHByZWZpeCwgKGVyciwgZGlyUGF0aCkgPT4ge1xuICAgICAgaWYgKGVycikge1xuICAgICAgICByZWplY3QoZXJyKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJlc29sdmUoZGlyUGF0aCk7XG4gICAgICB9XG4gICAgfSk7XG4gIH0pO1xufVxuXG4vKipcbiAqIEByZXR1cm4gcGF0aCB0byBhIHRlbXBvcmFyeSBmaWxlLiBUaGUgY2FsbGVyIGlzIHJlc3BvbnNpYmxlIGZvciBjbGVhbmluZyB1cFxuICogICAgIHRoZSBmaWxlLlxuICovXG5mdW5jdGlvbiB0ZW1wZmlsZShvcHRpb25zOiBhbnkpOiBQcm9taXNlPHN0cmluZz4ge1xuICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgIHJlcXVpcmUoJ3RlbXAnKS5vcGVuKG9wdGlvbnMsIChlcnIsIGluZm8pID0+IHtcbiAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgcmVqZWN0KGVycik7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBmcy5jbG9zZShpbmZvLmZkLCBjbG9zZUVyciA9PiB7XG4gICAgICAgICAgaWYgKGNsb3NlRXJyKSB7XG4gICAgICAgICAgICByZWplY3QoY2xvc2VFcnIpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXNvbHZlKGluZm8ucGF0aCk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfSk7XG59XG5cbi8qKlxuICogU2VhcmNoZXMgdXB3YXJkcyB0aHJvdWdoIHRoZSBmaWxlc3lzdGVtIGZyb20gcGF0aFRvRmlsZSB0byBmaW5kIGEgZmlsZSB3aXRoXG4gKiAgIGZpbGVOYW1lLlxuICogQHBhcmFtIGZpbGVOYW1lIFRoZSBuYW1lIG9mIHRoZSBmaWxlIHRvIGZpbmQuXG4gKiBAcGFyYW0gcGF0aFRvRGlyZWN0b3J5IFdoZXJlIHRvIGJlZ2luIHRoZSBzZWFyY2guIE11c3QgYmUgYSBwYXRoIHRvIGEgZGlyZWN0b3J5LCBub3QgYVxuICogICBmaWxlLlxuICogQHJldHVybiBkaXJlY3RvcnkgdGhhdCBjb250YWlucyB0aGUgbmVhcmVzdCBmaWxlIG9yIG51bGwuXG4gKi9cbmFzeW5jIGZ1bmN0aW9uIGZpbmROZWFyZXN0RmlsZShmaWxlTmFtZTogc3RyaW5nLCBwYXRoVG9EaXJlY3Rvcnk6IHN0cmluZyk6IFByb21pc2U8P3N0cmluZz4ge1xuICAvLyBUT0RPKDU1ODYzNTUpOiBJZiB0aGlzIGJlY29tZXMgYSBib3R0bGVuZWNrLCB3ZSBzaG91bGQgY29uc2lkZXIgbWVtb2l6aW5nXG4gIC8vIHRoaXMgZnVuY3Rpb24uIFRoZSBkb3duc2lkZSB3b3VsZCBiZSB0aGF0IGlmIHNvbWVvbmUgYWRkZWQgYSBjbG9zZXIgZmlsZVxuICAvLyB3aXRoIGZpbGVOYW1lIHRvIHBhdGhUb0ZpbGUgKG9yIGRlbGV0ZWQgdGhlIG9uZSB0aGF0IHdhcyBjYWNoZWQpLCB0aGVuIHdlXG4gIC8vIHdvdWxkIGhhdmUgYSBidWcuIFRoaXMgd291bGQgcHJvYmFibHkgYmUgcHJldHR5IHJhcmUsIHRob3VnaC5cbiAgbGV0IGN1cnJlbnRQYXRoID0gcGF0aC5yZXNvbHZlKHBhdGhUb0RpcmVjdG9yeSk7XG4gIGRvIHsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby1jb25zdGFudC1jb25kaXRpb25cbiAgICBjb25zdCBmaWxlVG9GaW5kID0gcGF0aC5qb2luKGN1cnJlbnRQYXRoLCBmaWxlTmFtZSk7XG4gICAgY29uc3QgaGFzRmlsZSA9IGF3YWl0IGV4aXN0cyhmaWxlVG9GaW5kKTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBiYWJlbC9uby1hd2FpdC1pbi1sb29wXG4gICAgaWYgKGhhc0ZpbGUpIHtcbiAgICAgIHJldHVybiBjdXJyZW50UGF0aDtcbiAgICB9XG5cbiAgICBpZiAoaXNSb290KGN1cnJlbnRQYXRoKSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGN1cnJlbnRQYXRoID0gcGF0aC5kaXJuYW1lKGN1cnJlbnRQYXRoKTtcbiAgfSB3aGlsZSAodHJ1ZSk7XG59XG5cbmZ1bmN0aW9uIGV4aXN0cyhmaWxlUGF0aDogc3RyaW5nKTogUHJvbWlzZTxib29sZWFuPiB7XG4gIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgZnMuZXhpc3RzKGZpbGVQYXRoLCByZXNvbHZlKTtcbiAgfSk7XG59XG5cbi8qKlxuICogUnVucyB0aGUgZXF1aXZhbGVudCBvZiBgbWtkaXIgLXBgIHdpdGggdGhlIGdpdmVuIHBhdGguXG4gKlxuICogTGlrZSBtb3N0IGltcGxlbWVudGF0aW9ucyBvZiBta2RpcnAsIGlmIGl0IGZhaWxzLCBpdCBpcyBwb3NzaWJsZSB0aGF0XG4gKiBkaXJlY3RvcmllcyB3ZXJlIGNyZWF0ZWQgZm9yIHNvbWUgcHJlZml4IG9mIHRoZSBnaXZlbiBwYXRoLlxuICogQHJldHVybiB0cnVlIGlmIHRoZSBwYXRoIHdhcyBjcmVhdGVkOyBmYWxzZSBpZiBpdCBhbHJlYWR5IGV4aXN0ZWQuXG4gKi9cbmFzeW5jIGZ1bmN0aW9uIG1rZGlycChmaWxlUGF0aDogc3RyaW5nKTogUHJvbWlzZTxib29sZWFuPiB7XG4gIGNvbnN0IGlzRXhpc3RpbmdEaXJlY3RvcnkgPSBhd2FpdCBleGlzdHMoZmlsZVBhdGgpO1xuICBpZiAoaXNFeGlzdGluZ0RpcmVjdG9yeSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgbWtkaXJwTGliKGZpbGVQYXRoLCBlcnIgPT4ge1xuICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgcmVqZWN0KGVycik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmVzb2x2ZSh0cnVlKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cbn1cblxuLyoqXG4gKiBSZW1vdmVzIGRpcmVjdG9yaWVzIGV2ZW4gaWYgdGhleSBhcmUgbm9uLWVtcHR5LiBEb2VzIG5vdCBmYWlsIGlmIHRoZSBkaXJlY3RvcnkgZG9lc24ndCBleGlzdC5cbiAqL1xuYXN5bmMgZnVuY3Rpb24gcm1kaXIoZmlsZVBhdGg6IHN0cmluZyk6IFByb21pc2Uge1xuICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgIHJpbXJhZihmaWxlUGF0aCwgZXJyID0+IHtcbiAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgcmVqZWN0KGVycik7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXNvbHZlKCk7XG4gICAgICB9XG4gICAgfSk7XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBleHBhbmRIb21lRGlyKGZpbGVQYXRoOiBzdHJpbmcpOiBzdHJpbmcge1xuICBjb25zdCB7SE9NRX0gPSBwcm9jZXNzLmVudjtcbiAgbGV0IHJlc29sdmVkUGF0aCA9IG51bGw7XG4gIGlmIChmaWxlUGF0aCA9PT0gJ34nKSB7XG4gICAgaW52YXJpYW50KEhPTUUgIT0gbnVsbCk7XG4gICAgcmVzb2x2ZWRQYXRoID0gSE9NRTtcbiAgfSBlbHNlIGlmIChmaWxlUGF0aC5zdGFydHNXaXRoKGB+JHtwYXRoLnNlcH1gKSkge1xuICAgIHJlc29sdmVkUGF0aCA9IGAke0hPTUV9JHtmaWxlUGF0aC5zdWJzdHIoMSl9YDtcbiAgfSBlbHNlIHtcbiAgICByZXNvbHZlZFBhdGggPSBmaWxlUGF0aDtcbiAgfVxuICByZXR1cm4gcmVzb2x2ZWRQYXRoO1xufVxuXG4vKiogQHJldHVybiB0cnVlIG9ubHkgaWYgd2UgYXJlIHN1cmUgZGlyZWN0b3J5UGF0aCBpcyBvbiBORlMuICovXG5hc3luYyBmdW5jdGlvbiBpc05mcyhlbnRpdHlQYXRoOiBzdHJpbmcpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgaWYgKHByb2Nlc3MucGxhdGZvcm0gPT09ICdsaW51eCcgfHwgcHJvY2Vzcy5wbGF0Zm9ybSA9PT0gJ2RhcndpbicpIHtcbiAgICBjb25zdCB7c3Rkb3V0LCBleGl0Q29kZX0gPSBhd2FpdCBjaGVja091dHB1dCgnc3RhdCcsIFsnLWYnLCAnLUwnLCAnLWMnLCAnJVQnLCBlbnRpdHlQYXRoXSk7XG4gICAgaWYgKGV4aXRDb2RlID09PSAwKSB7XG4gICAgICByZXR1cm4gc3Rkb3V0LnRyaW0oKSA9PT0gJ25mcyc7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgLy8gVE9ETyBIYW5kbGUgb3RoZXIgcGxhdGZvcm1zICh3aW5kb3dzPyk6IHQ5OTE3NTc2LlxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxufVxuXG4vKipcbiAqIFRha2VzIGEgbWV0aG9kIGZyb20gTm9kZSdzIGZzIG1vZHVsZSBhbmQgcmV0dXJucyBhIFwiZGVub2RlaWZpZWRcIiBlcXVpdmFsZW50LCBpLmUuLCBhbiBhZGFwdGVyXG4gKiB3aXRoIHRoZSBzYW1lIGZ1bmN0aW9uYWxpdHksIGJ1dCByZXR1cm5zIGEgUHJvbWlzZSByYXRoZXIgdGhhbiB0YWtpbmcgYSBjYWxsYmFjay4gVGhpcyBpc24ndFxuICogcXVpdGUgYXMgZWZmaWNpZW50IGFzIFEncyBpbXBsZW1lbnRhdGlvbiBvZiBkZW5vZGVpZnksIGJ1dCBpdCdzIGNvbnNpZGVyYWJseSBsZXNzIGNvZGUuXG4gKi9cbmZ1bmN0aW9uIGRlbm9kZWlmeUZzTWV0aG9kKG1ldGhvZE5hbWU6IHN0cmluZyk6ICgpID0+IFByb21pc2Uge1xuICByZXR1cm4gZnVuY3Rpb24oLi4uYXJncyk6IFByb21pc2Uge1xuICAgIGNvbnN0IG1ldGhvZCA9IGZzW21ldGhvZE5hbWVdO1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBtZXRob2QuYXBwbHkoZnMsIGFyZ3MuY29uY2F0KFtcbiAgICAgICAgKGVyciwgcmVzdWx0KSA9PiBlcnIgPyByZWplY3QoZXJyKSA6IHJlc29sdmUocmVzdWx0KSxcbiAgICAgIF0pKTtcbiAgICB9KTtcbiAgfTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGNobW9kOiBkZW5vZGVpZnlGc01ldGhvZCgnY2htb2QnKSxcbiAgZXhpc3RzLFxuICBmaW5kTmVhcmVzdEZpbGUsXG4gIGlzUm9vdCxcbiAgaXNOZnMsXG4gIGxzdGF0OiBkZW5vZGVpZnlGc01ldGhvZCgnbHN0YXQnKSxcbiAgbWtkaXI6IGRlbm9kZWlmeUZzTWV0aG9kKCdta2RpcicpLFxuICBta2RpcnAsXG4gIHJlYWRkaXI6IGRlbm9kZWlmeUZzTWV0aG9kKCdyZWFkZGlyJyksXG4gIHJlYWRGaWxlOiBkZW5vZGVpZnlGc01ldGhvZCgncmVhZEZpbGUnKSxcbiAgcmVhZGxpbms6IGRlbm9kZWlmeUZzTWV0aG9kKCdyZWFkbGluaycpLFxuICByZWFscGF0aDogZGVub2RlaWZ5RnNNZXRob2QoJ3JlYWxwYXRoJyksXG4gIHJlbmFtZTogZGVub2RlaWZ5RnNNZXRob2QoJ3JlbmFtZScpLFxuICBybWRpcixcbiAgc3RhdDogZGVub2RlaWZ5RnNNZXRob2QoJ3N0YXQnKSxcbiAgc3ltbGluazogZGVub2RlaWZ5RnNNZXRob2QoJ3N5bWxpbmsnKSxcbiAgdGVtcGRpcixcbiAgdGVtcGZpbGUsXG4gIHVubGluazogZGVub2RlaWZ5RnNNZXRob2QoJ3VubGluaycpLFxuICB3cml0ZUZpbGU6IGRlbm9kZWlmeUZzTWV0aG9kKCd3cml0ZUZpbGUnKSxcbiAgZXhwYW5kSG9tZURpcixcbn07XG4iXX0=