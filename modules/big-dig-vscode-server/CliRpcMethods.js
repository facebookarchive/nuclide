/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow strict-local
 * @format
 */

import * as path from 'path';
import {getLogger} from 'log4js';
import {Observable, Observer} from 'rxjs';
import net from 'net';
import {shellParse} from 'nuclide-commons/string';
import fs from 'nuclide-commons/fsPromise';
import type {RpcRegistrar} from './rpc-types';
import * as proto from './Protocol';

const CLI_SOCKET = '/tmp/big-dig-vscode';
const logger = getLogger('cli');

export class CliRpcMethods {
  _observer: Observable<string>;

  register(registrar: RpcRegistrar) {
    if (this._observer == null) {
      this._observer = this._observeCli();
    }
    registrar.registerObservable('cli/listen', this._listen.bind(this));
  }

  _observeCli(): Observable<string> {
    return Observable.create(observer => {
      try {
        const cliServer = net.createServer((cliSocket: net.Socket) =>
          this._onCliConnection(observer, cliSocket),
        );
        fs.rimraf(CLI_SOCKET).then(
          () => cliServer.listen(CLI_SOCKET),
          (error: mixed) => observer.error(error),
        );
      } catch (error) {
        observer.error(error);
      }
    });
  }

  _onCliConnection(observer: Observer<string>, cliSocket: net.Socket) {
    let data = '';
    cliSocket.on('data', (msg: string | Buffer) => {
      data += String(msg).trim();
    });
    cliSocket.on('error', (error: mixed) => {
      logger.warn(error);
    });
    cliSocket.on('end', () => {
      observer.next(data);
    });
  }

  _listen(params: proto.CliListenParams): Observable<proto.CliListenData> {
    return this._observer
      .concatMap(async (msg: string) => {
        logger.info(msg);
        const args = shellParse(msg);
        if (args.length > 2 && args[0] === params.session) {
          const cwd = args[1];
          const files = args.slice(2).map(file => path.resolve(cwd, file));
          return {cwd, files};
        } else {
          return null;
        }
      })
      .concatMap(v => (v == null ? [] : [v]));
  }
}
