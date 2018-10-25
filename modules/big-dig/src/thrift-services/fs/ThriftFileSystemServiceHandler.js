"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ThriftFileSystemServiceHandler = void 0;

var _fs = _interopRequireDefault(require("fs"));

function _collection() {
  const data = require("../../../../nuclide-commons/collection");

  _collection = function () {
    return data;
  };

  return data;
}

var _path = _interopRequireDefault(require("path"));

function _uuid() {
  const data = _interopRequireDefault(require("uuid"));

  _uuid = function () {
    return data;
  };

  return data;
}

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

var _os = _interopRequireDefault(require("os"));

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
// eslint-disable-next-line nuclide-internal/prefer-nuclide-uri
const commonWatchIgnoredExpressions = [['not', ['dirname', '.hg']], ['not', ['match', 'hg-checkexec-*', 'wholename']], ['not', ['match', 'hg-checklink-*', 'wholename']], ['not', ['dirname', '.buckd']], ['not', ['dirname', '.idea']], ['not', ['dirname', '_build']], ['not', ['dirname', 'buck-cache']], ['not', ['dirname', 'buck-out']], ['not', ['dirname', '.fbbuild/generated']], ['not', ['match', '.fbbuild/generated*', 'wholename']], ['not', ['match', '_build-junk*', 'wholename']]];
const logger = (0, _log4js().getLogger)('fs-thrift-server-handler');
/**
 * Create a service handler class to manage server methods
 */

class ThriftFileSystemServiceHandler {
  constructor(watcher) {
    this._fileChangeEvents = [];
    this._watcher = watcher;
    this._watchIdToChangeList = new Map();
  }

  async chmod(uri, mode) {
    try {
      return await _fsPromise().default.chmod(uri, mode);
    } catch (err) {
      throw (0, _converter().createThriftError)(err);
    }
  }

  async chown(uri, uid, gid) {
    try {
      return await _fsPromise().default.chown(uri, uid, gid);
    } catch (err) {
      throw (0, _converter().createThriftError)(err);
    }
  }

