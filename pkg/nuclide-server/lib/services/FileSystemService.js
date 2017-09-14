'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getFreeSpace = exports.readFile = exports.rmdirAll = exports.copyDir = exports.copy = exports.move = exports.readdir = exports.newFile = exports.findNearestAncestorNamed = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

/**
 * Starting in the directory `pathToDirectory`, checks if it contains a file named `fileName`.
 * If so, it returns the path to the file. If not, it successively looks for `fileName` in the
 * parent directory. If it gets all the way to the root and still does not find the file, then it
 * returns `null`.
 */
let findNearestAncestorNamed = exports.findNearestAncestorNamed = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* (fileName, pathToDirectory) {
    const directory = yield (_fsPromise || _load_fsPromise()).default.findNearestFile(fileName, pathToDirectory);
    if (directory != null) {
      return (_nuclideUri || _load_nuclideUri()).default.join(directory, fileName);
    } else {
      return null;
    }
  });

  return function findNearestAncestorNamed(_x, _x2) {
    return _ref.apply(this, arguments);
  };
})();

/**
 * If no file (or directory) at the specified path exists, creates the parent
 * directories (if necessary) and then writes an empty file at the specified
 * path.
 *
 * @return A boolean indicating whether the file was created.
 */
let newFile = exports.newFile = (() => {
  var _ref2 = (0, _asyncToGenerator.default)(function* (filePath) {
    const isExistingFile = yield (_fsPromise || _load_fsPromise()).default.exists(filePath);
    if (isExistingFile) {
      return false;
    }
    yield (_fsPromise || _load_fsPromise()).default.mkdirp((_nuclideUri || _load_nuclideUri()).default.dirname(filePath));
    yield (_fsPromise || _load_fsPromise()).default.writeFile(filePath, '');
    return true;
  });

  return function newFile(_x3) {
    return _ref2.apply(this, arguments);
  };
})();

/**
 * Lists all children of the given directory.
 */


let readdir = exports.readdir = (() => {
  var _ref3 = (0, _asyncToGenerator.default)(function* (path) {
    const files = yield (_fsPromise || _load_fsPromise()).default.readdir(path);
    const entries = yield Promise.all(files.map((() => {
      var _ref4 = (0, _asyncToGenerator.default)(function* (file) {
        const fullpath = (_nuclideUri || _load_nuclideUri()).default.join(path, file);
        const lstats = yield (_fsPromise || _load_fsPromise()).default.lstat(fullpath);
        if (!lstats.isSymbolicLink()) {
          return { file, stats: lstats, isSymbolicLink: false };
        } else {
          try {
            const stats = yield (_fsPromise || _load_fsPromise()).default.stat(fullpath);
            return { file, stats, isSymbolicLink: true };
          } catch (error) {
            return null;
          }
        }
      });

      return function (_x5) {
        return _ref4.apply(this, arguments);
      };
    })()));
    // TODO: Return entries directly and change client to handle error.
    return (0, (_collection || _load_collection()).arrayCompact)(entries).map(function (entry) {
      return [entry.file, entry.stats.isFile(), entry.isSymbolicLink];
    });
  });

  return function readdir(_x4) {
    return _ref3.apply(this, arguments);
  };
})();

/**
 * Gets the real path of a file path.
 * It could be different than the given path if the file is a symlink
 * or exists in a symlinked directory.
 */


/**
 * Moves all sourcePaths into the specified destDir, assumed to be a directory name.
 */
let move = exports.move = (() => {
  var _ref5 = (0, _asyncToGenerator.default)(function* (sourcePaths, destDir) {
    yield Promise.all(sourcePaths.map(function (path) {
      const destPath = (_nuclideUri || _load_nuclideUri()).default.join(destDir, (_nuclideUri || _load_nuclideUri()).default.basename(path));
      return (_fsPromise || _load_fsPromise()).default.move(path, destPath);
    }));
  });

  return function move(_x6, _x7) {
    return _ref5.apply(this, arguments);
  };
})();

