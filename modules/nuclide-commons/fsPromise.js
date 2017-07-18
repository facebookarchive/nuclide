'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

/**
 * Searches upward through the filesystem from pathToDirectory to find a file with
 * fileName.
 * @param fileName The name of the file to find.
 * @param pathToDirectory Where to begin the search. Must be a path to a directory,
 *   not a file.
 * @return directory that contains the nearest file or null.
 */
let findNearestFile = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* (fileName, pathToDirectory) {
    // TODO(5586355): If this becomes a bottleneck, we should consider memoizing
    // this function. The downside would be that if someone added a closer file
    // with fileName to pathToFile (or deleted the one that was cached), then we
    // would have a bug. This would probably be pretty rare, though.
    let currentPath = (_nuclideUri || _load_nuclideUri()).default.resolve(pathToDirectory);
    for (;;) {
      const fileToFind = (_nuclideUri || _load_nuclideUri()).default.join(currentPath, fileName);
      // eslint-disable-next-line no-await-in-loop
      const hasFile = yield exists(fileToFind);
      if (hasFile) {
        return currentPath;
      }
      if ((_nuclideUri || _load_nuclideUri()).default.isRoot(currentPath)) {
        return null;
      }
      currentPath = (_nuclideUri || _load_nuclideUri()).default.dirname(currentPath);
    }
  });

  return function findNearestFile(_x, _x2) {
    return _ref.apply(this, arguments);
  };
})();

/**
 * Searches upward through the filesystem from pathToDirectory to find the furthest
 * file with fileName.
 * @param fileName The name of the file to find.
 * @param pathToDirectory Where to begin the search. Must be a path to a directory,
 *   not a file.
 * @param stopOnMissing Stop searching when we reach a directory without fileName.
 * @return directory that contains the furthest file or null.
 */


let findFurthestFile = (() => {
  var _ref2 = (0, _asyncToGenerator.default)(function* (fileName, pathToDirectory, stopOnMissing = false) {
    let currentPath = (_nuclideUri || _load_nuclideUri()).default.resolve(pathToDirectory);
    let result = null;
    for (;;) {
      const fileToFind = (_nuclideUri || _load_nuclideUri()).default.join(currentPath, fileName);
      // eslint-disable-next-line no-await-in-loop
      const hasFile = yield exists(fileToFind);
      if (!hasFile && stopOnMissing || (_nuclideUri || _load_nuclideUri()).default.isRoot(currentPath)) {
        return result;
      } else if (hasFile) {
        result = currentPath;
      }
      currentPath = (_nuclideUri || _load_nuclideUri()).default.dirname(currentPath);
    }
  });

  return function findFurthestFile(_x3, _x4) {
    return _ref2.apply(this, arguments);
  };
})();

/**
 * Runs the equivalent of `mkdir -p` with the given path.
 *
 * Like most implementations of mkdirp, if it fails, it is possible that
 * directories were created for some prefix of the given path.
 * @return true if the path was created; false if it already existed.
 */
let mkdirp = (() => {
  var _ref3 = (0, _asyncToGenerator.default)(function* (filePath) {
    const isExistingDirectory = yield exists(filePath);
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
  });

  return function mkdirp(_x5) {
    return _ref3.apply(this, arguments);
  };
})();

/**
 * Removes directories even if they are non-empty. Does not fail if the directory doesn't exist.
 */


/** @return true only if we are sure directoryPath is on NFS. */
let isNfs = (() => {
  var _ref4 = (0, _asyncToGenerator.default)(function* (entityPath) {
    if (process.platform === 'linux' || process.platform === 'darwin') {
      try {
        const stdout = yield (0, (_process || _load_process()).runCommand)('stat', ['-f', '-L', '-c', '%T', entityPath]).toPromise();
        return stdout.trim() === 'nfs';
      } catch (err) {
        return false;
      }
    } else {
      // TODO Handle other platforms (windows?): t9917576.
      return false;
    }
  });

  return function isNfs(_x6) {
    return _ref4.apply(this, arguments);
  };
})();

let isNonNfsDirectory = (() => {
  var _ref5 = (0, _asyncToGenerator.default)(function* (directoryPath) {
    try {
      const stats = yield stat(directoryPath);
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
  });

  return function isNonNfsDirectory(_x7) {
    return _ref5.apply(this, arguments);
  };
})();

/**
 * Promisified wrappers around fs-plus functions.
 */

var _fs = _interopRequireDefault(require('fs'));

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

var _rimraf;

function _load_rimraf() {
  return _rimraf = _interopRequireDefault(require('rimraf'));
}

var _temp;

function _load_temp() {
  return _temp = _interopRequireDefault(require('temp'));
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('./nuclideUri'));
}

var _process;

