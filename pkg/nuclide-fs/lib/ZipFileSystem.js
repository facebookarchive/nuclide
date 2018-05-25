'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ZipFileSystem = undefined;
exports.rejectWrite = rejectWrite;
exports.rejectWriteSync = rejectWriteSync;

var _fs = _interopRequireDefault(require('fs'));

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../../modules/nuclide-commons/nuclideUri'));
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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// adm-zip assumes '/' as the separator on all platforms
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

const ZIP_SEPARATOR = '/';

class ZipFileSystem {

  constructor(zip, outerStat, outerLStat) {
    this._zip = zip;
    this._outerStat = outerStat;
    this._outerLStat = outerLStat;
  }

  getFileOrDirectoryEntry(path) {
    const slashPath = slash(path);
    const file = this._zip.getEntry(slashPath);
    if (file != null) {
      return file;
    }
    return this._zip.getEntry(`${slashPath}${ZIP_SEPARATOR}`);
  }

  async exists(path) {
    return this.getFileOrDirectoryEntry(path) != null;
  }

  async findNearestFile(name, directory) {
    let check = directory;
    while (check !== '') {
      // eslint-disable-next-line no-await-in-loop
      if (await this.exists((_nuclideUri || _load_nuclideUri()).default.join(check, name))) {
        return check;
      }
      check = (_nuclideUri || _load_nuclideUri()).default.getParent(check);
    }
    if (await this.exists(name)) {
      return '';
    }
  }

  async stat(path) {
    const lstat = await this.lstat(path);
    if (!lstat.isSymbolicLink()) {
      return lstat;
    }

    const entry = this.getFileOrDirectoryEntry(path);
    if (entry == null) {
      throw new Error(`No such file or directory: '${path}'`);
    }
    const newpath = (_nuclideUri || _load_nuclideUri()).default.normalize((_nuclideUri || _load_nuclideUri()).default.join((_nuclideUri || _load_nuclideUri()).default.getParent(path), entry.getData().toString()));
    return this.lstat(newpath);
  }

  async lstat(path) {
    const entry = this.getFileOrDirectoryEntry(path);
    if (entry == null) {
      throw new Error(`No such file or directory: '${path}'`);
    }
    return makeZipStats(this._outerLStat, entry);
  }

  readdir(path) {
    return Promise.all(this._zip.getEntries().filter(entry => isImmediateChild(slash(path), entry.entryName)).map(entry => directoryEntryFromZipEntry(this, entry)));
  }

  async realpath(path) {
    return path; // TODO: do we ever have symlinks in .jar files?
  }

  async readFile(path, options) {
    return new Promise((resolve, reject) => {
      const entry = this._zip.getEntry(slash(path));
      if (entry.header.size === 0) {
        resolve(new Buffer(0));
      } else if (entry.header.size > (_FileSystem || _load_FileSystem()).READFILE_SIZE_LIMIT) {
        reject(new Error(`File is too large (${entry.header.size} bytes)`));
      } else {
        entry.getDataAsync((data, err) => {
          if (err != null) {
            reject(err);
          } else {
            resolve(data);
          }
        });
      }
    });
  }

  createReadStream(path, options) {
    return _rxjsBundlesRxMinJs.Observable.defer(() => _rxjsBundlesRxMinJs.Observable.fromPromise(this.readFile(path, options))).publish();
  }

  async isNfs(path) {
    return false;
  }

  async isFuse(path) {
    return false;
  }

  async openArchive(path) {
    const buffer = await this.readFile(path);
    return new ZipFileSystem(buffer, this._outerStat, this._outerLStat);
  }

  mkdir(path) {
    return rejectWrite();
  }

  mkdirp(path) {
    return rejectWrite();
  }

  chmod(path, mode) {
    return rejectWrite();
  }

  chown(path, uid, gid) {
    return rejectWrite();
  }

  newFile(path) {
    return rejectWrite();
  }

  move(from, to) {
    return rejectWrite();
  }

  copy(from, to) {
    return rejectWrite();
  }

  rimraf(path) {
    return rejectWrite();
  }

  unlink(path) {
    return rejectWrite();
  }

  writeFile(path, data, options) {
    return rejectWrite();
  }
}

exports.ZipFileSystem = ZipFileSystem;
function rejectWrite() {
  throw new Error('ZipFileSystem does not support write operations');
}

function rejectWriteSync() {
  throw new Error('ZipFileSystem does not support write operations');
}

function isImmediateChild(zipDirectory, zipEntryName) {
  if (zipDirectory.length === 0) {
    return zipEntryName.lastIndexOf(ZIP_SEPARATOR, zipEntryName.length - 2) < 0;
  } else {
    const nameLength = normalLength(zipEntryName);
    return zipEntryName.length > zipDirectory.length + 1 && zipEntryName.startsWith(zipDirectory) && zipEntryName.charAt(zipDirectory.length) === ZIP_SEPARATOR && zipEntryName.lastIndexOf(ZIP_SEPARATOR, nameLength - 2) === zipDirectory.length;
  }
}

async function directoryEntryFromZipEntry(zipFs, entry) {
  const nameLength = normalLength(entry.entryName);
  const nameStart = entry.entryName.lastIndexOf('/', nameLength - 1) + 1;
  const name = entry.entryName.slice(nameStart, nameLength);
  const lstat = await zipFs.lstat(entry.entryName);
  if (!lstat.isSymbolicLink()) {
    return [name, lstat.isFile(), false];
  } else {
    return [name, false, true];
  }
}

function normalLength(path) {
  return path.length - (path.endsWith('/') ? 1 : 0);
}

function makeZipStats(outer, entry) {
  const header = entry.header;
  const stats = new _fs.default.Stats();

  stats.dev = outer.dev;
  stats.ino = outer.ino;
  stats.mode = modeFromZipAttr(header.attr);
  stats.nlink = 1;
  stats.uid = outer.uid;
  stats.gid = outer.gid;
  stats.rdev = outer.rdev;
  stats.size = header.size;
  stats.blksize = outer.blksize;
  stats.blocks = Math.floor((header.compressedSize - 1) / outer.blksize) + 1;
  stats.atime = header.time;
  stats.mtime = header.time;
  stats.ctime = outer.ctime;

  return stats;
}

function modeFromZipAttr(attr) {
  // eslint-disable-next-line no-bitwise
  return attr >>> 16;
}

function slash(uri) {
  const sep = (_nuclideUri || _load_nuclideUri()).default.pathSeparatorFor(uri);
  if (sep === '/') {
    return uri;
  } else {
    return uri.replace(sep, '/');
  }
}