/**
 * Runs the equivalent of `cp sourcePath destinationPath`.
 * @return true if the operation was successful; false if it wasn't.
 */


let copy = exports.copy = (() => {
  var _ref6 = (0, _asyncToGenerator.default)(function* (sourcePath, destinationPath) {
    const isExistingFile = yield (_fsPromise || _load_fsPromise()).default.exists(destinationPath);
    if (isExistingFile) {
      return false;
    }
    yield (_fsPromise || _load_fsPromise()).default.copy(sourcePath, destinationPath);
    yield copyFilePermissions(sourcePath, destinationPath);
    return true;
  });

  return function copy(_x8, _x9) {
    return _ref6.apply(this, arguments);
  };
})();

/**
 * Runs the equivalent of `cp -R sourcePath destinationPath`.
 * @return true if the operation was successful; false if it wasn't.
 */


let copyDir = exports.copyDir = (() => {
  var _ref7 = (0, _asyncToGenerator.default)(function* (sourcePath, destinationPath) {
    const oldContents = (yield Promise.all([mkdir(destinationPath), readdir(sourcePath)]))[1];

    const didCopyAll = yield Promise.all(oldContents.map(function ([file, isFile]) {
      const oldItem = (_nuclideUri || _load_nuclideUri()).default.join(sourcePath, file);
      const newItem = (_nuclideUri || _load_nuclideUri()).default.join(destinationPath, file);
      if (isFile) {
        // it's a file, copy it
        return copy(oldItem, newItem);
      }
      // it's a directory, copy it
      return copyDir(oldItem, newItem);
    }));
    // Are all the resulting booleans true?
    return didCopyAll.every(function (b) {
      return b;
    });
  });

  return function copyDir(_x10, _x11) {
    return _ref7.apply(this, arguments);
  };
})();

/**
 * Removes directories even if they are non-empty. Does not fail if the directory doesn't exist.
 */


let rmdirAll = exports.rmdirAll = (() => {
  var _ref8 = (0, _asyncToGenerator.default)(function* (paths) {
    yield Promise.all(paths.map(function (p) {
      return (_fsPromise || _load_fsPromise()).default.rimraf(p);
    }));
  });

  return function rmdirAll(_x12) {
    return _ref8.apply(this, arguments);
  };
})();

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


/**
 *   path: the path to the file to read
 *   options: options to pass to fs.readFile.
 *      Note that options does NOT include 'encoding' this ensures that the return value
 *      is always a Buffer and never a string.
 *
 *   Callers who want a string should call buffer.toString('utf8').
 */
let readFile = exports.readFile = (() => {
  var _ref9 = (0, _asyncToGenerator.default)(function* (path, options) {
    const stats = yield (_fsPromise || _load_fsPromise()).default.stat(path);
    if (stats.size > READFILE_SIZE_LIMIT) {
      throw new Error(`File is too large (${stats.size} bytes)`);
    }
    return (_fsPromise || _load_fsPromise()).default.readFile(path, options);
  });

  return function readFile(_x13, _x14) {
    return _ref9.apply(this, arguments);
  };
})();

let copyFilePermissions = (() => {
  var _ref10 = (0, _asyncToGenerator.default)(function* (sourcePath, destinationPath) {
    try {
      const { mode, uid, gid } = yield (_fsPromise || _load_fsPromise()).default.stat(sourcePath);
      yield Promise.all([
      // The user may not have permissions to use the uid/gid.
      (_fsPromise || _load_fsPromise()).default.chown(destinationPath, uid, gid).catch(function () {}), (_fsPromise || _load_fsPromise()).default.chmod(destinationPath, mode)]);
    } catch (e) {
      // If the file does not exist, then ENOENT will be thrown.
      if (e.code !== 'ENOENT') {
        throw e;
      }
      // For new files, use the default process file creation mask.
      yield (_fsPromise || _load_fsPromise()).default.chmod(destinationPath,
      // $FlowIssue: umask argument is optional
      0o666 & ~process.umask());
    }
  });

  return function copyFilePermissions(_x15, _x16) {
    return _ref10.apply(this, arguments);
  };
})();

