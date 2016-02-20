'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {Observable} from 'rx';
import {observeStream, splitStream} from '../../commons';
const logger = require('../../logging').getLogger();
import invariant from 'assert';

const CALL_MESSAGE_TYPE = 'call';
const RESPONSE_MESSAGE_TYPE = 'response';

type CallMessage = {
  type: 'call';
  id: number;
  args: any; // Typically Array<string | Object>
}

type ResponseError = {
  code?: number;
  message: string;
};

type ResponseMessage = {
  type: 'response';
  id: number;
  result?: any;
  error?: ResponseError;
};

type CallResolver = {
  resolve: (result: string | Object) => void;
  reject: (message: any) => void;
};

export function createCallMessage(id: number, args: any): CallMessage {
  return {
    type: CALL_MESSAGE_TYPE,
    id,
    args,
  };
}

export function createSuccessResponseMessage(id: number, result: any): ResponseMessage {
  return {
    type: RESPONSE_MESSAGE_TYPE,
    id,
    result,
  };
}

export function createErrorReponseMessage(id: number, error: ResponseError): ResponseMessage {
  return {
    type: RESPONSE_MESSAGE_TYPE,
    id,
    error,
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

export class HackRpc {
  _index: number;
  _inProgress: Map<number, CallResolver>;
  _transport: Transport;
  _subscription: IDisposable;

  constructor(transport: Transport) {
    this._index = 0;
    this._inProgress = new Map();
    this._transport = transport;
    this._subscription = transport.onMessage().doOnNext(message => {
      this._handleMessage(message);
    }).subscribe();
  }

  call(args: Array<string>): Promise<string | Object> {
    this._index++;
    const message = createCallMessage(this._index, args);
    const messageString = JSON.stringify(message);
    logger.debug(`Sending Hack Rpc: ${messageString}`);
    this._transport.sendMessage(messageString);

    return new Promise((resolve, reject) => {
      this._inProgress.set(this._index, {resolve, reject});
    });
  }

  dispose(): void {
    this._subscription.dispose();
  }

  _handleMessage(messageString: string): void {
    logger.debug(`Received Hack Rpc response: ${messageString}`);
    let messageObject;
    try {
      messageObject = JSON.parse(messageString);
    } catch (e) {
      logger.debug(`Error: Parsing hack Rpc message.`);
      return;
    }

    if (!isValidResponseMessage(messageObject)) {
      logger.debug(`Error: Received invalid Hack Rpc response.`);
      return;
    }
    const response: ResponseMessage = messageObject;
    const {id, result, error} = response;

    const inProgress = this._inProgress.get(id);
    if (inProgress == null) {
      logger.debug(`Error: Received Hack Rpc response with invalid index.`);
      return;
    }

    const {resolve, reject} = inProgress;
    this._inProgress.delete(id);
    if (result != null) {
      logger.debug(`Returning ${JSON.stringify(result)} from Hack RPC ${id}`);
      resolve(result);
      return;
    } else {
      invariant(error != null);
      logger.debug(`Error ${JSON.stringify(error)} from Hack RPC ${id}`);
      reject(error);
    }
  }
}
