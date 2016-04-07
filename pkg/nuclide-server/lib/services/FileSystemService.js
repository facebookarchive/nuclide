Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.exists = exists;
exports.findNearestFile = findNearestFile;
exports.lstat = lstat;
exports.mkdir = mkdir;
exports.mkdirp = mkdirp;
exports.chmod = chmod;

/**
 * If no file (or directory) at the specified path exists, creates the parent
 * directories (if necessary) and then writes an empty file at the specified
 * path.
 *
 * @return A boolean indicating whether the file was created.
 */

var newFile = _asyncToGenerator(function* (filePath) {
  var isExistingFile = yield fsPromise.exists(filePath);
  if (isExistingFile) {
    return false;
  }
  yield fsPromise.mkdirp(pathModule.dirname(filePath));
  yield fsPromise.writeFile(filePath, '');
  return true;
}

/**
 * The readdir endpoint accepts the following query parameters:
 *
 *   path: path to the folder to list entries inside.
 *
 * Body contains a JSON encoded array of objects with file: and stats: entries.
 * file: has the file or directory name, stats: has the stats of the file/dir,
 * isSymbolicLink: true if the entry is a symlink to another filesystem location.
 */
);

exports.newFile = newFile;

var readdir = _asyncToGenerator(function* (path) {
  var files = yield fsPromise.readdir(path);
  var entries = yield Promise.all(files.map(_asyncToGenerator(function* (file) {
    var fullpath = pathModule.join(path, file);
    var lstats = yield fsPromise.lstat(fullpath);
    if (!lstats.isSymbolicLink()) {
      return { file: file, stats: lstats, isSymbolicLink: false };
    } else {
      try {
        var stats = yield fsPromise.stat(fullpath);
        return { file: file, stats: stats, isSymbolicLink: true };
      } catch (error) {
        return { file: file, stats: undefined, isSymbolicLink: true, error: error };
      }
    }
  })));
  // TODO: Return entries directly and change client to handle error.
  return entries.filter(function (entry) {
    return entry.error === undefined;
  }).map(function (entry) {
    return { file: entry.file, stats: entry.stats, isSymbolicLink: entry.isSymbolicLink };
  });
}

/**
 * Gets the real path of a file path.
 * It could be different than the given path if the file is a symlink
 * or exists in a symlinked directory.
 */
);

exports.readdir = readdir;
exports.realpath = realpath;
exports.resolveRealPath = resolveRealPath;
exports.rename = rename;

/**
 * Runs the equivalent of `cp sourcePath destinationPath`.
 */

var copy = _asyncToGenerator(function* (sourcePath, destinationPath) {
  var isExistingFile = yield fsPromise.exists(destinationPath);
  if (isExistingFile) {
    return false;
  }
  yield new Promise(function (resolve, reject) {
    var fsPlus = require('fs-plus');
    fsPlus.copy(sourcePath, destinationPath, function (error) {
      error ? reject(error) : resolve();
    });
  });
  yield copyFilePermissions(sourcePath, destinationPath);
  return true;
}

/**
 * Removes directories even if they are non-empty. Does not fail if the directory doesn't exist.
 */
);

exports.copy = copy;
exports.rmdir = rmdir;
exports.stat = stat;
exports.unlink = unlink;

/**
 *   path: the path to the file to read
 *   options: options to pass to fs.readFile.
 *      Note that options does NOT include 'encoding' this ensures that the return value
 *      is always a Buffer and never a string.
 *
 *   Callers who want a string should call buffer.toString('utf8').
 */

var readFile = _asyncToGenerator(function* (path, options) {
  var stats = yield fsPromise.stat(path);
  if (stats.size > READFILE_SIZE_LIMIT) {
    throw new Error('File is too large (' + stats.size + ' bytes)');
  }
  return fsPromise.readFile(path, options);
}

/**
 * Returns true if the path being checked exists in a `NFS` mounted directory device.
 */
);

exports.readFile = readFile;
exports.isNfs = isNfs;

var copyFilePermissions = _asyncToGenerator(function* (sourcePath, destinationPath) {
  var permissions = null;
  try {
    permissions = (yield fsPromise.stat(sourcePath)).mode;
  } catch (e) {
    // If the file does not exist, then ENOENT will be thrown.
    if (e.code !== 'ENOENT') {
      throw e;
    }
  }
  if (permissions != null) {
    yield fsPromise.chmod(destinationPath, permissions);
  }
}

/**
 * The writeFile endpoint accepts the following query parameters:
 *
 *   path: path to the file to read (it must be url encoded).
 *   options: options to pass to fs.writeFile
 *
 * TODO: move to nuclide-commons and rename to writeFileAtomic
 */
);

