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
export type RequestMessage = CallRemoteFunctionMessage | CreateRemoteObjectMessage |
  CallRemoteMethodMessage | DisposeRemoteObjectMessage;

export type CallRemoteFunctionMessage = {
  protocol: 'service_framework3_rpc';
  type: 'FunctionCall';
  function: string;
  requestId: number;
  args: Array<any>;
};

export type CreateRemoteObjectMessage = {
  protocol: 'service_framework3_rpc';
  type: 'NewObject';
  interface: string;
  requestId: number;
  args: Array<any>;
};

export type CallRemoteMethodMessage = {
  protocol: 'service_framework3_rpc';
  type: 'MethodCall';
  method: string;
  requestId: number;
  objectId: number;
  args: Array<any>;
};

export type DisposeRemoteObjectMessage = {
  protocol: 'service_framework3_rpc';
  type: 'DisposeObject';
  requestId: number;
  objectId: number;
};

export type DisposeObservableMessage = {
  protocol: 'service_framework3_rpc';
  type: 'DisposeObservable';
  requestId: number;
};

// Encodes the structure of messages that can be sent from the server to the client.
export type ResponseMessage =
  PromiseResponseMessage | ErrorResponseMessage | ObservableResponseMessage;

export type ErrorResponseMessage = {
  protocol: 'service_framework3_rpc';
  type: 'ErrorMessage';
  requestId: number;
  error: any;
};

export type PromiseResponseMessage = {
  protocol: 'service_framework3_rpc';
  type: 'PromiseMessage';
  requestId: number;
  result: any;
};

export type ObservableResponseMessage = {
  protocol: 'service_framework3_rpc';
  type: 'ObservableMessage';
  requestId: number;
  result: ObservableResult;
};

export type ObservableResult = { type: 'completed'; } | { type: 'next'; data: any };


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

export function createCallFunctionMessage(
  functionName: string,
  requestId: number,
  args: Array<any>
): CallRemoteFunctionMessage {
  return {
    protocol: SERVICE_FRAMEWORK3_PROTOCOL,
    type: 'FunctionCall',
    function: functionName,
    requestId,
    args,
  };
}

export function createCallMethodMessage(
  methodName: string,
  objectId: number,
  requestId: number,
  args: Array<any>
): CallRemoteMethodMessage {
  return {
    protocol: SERVICE_FRAMEWORK3_PROTOCOL,
    type: 'MethodCall',
    method: methodName,
    objectId,
    requestId,
    args,
  };
}

export function createNewObjectMessage(
  interfaceName: string,
  requestId: number,
  args: Array<any>
): CreateRemoteObjectMessage {
  return {
    protocol: SERVICE_FRAMEWORK3_PROTOCOL,
    type: 'NewObject',
    interface: interfaceName,
    requestId,
    args,
  };
}

export function createPromiseMessage(requestId: number, result: any): PromiseResponseMessage {
  return {
    protocol: SERVICE_FRAMEWORK3_PROTOCOL,
    type: 'PromiseMessage',
    requestId,
    result,
  };
}

export function createNextMessage(requestId: number, data: any): ObservableResponseMessage {
  return {
    protocol: SERVICE_FRAMEWORK3_PROTOCOL,
    type: 'ObservableMessage',
    requestId,
    result: {
      type: 'next',
      data,
    },
  };
}

export function createCompletedMessage(requestId: number): ObservableResponseMessage {
  return {
    protocol: SERVICE_FRAMEWORK3_PROTOCOL,
    type: 'ObservableMessage',
    requestId,
    result: {type: 'completed'},
  };
}

export function createDisposeMessage(requestId: number): DisposeObservableMessage {
  return {
    protocol: SERVICE_FRAMEWORK3_PROTOCOL,
    type: 'DisposeObservable',
    requestId,
  };
}

export function createErrorMessage(requestId: number, error: any): ErrorResponseMessage {
  return {
    protocol: SERVICE_FRAMEWORK3_PROTOCOL,
    type: 'ErrorMessage',
    requestId,
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
