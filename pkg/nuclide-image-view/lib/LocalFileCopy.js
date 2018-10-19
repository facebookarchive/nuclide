"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _atom = require("atom");

var _crypto = _interopRequireDefault(require("crypto"));

function _log4js() {
  const data = require("log4js");

  _log4js = function () {
    return data;
  };

  return data;
}

function _projects() {
  const data = require("../../../modules/nuclide-commons-atom/projects");

  _projects = function () {
    return data;
  };

  return data;
}

function _event() {
  const data = require("../../../modules/nuclide-commons/event");

  _event = function () {
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

function _nuclideUri() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/nuclideUri"));

  _nuclideUri = function () {
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

function _UniversalDisposable() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/UniversalDisposable"));

  _UniversalDisposable = function () {
    return data;
  };

  return data;
}

function _nullthrows() {
  const data = _interopRequireDefault(require("nullthrows"));

  _nullthrows = function () {
    return data;
  };

  return data;
}

var _os = _interopRequireDefault(require("os"));

var _RxMin = require("rxjs/bundles/Rx.min.js");

function _temp() {
  const data = _interopRequireDefault(require("temp"));

  _temp = function () {
    return data;
  };

  return data;
}

function _nuclideRemoteConnection() {
  const data = require("../../nuclide-remote-connection");

  _nuclideRemoteConnection = function () {
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
 * 
 * @format
 */

/**
 * A file-like object that represents a local copy of a remote file.
 */
class LocalFileCopy {
  constructor(filePath) {
    this._remoteFile = new _RxMin.BehaviorSubject();
    this._tmpFile = new _RxMin.BehaviorSubject();
    this._disposed = new _RxMin.ReplaySubject(1);
    this._initialFilePath = filePath;
    getRemoteFile(filePath).takeUntil(this._disposed).subscribe(remoteFile => {
      this._remoteFile.next(remoteFile);
    });

    this._remoteFile.filter(Boolean).switchMap(file => (0, _event().observableFromSubscribeFunction)(cb => file.onDidChange(cb)).startWith(null).switchMap(path => copyToLocalTempFile(file.getPath())).catch(err => {
      // TODO: Improve error handling by updating view instead of resorting to notifications.
      atom.notifications.addError('There was an error loading the image. Please close the tab and try again.', {
        dismissable: true
      });
      (0, _log4js().getLogger)('nuclide-image-view').error(err);
      return _RxMin.Observable.empty();
    })).takeUntil(this._disposed).subscribe(tmpFile => {
      this._tmpFile.next(tmpFile);
    });
  }

  dispose() {
    this._disposed.next();
  }

  whenReady(callback) {
    return new (_UniversalDisposable().default)(this._tmpFile.filter(Boolean).take(1).takeUntil(this._disposed).subscribe(() => {
      callback();
    }));
  }

  getPath() {
    const remoteFile = this._remoteFile.getValue();

    return remoteFile == null ? this._initialFilePath : remoteFile.getPath();
  }

  getLocalPath() {
    const tmpFile = this._tmpFile.getValue();

    return tmpFile == null ? null : tmpFile.getPath();
  }

  onDidChange(callback) {
    return new (_UniversalDisposable().default)(this._tmpFile.takeUntil(this._disposed).subscribe(() => {
      callback();
    }));
  }

  onDidRename(callback) {
    return new (_UniversalDisposable().default)(this._remoteFile.filter(Boolean).switchMap(remoteFile => (0, _event().observableFromSubscribeFunction)(cb => (0, _nullthrows().default)(remoteFile).onDidRename(cb))).takeUntil(this._disposed).subscribe(() => {
      callback();
    }));
  }

  onDidDelete(callback) {
    return new (_UniversalDisposable().default)(this._remoteFile.filter(Boolean).switchMap(remoteFile => (0, _event().observableFromSubscribeFunction)(cb => (0, _nullthrows().default)(remoteFile).onDidDelete(cb))).takeUntil(this._disposed).subscribe(() => {
      callback();
    }));
  }

}

exports.default = LocalFileCopy;

function copyToLocalTempFile(remotePath) {
  return _RxMin.Observable.defer(async () => {
    const fsService = (0, _nuclideRemoteConnection().getFileSystemServiceByNuclideUri)(remotePath);
    const {
      mtime
    } = await fsService.stat(remotePath);
    return {
      fsService,
      mtime
    };
  }).switchMap(({
    fsService,
    mtime
  }) => {
    const cacheDir = _nuclideUri().default.join(_os.default.tmpdir(), 'nuclide-remote-images'); // Create a unique filename based on the path and mtime. We use a hash so we don't run into
    // filename length restrictions.


    const hash = _crypto.default.createHash('md5').update(remotePath).digest('hex').slice(0, 7);

    const extname = _nuclideUri().default.extname(remotePath);

    const basename = _nuclideUri().default.basename(remotePath);

    const name = basename.slice(0, basename.length - extname.length);

    const tmpFilePath = _nuclideUri().default.join(cacheDir, `${name}-${hash}-${mtime.getTime()}${extname}`);

    return _RxMin.Observable.fromPromise(_fsPromise().default.exists(tmpFilePath)).switchMap(exists => {
      if (exists) {
        return _RxMin.Observable.of(new _atom.File(tmpFilePath));
      }

      return fsService.createReadStream(remotePath).refCount().let(writeToTempFile(tmpFilePath));
    });
  });
}

const writeToTempFile = targetPath => source => {
  return _RxMin.Observable.defer(() => {
    const writeStream = _temp().default.createWriteStream();

    return (0, _stream().writeToStream)(source, writeStream).ignoreElements().concat(_RxMin.Observable.defer(async () => {
      // Move the file to the final destination.
      await _fsPromise().default.mkdirp(_nuclideUri().default.dirname(targetPath));
      await _fsPromise().default.mv(writeStream.path, targetPath);
      return new _atom.File(targetPath);
    }));
  });
}; // We have to wait for so much.


function getRemoteFile(path) {
  return (0, _event().observableFromSubscribeFunction)(cb => atom.packages.serviceHub.consume('nuclide-remote-projects', '0.0.0', cb)).switchMap(service => {
    if (service == null) {
      return _RxMin.Observable.of(null);
    }

    return (0, _event().observableFromSubscribeFunction)(cb => service.waitForRemoteProjectReload(cb)).map(() => (0, _projects().getFileForPath)(path));
  }).take(1);
}