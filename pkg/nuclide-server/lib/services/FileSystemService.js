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
  var isExistingFile = yield (_commonsNodeFsPromise2 || _commonsNodeFsPromise()).default.exists(filePath);
  if (isExistingFile) {
    return false;
  }
  yield (_commonsNodeFsPromise2 || _commonsNodeFsPromise()).default.mkdirp((_nuclideRemoteUri2 || _nuclideRemoteUri()).default.dirname(filePath));
  yield (_commonsNodeFsPromise2 || _commonsNodeFsPromise()).default.writeFile(filePath, '');
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
  var files = yield (_commonsNodeFsPromise2 || _commonsNodeFsPromise()).default.readdir(path);
  var entries = yield Promise.all(files.map(_asyncToGenerator(function* (file) {
    var fullpath = (_nuclideRemoteUri2 || _nuclideRemoteUri()).default.join(path, file);
    var lstats = yield (_commonsNodeFsPromise2 || _commonsNodeFsPromise()).default.lstat(fullpath);
    if (!lstats.isSymbolicLink()) {
      return { file: file, stats: lstats, isSymbolicLink: false };
    } else {
      try {
        var _stats = yield (_commonsNodeFsPromise2 || _commonsNodeFsPromise()).default.stat(fullpath);
        return { file: file, stats: _stats, isSymbolicLink: true };
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
 * Moves all sourcePaths into the specified destDir, assumed to be a directory name.
 */

var move = _asyncToGenerator(function* (sourcePaths, destDir) {
  yield Promise.all(sourcePaths.map(function (path) {
    var destPath = (_nuclideRemoteUri2 || _nuclideRemoteUri()).default.join(destDir, (_nuclideRemoteUri2 || _nuclideRemoteUri()).default.basename(path));
    return (_commonsNodeFsPromise2 || _commonsNodeFsPromise()).default.move(path, destPath);
  }));
}

/**
 * Runs the equivalent of `cp sourcePath destinationPath`.
 * @return true if the operation was successful; false if it wasn't.
 */
);

exports.move = move;

var copy = _asyncToGenerator(function* (sourcePath, destinationPath) {
  var isExistingFile = yield (_commonsNodeFsPromise2 || _commonsNodeFsPromise()).default.exists(destinationPath);
  if (isExistingFile) {
    return false;
  }
  yield new Promise(function (resolve, reject) {
    (_fsPlus2 || _fsPlus()).default.copy(sourcePath, destinationPath, function (error) {
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

var rmdirAll = _asyncToGenerator(function* (paths) {
  yield Promise.all(paths.map(function (p) {
    return (_commonsNodeFsPromise2 || _commonsNodeFsPromise()).default.rmdir(p);
  }));
}

/**
 * The stat endpoint accepts the following query parameters:
 *
 *   path: path to the file to read
 *
 * It returns a JSON encoded stats object that looks something like this:
 *
 * { dev: 2114,
 *  ino: 48064969,
 *  mode: 33188,
 *  nlink: 1,
 *  uid: 85,
 *  gid: 100,
 *  rdev: 0,
 *  size: 527,
 *  blksize: 4096,
 *  blocks: 8,
 *  atime: 'Mon, 10 Oct 2011 23:24:11 GMT',
 *  mtime: 'Mon, 10 Oct 2011 23:24:11 GMT',
 *  ctime: 'Mon, 10 Oct 2011 23:24:11 GMT',
 *  birthtime: 'Mon, 10 Oct 2011 23:24:11 GMT'
 * }
 *
 */
);

exports.rmdirAll = rmdirAll;
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
  var stats = yield (_commonsNodeFsPromise2 || _commonsNodeFsPromise()).default.stat(path);
  if (stats.size > READFILE_SIZE_LIMIT) {
    throw new Error('File is too large (' + stats.size + ' bytes)');
  }
  return (_commonsNodeFsPromise2 || _commonsNodeFsPromise()).default.readFile(path, options);
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
    permissions = (yield (_commonsNodeFsPromise2 || _commonsNodeFsPromise()).default.stat(sourcePath)).mode;
  } catch (e) {
    // If the file does not exist, then ENOENT will be thrown.
    if (e.code !== 'ENOENT') {
      throw e;
    }
  }
  if (permissions != null) {
    yield (_commonsNodeFsPromise2 || _commonsNodeFsPromise()).default.chmod(destinationPath, permissions);
  }
}

/**
 * The writeFile endpoint accepts the following query parameters:
 *
 *   path: path to the file to read (it must be url encoded).
 *   data: file contents to write.
 *   options: options to pass to fs.writeFile
 *
 * TODO: move to nuclide-commons and rename to writeFileAtomic
 */
);

var writeFile = _asyncToGenerator(function* (path, data, options) {

  var complete = false;
  var tempFilePath = yield (_commonsNodeFsPromise2 || _commonsNodeFsPromise()).default.tempfile('nuclide');
  try {
    yield (_commonsNodeFsPromise2 || _commonsNodeFsPromise()).default.writeFile(tempFilePath, data, options);

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
      yield (_commonsNodeFsPromise2 || _commonsNodeFsPromise()).default.unlink(tempFilePath);
    }
  }
});

exports.writeFile = writeFile;

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

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

var _mv2;

function _mv() {
  return _mv2 = _interopRequireDefault(require('mv'));
}

var _fs2;

function _fs() {
  return _fs2 = _interopRequireDefault(require('fs'));
}

var _fsPlus2;

function _fsPlus() {
  return _fsPlus2 = _interopRequireDefault(require('fs-plus'));
}

var _nuclideRemoteUri2;

function _nuclideRemoteUri() {
  return _nuclideRemoteUri2 = _interopRequireDefault(require('../../../nuclide-remote-uri'));
}

var _commonsNodeFsPromise2;

function _commonsNodeFsPromise() {
  return _commonsNodeFsPromise2 = _interopRequireDefault(require('../../../commons-node/fsPromise'));
}

// Attempting to read large files just crashes node, so just fail.
// Atom can't handle files of this scale anyway.
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
  return (_commonsNodeFsPromise2 || _commonsNodeFsPromise()).default.exists(path);
}

function findNearestFile(fileName, pathToDirectory) {
  return (_commonsNodeFsPromise2 || _commonsNodeFsPromise()).default.findNearestFile(fileName, pathToDirectory);
}

/**
 * The lstat endpoint is the same as the stat endpoint except it will return
 * the stat of a link instead of the file the link points to.
 */

function lstat(path) {
  return (_commonsNodeFsPromise2 || _commonsNodeFsPromise()).default.lstat(path);
}

/**
 * Creates a new directory with the given path.
 * Throws EEXIST error if the directory already exists.
 * Throws ENOENT if the path given is nested in a non-existing directory.
 */

function mkdir(path) {
  return (_commonsNodeFsPromise2 || _commonsNodeFsPromise()).default.mkdir(path);
}

/**
 * Runs the equivalent of `mkdir -p` with the given path.
 *
 * Like most implementations of mkdirp, if it fails, it is possible that
 * directories were created for some prefix of the given path.
 * @return true if the path was created; false if it already existed.
 */

function mkdirp(path) {
  return (_commonsNodeFsPromise2 || _commonsNodeFsPromise()).default.mkdirp(path);
}

/**
 * Changes permissions on a file.
 */

function chmod(path, mode) {
  return (_commonsNodeFsPromise2 || _commonsNodeFsPromise()).default.chmod(path, mode);
}

function realpath(path) {
  return (_commonsNodeFsPromise2 || _commonsNodeFsPromise()).default.realpath(path);
}

/**
 * Gets the real path of a file path, while expanding tilda paths and symlinks
 * like: ~/abc to its absolute path format.
 */

function resolveRealPath(path) {
  return (_commonsNodeFsPromise2 || _commonsNodeFsPromise()).default.realpath((_nuclideRemoteUri2 || _nuclideRemoteUri()).default.expandHomeDir(path));
}

/**
 * Runs the equivalent of `mv sourcePath destinationPath`.
 */

function rename(sourcePath, destinationPath) {
  return (_commonsNodeFsPromise2 || _commonsNodeFsPromise()).default.move(sourcePath, destinationPath);
}

function rmdir(path) {
  return (_commonsNodeFsPromise2 || _commonsNodeFsPromise()).default.rmdir(path);
}

function stat(path) {
  return (_commonsNodeFsPromise2 || _commonsNodeFsPromise()).default.stat(path);
}

/**
 * Removes files. Does not fail if the file doesn't exist.
 */

function unlink(path) {
  return (_commonsNodeFsPromise2 || _commonsNodeFsPromise()).default.unlink(path).catch(function (error) {
    if (error.code !== 'ENOENT') {
      throw error;
    }
  });
}

function isNfs(path) {
  return (_commonsNodeFsPromise2 || _commonsNodeFsPromise()).default.isNfs(path);
}

// TODO: Move to nuclide-commons
function mvPromise(sourcePath, destinationPath) {
  return new Promise(function (resolve, reject) {
    (0, (_mv2 || _mv()).default)(sourcePath, destinationPath, { mkdirp: false }, function (error) {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });
}