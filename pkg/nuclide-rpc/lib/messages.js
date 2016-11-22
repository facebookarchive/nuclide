'use strict';
'use babel';

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

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

var _config;

function _load_config() {
  return _config = require('./config');
}

// TODO: This should be a custom marshaller registered in the TypeRegistry


// Encodes the structure of messages that can be sent from the client to the server.


// Encodes the structure of messages that can be sent from the server to the client.
function decodeError(message, encodedError) {
  if (encodedError != null && typeof encodedError === 'object') {
    const resultError = new Error();
    resultError.message = `Remote Error: ${ encodedError.message } processing message ${ JSON.stringify(message) }\n` + JSON.stringify(encodedError.stack);
    // $FlowIssue - some Errors (notably file operations) have a code.
    resultError.code = encodedError.code;
    resultError.stack = encodedError.stack;
    return resultError;
  } else {
    return encodedError;
  }
}function createCallMessage(functionName, id, args) {
  return {
    protocol: (_config || _load_config()).SERVICE_FRAMEWORK3_PROTOCOL,
    type: 'call',
    method: functionName,
    id: id,
    args: args
  };
}

function createCallObjectMessage(methodName, objectId, id, args) {
  return {
    protocol: (_config || _load_config()).SERVICE_FRAMEWORK3_PROTOCOL,
    type: 'call-object',
    method: methodName,
    objectId: objectId,
    id: id,
    args: args
  };
}

function createNewObjectMessage(interfaceName, id, args) {
  return {
    protocol: (_config || _load_config()).SERVICE_FRAMEWORK3_PROTOCOL,
    type: 'new',
    interface: interfaceName,
    id: id,
    args: args
  };
}

function createPromiseMessage(id, result) {
  return {
    protocol: (_config || _load_config()).SERVICE_FRAMEWORK3_PROTOCOL,
    type: 'response',
    id: id,
    result: result
  };
}

function createNextMessage(id, value) {
  return {
    protocol: (_config || _load_config()).SERVICE_FRAMEWORK3_PROTOCOL,
    type: 'next',
    id: id,
    value: value
  };
}

function createCompleteMessage(id) {
  return {
    protocol: (_config || _load_config()).SERVICE_FRAMEWORK3_PROTOCOL,
    type: 'complete',
    id: id
  };
}

function createObserveErrorMessage(id, error) {
  return {
    protocol: (_config || _load_config()).SERVICE_FRAMEWORK3_PROTOCOL,
    type: 'error',
    id: id,
    error: formatError(error)
  };
}

function createDisposeMessage(id, objectId) {
  return {
    protocol: (_config || _load_config()).SERVICE_FRAMEWORK3_PROTOCOL,
    type: 'dispose',
    id: id,
    objectId: objectId
  };
}

function createUnsubscribeMessage(id) {
  return {
    protocol: (_config || _load_config()).SERVICE_FRAMEWORK3_PROTOCOL,
    type: 'unsubscribe',
    id: id
  };
}

function createErrorResponseMessage(id, error) {
  return {
    protocol: (_config || _load_config()).SERVICE_FRAMEWORK3_PROTOCOL,
    type: 'error-response',
    id: id,
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
      return `Unknown Error: ${ JSON.stringify(error, null, 2) }`;
    } catch (jsonError) {
      return `Unknown Error: ${ error.toString() }`;
    }
  }
}