var writeFile = _asyncToGenerator(function* (path, data, options) {

  var complete = false;
  var tempFilePath = yield fsPromise.tempfile('nuclide');
  try {
    yield fsPromise.writeFile(tempFilePath, data, options);

    // Ensure file still has original permissions:
    // https://github.com/facebook/nuclide/issues/157
    // We update the mode of the temp file rather than the destination file because
    // if we did the mv() then the chmod(), there would be a brief period between
    // those two operations where the destination file might have the wrong permissions.
    yield copyFilePermissions(path, tempFilePath);

    // TODO(mikeo): put renames into a queue so we don't write older save over new save.
    // Use mv as fs.rename doesn't work across partitions.
    yield mvPromise(tempFilePath, path);
    complete = true;
  } finally {
    if (!complete) {
      yield fsPromise.unlink(tempFilePath);
    }
  }
});

exports.writeFile = writeFile;

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

/**
 * This code implements the NuclideFs service.  It exports the FS on http via
 * the endpoint: http://your.server:your_port/fs/method where method is one of
 * readFile, writeFile, etc.
 */

// Attempting to read large files just crashes node, so just fail.
// Atom can't handle files of this scale anyway.
var mv = require('mv');
var fs = require('fs');
var pathModule = require('path');

var _require = require('../../../nuclide-commons');

var fsPromise = _require.fsPromise;
var READFILE_SIZE_LIMIT = 10 * 1024 * 1024;

///////////////////
//
// Services
//
//////////////////

/**
 * Checks a certain path for existence and returns 'true'/'false' accordingly
 */

function exists(path) {
  return fsPromise.exists(path);
}

function findNearestFile(fileName, pathToDirectory) {
  return fsPromise.findNearestFile(fileName, pathToDirectory);
}

/**
 * The lstat endpoint is the same as the stat endpoint except it will return
 * the stat of a link instead of the file the link points to.
 */

function lstat(path) {
  return fsPromise.lstat(path);
}

/**
 * Creates a new directory with the given path.
 * Throws EEXIST error if the directory already exists.
 * Throws ENOENT if the path given is nested in a non-existing directory.
 */

function mkdir(path) {
  return fsPromise.mkdir(path);
}

/**
 * Runs the equivalent of `mkdir -p` with the given path.
 *
 * Like most implementations of mkdirp, if it fails, it is possible that
 * directories were created for some prefix of the given path.
 * @return true if the path was created; false if it already existed.
 */

function mkdirp(path) {
  return fsPromise.mkdirp(path);
}

function chmod(path, mode) {
  return fsPromise.chmod(path, mode);
}

function realpath(path) {
  return fsPromise.realpath(path);
}

function resolveRealPath(path) {
  return fsPromise.realpath(fsPromise.expandHomeDir(path));
}

/**
 * Runs the equivalent of `mv sourcePath destinationPath`.
 */

function rename(sourcePath, destinationPath) {
  return new Promise(function (resolve, reject) {
    var fsPlus = require('fs-plus');
    fsPlus.move(sourcePath, destinationPath, function (error) {
      error ? reject(error) : resolve();
    });
  });
}

function rmdir(path) {
  return fsPromise.rmdir(path);
}

/**
 * The stat endpoint accepts the following query parameters:
 *
 *   path: path to the file to read
 *
 */

function stat(path) {
  return fsPromise.stat(path);
}

/**
 * Removes files. Does not fail if the file doesn't exist.
 */

function unlink(path) {
  return fsPromise.unlink(path)['catch'](function (error) {
    if (error.code !== 'ENOENT') {
      throw error;
    }
  });
}

function isNfs(path) {
  return fsPromise.isNfs(path);
}

