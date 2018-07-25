"use strict";

function _FileSearcher() {
  const data = require("./FileSearcher");

  _FileSearcher = function () {
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

function _CliRpcMethods() {
  const data = require("./CliRpcMethods");

  _CliRpcMethods = function () {
    return data;
  };

  return data;
}

function _ServerRpcMethods() {
  const data = require("./ServerRpcMethods");

  _ServerRpcMethods = function () {
    return data;
  };

  return data;
}

function _DebuggerRpcMethods() {
  const data = require("./DebuggerRpcMethods");

  _DebuggerRpcMethods = function () {
    return data;
  };

  return data;
}

function _ExecRpcMethods() {
  const data = require("./ExecRpcMethods");

  _ExecRpcMethods = function () {
    return data;
  };

  return data;
}

function _FsRpcMethods() {
  const data = require("./FsRpcMethods");

  _FsRpcMethods = function () {
    return data;
  };

  return data;
}

function _HgRpcMethods() {
  const data = require("./HgRpcMethods");

  _HgRpcMethods = function () {
    return data;
  };

  return data;
}

function _LspRpcMethods() {
  const data = require("./LspRpcMethods");

  _LspRpcMethods = function () {
    return data;
  };

  return data;
}

function _SearchRpcMethods() {
  const data = require("./SearchRpcMethods");

  _SearchRpcMethods = function () {
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

function _RpcMethodError() {
  const data = require("./RpcMethodError");

  _RpcMethodError = function () {
    return data;
  };

  return data;
}

function textSearcher() {
  const data = _interopRequireWildcard(require("./TextSearch"));

  textSearcher = function () {
    return data;
  };

  return data;
}

function _UniversalDisposable() {
  const data = _interopRequireDefault(require("../nuclide-commons/UniversalDisposable"));

  _UniversalDisposable = function () {
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
// Delay for logging method names; allows aggregating logging of method calls
const LOG_AGGREGATION_MS = 200;
const logger = (0, _log4js().getLogger)('server'); // Apparently the way are dynamically require()'ing this file from ServerLauncher.js
// prevents us from using `export default function`, so we have to use the more
// well-defined equivalent, `module.exports = function()`.

/**
 * @return {Promise<void>} Note that this function must return a Promise to
 *     satisfy the contract of parseArgsAndRunMain().
 */
// eslint-disable-next-line nuclide-internal/no-commonjs

module.exports = function launch(server) {
  server.addSubscriber('json-rpc', {
    onConnection(transport) {
      // To ensure no messages get missed while we are creating the
      // TransportHandler, store all messages in a backlog while we are waiting
      // for it to be created. Once it is available, replay all messages from
      // the backlog.
      //
      // NOTE: transport.onMessage().subscribe() MUST be called synchronously as
      // part of onConnection() because we must have this subscription in place
      // before we give up the event loop, as there could be messages waiting to
      // be processed on the next turn of the event loop and we want to be sure
      // we do not miss any.
      const backlog = [];
      let handler = null;
      transport.onMessage().subscribe(message => {
        if (handler != null) {
          handler.onMessage(message);
        } else {
          backlog.push(message);
        }
      }, error => {
        // TODO: this is not currently called
        logger.error(error);
      }, () => {
        if (handler != null) {
          handler.complete();
        }
      });
      createTransportHandler(transport).then(h => {
        handler = h;

        for (const message of backlog) {
          h.onMessage(message);
        } // Clear out the list so the messages can be garbage-collected.


        backlog.splice(0, backlog.length);
      });
    }

  });
  return Promise.resolve();
};

async function createTransportHandler(transport) {
  const watcher = new (_nuclideWatchmanHelpers().WatchmanClient)();
  return new TransportHandler(transport, (await (0, _FileSearcher().createFileSearcher)()), watcher);
}

class TransportHandler {
  // Prevent many successive method calls from overwhelming the log
  constructor(transport, fileSearcher, watcher) {
    this._streams = new Map();
    this._logMethodAggregator = null;
    this._disposables = new (_UniversalDisposable().default)();
    this._transport = transport;
    this._rpcMethods = new Map();
    this.register('stream-unsubscribe', async (id, params) => {
      logger.info(`Client unsubscribed from stream ${id}`);

      const subscription = this._streams.get(id);

      if (subscription != null) {
        subscription.unsubscribe();

        this._streams.delete(id);
      }
    }); // TODO(mbolin): As appropriate, move some of this functionality into
    // BigDigServer such that it is supported by default, not just in the VS
    // Code version of the server.

    const serverRpcMethods = new (_ServerRpcMethods().ServerRpcMethods)();
    serverRpcMethods.register(this);

    this._disposables.add(serverRpcMethods);

    const cliRpcMethods = new (_CliRpcMethods().CliRpcMethods)();
    cliRpcMethods.register(this);
    const debuggerRpcMethods = new (_DebuggerRpcMethods().DebuggerRpcMethods)();
    debuggerRpcMethods.register(this);
    const execRpcMethods = new (_ExecRpcMethods().ExecRpcMethods)();
    execRpcMethods.register(this);

    this._disposables.add(execRpcMethods);

    const fsRpcMethods = new (_FsRpcMethods().FsRpcMethods)(watcher);
    fsRpcMethods.register(this);
    const searchRpcMethods = new (_SearchRpcMethods().SearchRpcMethods)({
      forFiles: fileSearcher.search.bind(fileSearcher),
      forText: textSearcher().search
    });
    searchRpcMethods.register(this);

    this._disposables.add(searchRpcMethods);

    const lspRpcMethods = new (_LspRpcMethods().LspRpcMethods)();
    lspRpcMethods.register(this);
    const hgRpcMethods = new (_HgRpcMethods().HgRpcMethods)(watcher);
    hgRpcMethods.register(this);
    logger.info('Created TransportHandler.');
  }

  complete() {
    logger.info('Disposing transport handler.');

    for (const subscription of this._streams.values()) {
      subscription.unsubscribe();
    }

    this._streams.clear();

    this._disposables.dispose();
  }

  register(methodName, method) {
    const existingMethod = this._rpcMethods.get(methodName);

    if (existingMethod == null) {
      this._rpcMethods.set(methodName, method);
    } else {
      throw new Error(`RpcMethod already registered for ${methodName}`);
    }
  }

  registerFun(methodName, handler) {
    this.register(methodName, async (id, params) => {
      let result;

      try {
        result = await handler(params);
      } catch (error) {
        this._sendError(id, error);

        return;
      }

      this._send({
        id,
        result
      }, `Failed sending result of ${methodName} (id: ${id})`);
    });
  }

  registerObservable(methodName, f) {
    this.register(methodName, async (id, params) => {
      try {
        const obs = f(params);
        const subscription = obs.finally(() => this._streams.delete(id)).subscribe(message => this._send({
          id,
          message
        }, `Failed sending message for ${methodName} (id: ${id})`), error => {
          this._sendError(id, error);
        }, complete => {
          this._send({
            id,
            complete: {}
          }, `Failed sending completion for ${methodName} (id: ${id})`);
        });

        this._streams.set(id, subscription);
      } catch (error) {
        this._streams.delete(id);

        this._sendError(id, error);
      }
    });
  }

  onMessage(data) {
    const message = JSON.parse(data);
    const {
      id,
      method,
      params
    } = message;

    this._logMethod(id, method, params);

    const rpcMethod = this._rpcMethods.get(method);

    if (rpcMethod != null) {
      rpcMethod(id, params);
    } else {
      logger.warn(`No method handler for ${method}.`);
    }
  }

  _send(response, errorMessage) {
    try {
      this._transport.send(JSON.stringify(response));
    } catch (error) {
      // This can happen if e.g. the message is too big (`RangeError`)
      if (errorMessage != null) {
        logger.error(errorMessage);
      }

      logger.error(error);
      throw error;
    }
  }

  _sendError(id, error) {
    const rpcError = _RpcMethodError().RpcMethodError.wrap(error);

    this._send({
      id,
      error: rpcError.message,
      errorParams: rpcError.parameters
    }, `Failed to send error message (id: ${id})`);
  }

  _logAggregatedMethods() {
    if (this._logMethodAggregator != null) {
      const {
        method,
        count,
        timer
      } = this._logMethodAggregator;
      this._logMethodAggregator = null;
      clearTimeout(timer);
      const times = count <= 1 ? '' : ` (${count} times)`;
      logger.info(`Received request for method: ${method}${times}`);
    }
  }

  _logMethod(id, method, params) {
    if (this._logMethodAggregator != null) {
      const cache = this._logMethodAggregator;

      if (method === cache.method) {
        ++this._logMethodAggregator.count;
        return;
      } else {
        this._logAggregatedMethods();
      }
    }

    const timer = setTimeout(() => this._logAggregatedMethods(), LOG_AGGREGATION_MS);
    this._logMethodAggregator = {
      timer,
      method,
      count: 1
    };
  }

}