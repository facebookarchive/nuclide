'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {SERVICE_FRAMEWORK3_PROTOCOL} from './config';

// Encodes the structure of messages that can be sent from the client to the server.
export type RequestMessage = CallMessage | NewObjectMessage |
  CallObjectMessage | DisposeRemoteObjectMessage;

export type CallMessage = {
  protocol: 'service_framework3_rpc';
  type: 'call';
  method: string;
  id: number;
  args: Array<any>;
};

export type NewObjectMessage = {
  protocol: 'service_framework3_rpc';
  type: 'new';
  interface: string;
  id: number;
  args: Array<any>;
};

export type CallObjectMessage = {
  protocol: 'service_framework3_rpc';
  type: 'call-object';
  method: string;
  id: number;
  objectId: number;
  args: Array<any>;
};

export type DisposeRemoteObjectMessage = {
  protocol: 'service_framework3_rpc';
  type: 'DisposeObject';
  id: number;
  objectId: number;
};

export type DisposeObservableMessage = {
  protocol: 'service_framework3_rpc';
  type: 'DisposeObservable';
  id: number;
};

// Encodes the structure of messages that can be sent from the server to the client.
export type ResponseMessage =
  PromiseResponseMessage | ErrorResponseMessage | ObservableResponseMessage;

export type ErrorResponseMessage = {
  protocol: 'service_framework3_rpc';
  type: 'error-response';
  id: number;
  error: any;
};

export type PromiseResponseMessage = {
  protocol: 'service_framework3_rpc';
  type: 'PromiseMessage';
  id: number;
  result: any;
};

export type ObservableResponseMessage = {
  protocol: 'service_framework3_rpc';
  type: 'ObservableMessage';
  id: number;
  result: ObservableResult;
};

export type ObservableResult =
  { type: 'completed'; } |
  { type: 'next'; data: any } |
  { type: 'error'; error: any};


// TODO: This should be a custom marshaller registered in the TypeRegistry
export function decodeError(message: Object, encodedError: ?(Object | string)): ?(Error | string) {
  if (encodedError != null && typeof encodedError === 'object') {
    const resultError = new Error();
    resultError.message =
      `Remote Error: ${encodedError.message} processing message ${JSON.stringify(message)}\n`
      + JSON.stringify(encodedError.stack);
    // $FlowIssue - some Errors (notably file operations) have a code.
    resultError.code = encodedError.code;
    resultError.stack = encodedError.stack;
    return resultError;
  } else {
    return encodedError;
  }
}

export function createCallMessage(
  functionName: string,
  id: number,
  args: Array<any>,
): CallMessage {
  return {
    protocol: SERVICE_FRAMEWORK3_PROTOCOL,
    type: 'call',
    method: functionName,
    id,
    args,
  };
}

export function createCallObjectMessage(
  methodName: string,
  objectId: number,
  id: number,
  args: Array<any>,
): CallObjectMessage {
  return {
    protocol: SERVICE_FRAMEWORK3_PROTOCOL,
    type: 'call-object',
    method: methodName,
    objectId,
    id,
    args,
  };
}

export function createNewObjectMessage(
  interfaceName: string,
  id: number,
  args: Array<any>,
): NewObjectMessage {
  return {
    protocol: SERVICE_FRAMEWORK3_PROTOCOL,
    type: 'new',
    interface: interfaceName,
    id,
    args,
  };
}

export function createPromiseMessage(id: number, result: any): PromiseResponseMessage {
  return {
    protocol: SERVICE_FRAMEWORK3_PROTOCOL,
    type: 'PromiseMessage',
    id,
    result,
  };
}

export function createNextMessage(id: number, data: any): ObservableResponseMessage {
  return {
    protocol: SERVICE_FRAMEWORK3_PROTOCOL,
    type: 'ObservableMessage',
    id,
    result: {
      type: 'next',
      data,
    },
  };
}

export function createCompletedMessage(id: number): ObservableResponseMessage {
  return {
    protocol: SERVICE_FRAMEWORK3_PROTOCOL,
    type: 'ObservableMessage',
    id,
    result: {type: 'completed'},
  };
}

export function createObserveErrorMessage(
  id: number,
  error: any,
): ObservableResponseMessage {
  return {
    protocol: SERVICE_FRAMEWORK3_PROTOCOL,
    type: 'ObservableMessage',
    id,
    result: {
      type: 'error',
      error: formatError(error),
    },
  };
}

export function createDisposeMessage(id: number): DisposeObservableMessage {
  return {
    protocol: SERVICE_FRAMEWORK3_PROTOCOL,
    type: 'DisposeObservable',
    id,
  };
}

export function createErrorResponseMessage(id: number, error: any): ErrorResponseMessage {
  return {
    protocol: SERVICE_FRAMEWORK3_PROTOCOL,
    type: 'error-response',
    id,
    error: formatError(error),
  };
}

/**
 * Format the error before sending over the web socket.
 * TODO: This should be a custom marshaller registered in the TypeRegistry
 */
function formatError(error: any): ?(Object | string) {
  if (error instanceof Error) {
    return {
      message: error.message,
      code: error.code,
      stack: error.stack,
    };
  } else if (typeof error === 'string') {
    return error.toString();
  } else if (error === undefined) {
    return undefined;
  } else {
    try {
      return `Unknown Error: ${JSON.stringify(error, null, 2)}`;
    } catch (jsonError) {
      return `Unknown Error: ${error.toString()}`;
    }
  }
}
