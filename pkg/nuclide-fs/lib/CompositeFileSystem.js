'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CompositeFileSystem = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _fs = _interopRequireDefault(require('fs'));

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('nuclide-commons/nuclideUri'));
}

var _FileSystem;

function _load_FileSystem() {
  return _FileSystem = require('./FileSystem');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const ARCHIVE_SEPARATOR = (_nuclideUri || _load_nuclideUri()).default.ARCHIVE_SEPARATOR; /**
                                                                                          * Copyright (c) 2015-present, Facebook, Inc.
                                                                                          * All rights reserved.
                                                                                          *
                                                                                          * This source code is licensed under the license found in the LICENSE file in
                                                                                          * the root directory of this source tree.
                                                                                          *
                                                                                          * 
                                                                                          * @format
                                                                                          */

function segmentObservable(callback) {
  return ({ segFs, pth, prefix }) => _rxjsBundlesRxMinJs.Observable.fromPromise(callback(segFs, pth, prefix));
}

class CompositeFileSystem {

  constructor(rootFs) {
    this._rootFs = rootFs;
  }

  _topDownFsPath(fullPath) {
    const subPaths = fullPath.split(ARCHIVE_SEPARATOR);
    return _rxjsBundlesRxMinJs.Observable.of({
      segFs: this._rootFs,
      pth: subPaths[0],
      prefix: ''
    }).expand((previous, previousIndex) => {
      const index = previousIndex + 1;
      if (index < subPaths.length) {
        const prefix = subPaths.slice(0, index).join(ARCHIVE_SEPARATOR);
        const pth = subPaths[index];
        return _rxjsBundlesRxMinJs.Observable.fromPromise(previous.segFs.openArchive(previous.pth).then(segFs => ({ segFs, pth, prefix })));
      } else {
        return _rxjsBundlesRxMinJs.Observable.empty();
      }
    });
  }

  _bottomUpFsPath(fullPath) {
    return this._topDownFsPath(fullPath).reduce((acc, x) => acc.concat(x), []).concatMap(array => _rxjsBundlesRxMinJs.Observable.of(...array.reverse()));
  }

  _resolveFs(fullPath, callback) {
    return this._bottomUpFsPath(fullPath).first().concatMap(segmentObservable(callback)).toPromise();
  }

  openArchive(fullPath) {
    return this._resolveFs(fullPath, (segFs, pth) => Promise.resolve(segFs));
  }

  exists(fullPath) {
    const and = (x, y) => x && y;
    return this._topDownFsPath(fullPath).concatMap(segmentObservable((segFs, pth) => segFs.exists(pth))).reduce(and, true).toPromise().catch(e => Promise.resolve(false));
  }

  findNearestFile(name, dir) {
    var _this = this;

    return (0, _asyncToGenerator.default)(function* () {
      return _this._bottomUpFsPath((yield _this._archiveAsDirectory(dir))).concatMap(segmentObservable((() => {
        var _ref = (0, _asyncToGenerator.default)(function* (segFs, pth, prefix) {
          return maybeJoin(prefix, (yield segFs.findNearestFile(name, pth)));
        });

        return function (_x, _x2, _x3) {
          return _ref.apply(this, arguments);
        };
      })())).first().toPromise();
    })();
  }

  stat(fullPath) {
    return this._resolveFs(fullPath, (segFs, pth) => segFs.stat(pth));
  }

  lstat(fullPath) {
    return this._resolveFs(fullPath, (segFs, pth) => segFs.lstat(pth));
  }

  mkdir(fullPath) {
    rejectArchivePaths(fullPath, 'mkdir');
    return this._rootFs.mkdir(fullPath);
  }

  mkdirp(fullPath) {
    rejectArchivePaths(fullPath, 'mkdirp');
    return this._rootFs.mkdirp(fullPath);
  }

  chmod(fullPath, mode) {
    rejectArchivePaths(fullPath, 'chmod');
    return this._rootFs.chmod(fullPath, mode);
  }

  chown(fullPath, uid, gid) {
    rejectArchivePaths(fullPath, 'chown');
    return this._rootFs.chown(fullPath, uid, gid);
  }

  newFile(fullPath) {
    rejectArchivePaths(fullPath, 'newFile');
    return this._rootFs.newFile(fullPath);
  }

  readdir(fullPath) {
    var _this2 = this;

    return (0, _asyncToGenerator.default)(function* () {
      return _this2._resolveFs((yield _this2._archiveAsDirectory(fullPath)), (() => {
        var _ref2 = (0, _asyncToGenerator.default)(function* (segFs, pth) {
          return (yield segFs.readdir(pth)).map(function ([name, isFile, isLink]) {
            return [name, isFile, isLink];
          });
        });

        return function (_x4, _x5) {
          return _ref2.apply(this, arguments);
        };
      })());
    })();
  }

  realpath(fullPath) {
    return this._topDownFsPath(fullPath).concatMap(segmentObservable((segFs, pth) => segFs.realpath(pth))).reduce((a, s) => a + (a === '' ? '' : ARCHIVE_SEPARATOR) + s, '').toPromise();
  }

  move(from, to) {
    rejectArchivePaths(from, 'move');
    rejectArchivePaths(to, 'move');
    return this._rootFs.move(from, to);
  }

  copy(from, to) {
    rejectArchivePaths(from, 'copy');
    rejectArchivePaths(to, 'copy');
    return this._rootFs.copy(from, to);
  }

  rimraf(fullPath) {
    rejectArchivePaths(fullPath, 'rimraf');
    return this._rootFs.rimraf(fullPath);
  }

  unlink(fullPath) {
    return this._resolveFs(fullPath, (segFs, pth) => segFs.unlink(pth));
  }

  readFile(fullPath, options) {
    return this._resolveFs(fullPath, (segFs, pth) => segFs.readFile(pth));
  }

  createReadStream(fullPath, options) {
    return this._bottomUpFsPath(fullPath).first().concatMap(({ segFs, pth }) => segFs.createReadStream(pth, options).refCount()).publish();
  }

  writeFile(fullPath, data, options) {
    rejectArchivePaths(fullPath, 'writeFile');
    return this._rootFs.writeFile(fullPath, data, options);
  }

  isNfs(fullPath) {
    return this._resolveFs(fullPath, (segFs, pth) => segFs.isNfs(pth));
  }

  isFuse(fullPath) {
    return this._resolveFs(fullPath, (segFs, pth) => segFs.isNfs(pth));
  }

  _archiveAsDirectory(path) {
    var _this3 = this;

    return (0, _asyncToGenerator.default)(function* () {
      if ((_nuclideUri || _load_nuclideUri()).default.hasKnownArchiveExtension(path) && (yield _this3.exists(path)) && (yield _this3.lstat(path)).isFile()) {
        return path + ARCHIVE_SEPARATOR;
      } else {
        return path;
      }
    })();
  }
}

exports.CompositeFileSystem = CompositeFileSystem;
function rejectArchivePaths(fullPath, operation) {
  if ((_nuclideUri || _load_nuclideUri()).default.isInArchive(fullPath)) {
    throw new Error(`The '${operation}' operation does not support archive paths like '${fullPath}'`);
  }
}

function maybeJoin(prefix, found) {
  if (prefix === '') {
    return found;
  } else if (found == null) {
    return null;
  } else if (found === '') {
    return prefix;
  } else {
    return (_nuclideUri || _load_nuclideUri()).default.archiveJoin(prefix, found);
  }
}