function _load_process() {
  return _process = require('./process');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Create a temp directory with given prefix. The caller is responsible for cleaning up the
 *   drectory.
 * @param prefix optinal prefix for the temp directory name.
 * @return path to a temporary directory.
 */
/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * 
 * @format
 */

function tempdir(prefix = '') {
  return new Promise((resolve, reject) => {
    (_temp || _load_temp()).default.mkdir(prefix, (err, result) => {
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
  return new Promise((resolve, reject) => {
    (_temp || _load_temp()).default.open(options, (err, info) => {
      if (err) {
        reject(err);
      } else {
        _fs.default.close(info.fd, closeErr => {
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
  let commonDirectoryPath = (_nuclideUri || _load_nuclideUri()).default.dirname(filePaths[0]);
  while (filePaths.some(filePath => !filePath.startsWith(commonDirectoryPath))) {
    commonDirectoryPath = (_nuclideUri || _load_nuclideUri()).default.dirname(commonDirectoryPath);
  }
  return commonDirectoryPath;
}

function exists(filePath) {
  return new Promise((resolve, reject) => {
    _fs.default.exists(filePath, resolve);
  });
}function rmdir(filePath) {
  return new Promise((resolve, reject) => {
    (0, (_rimraf || _load_rimraf()).default)(filePath, (err, result) => {
      if (err == null) {
        resolve(result);
      } else {
        reject(err);
      }
    });
  });
}

function glob(pattern, options) {
  return new Promise((resolve, reject) => {
    (0, (_glob || _load_glob()).default)(pattern, options, (err, result) => {
      if (err == null) {
        resolve(result);
      } else {
        reject(err);
      }
    });
  });
}

function copy(source, dest) {
  return new Promise((resolve, reject) => {
    (_fsPlus || _load_fsPlus()).default.copy(source, dest, (err, result) => {
      if (err == null) {
        resolve(result);
      } else {
        reject(err);
      }
    });
  });
}

function move(source, dest) {
  return new Promise((resolve, reject) => {
    (_fsPlus || _load_fsPlus()).default.move(source, dest, (err, result) => {
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
  return new Promise((resolve, reject) => {
    (_fsPlus || _load_fsPlus()).default.writeFile(filename, data, options, (err, result) => {
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
  return new Promise((resolve, reject) => {
    _fs.default.chmod(path, mode, (err, result) => {
      if (err == null) {
        resolve(result);
      } else {
        reject(err);
      }
    });
  });
}

function chown(path, uid, gid) {
  return new Promise((resolve, reject) => {
    _fs.default.chown(path, uid, gid, (err, result) => {
      if (err == null) {
        resolve(result);
      } else {
        reject(err);
      }
    });
  });
}

function lstat(path) {
  return new Promise((resolve, reject) => {
    _fs.default.lstat(path, (err, result) => {
      if (err == null) {
        resolve(result);
      } else {
        reject(err);
      }
    });
  });
}

function mkdir(path, mode) {
  return new Promise((resolve, reject) => {
    _fs.default.mkdir(path, mode, (err, result) => {
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


const readFile = function (...args) {
  return new Promise((resolve, reject) => {
    // $FlowIssue: spread operator doesn't preserve any-type
    _fs.default.readFile(...args, (err, result) => {
      if (err == null) {
        resolve(result);
      } else {
        reject(err);
      }
    });
  });
};

function readdir(path) {
  return new Promise((resolve, reject) => {
    _fs.default.readdir(path, (err, result) => {
      if (err == null) {
        resolve(result);
      } else {
        reject(err);
      }
    });
  });
}

function readlink(path) {
  return new Promise((resolve, reject) => {
    _fs.default.readlink(path, (err, result) => {
      if (err == null) {
        resolve(result);
      } else {
        reject(err);
      }
    });
  });
}

function realpath(path, cache) {
  return new Promise((resolve, reject) => {
    _fs.default.realpath(path, cache, (err, result) => {
      if (err == null) {
        resolve(result);
      } else {
        reject(err);
      }
    });
  });
}

function rename(oldPath, newPath) {
  return new Promise((resolve, reject) => {
    _fs.default.rename(oldPath, newPath, (err, result) => {
      if (err == null) {
        resolve(result);
      } else {
        reject(err);
      }
    });
  });
}

function stat(path) {
  return new Promise((resolve, reject) => {
    _fs.default.stat(path, (err, result) => {
      if (err == null) {
        resolve(result);
      } else {
        reject(err);
      }
    });
  });
}

function symlink(source, dest, type) {
  return new Promise((resolve, reject) => {
    _fs.default.symlink(source, dest, type, (err, result) => {
      if (err == null) {
        resolve(result);
      } else {
        reject(err);
      }
    });
  });
}

function unlink(path) {
  return new Promise((resolve, reject) => {
    _fs.default.unlink(path, (err, result) => {
      if (err == null) {
        resolve(result);
      } else {
        reject(err);
      }
    });
  });
}

exports.default = {
  tempdir,
  tempfile,
  findNearestFile,
  findFurthestFile,
  getCommonAncestorDirectory,
  exists,
  mkdirp,
  rmdir,
  isNfs,
  glob,
  isNonNfsDirectory,

  copy,
  move,
  writeFile,

  chmod,
  chown,
  lstat,
  mkdir,
  readFile,
  readdir,
  readlink,
  realpath,
  rename,
  stat,
  symlink,
  unlink
};