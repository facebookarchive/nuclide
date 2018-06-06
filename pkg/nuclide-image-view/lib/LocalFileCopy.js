'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _atom = require('atom');

var _crypto = _interopRequireDefault(require('crypto'));

var _log4js;

function _load_log4js() {
  return _log4js = require('log4js');
}

var _projects;

function _load_projects() {
  return _projects = require('../../../modules/nuclide-commons-atom/projects');
}

var _event;

function _load_event() {
  return _event = require('../../../modules/nuclide-commons/event');
}

var _fsPromise;

function _load_fsPromise() {
  return _fsPromise = _interopRequireDefault(require('../../../modules/nuclide-commons/fsPromise'));
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../../modules/nuclide-commons/nuclideUri'));
}

var _stream;

function _load_stream() {
  return _stream = require('../../../modules/nuclide-commons/stream');
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('../../../modules/nuclide-commons/UniversalDisposable'));
}

var _nullthrows;

function _load_nullthrows() {
  return _nullthrows = _interopRequireDefault(require('nullthrows'));
}

var _os = _interopRequireDefault(require('os'));

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _temp;

function _load_temp() {
  return _temp = _interopRequireDefault(require('temp'));
}

var _nuclideRemoteConnection;

function _load_nuclideRemoteConnection() {
  return _nuclideRemoteConnection = require('../../nuclide-remote-connection');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * A file-like object that represents a local copy of a remote file.
 */
class LocalFileCopy {

  constructor(filePath) {
    this._remoteFile = new _rxjsBundlesRxMinJs.BehaviorSubject();
    this._tmpFile = new _rxjsBundlesRxMinJs.BehaviorSubject();
    this._disposed = new _rxjsBundlesRxMinJs.ReplaySubject(1);

    this._initialFilePath = filePath;
    getRemoteFile(filePath).takeUntil(this._disposed).subscribe(remoteFile => {
      this._remoteFile.next(remoteFile);
    });
    this._remoteFile.filter(Boolean).switchMap(file => (0, (_event || _load_event()).observableFromSubscribeFunction)(cb => file.onDidChange(cb)).startWith(null).switchMap(path => copyToLocalTempFile(file.getPath())).catch(err => {
      // TODO: Improve error handling by updating view instead of resorting to notifications.
      atom.notifications.addError('There was an error loading the image. Please close the tab and try again.', { dismissable: true });
      (0, (_log4js || _load_log4js()).getLogger)('nuclide-image-view').error(err);
      return _rxjsBundlesRxMinJs.Observable.empty();
    })).takeUntil(this._disposed).subscribe(tmpFile => {
      this._tmpFile.next(tmpFile);
    });
  }

  dispose() {
    this._disposed.next();
  }

  whenReady(callback) {
    return new (_UniversalDisposable || _load_UniversalDisposable()).default(this._tmpFile.filter(Boolean).take(1).takeUntil(this._disposed).subscribe(() => {
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
    return new (_UniversalDisposable || _load_UniversalDisposable()).default(this._tmpFile.takeUntil(this._disposed).subscribe(() => {
      callback();
    }));
  }

  onDidRename(callback) {
    return new (_UniversalDisposable || _load_UniversalDisposable()).default(this._remoteFile.filter(Boolean).switchMap(remoteFile => (0, (_event || _load_event()).observableFromSubscribeFunction)(cb => (0, (_nullthrows || _load_nullthrows()).default)(remoteFile).onDidRename(cb))).takeUntil(this._disposed).subscribe(() => {
      callback();
    }));
  }

  onDidDelete(callback) {
    return new (_UniversalDisposable || _load_UniversalDisposable()).default(this._remoteFile.filter(Boolean).switchMap(remoteFile => (0, (_event || _load_event()).observableFromSubscribeFunction)(cb => (0, (_nullthrows || _load_nullthrows()).default)(remoteFile).onDidDelete(cb))).takeUntil(this._disposed).subscribe(() => {
      callback();
    }));
  }
}

exports.default = LocalFileCopy; /**
                                  * Copyright (c) 2015-present, Facebook, Inc.
                                  * All rights reserved.
                                  *
                                  * This source code is licensed under the license found in the LICENSE file in
                                  * the root directory of this source tree.
                                  *
                                  * 
                                  * @format
                                  */

function copyToLocalTempFile(remotePath) {
  return _rxjsBundlesRxMinJs.Observable.defer(async () => {
    const fsService = (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getFileSystemServiceByNuclideUri)(remotePath);
    const { mtime } = await fsService.stat(remotePath);
    return { fsService, mtime };
  }).switchMap(({ fsService, mtime }) => {
    const cacheDir = (_nuclideUri || _load_nuclideUri()).default.join(_os.default.tmpdir(), 'nuclide-remote-images');
    // Create a unique filename based on the path and mtime. We use a hash so we don't run into
    // filename length restrictions.
    const hash = _crypto.default.createHash('md5').update(remotePath).digest('hex').slice(0, 7);
    const extname = (_nuclideUri || _load_nuclideUri()).default.extname(remotePath);
    const basename = (_nuclideUri || _load_nuclideUri()).default.basename(remotePath);
    const name = basename.slice(0, basename.length - extname.length);
    const tmpFilePath = (_nuclideUri || _load_nuclideUri()).default.join(cacheDir, `${name}-${hash}-${mtime.getTime()}${extname}`);
    return _rxjsBundlesRxMinJs.Observable.fromPromise((_fsPromise || _load_fsPromise()).default.exists(tmpFilePath)).switchMap(exists => {
      if (exists) {
        return _rxjsBundlesRxMinJs.Observable.of(new _atom.File(tmpFilePath));
      }
      return fsService.createReadStream(remotePath).refCount().let(writeToTempFile(tmpFilePath));
    });
  });
}

const writeToTempFile = targetPath => source => {
  return _rxjsBundlesRxMinJs.Observable.defer(() => {
    const writeStream = (_temp || _load_temp()).default.createWriteStream();
    return (0, (_stream || _load_stream()).writeToStream)(source, writeStream).ignoreElements().concat(_rxjsBundlesRxMinJs.Observable.defer(async () => {
      // Move the file to the final destination.
      await (_fsPromise || _load_fsPromise()).default.mkdirp((_nuclideUri || _load_nuclideUri()).default.dirname(targetPath));
      await (_fsPromise || _load_fsPromise()).default.mv(writeStream.path, targetPath);
      return new _atom.File(targetPath);
    }));
  });
};

// We have to wait for so much.
function getRemoteFile(path) {
  return (0, (_event || _load_event()).observableFromSubscribeFunction)(cb => atom.packages.serviceHub.consume('nuclide-remote-projects', '0.0.0', cb)).switchMap(service => {
    if (service == null) {
      return _rxjsBundlesRxMinJs.Observable.of(null);
    }
    return (0, (_event || _load_event()).observableFromSubscribeFunction)(cb => service.waitForRemoteProjectReload(cb)).map(() => (0, (_projects || _load_projects()).getFileForPath)(path));
  }).take(1);
}