/**
 * A small wrapper around fs.writeFile that also implements:
 *
 * - atomic writes (by writing to a temporary file first)
 * - uses a promise rather than a callback
 *
 * `options` is passed directly into fs.writeFile.
 */


let _writeFile = (() => {
  var _ref11 = (0, _asyncToGenerator.default)(function* (path, data, options) {
    let complete = false;
    const tempFilePath = yield (_fsPromise || _load_fsPromise()).default.tempfile('nuclide');
    try {
      yield (_fsPromise || _load_fsPromise()).default.writeFile(tempFilePath, data, options);

      // Expand the target path in case it contains symlinks.
      let realPath = path;
      try {
        realPath = yield resolveRealPath(path);
      } catch (e) {}
      // Fallback to using the specified path if it cannot be expanded.
      // Note: this is expected in cases where the remote file does not
      // actually exist.


      // Ensure file still has original permissions:
      // https://github.com/facebook/nuclide/issues/157
      // We update the mode of the temp file rather than the destination file because
      // if we did the mv() then the chmod(), there would be a brief period between
      // those two operations where the destination file might have the wrong permissions.
      yield copyFilePermissions(realPath, tempFilePath);

      // TODO(mikeo): put renames into a queue so we don't write older save over new save.
      // Use mv as fs.rename doesn't work across partitions.
      yield mvPromise(tempFilePath, realPath);
      complete = true;
    } finally {
      if (!complete) {
        yield (_fsPromise || _load_fsPromise()).default.unlink(tempFilePath);
      }
    }
  });

  return function _writeFile(_x17, _x18, _x19) {
    return _ref11.apply(this, arguments);
  };
})();

let getFreeSpace = exports.getFreeSpace = (() => {
  var _ref12 = (0, _asyncToGenerator.default)(function* (path) {
    // Only supported on Linux for now.
    if (process.platform !== 'linux') {
      return null;
    }
    // The output of this command is "Avail\n12345678\n".
    // Just return the first line that parses to an integer.
    return (0, (_process || _load_process()).runCommand)('df', ['--output=avail', path]).map(function (output) {
      for (const line of output.split('\n')) {
        const number = parseInt(line, 10);
        if (Number.isInteger(number)) {
          return number;
        }
      }
    }).toPromise().catch(function () {
      return null;
    });
  });

  return function getFreeSpace(_x20) {
    return _ref12.apply(this, arguments);
  };
})();

exports.exists = exists;
exports.findFilesInDirectories = findFilesInDirectories;
exports.lstat = lstat;
exports.mkdir = mkdir;
exports.mkdirp = mkdirp;
exports.chmod = chmod;
exports.realpath = realpath;
exports.resolveRealPath = resolveRealPath;
exports.rename = rename;
exports.rmdir = rmdir;
exports.stat = stat;
exports.unlink = unlink;
exports.createReadStream = createReadStream;
exports.isNfs = isNfs;
exports.writeFile = writeFile;
exports.writeFileBuffer = writeFileBuffer;

var _mv;

function _load_mv() {
  return _mv = _interopRequireDefault(require('mv'));
}

var _fs = _interopRequireDefault(require('fs'));

var _collection;

function _load_collection() {
  return _collection = require('nuclide-commons/collection');
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('nuclide-commons/nuclideUri'));
}

var _fsPromise;

function _load_fsPromise() {
  return _fsPromise = _interopRequireDefault(require('nuclide-commons/fsPromise'));
}

var _process;

function _load_process() {
  return _process = require('nuclide-commons/process');
}

var _stream;

