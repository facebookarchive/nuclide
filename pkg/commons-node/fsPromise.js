Object.defineProperty(exports, '__esModule', {
  value: true
});
var _slice = Array.prototype.slice;

/**
 * Searches upward through the filesystem from pathToDirectory to find a file with
 * fileName.
 * @param fileName The name of the file to find.
 * @param pathToDirectory Where to begin the search. Must be a path to a directory,
 *   not a file.
 * @return directory that contains the nearest file or null.
 */

var findNearestFile = _asyncToGenerator(function* (fileName, pathToDirectory) {
  // TODO(5586355): If this becomes a bottleneck, we should consider memoizing
  // this function. The downside would be that if someone added a closer file
  // with fileName to pathToFile (or deleted the one that was cached), then we
  // would have a bug. This would probably be pretty rare, though.
  var currentPath = (_commonsNodeNuclideUri || _load_commonsNodeNuclideUri()).default.resolve(pathToDirectory);
  for (;;) {
    var fileToFind = (_commonsNodeNuclideUri || _load_commonsNodeNuclideUri()).default.join(currentPath, fileName);
    // eslint-disable-next-line babel/no-await-in-loop
    var hasFile = yield exists(fileToFind);
    if (hasFile) {
      return currentPath;
    }
    if ((_commonsNodeNuclideUri || _load_commonsNodeNuclideUri()).default.isRoot(currentPath)) {
      return null;
    }
    currentPath = (_commonsNodeNuclideUri || _load_commonsNodeNuclideUri()).default.dirname(currentPath);
  }
}

/**
 * Searches upward through the filesystem from pathToDirectory to find the furthest
 * file with fileName.
 * @param fileName The name of the file to find.
 * @param pathToDirectory Where to begin the search. Must be a path to a directory,
 *   not a file.
 * @param stopOnMissing Stop searching when we reach a directory without fileName.
 * @return directory that contains the furthest file or null.
 */
);

