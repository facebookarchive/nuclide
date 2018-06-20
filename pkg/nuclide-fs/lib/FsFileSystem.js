'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.FsFileSystem = undefined;

var _fs = _interopRequireDefault(require('fs'));

var _collection;

function _load_collection() {
  return _collection = require('../../../modules/nuclide-commons/collection');
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../../modules/nuclide-commons/nuclideUri'));
}

var _fsPromise;

function _load_fsPromise() {
  return _fsPromise = _interopRequireDefault(require('../../../modules/nuclide-commons/fsPromise'));
}

var _process;

function _load_process() {
  return _process = require('../../../modules/nuclide-commons/process');
}

var _stream;

function _load_stream() {
  return _stream = require('../../../modules/nuclide-commons/stream');
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _admZip;

function _load_admZip() {
  return _admZip = _interopRequireDefault(require('adm-zip'));
}

var _FileSystem;

function _load_FileSystem() {
  return _FileSystem = require('./FileSystem');
}

var _ZipFileSystem;

function _load_ZipFileSystem() {
  return _ZipFileSystem = require('./ZipFileSystem');
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
    return (_fsPromise || _load_fsPromise()).default.exists(path);
  }

  findNearestFile(name, directory) {
    return (_fsPromise || _load_fsPromise()).default.findNearestFile(name, directory);
  }

  findInDirectories(name, directories) {
    if (directories.length === 0) {
      return _rxjsBundlesRxMinJs.Observable.throw(new Error('No directories to search in!')).publish();
    }
    const findArgs = [...directories, '-type', 'f', '-name', name];
    return (0, (_process || _load_process()).runCommand)('find', findArgs).map(stdout => stdout.split('\n').filter(filePath => filePath !== '')).publish();
  }

  stat(path) {
    return (_fsPromise || _load_fsPromise()).default.stat(path);
  }

  lstat(path) {
    return (_fsPromise || _load_fsPromise()).default.lstat(path);
  }

  mkdir(path) {
    return (_fsPromise || _load_fsPromise()).default.mkdir(path);
  }

  mkdirp(path) {
    return (_fsPromise || _load_fsPromise()).default.mkdirp(path);
  }

  chmod(path, mode) {
    return (_fsPromise || _load_fsPromise()).default.chmod(path, mode);
  }

  chown(path, uid, gid) {
    return (_fsPromise || _load_fsPromise()).default.chown(path, uid, gid);
  }

  async newFile(filePath) {
    const isExistingFile = await (_fsPromise || _load_fsPromise()).default.exists(filePath);
    if (isExistingFile) {
      return false;
    }
    await (_fsPromise || _load_fsPromise()).default.mkdirp((_nuclideUri || _load_nuclideUri()).default.dirname(filePath));
    await (_fsPromise || _load_fsPromise()).default.writeFile(filePath, '');
    return true;
  }

  async readdir(path) {
    const files = await (_fsPromise || _load_fsPromise()).default.readdir(path);
    const entries = await Promise.all(files.map(async file => {
      const fullpath = (_nuclideUri || _load_nuclideUri()).default.join(path, file);
      const lstats = await (_fsPromise || _load_fsPromise()).default.lstat(fullpath);
      if (!lstats.isSymbolicLink()) {
        return { file, stats: lstats, isSymbolicLink: false };
      } else {
        try {
          const stats = await (_fsPromise || _load_fsPromise()).default.stat(fullpath);
          return { file, stats, isSymbolicLink: true };
        } catch (error) {
          return null;
        }
      }
    }));
    // TODO: Return entries directly and change client to handle error.
    // $FlowFixMe
    return (0, (_collection || _load_collection()).arrayCompact)(entries).map(entry => {
      return [entry.file, entry.stats.isFile(), entry.isSymbolicLink];
    });
  }

  realpath(path) {
    return (_fsPromise || _load_fsPromise()).default.realpath(path);
  }

  move(sourcePath, destinationPath) {
    return (_fsPromise || _load_fsPromise()).default.mv(sourcePath, destinationPath, {
      mkdirp: true,
      clobber: false
    });
  }

  copy(sourcePath, destinationPath) {
    return (_fsPromise || _load_fsPromise()).default.copy(sourcePath, destinationPath);
  }

  rimraf(path) {
    return (_fsPromise || _load_fsPromise()).default.rimraf(path);
  }

  unlink(path) {
    return (_fsPromise || _load_fsPromise()).default.unlink(path).catch(error => {
      if (error.code !== 'ENOENT') {
        throw error;
      }
    });
  }

  async readFile(path, options) {
    const stats = await (_fsPromise || _load_fsPromise()).default.stat(path);
    if (stats.size > (_FileSystem || _load_FileSystem()).READFILE_SIZE_LIMIT) {
      throw new Error(`File is too large (${stats.size} bytes)`);
    }
    return (_fsPromise || _load_fsPromise()).default.readFile(path, options);
  }

  createReadStream(path, options) {
    return (0, (_stream || _load_stream()).observeRawStream)(_fs.default.createReadStream(path, options)).publish();
  }

  writeFile(path, data, options) {
    return (_fsPromise || _load_fsPromise()).default.writeFile(path, data, options);
  }

  isNfs(path) {
    return (_fsPromise || _load_fsPromise()).default.isNfs(path);
  }

  isFuse(path) {
    return (_fsPromise || _load_fsPromise()).default.isFuse(path);
  }

  async openArchive(path) {
    const [buffer, stat, lstat] = await Promise.all([(_fsPromise || _load_fsPromise()).default.readFile(path), this.stat(path), this.lstat(path)]);
    return new (_ZipFileSystem || _load_ZipFileSystem()).ZipFileSystem(new (_admZip || _load_admZip()).default(buffer), stat, lstat);
  }
}
exports.FsFileSystem = FsFileSystem;