"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getOrCreateRfsClientAdapter = getOrCreateRfsClientAdapter;
exports.ThriftRfsClientAdapter = exports.SUPPORTED_THRIFT_RFS_FUNCTIONS = exports.BUFFER_ENCODING = void 0;

function _memoize2() {
  const data = _interopRequireDefault(require("lodash/memoize"));

  _memoize2 = function () {
    return data;
  };

  return data;
}

function _serviceConfig() {
  const data = require("../../../../modules/big-dig/src/services/fs/service-config");

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
  const data = require("../../../../modules/big-dig/src/services/fs/types");

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
  const data = _interopRequireDefault(require("../../../../modules/big-dig/src/services/fs/gen-nodejs/filesystem_types"));

  _filesystem_types = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const BUFFER_ENCODING = 'utf-8';
exports.BUFFER_ENCODING = BUFFER_ENCODING;
const logger = (0, _log4js().getLogger)('thrift-rfs-adapters'); // including all supported remote file system function names

const SUPPORTED_THRIFT_RFS_FUNCTIONS = new Set(['stat', 'lstat', 'exists', 'readFile', 'writeFile', 'writeFileBuffer', 'mkdir', 'mkdirp', 'newFile', 'unlink', 'rmdir', 'rmdirAll', 'rename', 'move', // 'readdir',
// 'readdirSorted',
'copy', 'copyDir']);
exports.SUPPORTED_THRIFT_RFS_FUNCTIONS = SUPPORTED_THRIFT_RFS_FUNCTIONS;

class ThriftRfsClientAdapter {
  constructor(client) {
    this._client = client;
  }

  async _statPath(path) {
    const thriftFileStat = await this._client.stat(path);
    return (0, _util().convertToFsFileStat)(thriftFileStat);
  }

  async stat(uri) {
    try {
      (0, _util().checkArchivePathsToFallbackToRpc)(uri, 'stat');
      return await this._statPath(_nuclideUri().default.getPath(uri));
    } catch (err) {
      throw err;
    }
  }

  async lstat(uri) {
    try {
      (0, _util().checkArchivePathsToFallbackToRpc)(uri, 'lstat');
      const thriftFileStat = await this._client.lstat(_nuclideUri().default.getPath(uri));
      return (0, _util().convertToFsFileStat)(thriftFileStat);
    } catch (err) {
      throw err;
    }
  }

  async exists(uri) {
    try {
      (0, _util().checkArchivePathsToFallbackToRpc)(uri, 'exists');
      await this._statPath(_nuclideUri().default.getPath(uri));
      return true;
    } catch (error) {
      if (error.code === _filesystem_types().default.ErrorCode.ENOENT) {
        return false;
      } else {
        throw error;
      }
    }
  }

  async readFile(uri, options) {
    try {
      (0, _util().checkArchivePathsToFallbackToRpc)(uri, 'readFile');

      const path = _nuclideUri().default.getPath(uri);

      return await this._client.readFile(path);
    } catch (err) {
      throw err;
    }
  }

  async writeFile(uri, content, options) {
    try {
      (0, _util().rejectArchivePaths)(uri, 'writeFile');
      const data = new Buffer(content, BUFFER_ENCODING);
      await this.writeFileBuffer(uri, data, options);
    } catch (err) {
      throw err;
    }
  }

  async writeFileBuffer(uri, data, options) {
    try {
      (0, _util().rejectArchivePaths)(uri, 'writeFileBuffer');

      const path = _nuclideUri().default.getPath(uri);

      const writeOptions = options || {};
      await this._client.writeFile(path, data, writeOptions);
    } catch (err) {
      throw err;
    }
  }

  async mkdir(uri) {
    try {
      (0, _util().rejectArchivePaths)(uri, 'mkdir');
      await this._client.createDirectory(_nuclideUri().default.getPath(uri));
    } catch (err) {
      throw err;
    }
  }

  async mkdirp(uri) {
    try {
      (0, _util().rejectArchivePaths)(uri, 'mkdirp');
      await this._client.createDirectory(_nuclideUri().default.getPath(uri));
      return true;
    } catch (err) {
      logger.error(err);
      return false;
    }
  }

  async newFile(uri) {
    try {
      (0, _util().checkArchivePathsToFallbackToRpc)(uri, 'newFile');
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
  /**
   * Removes files. Does not fail if the file doesn't exist.
   */


  async unlink(uri) {
    try {
      (0, _util().checkArchivePathsToFallbackToRpc)(uri, 'unlink');
      await this._client.deletePath(_nuclideUri().default.getPath(uri));
    } catch (error) {
      if (error instanceof _util().FallbackToRpcError) {
        throw error;
      }

      if (error.code !== _filesystem_types().default.ErrorCode.ENOENT) {
        throw error;
      }
    }
  }
  /**
   * Removes directories even if they are non-empty. Does not fail if the
   * directory doesn't exist.
   */


  async rmdir(uri) {
    try {
      (0, _util().rejectArchivePaths)(uri, 'rmdir');
      await this._client.deletePath(_nuclideUri().default.getPath(uri), {
        recursive: true
      });
    } catch (err) {
      throw err;
    }
  }

  async rmdirAll(uris) {
    await Promise.all(uris.map(uri => this.rmdir(uri)));
  }
  /**
   * Runs the equivalent of `mv sourceUri destinationUri`.
   */


  async rename(sourceUri, destinationUri) {
    try {
      (0, _util().rejectArchivePaths)(sourceUri, 'rename');
      (0, _util().rejectArchivePaths)(destinationUri, 'rename');
      return this._client.rename(_nuclideUri().default.getPath(sourceUri), _nuclideUri().default.getPath(destinationUri), {
        overwrite: false
      });
    } catch (err) {
      throw err;
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
  /**
   * Lists all children of the given directory.
   */


  async readdir(uri) {
    try {
      // try to read archive dir, should fallback to use RPC method
      if (_nuclideUri().default.hasKnownArchiveExtension(uri)) {
        throw new (_util().FallbackToRpcError)(`Unable to perform: readdir on archive file: ${uri}, fallback to use RPC method`);
      }

      const entries = await this._client.readDirectory(_nuclideUri().default.getPath(uri));
      return (0, _util().convertToFsDirectoryEntries)(entries);
    } catch (err) {
      throw err;
    }
  }
  /**
   * Sorts the result of readdir() by alphabetical order (case-insensitive).
   */


  async readdirSorted(uri) {
    return (await this.readdir(uri)).sort((a, b) => {
      return a[0].toLowerCase().localeCompare(b[0].toLowerCase());
    });
  }
  /**
   * Runs the equivalent of `cp sourceUri destinationUri`.
   * @return true if the operation was successful; false if it wasn't.
   */


  async copy(sourceUri, destinationUri) {
    try {
      (0, _util().rejectArchivePaths)(sourceUri, 'copy');
      (0, _util().rejectArchivePaths)(destinationUri, 'copy');
      await this._client.copy(_nuclideUri().default.getPath(sourceUri), _nuclideUri().default.getPath(destinationUri), {
        overwrite: false
      });
    } catch (err) {
      if (err.code === _filesystem_types().default.ErrorCode.EEXIST) {
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
      (0, _util().rejectArchivePaths)(sourceUri, 'copyDir');
      (0, _util().rejectArchivePaths)(destinationUri, 'copyDir');
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

}

exports.ThriftRfsClientAdapter = ThriftRfsClientAdapter;

async function getOrCreateRfsClientAdapter(bigDigClient) {
  const clientWrapper = await getOrCreateThriftClient(bigDigClient);
  return getOrCreateAdapter(clientWrapper);
}

const getOrCreateThriftClient = (0, _memoize2().default)(bigDigClient => {
  return bigDigClient.getOrCreateThriftClient(_serviceConfig().FS_SERVICE_CONIFG).then(clientWrapper => {
    clientWrapper.onConnectionEnd(() => {
      getOrCreateThriftClient.cache.delete(bigDigClient);
    });
    return clientWrapper;
  }, error => {
    getOrCreateThriftClient.cache.delete(bigDigClient);
    return Promise.reject(error);
  });
});
const getOrCreateAdapter = (0, _memoize2().default)(clientWrapper => {
  clientWrapper.onConnectionEnd(() => {
    getOrCreateAdapter.cache.delete(clientWrapper);
  });
  return new ThriftRfsClientAdapter(clientWrapper.getClient());
});