"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.FsFileSystem = void 0;

var _fs = _interopRequireDefault(require("fs"));

function _collection() {
  const data = require("../../../modules/nuclide-commons/collection");

  _collection = function () {
    return data;
  };

  return data;
}

function _nuclideUri() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/nuclideUri"));

  _nuclideUri = function () {
    return data;
  };

  return data;
}

function _fsPromise() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/fsPromise"));

  _fsPromise = function () {
    return data;
  };

  return data;
}

function _process() {
  const data = require("../../../modules/nuclide-commons/process");

  _process = function () {
    return data;
  };

  return data;
}

function _stream() {
  const data = require("../../../modules/nuclide-commons/stream");

  _stream = function () {
    return data;
  };

  return data;
}

var _RxMin = require("rxjs/bundles/Rx.min.js");

function _admZip() {
  const data = _interopRequireDefault(require("adm-zip"));

  _admZip = function () {
    return data;
  };

  return data;
}

function _FileSystem() {
  const data = require("./FileSystem");

  _FileSystem = function () {
    return data;
  };

  return data;
}

function _ZipFileSystem() {
  const data = require("./ZipFileSystem");

  _ZipFileSystem = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 *  strict-local
 * @format
 */

/**
 * This code implements the NuclideFs service.  It exports the FS on http via
 * the endpoint: http://your.server:your_port/fs/method where method is one of
 * readFile, writeFile, etc.
 */
class FsFileSystem {
  exists(path) {
    return _fsPromise().default.exists(path);
  }

  findNearestFile(name, directory) {
    return _fsPromise().default.findNearestFile(name, directory);
  }

  findInDirectories(name, directories) {
    if (directories.length === 0) {
      return _RxMin.Observable.throw(new Error('No directories to search in!')).publish();
    }

    const findArgs = [...directories, '-type', 'f', '-name', name];
    return (0, _process().runCommand)('find', findArgs).map(stdout => stdout.split('\n').filter(filePath => filePath !== '')).publish();
  }

  stat(path) {
    return _fsPromise().default.stat(path);
  }

  lstat(path) {
    return _fsPromise().default.lstat(path);
  }

  mkdir(path) {
    return _fsPromise().default.mkdir(path);
  }

  mkdirp(path) {
    return _fsPromise().default.mkdirp(path);
  }

  chmod(path, mode) {
    return _fsPromise().default.chmod(path, mode);
  }

  chown(path, uid, gid) {
    return _fsPromise().default.chown(path, uid, gid);
  }

  async newFile(filePath) {
    const isExistingFile = await _fsPromise().default.exists(filePath);

    if (isExistingFile) {
      return false;
    }

    await _fsPromise().default.mkdirp(_nuclideUri().default.dirname(filePath));
    await _fsPromise().default.writeFile(filePath, '');
    return true;
  }

  async readdir(path) {
    const files = await _fsPromise().default.readdir(path);
    const entries = await Promise.all(files.map(async file => {
      const fullpath = _nuclideUri().default.join(path, file);

      const lstats = await _fsPromise().default.lstat(fullpath);

      if (!lstats.isSymbolicLink()) {
        return {
          file,
          stats: lstats,
          isSymbolicLink: false
        };
      } else {
        try {
          const stats = await _fsPromise().default.stat(fullpath);
          return {
            file,
            stats,
            isSymbolicLink: true
          };
        } catch (error) {
          return null;
        }
      }
    })); // TODO: Return entries directly and change client to handle error.

    return (0, _collection().arrayCompact)(entries).map(entry => {
      return [entry.file, entry.stats.isFile(), entry.isSymbolicLink];
    });
  }

  realpath(path) {
    return _fsPromise().default.realpath(path);
  }

  move(sourcePath, destinationPath) {
    return _fsPromise().default.mv(sourcePath, destinationPath, {
      mkdirp: true,
      clobber: false
    });
  }

  copy(sourcePath, destinationPath) {
    return _fsPromise().default.copy(sourcePath, destinationPath);
  }

  symlink(source, target, type) {
    return _fsPromise().default.symlink(source, target, type);
  }

  rimraf(path) {
    return _fsPromise().default.rimraf(path);
  }

  unlink(path) {
    return _fsPromise().default.unlink(path).catch(error => {
      if (error.code !== 'ENOENT') {
        throw error;
      }
    });
  }

  async readFile(path, options) {
    const stats = await _fsPromise().default.stat(path);

    if (stats.size > _FileSystem().READFILE_SIZE_LIMIT) {
      throw new Error(`File is too large (${stats.size} bytes)`);
    }

    return _fsPromise().default.readFile(path, options);
  }

  createReadStream(path, options) {
    return (0, _stream().observeRawStream)(_fs.default.createReadStream(path, options)).publish();
  }

  writeFile(path, data, options) {
    return _fsPromise().default.writeFile(path, data, options);
  }

  isNfs(path) {
    return _fsPromise().default.isNfs(path);
  }

  isFuse(path) {
    return _fsPromise().default.isFuse(path);
  }

  async openArchive(path) {
    const [buffer, stat, lstat] = await Promise.all([_fsPromise().default.readFile(path), this.stat(path), this.lstat(path)]);
    return new (_ZipFileSystem().ZipFileSystem)(new (_admZip().default)(buffer), stat, lstat);
  }

}

exports.FsFileSystem = FsFileSystem;