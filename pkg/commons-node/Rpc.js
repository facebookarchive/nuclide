'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {Observable, Subscription} from 'rxjs';
import {observeStream, splitStream} from './stream';
import {getLogger} from '../nuclide-logging';
import invariant from 'assert';

const logger = getLogger();

const CALL_MESSAGE_TYPE = 'call';
const RESPONSE_MESSAGE_TYPE = 'response';

type CallMessage<T> = {
  type: 'call';
  id: number;
  args: T; // Typically Array<string | Object>
};

type ResponseError = {
  code?: number;
  message: string;
};

type ResponseMessage<T> = {
  type: 'response';
  id: number;
  result?: T;
  error?: ResponseError;
};

type CallResolver<T> = {
  resolve: (result: T) => void;
  reject: (err: Error) => void;
};

export function createCallMessage<T>(id: number, args: T): CallMessage<T> {
  return {
    type: CALL_MESSAGE_TYPE,
    id,
    args,
  };
}

export function isValidResponseMessage(obj: any): boolean {
  return obj.type === RESPONSE_MESSAGE_TYPE
    && typeof obj.id === 'number'
    && ((obj.result == null) !== (obj.error == null));
}

interface Transport {
  sendMessage(message: string): void;
  onMessage(): Observable<string>;
}

export class StreamTransport {
  _output: stream$Writable;
  _messages: Observable<string>;

  constructor(output: stream$Writable, input: stream$Readable) {
    this._output = output;
    this._messages = splitStream(observeStream(input));
  }
  sendMessage(message: string): void {
    invariant(message.indexOf('\n') === -1);
    this._output.write(message + '\n');
  }
  onMessage(): Observable<string> {
    return this._messages;
  }
}

export class Rpc<TReq, TRes> {
  _name: string;
  _disposed: boolean;
  _index: number;
  _inProgress: Map<number, CallResolver<TRes>>;
  _transport: Transport;
  _subscription: Subscription;

  constructor(name: string, transport: Transport) {
    this._name = name;
    this._disposed = false;
    this._index = 0;
    this._inProgress = new Map();
    this._transport = transport;
    this._subscription = transport.onMessage().do(message => {
      this._handleMessage(message);
    }).subscribe();
  }

  getName(): string {
    return this._name;
  }

  call(args: TReq): Promise<TRes> {
    invariant(!this._disposed, `${this._name} - called after dispose: ${args}`);
    this._index++;
    const message = createCallMessage(this._index, args);
    const messageString = JSON.stringify(message);
    logger.debug(`${this._name} - Sending RPC: ${messageString}`);
    this._transport.sendMessage(messageString);

    return new Promise((resolve, reject) => {
      this._inProgress.set(this._index, {resolve, reject});
    });
  }

  dispose(): void {
    this._disposed = true;
    this._subscription.unsubscribe();
    this._clearInProgress();
  }

  _handleMessage(messageString: string): void {
    invariant(!this._disposed, `${this._name} - received after dispose: ${messageString}`);
    let messageObject;
    try {
      messageObject = JSON.parse(messageString);
    } catch (e) {
      logger.debug(`${this._name} - error: parsing RPC message.`);
      return;
    }

    if (!isValidResponseMessage(messageObject)) {
      logger.debug(`${this._name} - error: received invalid RPC response.`);
      return;
    }
    const response: ResponseMessage = messageObject;
    const {id, result, error} = response;

    const inProgress = this._inProgress.get(id);
    if (inProgress == null) {
      logger.debug(`${this._name} - error: received RPC response with invalid index.`);
      return;
    }

    const {resolve, reject} = inProgress;
    this._inProgress.delete(id);
    if (error != null) {
      // Stringify the error only if it's not already a string, to avoid extra
      // double quotes around strings.
      const errStr = (typeof error === 'string') ? error : JSON.stringify(error);
      logger.debug(`${this._name} - error from RPC ${id}: ${errStr}`);
      reject(new Error(errStr));
    } else {
      logger.debug(`${this._name} - returning ${JSON.stringify(result)} from RPC ${id}`);
      invariant(result, `${this._name} - neither result or error received in response`);
      resolve(result);
    }
  }

  _clearInProgress(): void {
    this._inProgress.forEach(({resolve, reject}) => {
      const err = new Error('Server exited.');
      reject(err);
    });
    this._inProgress.clear();
  }
}
