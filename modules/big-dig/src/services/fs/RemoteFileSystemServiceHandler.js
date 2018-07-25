"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.RemoteFileSystemServiceHandler = void 0;

var _fs = _interopRequireDefault(require("fs"));

var _path = _interopRequireDefault(require("path"));

function _rimraf() {
  const data = _interopRequireDefault(require("rimraf"));

  _rimraf = function () {
    return data;
  };

  return data;
}

function _filesystem_types() {
  const data = _interopRequireDefault(require("./gen-nodejs/filesystem_types"));

  _filesystem_types = function () {
    return data;
  };

  return data;
}

function _fsPromise() {
  const data = _interopRequireDefault(require("../../../../nuclide-commons/fsPromise"));

  _fsPromise = function () {
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

function _nuclideWatchmanHelpers() {
  const data = require("../../../../nuclide-watchman-helpers");

  _nuclideWatchmanHelpers = function () {
    return data;
  };

  return data;
}

function _converter() {
  const data = require("./converter");

  _converter = function () {
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
const commonWatchIgnoredExpressions = [['not', ['dirname', '.hg']], ['not', ['match', 'hg-checkexec-*', 'wholename']], ['not', ['match', 'hg-checklink-*', 'wholename']], ['not', ['dirname', '.buckd']], ['not', ['dirname', '.idea']], ['not', ['dirname', '_build']], ['not', ['dirname', 'buck-cache']], ['not', ['dirname', 'buck-out']], ['not', ['dirname', '.fbbuild/generated']], ['not', ['match', '.fbbuild/generated*', 'wholename']], ['not', ['match', '_build-junk*', 'wholename']]];
/**
 * Create a service handler class to manage server methods
 */

class RemoteFileSystemServiceHandler {
  constructor(watcher) {
    this._fileChangeEvents = [];
    this._watcher = watcher;
    this._logger = (0, _log4js().getLogger)('fs-thrift-server-handler');
  }

  async watch(uri, options) {
    const {
      recursive,
      excludes
    } = options;
    const excludeExpr = (0, _converter().genWatchExcludedExpressions)(excludes);

    if (!recursive) {
      // Do not match files in subdirectories:
      excludeExpr.push(['not', ['dirname', '', ['depth', 'ge', 2]]]);
    }

    const opts = {
      expression: ['allof', ...commonWatchIgnoredExpressions, ...excludeExpr]
    };

    this._logger.info(`Watching ${uri} ${JSON.stringify(opts)}`);

    const subName = `big-dig-thrift-filewatcher-${uri}`;

    try {
      const sub = await this._watcher.watchDirectoryRecursive(uri, subName, opts);
      sub.on('error', error => {
        this._logger.error(`Watchman Subscription Error: big-dig-thrift-filewatcher-${uri}`);

        this._logger.error(error);
      });
      sub.on('change', entries => {
        const changes = entries.map(entry => {
          if (!entry.exists) {
            return {
              fname: entry.name,
              eventType: _filesystem_types().default.FileChangeEventType.DELETE
            };
          } else if (entry.new) {
            return {
              fname: entry.name,
              eventType: _filesystem_types().default.FileChangeEventType.ADD
            };
          } else {
            return {
              fname: entry.name,
              eventType: _filesystem_types().default.FileChangeEventType.UPDATE
            };
          }
        }); // Add new changes into the list of file changes

        this._fileChangeEvents.push(...changes);
      });
    } catch (err) {
      this._logger.error('BigDig Thrift FS Server Watchman Subscription Creation Error');

      this._logger.error(err);
    }

    return;
  }

  pollFileChanges() {
    const retEventChangeList = this._fileChangeEvents;
    this._fileChangeEvents = [];
    return retEventChangeList;
  }

  async createDirectory(uri) {
    try {
      return await _fsPromise().default.mkdir(uri);
    } catch (err) {
      throw (0, _converter().createThriftError)(err);
    }
  }

  async stat(uri) {
    try {
      const statData = await _fsPromise().default.stat(uri);
      return (0, _converter().convertToThriftFileStat)(statData);
    } catch (err) {
      throw (0, _converter().createThriftError)(err);
    }
  }

  async lstat(uri) {
    try {
      const statData = await _fsPromise().default.lstat(uri);
      return (0, _converter().convertToThriftFileStat)(statData);
    } catch (err) {
      throw (0, _converter().createThriftError)(err);
    }
  } // Always returns a Buffer


  async readFile(uri) {
    try {
      const contents = await _fsPromise().default.readFile(uri);
      return contents;
    } catch (err) {
      throw (0, _converter().createThriftError)(err);
    }
  }

  async writeFile(uri, content, options) {
    try {
      let writeOptions = {};

      if (options.encoding != null || options.mode != null || options.flag != null) {
        // used in Nuclide
        writeOptions.encoding = options.encoding;
        writeOptions.mode = options.mode;
        writeOptions.flag = options.flag;
      } else {
        // used in VSCode
        const flags = [_fs.default.constants.O_WRONLY, _fs.default.constants.O_TRUNC, options.create ? _fs.default.constants.O_CREAT : 0, options.overwrite || !options.create ? 0 : _fs.default.constants.O_EXCL] // eslint-disable-next-line no-bitwise
        .reduce((acc, f) => acc | f, 0);
        writeOptions = {
          flags
        };
      }

      await _fsPromise().default.writeFile(uri, content, writeOptions);
    } catch (err) {
      throw (0, _converter().createThriftError)(err);
    }
  }

  async rename(oldUri, newUri, options) {
    try {
      await _fsPromise().default.mv(oldUri, newUri, {
        clobber: options.overwrite
      });
    } catch (err) {
      throw (0, _converter().createThriftError)(err);
    }
  }

  async copy(source, destination, options) {
    try {
      const {
        overwrite
      } = options;

      if (!overwrite && (await _fsPromise().default.exists(destination))) {
        throw (0, _converter().createThriftErrorWithCode)(_filesystem_types().default.ErrorCode.EEXIST, {
          source,
          destination
        });
      }

      await _fsPromise().default.copy(source, destination);
    } catch (err) {
      throw (0, _converter().createThriftError)(err);
    }
  }

  async deletePath(uri, options) {
    try {
      if (options.recursive) {
        return new Promise((resolve, reject) => {
          (0, _rimraf().default)(uri, {
            disableGlobs: true
          }, (err, result) => {
            if (err == null) {
              resolve();
            } else {
              reject((0, _converter().createThriftError)(err));
            }
          });
        });
      } else {
        const stats = await _fsPromise().default.lstat(uri);

        if (stats.isDirectory()) {
          await _fsPromise().default.rmdir(uri);
        } else {
          await _fsPromise().default.unlink(uri);
        }
      }
    } catch (err) {
      throw (0, _converter().createThriftError)(err);
    }
  }

  async readDirectory(uri) {
    try {
      const files = await _fsPromise().default.readdir(uri); // Promise.all either resolves with an array of all resolved promises, or
      // it rejects with a single error

      return Promise.all(files.map(async file => {
        const statData = await this.stat(_path.default.join(uri, file));
        return (0, _converter().convertToThriftFileEntry)(file, statData);
      }));
    } catch (err) {
      throw (0, _converter().createThriftError)(err);
    }
  }

  dispose() {}

}

exports.RemoteFileSystemServiceHandler = RemoteFileSystemServiceHandler;