var findFurthestFile = _asyncToGenerator(function* (fileName, pathToDirectory) {
  var stopOnMissing = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];

  var currentPath = (_commonsNodeNuclideUri || _load_commonsNodeNuclideUri()).default.resolve(pathToDirectory);
  var result = null;
  for (;;) {
    var fileToFind = (_commonsNodeNuclideUri || _load_commonsNodeNuclideUri()).default.join(currentPath, fileName);
    // eslint-disable-next-line babel/no-await-in-loop
    var hasFile = yield exists(fileToFind);
    if (!hasFile && stopOnMissing || (_commonsNodeNuclideUri || _load_commonsNodeNuclideUri()).default.isRoot(currentPath)) {
      return result;
    } else if (hasFile) {
      result = currentPath;
    }
    currentPath = (_commonsNodeNuclideUri || _load_commonsNodeNuclideUri()).default.dirname(currentPath);
  }
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
      (0, (_mkdirp || _load_mkdirp()).default)(filePath, function (err) {
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

/** @return true only if we are sure directoryPath is on NFS. */

var isNfs = _asyncToGenerator(function* (entityPath) {
  if (process.platform === 'linux' || process.platform === 'darwin') {
    var _ref = yield (0, (_process || _load_process()).asyncExecute)('stat', ['-f', '-L', '-c', '%T', entityPath]);

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
});

var isNonNfsDirectory = _asyncToGenerator(function* (directoryPath) {
  try {
    var stats = yield stat(directoryPath);
    if (stats.isDirectory()) {
      return !(yield isNfs(directoryPath));
    } else {
      return false;
    }
  } catch (e) {
    // If the directory cannot be probed for whatever reason, just
    // indicate that this is not a valid candidate directory.
    // Typically this is ENOENT for missing directory.
    return false;
  }
}

/**
 * Promisified wrappers around fs-plus functions.
 */

);

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _fs;

function _load_fs() {
  return _fs = _interopRequireDefault(require('fs'));
}

var _fsPlus;

function _load_fsPlus() {
  return _fsPlus = _interopRequireDefault(require('fs-plus'));
}

var _glob;

function _load_glob() {
  return _glob = _interopRequireDefault(require('glob'));
}

var _mkdirp;

function _load_mkdirp() {
  return _mkdirp = _interopRequireDefault(require('mkdirp'));
}

var _commonsNodeNuclideUri;

function _load_commonsNodeNuclideUri() {
  return _commonsNodeNuclideUri = _interopRequireDefault(require('../commons-node/nuclideUri'));
}

var _rimraf;

function _load_rimraf() {
  return _rimraf = _interopRequireDefault(require('rimraf'));
}

var _temp;

function _load_temp() {
  return _temp = _interopRequireDefault(require('temp'));
}

var _process;

function _load_process() {
  return _process = require('./process');
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
    (_temp || _load_temp()).default.mkdir(prefix, function (err, result) {
      if (err == null) {
        resolve(result);
      } else {
        reject(err);
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
    (_temp || _load_temp()).default.open(options, function (err, info) {
      if (err) {
        reject(err);
      } else {
        (_fs || _load_fs()).default.close(info.fd, function (closeErr) {
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
  var commonDirectoryPath = (_commonsNodeNuclideUri || _load_commonsNodeNuclideUri()).default.dirname(filePaths[0]);
  while (filePaths.some(function (filePath) {
    return !filePath.startsWith(commonDirectoryPath);
  })) {
    commonDirectoryPath = (_commonsNodeNuclideUri || _load_commonsNodeNuclideUri()).default.dirname(commonDirectoryPath);
  }
  return commonDirectoryPath;
}

function exists(filePath) {
  return new Promise(function (resolve, reject) {
    (_fs || _load_fs()).default.exists(filePath, resolve);
  });
}function rmdir(filePath) {
  return new Promise(function (resolve, reject) {
    (0, (_rimraf || _load_rimraf()).default)(filePath, function (err, result) {
      if (err == null) {
        resolve(result);
      } else {
        reject(err);
      }
    });
  });
}

function glob(pattern, options) {
  return new Promise(function (resolve, reject) {
    (0, (_glob || _load_glob()).default)(pattern, options, function (err, result) {
      if (err == null) {
        resolve(result);
      } else {
        reject(err);
      }
    });
  });
}

function copy(source, dest) {
  return new Promise(function (resolve, reject) {
    (_fsPlus || _load_fsPlus()).default.copy(source, dest, function (err, result) {
      if (err == null) {
        resolve(result);
      } else {
        reject(err);
      }
    });
  });
}

function move(source, dest) {
  return new Promise(function (resolve, reject) {
    (_fsPlus || _load_fsPlus()).default.move(source, dest, function (err, result) {
      if (err == null) {
        resolve(result);
      } else {
        reject(err);
      }
    });
  });
}

/**
 * TODO: the fs-plus `writeFile` implementation runs `mkdirp` first.
 * We should use `fs.writeFile` and have callsites explicitly opt-in to this behaviour.
 */
function writeFile(filename, data, options) {
  return new Promise(function (resolve, reject) {
    (_fsPlus || _load_fsPlus()).default.writeFile(filename, data, options, function (err, result) {
      if (err == null) {
        resolve(result);
      } else {
        reject(err);
      }
    });
  });
}

/**
 * Promisified wrappers around fs functions.
 */

function chmod(path, mode) {
  return new Promise(function (resolve, reject) {
    (_fs || _load_fs()).default.chmod(path, mode, function (err, result) {
      if (err == null) {
        resolve(result);
      } else {
        reject(err);
      }
    });
  });
}

function lstat(path) {
  return new Promise(function (resolve, reject) {
    (_fs || _load_fs()).default.lstat(path, function (err, result) {
      if (err == null) {
        resolve(result);
      } else {
        reject(err);
      }
    });
  });
}

function mkdir(path, mode) {
  return new Promise(function (resolve, reject) {
    (_fs || _load_fs()).default.mkdir(path, mode, function (err, result) {
      if (err == null) {
        resolve(result);
      } else {
        reject(err);
      }
    });
  });
}

// `fs.readFile` returns a Buffer unless an encoding is specified.
// This workaround is adapted from the Flow declarations.

var readFile = function () {
  var _arguments = arguments;

  return new Promise(function (resolve, reject) {
    var _default;

    // $FlowIssue: spread operator doesn't preserve any-type
    (_default = (_fs || _load_fs()).default).readFile.apply(_default, _slice.call(_arguments).concat([function (err, result) {
      if (err == null) {
        resolve(result);
      } else {
        reject(err);
      }
    }]));
  });
};

function readdir(path) {
  return new Promise(function (resolve, reject) {
    (_fs || _load_fs()).default.readdir(path, function (err, result) {
      if (err == null) {
        resolve(result);
      } else {
        reject(err);
      }
    });
  });
}

function readlink(path) {
  return new Promise(function (resolve, reject) {
    (_fs || _load_fs()).default.readlink(path, function (err, result) {
      if (err == null) {
        resolve(result);
      } else {
        reject(err);
      }
    });
  });
}

function realpath(path, cache) {
  return new Promise(function (resolve, reject) {
    (_fs || _load_fs()).default.realpath(path, cache, function (err, result) {
      if (err == null) {
        resolve(result);
      } else {
        reject(err);
      }
    });
  });
}

function rename(oldPath, newPath) {
  return new Promise(function (resolve, reject) {
    (_fs || _load_fs()).default.rename(oldPath, newPath, function (err, result) {
      if (err == null) {
        resolve(result);
      } else {
        reject(err);
      }
    });
  });
}

function stat(path) {
  return new Promise(function (resolve, reject) {
    (_fs || _load_fs()).default.stat(path, function (err, result) {
      if (err == null) {
        resolve(result);
      } else {
        reject(err);
      }
    });
  });
}

function symlink(source, dest, type) {
  return new Promise(function (resolve, reject) {
    (_fs || _load_fs()).default.symlink(source, dest, type, function (err, result) {
      if (err == null) {
        resolve(result);
      } else {
        reject(err);
      }
    });
  });
}

function unlink(path) {
  return new Promise(function (resolve, reject) {
    (_fs || _load_fs()).default.unlink(path, function (err, result) {
      if (err == null) {
        resolve(result);
      } else {
        reject(err);
      }
    });
  });
}

exports.default = {
  tempdir: tempdir,
  tempfile: tempfile,
  findNearestFile: findNearestFile,
  findFurthestFile: findFurthestFile,
  getCommonAncestorDirectory: getCommonAncestorDirectory,
  exists: exists,
  mkdirp: mkdirp,
  rmdir: rmdir,
  isNfs: isNfs,
  glob: glob,
  isNonNfsDirectory: isNonNfsDirectory,

  copy: copy,
  move: move,
  writeFile: writeFile,

  chmod: chmod,
  lstat: lstat,
  mkdir: mkdir,
  readFile: readFile,
  readdir: readdir,
  readlink: readlink,
  realpath: realpath,
  rename: rename,
  stat: stat,
  symlink: symlink,
  unlink: unlink
};
module.exports = exports.default;