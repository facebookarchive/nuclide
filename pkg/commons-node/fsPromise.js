Object.defineProperty(exports, '__esModule', {
  value: true
});

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
  var currentPath = (_commonsNodeNuclideUri2 || _commonsNodeNuclideUri()).default.resolve(pathToDirectory);
  for (;;) {
    var fileToFind = (_commonsNodeNuclideUri2 || _commonsNodeNuclideUri()).default.join(currentPath, fileName);
    // eslint-disable-next-line babel/no-await-in-loop
    var hasFile = yield exists(fileToFind);
    if (hasFile) {
      return currentPath;
    }
    if ((_commonsNodeNuclideUri2 || _commonsNodeNuclideUri()).default.isRoot(currentPath)) {
      return null;
    }
    currentPath = (_commonsNodeNuclideUri2 || _commonsNodeNuclideUri()).default.dirname(currentPath);
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

  var currentPath = (_commonsNodeNuclideUri2 || _commonsNodeNuclideUri()).default.resolve(pathToDirectory);
  var result = null;
  for (;;) {
    var fileToFind = (_commonsNodeNuclideUri2 || _commonsNodeNuclideUri()).default.join(currentPath, fileName);
    // eslint-disable-next-line babel/no-await-in-loop
    var hasFile = yield exists(fileToFind);
    if (!hasFile && stopOnMissing || (_commonsNodeNuclideUri2 || _commonsNodeNuclideUri()).default.isRoot(currentPath)) {
      return result;
    } else if (hasFile) {
      result = currentPath;
    }
    currentPath = (_commonsNodeNuclideUri2 || _commonsNodeNuclideUri()).default.dirname(currentPath);
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
      (0, (_mkdirp2 || _mkdirp()).default)(filePath, function (err) {
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
    var _ref = yield (0, (_process2 || _process()).asyncExecute)('stat', ['-f', '-L', '-c', '%T', entityPath]);

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

var glob = _asyncToGenerator(function* (pattern, options) {
  return yield new Promise(function (resolve, reject) {
    (0, (_glob2 || _glob()).default)(pattern, options, function (err, files) {
      if (err) {
        reject(err);
      } else {
        resolve(files);
      }
    });
  });
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
 * Takes a method from Node's fs module and returns a "denodeified" equivalent, i.e., an adapter
 * with the same functionality, but returns a Promise rather than taking a callback. This isn't
 * quite as efficient as Q's implementation of denodeify, but it's considerably less code.
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

var _fsPlus2;

function _fsPlus() {
  return _fsPlus2 = _interopRequireDefault(require('fs-plus'));
}

var _glob2;

function _glob() {
  return _glob2 = _interopRequireDefault(require('glob'));
}

var _mkdirp2;

function _mkdirp() {
  return _mkdirp2 = _interopRequireDefault(require('mkdirp'));
}

var _commonsNodeNuclideUri2;

function _commonsNodeNuclideUri() {
  return _commonsNodeNuclideUri2 = _interopRequireDefault(require('../commons-node/nuclideUri'));
}

var _rimraf2;

function _rimraf() {
  return _rimraf2 = _interopRequireDefault(require('rimraf'));
}

var _temp2;

function _temp() {
  return _temp2 = _interopRequireDefault(require('temp'));
}

var _process2;

function _process() {
  return _process2 = require('./process');
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
    (_temp2 || _temp()).default.mkdir(prefix, function (err, dirPath) {
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
    (_temp2 || _temp()).default.open(options, function (err, info) {
      if (err) {
        reject(err);
      } else {
        (_fsPlus2 || _fsPlus()).default.close(info.fd, function (closeErr) {
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
  var commonDirectoryPath = (_commonsNodeNuclideUri2 || _commonsNodeNuclideUri()).default.dirname(filePaths[0]);
  while (filePaths.some(function (filePath) {
    return !filePath.startsWith(commonDirectoryPath);
  })) {
    commonDirectoryPath = (_commonsNodeNuclideUri2 || _commonsNodeNuclideUri()).default.dirname(commonDirectoryPath);
  }
  return commonDirectoryPath;
}

function exists(filePath) {
  return new Promise(function (resolve, reject) {
    (_fsPlus2 || _fsPlus()).default.exists(filePath, resolve);
  });
}function rmdir(filePath) {
  return new Promise(function (resolve, reject) {
    (0, (_rimraf2 || _rimraf()).default)(filePath, function (err) {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}function _denodeifyFsMethod(methodName) {
  return function () {
    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    var method = (_fsPlus2 || _fsPlus()).default[methodName];
    return new Promise(function (resolve, reject) {
      method.apply((_fsPlus2 || _fsPlus()).default, args.concat([function (err, result) {
        return err ? reject(err) : resolve(result);
      }]));
    });
  };
}

var stat = _denodeifyFsMethod('stat');

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

  copy: _denodeifyFsMethod('copy'),
  chmod: _denodeifyFsMethod('chmod'),
  lstat: _denodeifyFsMethod('lstat'),
  mkdir: _denodeifyFsMethod('mkdir'),
  readdir: _denodeifyFsMethod('readdir'),
  readFile: _denodeifyFsMethod('readFile'),
  readlink: _denodeifyFsMethod('readlink'),
  realpath: _denodeifyFsMethod('realpath'),
  rename: _denodeifyFsMethod('rename'),
  move: _denodeifyFsMethod('move'),
  stat: stat,
  symlink: _denodeifyFsMethod('symlink'),
  unlink: _denodeifyFsMethod('unlink'),
  writeFile: _denodeifyFsMethod('writeFile')
};
module.exports = exports.default;