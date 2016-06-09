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
  CallObjectMessage | DisposeMessage | UnsubscribeMessage;

export type CallMessage = {
  protocol: 'service_framework3_rpc';
  type: 'call';
  method: string;
  id: number;
  args: Object;
};

export type NewObjectMessage = {
  protocol: 'service_framework3_rpc';
  type: 'new';
  interface: string;
  id: number;
  args: Object;
};

export type CallObjectMessage = {
  protocol: 'service_framework3_rpc';
  type: 'call-object';
  method: string;
  id: number;
  objectId: number;
  args: Object;
};

export type DisposeMessage = {
  protocol: 'service_framework3_rpc';
  type: 'dispose';
  id: number;
  objectId: number;
};

export type UnsubscribeMessage = {
  protocol: 'service_framework3_rpc';
  type: 'unsubscribe';
  id: number;
};

// Encodes the structure of messages that can be sent from the server to the client.
export type ResponseMessage = PromiseResponseMessage | ErrorResponseMessage
  | NextMessage | CompleteMessage | ErrorMessage;

export type ErrorResponseMessage = {
  protocol: 'service_framework3_rpc';
  type: 'error-response';
  id: number;
  error: any;
};

export type PromiseResponseMessage = {
  protocol: 'service_framework3_rpc';
  type: 'response';
  id: number;
  result: any;
};

export type NextMessage = {
  protocol: 'service_framework3_rpc';
  type: 'next';
  id: number;
  value: any;
};

export type CompleteMessage = {
  protocol: 'service_framework3_rpc';
  type: 'complete';
  id: number;
};

export type ErrorMessage = {
  protocol: 'service_framework3_rpc';
  type: 'error';
  id: number;
  error: any;
};

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
  args: Object,
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
  args: Object,
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
  args: Object,
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
    type: 'response',
    id,
    result,
  };
}

export function createNextMessage(id: number, value: any): NextMessage {
  return {
    protocol: SERVICE_FRAMEWORK3_PROTOCOL,
    type: 'next',
    id,
    value,
  };
}

export function createCompleteMessage(id: number): CompleteMessage {
  return {
    protocol: SERVICE_FRAMEWORK3_PROTOCOL,
    type: 'complete',
    id,
  };
}

export function createObserveErrorMessage(
  id: number,
  error: any,
): ErrorMessage {
  return {
    protocol: SERVICE_FRAMEWORK3_PROTOCOL,
    type: 'error',
    id,
    error: formatError(error),
  };
}

export function createDisposeMessage(id: number, objectId: number): DisposeMessage {
  return {
    protocol: SERVICE_FRAMEWORK3_PROTOCOL,
    type: 'dispose',
    id,
    objectId,
  };
}

export function createUnsubscribeMessage(id: number): UnsubscribeMessage {
  return {
    protocol: SERVICE_FRAMEWORK3_PROTOCOL,
    type: 'unsubscribe',
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
