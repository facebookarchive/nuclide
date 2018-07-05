/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow
 * @format
 */

import type {FileSearcher} from './FileSearcher';
import type {RpcMethod, RpcRegistrar} from './rpc-types';
import type {Transport, BigDigServer} from 'big-dig/src/server/BigDigServer';
import type {Observable, Subscription} from 'rxjs';

import {createFileSearcher} from './FileSearcher';
import {getLogger} from 'log4js';
import {CliRpcMethods} from './CliRpcMethods';
import {ServerRpcMethods} from './ServerRpcMethods';
import {DebuggerRpcMethods} from './DebuggerRpcMethods';
import {ExecRpcMethods} from './ExecRpcMethods';
import {FsRpcMethods} from './FsRpcMethods';
import {HgRpcMethods} from './HgRpcMethods';
import {LspRpcMethods} from './LspRpcMethods';
import {SearchRpcMethods} from './SearchRpcMethods';
import {WatchmanClient} from 'nuclide-watchman-helpers';
import {RpcMethodError} from './RpcMethodError';
import * as textSearcher from './TextSearch';
import UniversalDisposable from 'nuclide-commons/UniversalDisposable';

// Delay for logging method names; allows aggregating logging of method calls
const LOG_AGGREGATION_MS = 200;

const logger = getLogger('server');

// Apparently the way are dynamically require()'ing this file from ServerLauncher.js
// prevents us from using `export default function`, so we have to use the more
// well-defined equivalent, `module.exports = function()`.
/**
 * @return {Promise<void>} Note that this function must return a Promise to
 *     satisfy the contract of parseArgsAndRunMain().
 */
// eslint-disable-next-line nuclide-internal/no-commonjs
module.exports = function launch(server: BigDigServer): Promise<void> {
  server.addSubscriber('json-rpc', {
    onConnection(transport: Transport) {
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
      let handler: ?TransportHandler = null;

      transport.onMessage().subscribe(
        (message: string) => {
          if (handler != null) {
            handler.onMessage(message);
          } else {
            backlog.push(message);
          }
        },
        error => {
          // TODO: this is not currently called
          logger.error(error);
        },
        () => {
          if (handler != null) {
            handler.complete();
          }
        },
      );

      createTransportHandler(transport).then(h => {
        handler = h;
        for (const message of backlog) {
          h.onMessage(message);
        }

        // Clear out the list so the messages can be garbage-collected.
        backlog.splice(0, backlog.length);
      });
    },
  });

  return Promise.resolve();
};

async function createTransportHandler(
  transport: Transport,
): Promise<TransportHandler> {
  const watcher = new WatchmanClient();

  return new TransportHandler(transport, await createFileSearcher(), watcher);
}

class TransportHandler implements RpcRegistrar {
  _transport: Transport;
  _rpcMethods: Map<string, RpcMethod>;
  _streams: Map<string, Subscription> = new Map();

  // Prevent many successive method calls from overwhelming the log
  _logMethodAggregator: ?{
    timer: TimeoutID,
    method: string,
    count: number,
  } = null;

  _disposables = new UniversalDisposable();

  constructor(
    transport: Transport,
    fileSearcher: FileSearcher,
    watcher: WatchmanClient,
  ) {
    this._transport = transport;
    this._rpcMethods = new Map();

    this.register('stream-unsubscribe', async (id: string, params: any) => {
      logger.info(`Client unsubscribed from stream ${id}`);
      const subscription = this._streams.get(id);
      if (subscription != null) {
        subscription.unsubscribe();
        this._streams.delete(id);
      }
    });

    // TODO(mbolin): As appropriate, move some of this functionality into
    // BigDigServer such that it is supported by default, not just in the VS
    // Code version of the server.
    const serverRpcMethods = new ServerRpcMethods();
    serverRpcMethods.register(this);
    this._disposables.add(serverRpcMethods);

    const cliRpcMethods = new CliRpcMethods();
    cliRpcMethods.register(this);
    const debuggerRpcMethods = new DebuggerRpcMethods();
    debuggerRpcMethods.register(this);
    const execRpcMethods = new ExecRpcMethods();
    execRpcMethods.register(this);
    this._disposables.add(execRpcMethods);
    const fsRpcMethods = new FsRpcMethods(watcher);
    fsRpcMethods.register(this);
    const searchRpcMethods = new SearchRpcMethods({
      forFiles: fileSearcher.search.bind(fileSearcher),
      forText: textSearcher.search,
    });
    searchRpcMethods.register(this);
    this._disposables.add(searchRpcMethods);
    const lspRpcMethods = new LspRpcMethods();
    lspRpcMethods.register(this);
    const hgRpcMethods = new HgRpcMethods(watcher);
    hgRpcMethods.register(this);

    logger.info('Created TransportHandler.');
  }

  complete(): void {
    logger.info('Disposing transport handler.');

    for (const subscription of this._streams.values()) {
      subscription.unsubscribe();
    }
    this._streams.clear();

    this._disposables.dispose();
  }

  register(methodName: string, method: RpcMethod): void {
    const existingMethod = this._rpcMethods.get(methodName);
    if (existingMethod == null) {
      this._rpcMethods.set(methodName, method);
    } else {
      throw new Error(`RpcMethod already registered for ${methodName}`);
    }
  }

  registerFun<T1, T2>(methodName: string, handler: T1 => Promise<T2>) {
    this.register(methodName, async (id: string, params: any) => {
      let result: T2;
      try {
        result = await handler(params);
      } catch (error) {
        this._sendError(id, error);
        return;
      }

      this._send(
        {id, result},
        `Failed sending result of ${methodName} (id: ${id})`,
      );
    });
  }

  registerObservable<T1, T2>(methodName: string, f: T1 => Observable<T2>) {
    this.register(methodName, async (id: string, params: any) => {
      try {
        const obs = f(params);
        const subscription = obs
          .finally(() => this._streams.delete(id))
          .subscribe(
            message =>
              this._send(
                {id, message},
                `Failed sending message for ${methodName} (id: ${id})`,
              ),
            error => {
              this._sendError(id, error);
            },
            complete => {
              this._send(
                {id, complete: {}},
                `Failed sending completion for ${methodName} (id: ${id})`,
              );
            },
          );
        this._streams.set(id, subscription);
      } catch (error) {
        this._streams.delete(id);
        this._sendError(id, error);
      }
    });
  }

  onMessage(data: string) {
    const message = JSON.parse(data);
    const {id, method, params} = message;
    this._logMethod(id, method, params);

    const rpcMethod = this._rpcMethods.get(method);
    if (rpcMethod != null) {
      rpcMethod(id, params);
    } else {
      logger.warn(`No method handler for ${method}.`);
    }
  }

  _send(response: Object, errorMessage?: string) {
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

  _sendError(id: string, error: any) {
    const rpcError = RpcMethodError.wrap(error);
    this._send(
      {id, error: rpcError.message, errorParams: rpcError.parameters},
      `Failed to send error message (id: ${id})`,
    );
  }

  _logAggregatedMethods() {
    if (this._logMethodAggregator != null) {
      const {method, count, timer} = this._logMethodAggregator;
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

    const timer = setTimeout(
      () => this._logAggregatedMethods(),
      LOG_AGGREGATION_MS,
    );
    this._logMethodAggregator = {timer, method, count: 1};
  }
}
