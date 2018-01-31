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
    const directory = yield (_nuclideFs || _load_nuclideFs()).ROOT_FS.findNearestFile(fileName, pathToDirectory);
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
    const isExistingFile = yield (_nuclideFs || _load_nuclideFs()).ROOT_FS.exists(filePath);
    if (isExistingFile) {
      return false;
    }
    yield (_nuclideFs || _load_nuclideFs()).ROOT_FS.mkdirp((_nuclideUri || _load_nuclideUri()).default.dirname(filePath));
    yield writeFile(filePath, '');
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
    return (_nuclideFs || _load_nuclideFs()).ROOT_FS.readdir(path);
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
  var _ref4 = (0, _asyncToGenerator.default)(function* (sourcePaths, destDir) {
    yield Promise.all(sourcePaths.map(function (path) {
      const destPath = (_nuclideUri || _load_nuclideUri()).default.join(destDir, (_nuclideUri || _load_nuclideUri()).default.basename(path));
      return (_nuclideFs || _load_nuclideFs()).ROOT_FS.move(path, destPath);
    }));
  });

  return function move(_x5, _x6) {
    return _ref4.apply(this, arguments);
  };
})();

/**
 * Runs the equivalent of `cp sourcePath destinationPath`.
 * @return true if the operation was successful; false if it wasn't.
 */


let copy = exports.copy = (() => {
  var _ref5 = (0, _asyncToGenerator.default)(function* (sourcePath, destinationPath) {
    const isExistingFile = yield (_nuclideFs || _load_nuclideFs()).ROOT_FS.exists(destinationPath);
    if (isExistingFile) {
      return false;
    }
    yield (_nuclideFs || _load_nuclideFs()).ROOT_FS.copy(sourcePath, destinationPath);
    // TODO: May need to move into ROOT_FS if future filesystems support writing.
    yield (_fsPromise || _load_fsPromise()).default.copyFilePermissions(sourcePath, destinationPath);
    return true;
  });

  return function copy(_x7, _x8) {
    return _ref5.apply(this, arguments);
  };
})();

/**
 * Runs the equivalent of `cp -R sourcePath destinationPath`.
 * @return true if the operation was successful; false if it wasn't.
 */


let copyDir = exports.copyDir = (() => {
  var _ref6 = (0, _asyncToGenerator.default)(function* (sourcePath, destinationPath) {
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

  return function copyDir(_x9, _x10) {
    return _ref6.apply(this, arguments);
  };
})();

/**
 * Removes directories even if they are non-empty. Does not fail if the directory doesn't exist.
 */


let rmdirAll = exports.rmdirAll = (() => {
  var _ref7 = (0, _asyncToGenerator.default)(function* (paths) {
    yield Promise.all(paths.map(function (p) {
      return (_nuclideFs || _load_nuclideFs()).ROOT_FS.rimraf(p);
    }));
  });

  return function rmdirAll(_x11) {
    return _ref7.apply(this, arguments);
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
  var _ref8 = (0, _asyncToGenerator.default)(function* (path, options) {
    return (_nuclideFs || _load_nuclideFs()).ROOT_FS.readFile(path, options);
  });

  return function readFile(_x12, _x13) {
    return _ref8.apply(this, arguments);
  };
})();

let getFreeSpace = exports.getFreeSpace = (() => {
  var _ref9 = (0, _asyncToGenerator.default)(function* (path) {
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

  return function getFreeSpace(_x14) {
    return _ref9.apply(this, arguments);
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
exports.isFuse = isFuse;
exports.writeFile = writeFile;
exports.writeFileBuffer = writeFileBuffer;

var _fs = _interopRequireDefault(require('fs'));

var _fsPromise;

function _load_fsPromise() {
  return _fsPromise = _interopRequireDefault(require('nuclide-commons/fsPromise'));
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('nuclide-commons/nuclideUri'));
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

var _nuclideFs;

function _load_nuclideFs() {
  return _nuclideFs = require('../../../nuclide-fs');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

//------------------------------------------------------------------------------
// Services
//------------------------------------------------------------------------------

/**
 * Checks a certain path for existence and returns 'true'/'false' accordingly
 */
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

function exists(path) {
  return (_nuclideFs || _load_nuclideFs()).ROOT_FS.exists(path);
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
  return (_nuclideFs || _load_nuclideFs()).ROOT_FS.lstat(path);
}

/**
 * Creates a new directory with the given path.
 * Throws EEXIST error if the directory already exists.
 * Throws ENOENT if the path given is nested in a non-existing directory.
 */
function mkdir(path) {
  return (_nuclideFs || _load_nuclideFs()).ROOT_FS.mkdir(path);
}

/**
 * Runs the equivalent of `mkdir -p` with the given path.
 *
 * Like most implementations of mkdirp, if it fails, it is possible that
 * directories were created for some prefix of the given path.
 * @return true if the path was created; false if it already existed.
 */
function mkdirp(path) {
  return (_nuclideFs || _load_nuclideFs()).ROOT_FS.mkdirp(path);
}

/**
 * Changes permissions on a file.
 */
function chmod(path, mode) {
  return (_nuclideFs || _load_nuclideFs()).ROOT_FS.chmod(path, mode);
}function realpath(path) {
  return (_nuclideFs || _load_nuclideFs()).ROOT_FS.realpath(path);
}

/**
 * Gets the real path of a file path, while expanding tilda paths and symlinks
 * like: ~/abc to its absolute path format.
 */
function resolveRealPath(path) {
  return (_nuclideFs || _load_nuclideFs()).ROOT_FS.realpath((_nuclideUri || _load_nuclideUri()).default.expandHomeDir(path));
}

/**
 * Runs the equivalent of `mv sourcePath destinationPath`.
 */
function rename(sourcePath, destinationPath) {
  return (_nuclideFs || _load_nuclideFs()).ROOT_FS.move(sourcePath, destinationPath);
}function rmdir(path) {
  return (_nuclideFs || _load_nuclideFs()).ROOT_FS.rimraf(path);
}

function stat(path) {
  return (_nuclideFs || _load_nuclideFs()).ROOT_FS.stat(path);
}

/**
 * Removes files. Does not fail if the file doesn't exist.
 */
function unlink(path) {
  return (_nuclideFs || _load_nuclideFs()).ROOT_FS.unlink(path).catch(error => {
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
  return (_nuclideFs || _load_nuclideFs()).ROOT_FS.isNfs(path);
}

/**
 * Returns true if the path being checked exists in a `Fuse` mounted directory device.
 */
function isFuse(path) {
  return (_nuclideFs || _load_nuclideFs()).ROOT_FS.isFuse(path);
}

/**
 * A small wrapper around fs.writeFile that also implements:
 *
 * - atomic writes (by writing to a temporary file first)
 * - uses a promise rather than a callback
 *
 * `options` is passed directly into fs.writeFile.
 */
function writeFile(path, data, options) {
  // TODO: May need to move into ROOT_FS if future filesystems support writing.
  return (_fsPromise || _load_fsPromise()).default.writeFileAtomic(path, data, options);
}

/**
 * This is the same as writeFile but with buffers.
 * The RPC framework can't use string | Buffer so we have to create a separate function.
 * Note that options.encoding is ignored for raw buffers.
 */
function writeFileBuffer(path, data, options) {
  return (_fsPromise || _load_fsPromise()).default.writeFileAtomic(path, data, options);
}