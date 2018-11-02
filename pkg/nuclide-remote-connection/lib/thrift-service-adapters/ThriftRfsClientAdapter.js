"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getOrCreateRfsClientAdapter = getOrCreateRfsClientAdapter;
exports.SUPPORTED_THRIFT_RFS_FUNCTIONS = void 0;

function _memoize2() {
  const data = _interopRequireDefault(require("lodash/memoize"));

  _memoize2 = function () {
    return data;
  };

  return data;
}

function _serviceConfig() {
  const data = require("../../../../modules/big-dig/src/thrift-services/fs/service-config");

  _serviceConfig = function () {
    return data;
  };

  return data;
}

var _fs = _interopRequireDefault(require("fs"));

function _log4js() {
  const data = require("log4js");

  _log4js = function () {
    return data;
  };

  return data;
}

function _nuclideUri() {
  const data = _interopRequireDefault(require("../../../../modules/nuclide-commons/nuclideUri"));

  _nuclideUri = function () {
    return data;
  };

  return data;
}

function _types() {
  const data = require("../../../../modules/big-dig/src/thrift-services/fs/types");

  _types = function () {
    return data;
  };

  return data;
}

function _util() {
  const data = require("./util");

  _util = function () {
    return data;
  };

  return data;
}

function _filesystem_types() {
  const data = _interopRequireDefault(require("../../../../modules/big-dig/src/thrift-services/fs/gen-nodejs/filesystem_types"));

  _filesystem_types = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const BUFFER_ENCODING = 'utf-8';
const logger = (0, _log4js().getLogger)('thrift-rfs-adapters');

class ThriftRfsClientAdapter {
  constructor(client) {
    this._client = client;
  }

  async chmod(uri, mode) {
    return this._client.chmod(uri, mode);
  }

  async chown(uri, uid, gid) {
    return this._client.chown(uri, uid, gid);
  }

  async close(fd) {
    return this._client.close(fd);
  }
  /**
   * Runs the equivalent of `cp sourceUri destinationUri`.
   * @return true if the operation was successful; false if it wasn't.
   */


  async copy(sourceUri, destinationUri) {
    try {
      await this._client.copy(_nuclideUri().default.getPath(sourceUri), _nuclideUri().default.getPath(destinationUri), {
        overwrite: false
      });
    } catch (err) {
      if (err.code === 'EEXIST') {
        // expected if the targetPath already exists
        return false;
      }

      throw err;
    }

    return true;
  }
  /**
   * Runs the equivalent of `cp -R sourceUri destinationUri`.
   * @return true if the operation was successful; false if it wasn't.
   */


  async copyDir(sourceUri, destinationUri) {
    try {
      const oldContents = (await Promise.all([this.mkdir(destinationUri), this.readdir(sourceUri)]))[1];
      const didCopyAll = await Promise.all(oldContents.map(([file, isFile]) => {
        const oldItem = _nuclideUri().default.join(sourceUri, file);

        const newItem = _nuclideUri().default.join(destinationUri, file);

        if (isFile) {
          return this.copy(oldItem, newItem);
        }

        return this.copyDir(oldItem, newItem);
      }));
      return didCopyAll.every(b => b);
    } catch (err) {
      throw err;
    }
  }

  async exists(uri) {
    try {
      await this._statPath(_nuclideUri().default.getPath(uri));
      return true;
    } catch (error) {
      if (error.code === 'ENOENT') {
        return false;
      } else {
        throw error;
      }
    }
  }

  async expandHomeDir(uri) {
    return this._client.expandHomeDir(uri);
  }

  async fstat(fd) {
    const statData = await this._client.fstat(fd);
    return (0, _util().convertToFsFileStat)(statData);
  }

  async fsync(fd) {
    return this._client.fsync(fd);
  }

  async ftruncate(fd, len) {
    return this._client.ftruncate(fd, len);
  }

  async lstat(uri) {
    try {
      const thriftFileStat = await this._client.lstat(_nuclideUri().default.getPath(uri));
      return (0, _util().convertToFsFileStat)(thriftFileStat);
    } catch (err) {
      throw err;
    }
  }

  async mkdir(uri) {
    try {
      await this._client.createDirectory(_nuclideUri().default.getPath(uri));
    } catch (err) {
      throw err;
    }
  }

  async mkdirp(uri) {
    try {
      await this._client.mkdirp(_nuclideUri().default.getPath(uri));
      return true;
    } catch (err) {
      logger.error(err);
      return false;
    }
  }
  /**
   * Moves all sourceUris into the specified destDir, assumed to be a directory name.
   */


  async move(sourceUris, destDir) {
    await Promise.all(sourceUris.map(uri => {
      const destUri = _nuclideUri().default.join(destDir, _nuclideUri().default.basename(uri));

      return this.rename(uri, destUri);
    }));
  }

  async newFile(uri) {
    try {
      const isExistingFile = await this.exists(uri);

      if (isExistingFile) {
        return false;
      }

      await this.mkdirp(_nuclideUri().default.dirname(uri));
      await this.writeFile(uri, '');
      return true;
    } catch (err) {
      throw err;
    }
  }

  async open(uri, permissionFlags, mode) {
    const fd = await this._client.open(uri, permissionFlags, mode);
    return fd;
  }
  /**
   * Lists all children of the given directory.
   */


  async readdir(uri) {
    try {
      const entries = await this._client.readDirectory(_nuclideUri().default.getPath(uri));
      return (0, _util().convertToFsDirectoryEntries)(entries);
    } catch (err) {
      throw err;
    }
  }

  async rmdirAll(uris) {
    await Promise.all(uris.map(uri => this.rmdir(uri)));
  }
  /**
   * Sorts the result of readdir() by alphabetical order (case-insensitive).
   */


  async readdirSorted(uri) {
    return (await this.readdir(uri)).sort((a, b) => {
      return a[0].toLowerCase().localeCompare(b[0].toLowerCase());
    });
  }

  async readFile(uri, options) {
    try {
      const path = _nuclideUri().default.getPath(uri);

      return await this._client.readFile(path);
    } catch (err) {
      throw err;
    }
  }

  async realpath(uri) {
    return this._client.realpath(uri);
  }

  async resolveRealPath(uri) {
    return this._client.resolveRealPath(uri);
  }
  /**
   * Removes directories even if they are non-empty. Does not fail if the
   * directory doesn't exist.
   */


  async rmdir(uri) {
    try {
      await this._client.deletePath(_nuclideUri().default.getPath(uri), {
        recursive: true
      });
    } catch (err) {
      throw err;
    }
  }
  /**
   * Runs the equivalent of `mv sourceUri destinationUri`.
   */


  async rename(sourceUri, destinationUri) {
    try {
      return this._client.rename(_nuclideUri().default.getPath(sourceUri), _nuclideUri().default.getPath(destinationUri), {
        overwrite: false
      });
    } catch (err) {
      throw err;
    }
  }

  async _statPath(path) {
    const thriftFileStat = await this._client.stat(path);
    return (0, _util().convertToFsFileStat)(thriftFileStat);
  }

  async stat(uri) {
    try {
      return await this._statPath(_nuclideUri().default.getPath(uri));
    } catch (err) {
      throw err;
    }
  }
  /**
   * Removes files. Does not fail if the file doesn't exist.
   */


  async unlink(uri) {
    try {
      await this._client.deletePath(_nuclideUri().default.getPath(uri), {});
    } catch (error) {
      if (error.code !== _filesystem_types().default.ErrorCode.ENOENT) {
        throw error;
      }
    }
  }

  async utimes(uri, atime, mtime) {
    return this._client.utimes(uri, atime, mtime);
  }

  async writeFile(uri, content, options) {
    try {
      const data = new Buffer(content, BUFFER_ENCODING);
      await this.writeFileBuffer(uri, data, options);
    } catch (err) {
      throw err;
    }
  }

  async writeFileBuffer(uri, data, options) {
    try {
      const path = _nuclideUri().default.getPath(uri);

      const writeOptions = options || {};
      await this._client.writeFile(path, data, writeOptions);
    } catch (err) {
      throw err;
    }
  }

}

const SUPPORTED_THRIFT_RFS_FUNCTIONS = new Set(Object.getOwnPropertyNames(ThriftRfsClientAdapter.prototype).filter(i => !i.startsWith('_')));
exports.SUPPORTED_THRIFT_RFS_FUNCTIONS = SUPPORTED_THRIFT_RFS_FUNCTIONS;

async function getOrCreateRfsClientAdapter(bigDigClient) {
  const thriftClient = await getOrCreateThriftClient(bigDigClient);
  return getOrCreateAdapter(thriftClient);
}

const getOrCreateThriftClient = (0, _memoize2().default)(bigDigClient => {
  return bigDigClient.getOrCreateThriftClient(_serviceConfig().FS_SERVICE_CONFIG).then(thriftClient => {
    thriftClient.onUnexpectedClientFailure(() => {
      getOrCreateThriftClient.cache.delete(bigDigClient);
    });
    return thriftClient;
  }, error => {
    getOrCreateThriftClient.cache.delete(bigDigClient);
    return Promise.reject(error);
  });
});
const getOrCreateAdapter = (0, _memoize2().default)(thriftClient => {
  thriftClient.onUnexpectedClientFailure(() => {
    getOrCreateAdapter.cache.delete(thriftClient);
  });
  return new ThriftRfsClientAdapter(thriftClient.getClient());
});