function _load_stream() {
  return _stream = require('nuclide-commons/stream');
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Attempting to read large files just crashes node, so just fail.
// Atom can't handle files of this scale anyway.
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 */

/**
 * This code implements the NuclideFs service.  It exports the FS on http via
 * the endpoint: http://your.server:your_port/fs/method where method is one of
 * readFile, writeFile, etc.
 */

const READFILE_SIZE_LIMIT = 10 * 1024 * 1024;

//------------------------------------------------------------------------------
// Services
//------------------------------------------------------------------------------

/**
 * Checks a certain path for existence and returns 'true'/'false' accordingly
 */
function exists(path) {
  return (_fsPromise || _load_fsPromise()).default.exists(path);
}function findFilesInDirectories(searchPaths, fileName) {
  if (searchPaths.length === 0) {
    return _rxjsBundlesRxMinJs.Observable.throw(new Error('No directories to search in!')).publish();
  }
  const findArgs = [...searchPaths, '-type', 'f', '-name', fileName];
  return (0, (_process || _load_process()).runCommand)('find', findArgs).map(stdout => stdout.split('\n').filter(filePath => filePath !== '')).publish();
}

/**
 * The lstat endpoint is the same as the stat endpoint except it will return
 * the stat of a link instead of the file the link points to.
 */
function lstat(path) {
  return (_fsPromise || _load_fsPromise()).default.lstat(path);
}

/**
 * Creates a new directory with the given path.
 * Throws EEXIST error if the directory already exists.
 * Throws ENOENT if the path given is nested in a non-existing directory.
 */
function mkdir(path) {
  return (_fsPromise || _load_fsPromise()).default.mkdir(path);
}

/**
 * Runs the equivalent of `mkdir -p` with the given path.
 *
 * Like most implementations of mkdirp, if it fails, it is possible that
 * directories were created for some prefix of the given path.
 * @return true if the path was created; false if it already existed.
 */
function mkdirp(path) {
  return (_fsPromise || _load_fsPromise()).default.mkdirp(path);
}

/**
 * Changes permissions on a file.
 */
function chmod(path, mode) {
  return (_fsPromise || _load_fsPromise()).default.chmod(path, mode);
}function realpath(path) {
  return (_fsPromise || _load_fsPromise()).default.realpath(path);
}

/**
 * Gets the real path of a file path, while expanding tilda paths and symlinks
 * like: ~/abc to its absolute path format.
 */
function resolveRealPath(path) {
  return (_fsPromise || _load_fsPromise()).default.realpath((_nuclideUri || _load_nuclideUri()).default.expandHomeDir(path));
}

/**
 * Runs the equivalent of `mv sourcePath destinationPath`.
 */
function rename(sourcePath, destinationPath) {
  return (_fsPromise || _load_fsPromise()).default.move(sourcePath, destinationPath);
}function rmdir(path) {
  return (_fsPromise || _load_fsPromise()).default.rimraf(path);
}

function stat(path) {
  return (_fsPromise || _load_fsPromise()).default.stat(path);
}

/**
 * Removes files. Does not fail if the file doesn't exist.
 */
function unlink(path) {
  return (_fsPromise || _load_fsPromise()).default.unlink(path).catch(error => {
    if (error.code !== 'ENOENT') {
      throw error;
    }
  });
}function createReadStream(path, options) {
  return (0, (_stream || _load_stream()).observeRawStream)(_fs.default.createReadStream(path, options)).publish();
}

/**
 * Returns true if the path being checked exists in a `NFS` mounted directory device.
 */
function isNfs(path) {
  return (_fsPromise || _load_fsPromise()).default.isNfs(path);
}

// TODO: Move to nuclide-commons
function mvPromise(sourcePath, destinationPath) {
  return new Promise((resolve, reject) => {
    (0, (_mv || _load_mv()).default)(sourcePath, destinationPath, { mkdirp: false }, error => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });
}

function writeFile(path, data, options) {
  return _writeFile(path, data, options);
}

/**
 * This is the same as writeFile but with buffers.
 * The RPC framework can't use string | Buffer so we have to create a separate function.
 * Note that options.encoding is ignored for raw buffers.
 */
function writeFileBuffer(path, data, options) {
  return _writeFile(path, data, options);
}