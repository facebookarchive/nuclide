"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ConnectionWrapper = exports.RpcMethodError = exports.ConnectionClosed = void 0;

function _serviceConfig() {
  const data = require("../../big-dig/src/services/fs/service-config");

  _serviceConfig = function () {
    return data;
  };

  return data;
}

function _types() {
  const data = require("../../big-dig/src/services/fs/types");

  _types = function () {
    return data;
  };

  return data;
}

function vscode() {
  const data = _interopRequireWildcard(require("vscode"));

  vscode = function () {
    return data;
  };

  return data;
}

var _events = _interopRequireDefault(require("events"));

var _RxMin = require("rxjs/bundles/Rx.min.js");

function _promise() {
  const data = require("../../nuclide-commons/promise");

  _promise = function () {
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

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

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
const TAG = 'json-rpc';

class ConnectionClosed extends Error {
  constructor() {
    super('Connection was closed');
  }

}

exports.ConnectionClosed = ConnectionClosed;

class RpcMethodError extends Error {
  constructor(message) {
    super(message.error);
    this.parameters = message.errorParams || {};
  }

}

exports.RpcMethodError = RpcMethodError;

// $FlowIssue: IDisposable is an interface, but Flow thinks otherwise.
class ConnectionWrapper {
  constructor(bigDigClient) {
    this._closed = new (_promise().Deferred)();
    this._fsThriftClient = null;
    this._fsThriftClientPromise = null;
    this._bigDigClient = bigDigClient;
    this._nextId = 0;
    this._emitter = new _events.default();

    if (bigDigClient.isClosed()) {
      this._closed.reject(new ConnectionClosed());
    }

    bigDigClient.onClose(() => {
      this._closed.reject(new ConnectionClosed());
    });
    const observable = bigDigClient.onMessage(TAG);
    observable.subscribe({
      // Must use arrow function so that `this` is bound correctly.
      next: value => {
        const response = JSON.parse(value);

        this._emitter.emit(response.id, response);
      },

      error(err) {
        // eslint-disable-next-line no-console
        console.error('Error received in ConnectionWrapper', err);
      },

      complete() {
        // eslint-disable-next-line no-console
        console.error('ConnectionWrapper completed()?');
      }

    });
  }

  isClosed() {
    return this._bigDigClient.isClosed();
  }

  onClose(callback) {
    return this._bigDigClient.onClose(callback);
  }

  getAddress() {
    return this._bigDigClient.getAddress();
  }

  shutdown() {
    return this._makeRpc('shutdown', {});
  }

  getServerStatus() {
    return this._makeRpc('get-status', {});
  }

  getOrCreateThriftClient() {
    if (this._fsThriftClient != null) {
      return Promise.resolve(this._fsThriftClient);
    }

    return this._getThriftClientPromise();
  }

  _getThriftClientPromise() {
    if (this._fsThriftClientPromise != null) {
      return this._fsThriftClientPromise;
    }

    this._fsThriftClientPromise = this._bigDigClient.getOrCreateThriftClient(_serviceConfig().FS_SERVICE_CONIFG).then(client => {
      this._fsThriftClientPromise = null;
      this._fsThriftClient = client.getClient();
      return client.getClient();
    }, error => {
      this._fsThriftClientPromise = null;
      return Promise.reject(error);
    });
    return this._fsThriftClientPromise;
  }

  async fsGetFileContents(path) {
    const params = {
      path
    };
    const {
      contents
    } = await this._makeRpc('fs/get-file-contents', params);
    return contents;
  }

  fsStat(path) {
    const params = {
      path
    };
    return this._makeRpc('fs/stat', params);
  }

  fsRead(params) {
    return this._makeObservable('fs/read', params).map(data => Buffer.from(data, BUFFER_ENCODING));
  }

  fsWrite(path, data, options) {
    const params = {
      path,
      content: Buffer.from(data).toString(BUFFER_ENCODING),
      create: options.create,
      overwrite: options.overwrite
    };
    return this._makeRpc('fs/write', params);
  }

  fsMove(source, destination, options) {
    const params = {
      source,
      destination,
      overwrite: options.overwrite
    };
    return this._makeRpc('fs/move', params);
  }

  fsCopy(source, destination, options) {
    const params = {
      source,
      destination,
      overwrite: options.overwrite
    };
    return this._makeRpc('fs/copy', params);
  }

  fsMkdir(path) {
    const params = {
      path
    };
    return this._makeRpc('fs/mkdir', params);
  }

  async fsReaddir(path) {
    const params = {
      path
    };
    const result = await this._makeRpc('fs/readdir', params);
    return result;
  }

  fsDelete(path, options) {
    const params = {
      path,
      recursive: options.recursive
    };
    return this._makeRpc('fs/delete', params);
  }

  fsWatch(path, options) {
    const {
      recursive,
      exclude
    } = options;
    const params = {
      path,
      recursive,
      exclude
    };
    return this._makeObservable('fs/watch', params);
  }

  searchForFiles(directory, query) {
    const params = {
      directory,
      query
    };
    return this._makeRpc('search/for-files', params);
  }

  searchForText(params) {
    const result = this._makeObservable('search/for-text', params);

    return result.mergeAll().map(({
      path,
      range,
      preview
    }) => ({
      path,
      preview,
      range: makeRange(range)
    }));
  }

  cliListen(session) {
    const params = {
      session
    };
    return this._makeObservable('cli/listen', params);
  }

  execSpawn(params) {
    (0, _log4js().getLogger)().info(`spawning ${params.cmd} ${params.args.join(' ')}`);
    return this._makeObservable('exec/spawn', params);
  }

  execStdin(pid, data) {
    const params = {
      pid,
      data
    };
    return this._makeRpc('exec/stdin', params);
  }

  execObserve(pid) {
    const params = {
      pid
    };
    return this._makeObservable('exec/observe', params);
  }

  execKill(pid, signal) {
    const params = {
      pid,
      signal
    };
    return this._makeRpc('exec/kill', params);
  }

  execResize(pid, columns, rows) {
    const params = {
      pid,
      columns,
      rows
    };
    return this._makeRpc('exec/resize', params);
  }

  debuggerList(directory) {
    const params = {
      directory
    };
    return this._makeRpc('debugger/list', params);
  }

  lspList(directory) {
    const params = {
      directory
    };
    return this._makeRpc('lsp/list', params);
  }

  hgIsRepo(directory) {
    const params = {
      directory
    };
    return this._makeRpc('hg/is-repo', params);
  }

  hgObserveStatus(root) {
    const params = {
      root
    };
    return this._makeObservable('hg/status', params);
  }

  hgGetContents(path, ref) {
    const params = {
      path,
      ref
    };
    return this._makeRpc('hg/get-contents', params);
  }

  _sendMessage(message) {
    this._bigDigClient.sendMessage(TAG, message);
  }
  /**
   * This is for an RPC that expects a response.
   */


  _makeRpc(method, params) {
    const id = (this._nextId++).toString(16);
    const response = new Promise((resolve, reject) => {
      function onResponse(message) {
        if (message.error == null) {
          resolve(message.result);
        } else {
          reject(new RpcMethodError(message));
        }
      }

      this._emitter.once(id, onResponse);

      this._closed.promise.catch(error => {
        this._emitter.removeListener(id, onResponse);

        reject(error);
      });
    });
    const payload = {
      id,
      method,
      params
    };

    this._sendMessage(JSON.stringify(payload));

    return response;
  }
  /**
   * Creates an RPC around a remote observable. The remote call is made upon the first subscription.
   * When the last subscriber unsubscribes, this will unsubscribe from the remote subscription.
   */


  _makeObservable(method, params) {
    return _RxMin.Observable.create(observer => {
      const id = (this._nextId++).toString(16);

      function onResponse(response) {
        if (response.error != null) {
          observer.error(new RpcMethodError(response));
        } else if (response.complete != null) {
          observer.complete();
        } else {
          observer.next(response.message);
        }
      }

      this._emitter.on(id, onResponse);

      this._closed.promise.catch(error => {
        this._emitter.removeListener(id, onResponse);

        observer.error(error);
      });

      const payload = {
        id,
        method,
        params
      };

      this._sendMessage(JSON.stringify(payload));

      return () => {
        this._emitter.removeListener(id, onResponse);

        try {
          // This can fail if "unsubscribe" happens after the connection is closed. And we cannot
          // reliably determine if the connection is closed until we try sending a message.
          this._sendMessage(JSON.stringify({
            id,
            method: 'stream-unsubscribe',
            params: {}
          }));
        } catch (error) {// We made an effort, but it seems the connection is already closed.
        }
      };
    });
  }

  dispose() {
    this._bigDigClient.close();

    this._emitter.removeAllListeners();
  }

}

exports.ConnectionWrapper = ConnectionWrapper;

function makeRange(range) {
  return new (vscode().Range)(range.start.line, range.start.column, range.end.line, range.end.column);
}