// TODO: Move to nuclide-commons
function mvPromise(sourcePath, destinationPath) {
  return new Promise(function (resolve, reject) {
    mv(sourcePath, destinationPath, { mkdirp: false }, function (error) {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });
}
//# sourceMappingURL=data:application/json;base64,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QztDQUM3Qjs7Ozs7O0FBS00sU0FBUyxNQUFNLENBQUMsSUFBWSxFQUFXO0FBQzVDLFNBQU8sU0FBUyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsU0FBTSxDQUFDLFVBQUEsS0FBSyxFQUFJO0FBQzNDLFFBQUksS0FBSyxDQUFDLElBQUksS0FBSyxRQUFRLEVBQUU7QUFDM0IsWUFBTSxLQUFLLENBQUM7S0FDYjtHQUNGLENBQUMsQ0FBQztDQUNKOztBQXNCTSxTQUFTLEtBQUssQ0FBQyxJQUFZLEVBQW9CO0FBQ3BELFNBQU8sU0FBUyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztDQUM5Qjs7O0FBR0QsU0FBUyxTQUFTLENBQUMsVUFBa0IsRUFBRSxlQUF1QixFQUFpQjtBQUM3RSxTQUFPLElBQUksT0FBTyxDQUFDLFVBQUMsT0FBTyxFQUFFLE1BQU0sRUFBSztBQUN0QyxNQUFFLENBQUMsVUFBVSxFQUFFLGVBQWUsRUFBRSxFQUFDLE1BQU0sRUFBRSxLQUFLLEVBQUMsRUFBRSxVQUFBLEtBQUssRUFBSTtBQUN4RCxVQUFJLEtBQUssRUFBRTtBQUNULGNBQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQztPQUNmLE1BQU07QUFDTCxlQUFPLEVBQUUsQ0FBQztPQUNYO0tBQ0YsQ0FBQyxDQUFDO0dBQ0osQ0FBQyxDQUFDO0NBQ0oiLCJmaWxlIjoiRmlsZVN5c3RlbVNlcnZpY2UuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG4vKipcbiAqIFRoaXMgY29kZSBpbXBsZW1lbnRzIHRoZSBOdWNsaWRlRnMgc2VydmljZS4gIEl0IGV4cG9ydHMgdGhlIEZTIG9uIGh0dHAgdmlhXG4gKiB0aGUgZW5kcG9pbnQ6IGh0dHA6Ly95b3VyLnNlcnZlcjp5b3VyX3BvcnQvZnMvbWV0aG9kIHdoZXJlIG1ldGhvZCBpcyBvbmUgb2ZcbiAqIHJlYWRGaWxlLCB3cml0ZUZpbGUsIGV0Yy5cbiAqL1xuXG5jb25zdCBtdiA9IHJlcXVpcmUoJ212Jyk7XG5jb25zdCBmcyA9IHJlcXVpcmUoJ2ZzJyk7XG5jb25zdCBwYXRoTW9kdWxlID0gcmVxdWlyZSgncGF0aCcpO1xuY29uc3Qge2ZzUHJvbWlzZX0gPSByZXF1aXJlKCcuLi8uLi8uLi9udWNsaWRlLWNvbW1vbnMnKTtcblxuaW1wb3J0IHR5cGUge0ZpbGVXaXRoU3RhdHN9IGZyb20gJy4vRmlsZVN5c3RlbVNlcnZpY2VUeXBlJztcblxuLy8gQXR0ZW1wdGluZyB0byByZWFkIGxhcmdlIGZpbGVzIGp1c3QgY3Jhc2hlcyBub2RlLCBzbyBqdXN0IGZhaWwuXG4vLyBBdG9tIGNhbid0IGhhbmRsZSBmaWxlcyBvZiB0aGlzIHNjYWxlIGFueXdheS5cbmNvbnN0IFJFQURGSUxFX1NJWkVfTElNSVQgPSAxMCAqIDEwMjQgKiAxMDI0O1xuXG4vLy8vLy8vLy8vLy8vLy8vLy8vXG4vL1xuLy8gU2VydmljZXNcbi8vXG4vLy8vLy8vLy8vLy8vLy8vLy9cblxuLyoqXG4gKiBDaGVja3MgYSBjZXJ0YWluIHBhdGggZm9yIGV4aXN0ZW5jZSBhbmQgcmV0dXJucyAndHJ1ZScvJ2ZhbHNlJyBhY2NvcmRpbmdseVxuICovXG5leHBvcnQgZnVuY3Rpb24gZXhpc3RzKHBhdGg6IHN0cmluZyk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICByZXR1cm4gZnNQcm9taXNlLmV4aXN0cyhwYXRoKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGZpbmROZWFyZXN0RmlsZShmaWxlTmFtZTogc3RyaW5nLCBwYXRoVG9EaXJlY3Rvcnk6IHN0cmluZyk6IFByb21pc2U8P3N0cmluZz4ge1xuICByZXR1cm4gZnNQcm9taXNlLmZpbmROZWFyZXN0RmlsZShmaWxlTmFtZSwgcGF0aFRvRGlyZWN0b3J5KTtcbn1cblxuLyoqXG4gKiBUaGUgbHN0YXQgZW5kcG9pbnQgaXMgdGhlIHNhbWUgYXMgdGhlIHN0YXQgZW5kcG9pbnQgZXhjZXB0IGl0IHdpbGwgcmV0dXJuXG4gKiB0aGUgc3RhdCBvZiBhIGxpbmsgaW5zdGVhZCBvZiB0aGUgZmlsZSB0aGUgbGluayBwb2ludHMgdG8uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBsc3RhdChwYXRoOiBzdHJpbmcpOiBQcm9taXNlPGZzLlN0YXRzPiB7XG4gIHJldHVybiBmc1Byb21pc2UubHN0YXQocGF0aCk7XG59XG5cbi8qKlxuICogQ3JlYXRlcyBhIG5ldyBkaXJlY3Rvcnkgd2l0aCB0aGUgZ2l2ZW4gcGF0aC5cbiAqIFRocm93cyBFRVhJU1QgZXJyb3IgaWYgdGhlIGRpcmVjdG9yeSBhbHJlYWR5IGV4aXN0cy5cbiAqIFRocm93cyBFTk9FTlQgaWYgdGhlIHBhdGggZ2l2ZW4gaXMgbmVzdGVkIGluIGEgbm9uLWV4aXN0aW5nIGRpcmVjdG9yeS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG1rZGlyKHBhdGg6IHN0cmluZyk6IFByb21pc2U8dm9pZD4ge1xuICByZXR1cm4gZnNQcm9taXNlLm1rZGlyKHBhdGgpO1xufVxuXG4vKipcbiAqIFJ1bnMgdGhlIGVxdWl2YWxlbnQgb2YgYG1rZGlyIC1wYCB3aXRoIHRoZSBnaXZlbiBwYXRoLlxuICpcbiAqIExpa2UgbW9zdCBpbXBsZW1lbnRhdGlvbnMgb2YgbWtkaXJwLCBpZiBpdCBmYWlscywgaXQgaXMgcG9zc2libGUgdGhhdFxuICogZGlyZWN0b3JpZXMgd2VyZSBjcmVhdGVkIGZvciBzb21lIHByZWZpeCBvZiB0aGUgZ2l2ZW4gcGF0aC5cbiAqIEByZXR1cm4gdHJ1ZSBpZiB0aGUgcGF0aCB3YXMgY3JlYXRlZDsgZmFsc2UgaWYgaXQgYWxyZWFkeSBleGlzdGVkLlxuICovXG5leHBvcnQgZnVuY3Rpb24gbWtkaXJwKHBhdGg6IHN0cmluZyk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICByZXR1cm4gZnNQcm9taXNlLm1rZGlycChwYXRoKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNobW9kKHBhdGg6IHN0cmluZywgbW9kZTogbnVtYmVyKTogUHJvbWlzZTx2b2lkPiB7XG4gIHJldHVybiBmc1Byb21pc2UuY2htb2QocGF0aCwgbW9kZSk7XG59XG5cbi8qKlxuICogSWYgbm8gZmlsZSAob3IgZGlyZWN0b3J5KSBhdCB0aGUgc3BlY2lmaWVkIHBhdGggZXhpc3RzLCBjcmVhdGVzIHRoZSBwYXJlbnRcbiAqIGRpcmVjdG9yaWVzIChpZiBuZWNlc3NhcnkpIGFuZCB0aGVuIHdyaXRlcyBhbiBlbXB0eSBmaWxlIGF0IHRoZSBzcGVjaWZpZWRcbiAqIHBhdGguXG4gKlxuICogQHJldHVybiBBIGJvb2xlYW4gaW5kaWNhdGluZyB3aGV0aGVyIHRoZSBmaWxlIHdhcyBjcmVhdGVkLlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gbmV3RmlsZShmaWxlUGF0aDogc3RyaW5nKTogUHJvbWlzZTxib29sZWFuPiB7XG4gIGNvbnN0IGlzRXhpc3RpbmdGaWxlID0gYXdhaXQgZnNQcm9taXNlLmV4aXN0cyhmaWxlUGF0aCk7XG4gIGlmIChpc0V4aXN0aW5nRmlsZSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICBhd2FpdCBmc1Byb21pc2UubWtkaXJwKHBhdGhNb2R1bGUuZGlybmFtZShmaWxlUGF0aCkpO1xuICBhd2FpdCBmc1Byb21pc2Uud3JpdGVGaWxlKGZpbGVQYXRoLCAnJyk7XG4gIHJldHVybiB0cnVlO1xufVxuXG4vKipcbiAqIFRoZSByZWFkZGlyIGVuZHBvaW50IGFjY2VwdHMgdGhlIGZvbGxvd2luZyBxdWVyeSBwYXJhbWV0ZXJzOlxuICpcbiAqICAgcGF0aDogcGF0aCB0byB0aGUgZm9sZGVyIHRvIGxpc3QgZW50cmllcyBpbnNpZGUuXG4gKlxuICogQm9keSBjb250YWlucyBhIEpTT04gZW5jb2RlZCBhcnJheSBvZiBvYmplY3RzIHdpdGggZmlsZTogYW5kIHN0YXRzOiBlbnRyaWVzLlxuICogZmlsZTogaGFzIHRoZSBmaWxlIG9yIGRpcmVjdG9yeSBuYW1lLCBzdGF0czogaGFzIHRoZSBzdGF0cyBvZiB0aGUgZmlsZS9kaXIsXG4gKiBpc1N5bWJvbGljTGluazogdHJ1ZSBpZiB0aGUgZW50cnkgaXMgYSBzeW1saW5rIHRvIGFub3RoZXIgZmlsZXN5c3RlbSBsb2NhdGlvbi5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHJlYWRkaXIocGF0aDogc3RyaW5nKTogUHJvbWlzZTxBcnJheTxGaWxlV2l0aFN0YXRzPj4ge1xuICBjb25zdCBmaWxlcyA9IGF3YWl0IGZzUHJvbWlzZS5yZWFkZGlyKHBhdGgpO1xuICBjb25zdCBlbnRyaWVzID0gYXdhaXQgUHJvbWlzZS5hbGwoZmlsZXMubWFwKGFzeW5jIGZpbGUgPT4ge1xuICAgIGNvbnN0IGZ1bGxwYXRoID0gcGF0aE1vZHVsZS5qb2luKHBhdGgsIGZpbGUpO1xuICAgIGNvbnN0IGxzdGF0cyA9IGF3YWl0IGZzUHJvbWlzZS5sc3RhdChmdWxscGF0aCk7XG4gICAgaWYgKCFsc3RhdHMuaXNTeW1ib2xpY0xpbmsoKSkge1xuICAgICAgcmV0dXJuIHtmaWxlLCBzdGF0czogbHN0YXRzLCBpc1N5bWJvbGljTGluazogZmFsc2V9O1xuICAgIH0gZWxzZSB7XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCBzdGF0cyA9IGF3YWl0IGZzUHJvbWlzZS5zdGF0KGZ1bGxwYXRoKTtcbiAgICAgICAgcmV0dXJuIHtmaWxlLCBzdGF0cywgaXNTeW1ib2xpY0xpbms6IHRydWV9O1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgcmV0dXJuIHtmaWxlLCBzdGF0czogdW5kZWZpbmVkLCBpc1N5bWJvbGljTGluazogdHJ1ZSwgZXJyb3J9O1xuICAgICAgfVxuICAgIH1cbiAgfSkpO1xuICAvLyBUT0RPOiBSZXR1cm4gZW50cmllcyBkaXJlY3RseSBhbmQgY2hhbmdlIGNsaWVudCB0byBoYW5kbGUgZXJyb3IuXG4gIHJldHVybiBlbnRyaWVzLmZpbHRlcihlbnRyeSA9PiBlbnRyeS5lcnJvciA9PT0gdW5kZWZpbmVkKS5cbiAgICBtYXAoZW50cnkgPT4ge1xuICAgICAgcmV0dXJuIHtmaWxlOiBlbnRyeS5maWxlLCBzdGF0czogZW50cnkuc3RhdHMsIGlzU3ltYm9saWNMaW5rOiBlbnRyeS5pc1N5bWJvbGljTGlua307XG4gICAgfSk7XG59XG5cbi8qKlxuICogR2V0cyB0aGUgcmVhbCBwYXRoIG9mIGEgZmlsZSBwYXRoLlxuICogSXQgY291bGQgYmUgZGlmZmVyZW50IHRoYW4gdGhlIGdpdmVuIHBhdGggaWYgdGhlIGZpbGUgaXMgYSBzeW1saW5rXG4gKiBvciBleGlzdHMgaW4gYSBzeW1saW5rZWQgZGlyZWN0b3J5LlxuICovXG5leHBvcnQgZnVuY3Rpb24gcmVhbHBhdGgocGF0aDogc3RyaW5nKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgcmV0dXJuIGZzUHJvbWlzZS5yZWFscGF0aChwYXRoKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlc29sdmVSZWFsUGF0aChwYXRoOiBzdHJpbmcpOiBQcm9taXNlPHN0cmluZz4ge1xuICByZXR1cm4gZnNQcm9taXNlLnJlYWxwYXRoKGZzUHJvbWlzZS5leHBhbmRIb21lRGlyKHBhdGgpKTtcbn1cblxuLyoqXG4gKiBSdW5zIHRoZSBlcXVpdmFsZW50IG9mIGBtdiBzb3VyY2VQYXRoIGRlc3RpbmF0aW9uUGF0aGAuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiByZW5hbWUoc291cmNlUGF0aDogc3RyaW5nLCBkZXN0aW5hdGlvblBhdGg6IHN0cmluZyk6IFByb21pc2Uge1xuICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgIGNvbnN0IGZzUGx1cyA9IHJlcXVpcmUoJ2ZzLXBsdXMnKTtcbiAgICBmc1BsdXMubW92ZShzb3VyY2VQYXRoLCBkZXN0aW5hdGlvblBhdGgsIGVycm9yID0+IHtcbiAgICAgIGVycm9yID8gcmVqZWN0KGVycm9yKSA6IHJlc29sdmUoKTtcbiAgICB9KTtcbiAgfSk7XG59XG5cbi8qKlxuICogUnVucyB0aGUgZXF1aXZhbGVudCBvZiBgY3Agc291cmNlUGF0aCBkZXN0aW5hdGlvblBhdGhgLlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gY29weShzb3VyY2VQYXRoOiBzdHJpbmcsIGRlc3RpbmF0aW9uUGF0aDogc3RyaW5nKTogUHJvbWlzZTxib29sZWFuPiB7XG4gIGNvbnN0IGlzRXhpc3RpbmdGaWxlID0gYXdhaXQgZnNQcm9taXNlLmV4aXN0cyhkZXN0aW5hdGlvblBhdGgpO1xuICBpZiAoaXNFeGlzdGluZ0ZpbGUpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgYXdhaXQgbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgIGNvbnN0IGZzUGx1cyA9IHJlcXVpcmUoJ2ZzLXBsdXMnKTtcbiAgICBmc1BsdXMuY29weShzb3VyY2VQYXRoLCBkZXN0aW5hdGlvblBhdGgsIGVycm9yID0+IHtcbiAgICAgIGVycm9yID8gcmVqZWN0KGVycm9yKSA6IHJlc29sdmUoKTtcbiAgICB9KTtcbiAgfSk7XG4gIGF3YWl0IGNvcHlGaWxlUGVybWlzc2lvbnMoc291cmNlUGF0aCwgZGVzdGluYXRpb25QYXRoKTtcbiAgcmV0dXJuIHRydWU7XG59XG5cbi8qKlxuICogUmVtb3ZlcyBkaXJlY3RvcmllcyBldmVuIGlmIHRoZXkgYXJlIG5vbi1lbXB0eS4gRG9lcyBub3QgZmFpbCBpZiB0aGUgZGlyZWN0b3J5IGRvZXNuJ3QgZXhpc3QuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBybWRpcihwYXRoOiBzdHJpbmcpOiBQcm9taXNlPHZvaWQ+IHtcbiAgcmV0dXJuIGZzUHJvbWlzZS5ybWRpcihwYXRoKTtcbn1cblxuLyoqXG4gKiBUaGUgc3RhdCBlbmRwb2ludCBhY2NlcHRzIHRoZSBmb2xsb3dpbmcgcXVlcnkgcGFyYW1ldGVyczpcbiAqXG4gKiAgIHBhdGg6IHBhdGggdG8gdGhlIGZpbGUgdG8gcmVhZFxuICpcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHN0YXQocGF0aDogc3RyaW5nKTogUHJvbWlzZTxmcy5TdGF0cz4ge1xuICByZXR1cm4gZnNQcm9taXNlLnN0YXQocGF0aCk7XG59XG5cbi8qKlxuICogUmVtb3ZlcyBmaWxlcy4gRG9lcyBub3QgZmFpbCBpZiB0aGUgZmlsZSBkb2Vzbid0IGV4aXN0LlxuICovXG5leHBvcnQgZnVuY3Rpb24gdW5saW5rKHBhdGg6IHN0cmluZyk6IFByb21pc2Uge1xuICByZXR1cm4gZnNQcm9taXNlLnVubGluayhwYXRoKS5jYXRjaChlcnJvciA9PiB7XG4gICAgaWYgKGVycm9yLmNvZGUgIT09ICdFTk9FTlQnKSB7XG4gICAgICB0aHJvdyBlcnJvcjtcbiAgICB9XG4gIH0pO1xufVxuXG4vKipcbiAqICAgcGF0aDogdGhlIHBhdGggdG8gdGhlIGZpbGUgdG8gcmVhZFxuICogICBvcHRpb25zOiBvcHRpb25zIHRvIHBhc3MgdG8gZnMucmVhZEZpbGUuXG4gKiAgICAgIE5vdGUgdGhhdCBvcHRpb25zIGRvZXMgTk9UIGluY2x1ZGUgJ2VuY29kaW5nJyB0aGlzIGVuc3VyZXMgdGhhdCB0aGUgcmV0dXJuIHZhbHVlXG4gKiAgICAgIGlzIGFsd2F5cyBhIEJ1ZmZlciBhbmQgbmV2ZXIgYSBzdHJpbmcuXG4gKlxuICogICBDYWxsZXJzIHdobyB3YW50IGEgc3RyaW5nIHNob3VsZCBjYWxsIGJ1ZmZlci50b1N0cmluZygndXRmOCcpLlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcmVhZEZpbGUocGF0aDogc3RyaW5nLCBvcHRpb25zPzoge2ZsYWc/OiBzdHJpbmd9KTpcbiAgICBQcm9taXNlPEJ1ZmZlcj4ge1xuICBjb25zdCBzdGF0cyA9IGF3YWl0IGZzUHJvbWlzZS5zdGF0KHBhdGgpO1xuICBpZiAoc3RhdHMuc2l6ZSA+IFJFQURGSUxFX1NJWkVfTElNSVQpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYEZpbGUgaXMgdG9vIGxhcmdlICgke3N0YXRzLnNpemV9IGJ5dGVzKWApO1xuICB9XG4gIHJldHVybiBmc1Byb21pc2UucmVhZEZpbGUocGF0aCwgb3B0aW9ucyk7XG59XG5cbi8qKlxuICogUmV0dXJucyB0cnVlIGlmIHRoZSBwYXRoIGJlaW5nIGNoZWNrZWQgZXhpc3RzIGluIGEgYE5GU2AgbW91bnRlZCBkaXJlY3RvcnkgZGV2aWNlLlxuICovXG5leHBvcnQgZnVuY3Rpb24gaXNOZnMocGF0aDogc3RyaW5nKTogUHJvbWlzZTxib29sZWFuPiB7XG4gIHJldHVybiBmc1Byb21pc2UuaXNOZnMocGF0aCk7XG59XG5cbi8vIFRPRE86IE1vdmUgdG8gbnVjbGlkZS1jb21tb25zXG5mdW5jdGlvbiBtdlByb21pc2Uoc291cmNlUGF0aDogc3RyaW5nLCBkZXN0aW5hdGlvblBhdGg6IHN0cmluZyk6IFByb21pc2U8dm9pZD4ge1xuICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgIG12KHNvdXJjZVBhdGgsIGRlc3RpbmF0aW9uUGF0aCwge21rZGlycDogZmFsc2V9LCBlcnJvciA9PiB7XG4gICAgICBpZiAoZXJyb3IpIHtcbiAgICAgICAgcmVqZWN0KGVycm9yKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJlc29sdmUoKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfSk7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGNvcHlGaWxlUGVybWlzc2lvbnMoc291cmNlUGF0aDogc3RyaW5nLCBkZXN0aW5hdGlvblBhdGg6IHN0cmluZyk6IFByb21pc2U8dm9pZD4ge1xuICBsZXQgcGVybWlzc2lvbnMgPSBudWxsO1xuICB0cnkge1xuICAgIHBlcm1pc3Npb25zID0gKGF3YWl0IGZzUHJvbWlzZS5zdGF0KHNvdXJjZVBhdGgpKS5tb2RlO1xuICB9IGNhdGNoIChlKSB7XG4gICAgLy8gSWYgdGhlIGZpbGUgZG9lcyBub3QgZXhpc3QsIHRoZW4gRU5PRU5UIHdpbGwgYmUgdGhyb3duLlxuICAgIGlmIChlLmNvZGUgIT09ICdFTk9FTlQnKSB7XG4gICAgICB0aHJvdyBlO1xuICAgIH1cbiAgfVxuICBpZiAocGVybWlzc2lvbnMgIT0gbnVsbCkge1xuICAgIGF3YWl0IGZzUHJvbWlzZS5jaG1vZChkZXN0aW5hdGlvblBhdGgsIHBlcm1pc3Npb25zKTtcbiAgfVxufVxuXG4vKipcbiAqIFRoZSB3cml0ZUZpbGUgZW5kcG9pbnQgYWNjZXB0cyB0aGUgZm9sbG93aW5nIHF1ZXJ5IHBhcmFtZXRlcnM6XG4gKlxuICogICBwYXRoOiBwYXRoIHRvIHRoZSBmaWxlIHRvIHJlYWQgKGl0IG11c3QgYmUgdXJsIGVuY29kZWQpLlxuICogICBvcHRpb25zOiBvcHRpb25zIHRvIHBhc3MgdG8gZnMud3JpdGVGaWxlXG4gKlxuICogVE9ETzogbW92ZSB0byBudWNsaWRlLWNvbW1vbnMgYW5kIHJlbmFtZSB0byB3cml0ZUZpbGVBdG9taWNcbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHdyaXRlRmlsZShwYXRoOiBzdHJpbmcsIGRhdGE6IHN0cmluZyxcbiAgICBvcHRpb25zOiA/e2VuY29kaW5nPzogc3RyaW5nOyBtb2RlPzogbnVtYmVyOyBmbGFnPzpzdHJpbmd9KTogUHJvbWlzZTx2b2lkPiB7XG5cbiAgbGV0IGNvbXBsZXRlID0gZmFsc2U7XG4gIGNvbnN0IHRlbXBGaWxlUGF0aCA9IGF3YWl0IGZzUHJvbWlzZS50ZW1wZmlsZSgnbnVjbGlkZScpO1xuICB0cnkge1xuICAgIGF3YWl0IGZzUHJvbWlzZS53cml0ZUZpbGUodGVtcEZpbGVQYXRoLCBkYXRhLCBvcHRpb25zKTtcblxuICAgIC8vIEVuc3VyZSBmaWxlIHN0aWxsIGhhcyBvcmlnaW5hbCBwZXJtaXNzaW9uczpcbiAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vZmFjZWJvb2svbnVjbGlkZS9pc3N1ZXMvMTU3XG4gICAgLy8gV2UgdXBkYXRlIHRoZSBtb2RlIG9mIHRoZSB0ZW1wIGZpbGUgcmF0aGVyIHRoYW4gdGhlIGRlc3RpbmF0aW9uIGZpbGUgYmVjYXVzZVxuICAgIC8vIGlmIHdlIGRpZCB0aGUgbXYoKSB0aGVuIHRoZSBjaG1vZCgpLCB0aGVyZSB3b3VsZCBiZSBhIGJyaWVmIHBlcmlvZCBiZXR3ZWVuXG4gICAgLy8gdGhvc2UgdHdvIG9wZXJhdGlvbnMgd2hlcmUgdGhlIGRlc3RpbmF0aW9uIGZpbGUgbWlnaHQgaGF2ZSB0aGUgd3JvbmcgcGVybWlzc2lvbnMuXG4gICAgYXdhaXQgY29weUZpbGVQZXJtaXNzaW9ucyhwYXRoLCB0ZW1wRmlsZVBhdGgpO1xuXG4gICAgLy8gVE9ETyhtaWtlbyk6IHB1dCByZW5hbWVzIGludG8gYSBxdWV1ZSBzbyB3ZSBkb24ndCB3cml0ZSBvbGRlciBzYXZlIG92ZXIgbmV3IHNhdmUuXG4gICAgLy8gVXNlIG12IGFzIGZzLnJlbmFtZSBkb2Vzbid0IHdvcmsgYWNyb3NzIHBhcnRpdGlvbnMuXG4gICAgYXdhaXQgbXZQcm9taXNlKHRlbXBGaWxlUGF0aCwgcGF0aCk7XG4gICAgY29tcGxldGUgPSB0cnVlO1xuICB9IGZpbmFsbHkge1xuICAgIGlmICghY29tcGxldGUpIHtcbiAgICAgIGF3YWl0IGZzUHJvbWlzZS51bmxpbmsodGVtcEZpbGVQYXRoKTtcbiAgICB9XG4gIH1cbn1cbiJdfQ==