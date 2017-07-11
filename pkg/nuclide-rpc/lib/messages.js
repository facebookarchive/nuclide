'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.decodeError = decodeError;
exports.createCallMessage = createCallMessage;
exports.createCallObjectMessage = createCallObjectMessage;
exports.createNewObjectMessage = createNewObjectMessage;
exports.createPromiseMessage = createPromiseMessage;
exports.createNextMessage = createNextMessage;
exports.createCompleteMessage = createCompleteMessage;
exports.createObserveErrorMessage = createObserveErrorMessage;
exports.createDisposeMessage = createDisposeMessage;
exports.createUnsubscribeMessage = createUnsubscribeMessage;
exports.createErrorResponseMessage = createErrorResponseMessage;


// TODO: This should be a custom marshaller registered in the TypeRegistry


// Encodes the structure of messages that can be sent from the server to the client.
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 */

// Encodes the structure of messages that can be sent from the client to the server.
function decodeError(message, encodedError) {
  if (encodedError != null && typeof encodedError === 'object') {
    const resultError = new Error();
    resultError.message = `Remote Error: ${encodedError.message} processing message ${JSON.stringify(message)}\n` + JSON.stringify(encodedError.stack);
    // $FlowIssue - some Errors (notably file operations) have a code.
    resultError.code = encodedError.code;
    resultError.stack = encodedError.stack;
    return resultError;
  } else {
    return encodedError;
  }
}

function createCallMessage(protocol, functionName, id, args) {
  return {
    protocol,
    type: 'call',
    method: functionName,
    id,
    args
  };
}

function createCallObjectMessage(protocol, methodName, objectId, id, args) {
  return {
    protocol,
    type: 'call-object',
    method: methodName,
    objectId,
    id,
    args
  };
}

function createNewObjectMessage(protocol, interfaceName, id, args) {
  return {
    protocol,
    type: 'new',
    interface: interfaceName,
    id,
    args
  };
}

function createPromiseMessage(protocol, id, result) {
  return {
    protocol,
    type: 'response',
    id,
    result
  };
}

function createNextMessage(protocol, id, value) {
  return {
    protocol,
    type: 'next',
    id,
    value
  };
}

function createCompleteMessage(protocol, id) {
  return {
    protocol,
    type: 'complete',
    id
  };
}

function createObserveErrorMessage(protocol, id, error) {
  return {
    protocol,
    type: 'error',
    id,
    error: formatError(error)
  };
}

function createDisposeMessage(protocol, id, objectId) {
  return {
    protocol,
    type: 'dispose',
    id,
    objectId
  };
}

function createUnsubscribeMessage(protocol, id) {
  return {
    protocol,
    type: 'unsubscribe',
    id
  };
}

function createErrorResponseMessage(protocol, id, error) {
  return {
    protocol,
    type: 'error-response',
    id,
    error: formatError(error)
  };
}

/**
 * Format the error before sending over the web socket.
 * TODO: This should be a custom marshaller registered in the TypeRegistry
 */
function formatError(error) {
  if (error instanceof Error) {
    return {
      message: error.message,
      code: error.code,
      stack: error.stack
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