  async close(fd) {
    try {
      return await _fsPromise().default.close(fd);
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
        throw (0, _converter().createThriftErrorWithCode)('EEXIST', _filesystem_types().default.ErrorCode.EEXIST, {
          source,
          destination
        });
      }

      await _fsPromise().default.copy(source, destination);
    } catch (err) {
      throw (0, _converter().createThriftError)(err);
    }
  }

  async createDirectory(uri) {
    try {
      return await _fsPromise().default.mkdir(uri);
    } catch (err) {
      throw (0, _converter().createThriftError)(err);
    }
  }

  async deletePath(uri, options) {
    try {
      if (options === null || options === void 0 ? void 0 : options.recursive) {
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

  dispose() {
    for (const watchId of this._watchIdToChangeList.keys()) {
      this._watcher.unwatch(watchId);
    }

    this._watchIdToChangeList.clear();
  }

  async expandHomeDir(uri) {
    // Do not expand non home relative uris
    if (!uri.startsWith('~')) {
      return uri;
    } // "home" on Windows is %UserProfile%. Note that Windows environment variables
    // are NOT case sensitive, but process.env is a magic object that wraps GetEnvironmentVariableW
    // on Windows, so asking for any case is expected to work.


    const {
      HOME,
      UserProfile
    } = process.env;
    const isWindows = _os.default.platform() === 'win32';
    const homePath = isWindows ? UserProfile : HOME;

    if (homePath == null) {
      throw (0, _converter().createThriftError)({
        message: 'could not find path to home directory'
      });
    }

    if (uri === '~') {
      return homePath;
    } // Uris like ~abc should not be expanded


    if (!uri.startsWith('~/') && (!isWindows || !uri.startsWith('~\\'))) {
      return uri;
    }

    return _path.default.resolve(homePath, uri.replace('~', '.'));
  }

  async fstat(fd) {
    try {
      const statData = await _fsPromise().default.fstat(fd);
      return (0, _converter().convertToThriftFileStat)(statData);
    } catch (err) {
      throw (0, _converter().createThriftError)(err);
    }
  }

  async fsync(fd) {
    try {
      return await _fsPromise().default.fsync(fd);
    } catch (err) {
      throw (0, _converter().createThriftError)(err);
    }
  }

  async ftruncate(fd, len) {
    try {
      return await _fsPromise().default.ftruncate(fd, len);
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
  }

  async mkdirp(uri) {
    try {
      return await _fsPromise().default.mkdirp(uri);
    } catch (err) {
      throw (0, _converter().createThriftError)(err);
    }
  }

  async open(uri, permissionFlags, mode) {
    try {
      const fd = await _fsPromise().default.open(uri, permissionFlags, mode);
      return fd;
    } catch (err) {
      throw (0, _converter().createThriftError)(err);
    }
  }

  pollFileChanges(watchId) {
    const fileChangeList = this._watchIdToChangeList.get(watchId) || [];

    this._watchIdToChangeList.set(watchId, []);

    return fileChangeList;
  }

  async readDirectory(uri) {
    try {
      const files = await _fsPromise().default.readdir(uri);
      const entries = await Promise.all(files.map(async file => {
        const fullpath = _path.default.join(uri, file); // lstat is the same as stat, but if path is a symbolic link, then
        // the link itself is stat-ed, not the file that it refers to


        const lstats = await this.lstat(fullpath);

        if (lstats.ftype !== _filesystem_types().default.FileType.SYMLINK) {
          return (0, _converter().convertToThriftFileEntry)(file, lstats, false);
        }

        try {
          // try to return what the symlink points to (stat data)
          const stats = await this.stat(fullpath);
          return (0, _converter().convertToThriftFileEntry)(file, stats, true);
        } catch (error) {
          // symlink points to non-existent file/dir or cannot be read for
          // some reason
          return (0, _converter().convertToThriftFileEntry)(file, lstats, true);
        }
      }));
      return (0, _collection().arrayCompact)(entries);
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

  async realpath(uri) {
    try {
      return await _fsPromise().default.realpath(uri);
    } catch (err) {
      throw (0, _converter().createThriftError)(err);
    }
  }

  async resolveRealPath(uri) {
    try {
      const expandedHome = await this.expandHomeDir(uri);
      return await _fsPromise().default.realpath(expandedHome);
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

  async stat(uri) {
    try {
      const statData = await _fsPromise().default.stat(uri);
      return (0, _converter().convertToThriftFileStat)(statData);
    } catch (err) {
      throw (0, _converter().createThriftError)(err);
    }
  }

  async unwatch(watchId) {
    try {
      await this._watcher.unwatch(watchId);
    } catch (err) {
      throw (0, _converter().createThriftError)(err);
    }
  }

  async utimes(uri, atime, mtime) {
    try {
      return await _fsPromise().default.utimes(uri, atime, mtime);
    } catch (err) {
      throw (0, _converter().createThriftError)(err);
    }
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
    logger.info(`Watching ${uri} ${JSON.stringify(opts)}`);
    const watchId = `big-dig-thrift-filewatcher-${_uuid().default.v4()}`;

    try {
      const sub = await this._watcher.watchDirectoryRecursive(uri, watchId, opts);
      sub.on('error', error => {
        logger.error(`Watchman Subscription Error: big-dig-thrift-filewatcher-${uri}`);
        logger.error(error);
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

        const fileChangeList = this._watchIdToChangeList.get(watchId) || [];
        fileChangeList.push(...changes);

        this._watchIdToChangeList.set(watchId, fileChangeList);
      });
    } catch (err) {
      logger.error('BigDig Thrift FS Server Watchman Subscription Creation Error');
      logger.error(err);
    }

    return watchId;
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

}

exports.ThriftFileSystemServiceHandler = ThriftFileSystemServiceHandler;