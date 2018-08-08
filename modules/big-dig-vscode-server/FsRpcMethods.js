"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.FsRpcMethods = void 0;

var _RxMin = require("rxjs/bundles/Rx.min.js");

function _fsPromise() {
  const data = _interopRequireDefault(require("../nuclide-commons/fsPromise"));

  _fsPromise = function () {
    return data;
  };

  return data;
}

var _fs = _interopRequireDefault(require("fs"));

var _path = _interopRequireDefault(require("path"));

function _rimraf() {
  const data = _interopRequireDefault(require("rimraf"));

  _rimraf = function () {
    return data;
  };

  return data;
}

function _RpcMethodError() {
  const data = require("./RpcMethodError");

  _RpcMethodError = function () {
    return data;
  };

  return data;
}

function _nuclideWatchmanHelpers() {
  const data = require("../nuclide-watchman-helpers");

  _nuclideWatchmanHelpers = function () {
    return data;
  };

  return data;
}

function _log4js() {
  const data = require("log4js");

  _log4js = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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
const BUFFER_ENCODING = 'utf-8';
const logger = (0, _log4js().getLogger)('fs-rpc');

class FsRpcMethods {
  constructor(watcher) {
    this._watcher = watcher;
  }

  register(registrar) {
    const regFn = registrar.registerFun.bind(registrar);
    const regObs = registrar.registerObservable.bind(registrar);
    regFn('fs/get-file-contents', this._getFileContents.bind(this));
    regObs('fs/watch', this._watch.bind(this));
    regObs('fs/read', this._read.bind(this));
    regFn('fs/stat', this._stat.bind(this));
    regFn('fs/write', this._write.bind(this));
    regFn('fs/move', this._move.bind(this));
    regFn('fs/copy', this._copy.bind(this));
    regFn('fs/mkdir', this._mkdir.bind(this));
    regFn('fs/readdir', this._readdir.bind(this));
    regFn('fs/delete', this._delete.bind(this));
  }

  async _stat(params) {
    const stats = await _fsPromise().default.lstat(params.path);
    const {
      atime,
      mtime,
      ctime,
      size,
      mode
    } = stats;

    if (stats.isSymbolicLink()) {
      try {
        const stats2 = await _fsPromise().default.stat(params.path);
        return {
          atime: stats2.atime.valueOf(),
          mtime: stats2.mtime.valueOf(),
          ctime: stats2.ctime.valueOf(),
          size: stats2.size,
          mode: stats2.mode,
          isFile: stats2.isFile() ? true : undefined,
          isDirectory: stats2.isDirectory() ? true : undefined,
          isSymlink: true
        };
      } catch (error) {}
    }

    return {
      atime: atime.valueOf(),
      mtime: mtime.valueOf(),
      ctime: ctime.valueOf(),
      size,
      mode,
      isFile: stats.isFile() ? true : undefined,
      isDirectory: stats.isDirectory() ? true : undefined
    };
  }

  _read(params) {
    return _RxMin.Observable.create(observer => {
      const end = params.length === -1 ? undefined : params.offset + params.length - 1;

      const stream = _fs.default.createReadStream(params.path, {
        encoding: BUFFER_ENCODING,
        start: params.offset,
        end,
        autoClose: true
      });

      function cleanup() {
        stream.removeAllListeners('data');
        stream.removeAllListeners('end');
        stream.removeAllListeners('error');
      }

      stream.on('data', data => {
        observer.next(data);
      });
      stream.on('end', () => {
        cleanup();
        observer.complete();
      });
      stream.on('error', error => {
        cleanup();
        observer.error(error);
      });
      return () => {
        cleanup();
        observer.error(new Error('Disposed'));
      };
    });
  }

  async _write(params) {
    const data = Buffer.from(params.content, BUFFER_ENCODING);
    const flags = [_fs.default.constants.O_WRONLY, _fs.default.constants.O_TRUNC, params.create ? _fs.default.constants.O_CREAT : 0, params.overwrite || !params.create ? 0 : _fs.default.constants.O_EXCL] // eslint-disable-next-line no-bitwise
    .reduce((acc, f) => acc | f, 0);
    await _fsPromise().default.writeFile(params.path, data, {
      flags
    });
    return {};
  }

  async _move(params) {
    await _fsPromise().default.mv(params.source, params.destination, {
      clobber: params.overwrite
    });
    return {};
  }

  async _copy(params) {
    const {
      overwrite,
      source,
      destination
    } = params;

    if (!overwrite && (await _fsPromise().default.exists(destination))) {
      throw new (_RpcMethodError().RpcMethodError)(`Cannot copy ${source} to ${destination}; ` + 'destination file already exists', {
        code: 'EEXIST'
      });
    }

    await _fsPromise().default.copy(source, destination);
    return {};
  }

  async _mkdir(params) {
    await _fsPromise().default.mkdirp(params.path);
    return {};
  }

  async _readdir(params) {
    const files = await _fsPromise().default.readdir(params.path);
    return Promise.all(files.map(async file => {
      const stat = await this._stat({
        path: _path.default.join(params.path, file)
      });
      return [file, stat];
    }));
  }

  async _delete(params) {
    if (params.recursive) {
      return new Promise((resolve, reject) => {
        (0, _rimraf().default)(params.path, {
          disableGlobs: true
        }, (err, result) => {
          if (err == null) {
            resolve({});
          } else {
            reject(err);
          }
        });
      });
    } else {
      const stats = await _fsPromise().default.lstat(params.path);

      if (stats.isDirectory()) {
        await _fsPromise().default.rmdir(params.path);
      } else {
        await _fsPromise().default.unlink(params.path);
      }
    }

    return {};
  }

  _watch(params) {
    return _RxMin.Observable.create(observer => {
      const {
        recursive,
        exclude
      } = params;
      const excludeExpr = exclude.map(x => ['match', x, 'wholename']);

      if (!recursive) {
        // Do not match files in subdirectories:
        excludeExpr.push(['dirname', '', ['depth', 'ge', 2]]);
      }

      const opts = excludeExpr.length > 0 ? {
        expression: ['not', ['anyof', ...excludeExpr]]
      } : undefined;
      logger.info(`Watching ${params.path} ${JSON.stringify(opts)}`);
      const subName = `big-dig-filewatcher-${params.path}`;

      const doSub = this._watcher.watchDirectoryRecursive(params.path, subName, opts);

      doSub.then(sub => {
        sub.on('error', error => observer.error(error));
        sub.on('change', entries => {
          const changes = entries.map(entry => {
            if (!entry.exists) {
              return {
                path: entry.name,
                type: 'd'
              };
            } else if (entry.new) {
              return {
                path: entry.name,
                type: 'a'
              };
            } else {
              return {
                path: entry.name,
                type: 'u'
              };
            }
          });
          observer.next(changes);
        });
      }, error => observer.error(error));
      return async () => {
        try {
          await doSub;
        } catch (error) {
          // Ignore error because it has already been handled by `observer`.
          return;
        }

        try {
          this._watcher.unwatch(subName);

          logger.info(`Stopped watching ${params.path} ${JSON.stringify(opts)}`);
        } catch (error) {
          logger.error('Error when unsubscribing from watch:\n', error);
        }
      };
    });
  }

  async _getFileContents(params) {
    const {
      path
    } = params;
    const contents = await _fsPromise().default.readFile(path, 'utf8');
    return {
      contents
    };
  }

}

exports.FsRpcMethods = FsRpcMethods;