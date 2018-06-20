'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

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

var _mv;

function _load_mv() {
  return _mv = _interopRequireDefault(require('mv'));
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

/**
 * Searches upward through the filesystem from pathToDirectory to find a file with
 * fileName.
 * @param fileName The name of the file to find.
 * @param pathToDirectory Where to begin the search. Must be a path to a directory,
 *   not a file.
 * @return directory that contains the nearest file or null.
 */
async function findNearestFile(fileName, pathToDirectory) {
  // TODO(5586355): If this becomes a bottleneck, we should consider memoizing
  // this function. The downside would be that if someone added a closer file
  // with fileName to pathToFile (or deleted the one that was cached), then we
  // would have a bug. This would probably be pretty rare, though.
  let currentPath = (_nuclideUri || _load_nuclideUri()).default.resolve(pathToDirectory);
  for (;;) {
    const fileToFind = (_nuclideUri || _load_nuclideUri()).default.join(currentPath, fileName);
    // eslint-disable-next-line no-await-in-loop
    const hasFile = await exists(fileToFind);
    if (hasFile) {
      return currentPath;
    }
    if ((_nuclideUri || _load_nuclideUri()).default.isRoot(currentPath)) {
      return null;
    }
    currentPath = (_nuclideUri || _load_nuclideUri()).default.dirname(currentPath);
  }
}

async function findNearestAncestorNamed(fileName, pathToDirectory) {
  const directory = await findNearestFile(fileName, pathToDirectory);
  if (directory != null) {
    return (_nuclideUri || _load_nuclideUri()).default.join(directory, fileName);
  } else {
    return null;
  }
}

function resolveRealPath(path) {
  return realpath((_nuclideUri || _load_nuclideUri()).default.expandHomeDir(path));
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
async function findFurthestFile(fileName, pathToDirectory, stopOnMissing = false) {
  let currentPath = (_nuclideUri || _load_nuclideUri()).default.resolve(pathToDirectory);
  let result = null;
  for (;;) {
    const fileToFind = (_nuclideUri || _load_nuclideUri()).default.join(currentPath, fileName);
    // eslint-disable-next-line no-await-in-loop
    const hasFile = await exists(fileToFind);
    if (!hasFile && stopOnMissing || (_nuclideUri || _load_nuclideUri()).default.isRoot(currentPath)) {
      return result;
    } else if (hasFile) {
      result = currentPath;
    }
    currentPath = (_nuclideUri || _load_nuclideUri()).default.dirname(currentPath);
  }
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
}

/**
 * Runs the equivalent of `mkdir -p` with the given path.
 *
 * Like most implementations of mkdirp, if it fails, it is possible that
 * directories were created for some prefix of the given path.
 * @return true if the path was created; false if it already existed.
 */
async function mkdirp(filePath) {
  const isExistingDirectory = await exists(filePath);
  if (isExistingDirectory) {
    return false;
  } else {
    return new Promise((resolve, reject) => {
      (0, (_mkdirp || _load_mkdirp()).default)(filePath, err => {
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
function rimrafWrapper(filePath) {
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

async function getFileSystemType(entityPath) {
  if (process.platform === 'linux' || process.platform === 'darwin') {
    try {
      const stdout = await (0, (_process || _load_process()).runCommand)('stat', ['-f', '-L', '-c', '%T', entityPath]).toPromise();
      return stdout.trim();
    } catch (err) {
      return null;
    }
  } else {
    // TODO Handle other platforms (windows?)
    return null;
  }
}

/** @return true only if we are sure entityPath is on NFS. */
async function isNfs(entityPath) {
  return (await getFileSystemType(entityPath)) === 'nfs';
}

/** @return true only if we are sure entityPath is on a Fuse filesystem like
            dewey or gvfs.
*/
async function isFuse(entityPath) {
  return (await getFileSystemType(entityPath)) === 'fuseblk';
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

async function isNonNfsDirectory(directoryPath) {
  try {
    const stats = await stat(directoryPath);
    if (stats.isDirectory()) {
      return !(await isNfs(directoryPath));
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

async function copyFilePermissions(sourcePath, destinationPath) {
  try {
    const { mode, uid, gid } = await stat(sourcePath);
    await Promise.all([
    // The user may not have permissions to use the uid/gid.
    chown(destinationPath, uid, gid).catch(() => {}), chmod(destinationPath, mode)]);
  } catch (e) {
    // If the file does not exist, then ENOENT will be thrown.
    if (e.code !== 'ENOENT') {
      throw e;
    }
    // For new files, use the default process file creation mask.
    await chmod(destinationPath, 0o666 & ~process.umask() // eslint-disable-line no-bitwise
    );
  }
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

async function writeFileAtomic(path, data, options) {
  const tempFilePath = await tempfile('nuclide');
  try {
    await writeFile(tempFilePath, data, options);

    // Expand the target path in case it contains symlinks.
    let realPath = path;
    try {
      realPath = await realpath(path);
    } catch (e) {}
    // Fallback to using the specified path if it cannot be expanded.
    // Note: this is expected in cases where the remote file does not
    // actually exist.


    // Ensure file still has original permissions:
    // https://github.com/facebook/nuclide/issues/157
    // We update the mode of the temp file rather than the destination file because
    // if we did the mv() then the chmod(), there would be a brief period between
    // those two operations where the destination file might have the wrong permissions.
    await copyFilePermissions(realPath, tempFilePath);

    // TODO: put renames into a queue so we don't write older save over new save.
    // Use mv as fs.rename doesn't work across partitions.
    await mv(tempFilePath, realPath, { mkdirp: true });
  } catch (err) {
    await unlink(tempFilePath);
    throw err;
  }
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

function close(fd) {
  return new Promise((resolve, reject) => {
    _fs.default.close(fd, err => {
      if (err == null) {
        resolve();
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

/**
 * The key difference between 'mv' and 'rename' is that 'mv' works across devices.
 * It's not uncommon to have temporary files in a different disk, for instance.
 */
function mv(sourcePath, destinationPath, options = {}) {
  return new Promise((resolve, reject) => {
    (0, (_mv || _load_mv()).default)(sourcePath, destinationPath, options, error => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });
}

function open(path, flags, mode = 0o666) {
  return new Promise((resolve, reject) => {
    _fs.default.open(path, flags, mode, (err, fd) => {
      if (err == null) {
        resolve(fd);
      } else {
        reject(err);
      }
    });
  });
}

function read(fd, buffer, offset, length, position) {
  return new Promise((resolve, reject) => {
    _fs.default.read(fd, buffer, offset, length, position, (err, bytesRead) => {
      if (err == null) {
        resolve(bytesRead);
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

function access(path, mode) {
  return new Promise((resolve, reject) => {
    _fs.default.access(path, mode, err => {
      if (err == null) {
        resolve(true);
      } else {
        resolve(false);
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

/**
 * A utility function to grab the last N bytes from a file. Attempts to do so
 * without reading the entire file.
 */
async function tailBytes(file, maxBytes) {
  if (maxBytes <= 0) {
    throw new Error('tailbytes expects maxBytes > 0');
  }

  // Figure out the size so we know what strategy to use
  const { size: file_size } = await stat(file);

  if (file_size > maxBytes) {
    const fd = await open(file, 'r');
    const buffer = Buffer.alloc(maxBytes);
    const bytesRead = await read(fd, buffer, 0, // buffer offset
    maxBytes, // length to read
    file_size - maxBytes // file offset
    );
    await close(fd);

    /* If we meant to read the last 100 bytes but only read 50 bytes, then we've
     * failed to read the last 100 bytes. So throw. In the future, someone
     * could update this code to keep calling `read` until we read maxBytes.
     */
    if (bytesRead !== maxBytes) {
      throw new Error(`Failed to tail file. Intended to read ${maxBytes} bytes but ` + `only read ${bytesRead} bytes`);
    }
    return buffer;
  } else {
    return readFile(file);
  }
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

function utimes(path, atime, mtime) {
  return new Promise((resolve, reject) => {
    _fs.default.utimes(path, atime, mtime, err => {
      if (err == null) {
        resolve();
      } else {
        reject(err);
      }
    });
  });
}

function rmdir(path) {
  return new Promise((resolve, reject) => {
    _fs.default.rmdir(path, err => {
      if (err == null) {
        resolve();
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
  rimraf: rimrafWrapper,
  isNfs,
  isFuse,
  glob,
  isNonNfsDirectory,

  copy,
  copyFilePermissions,
  writeFile,
  writeFileAtomic,

  chmod,
  chown,
  close,
  lstat,
  mkdir,
  mv,
  open,
  read,
  readFile,
  readdir,
  readlink,
  realpath,
  stat,
  symlink,
  tailBytes,
  unlink,
  utimes,
  rmdir,
  access,

  findNearestAncestorNamed,
  resolveRealPath
};