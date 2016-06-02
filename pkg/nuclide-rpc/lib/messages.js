Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.decodeError = decodeError;
exports.createCallFunctionMessage = createCallFunctionMessage;
exports.createCallMethodMessage = createCallMethodMessage;
exports.createNewObjectMessage = createNewObjectMessage;
exports.createPromiseMessage = createPromiseMessage;
exports.createNextMessage = createNextMessage;
exports.createCompletedMessage = createCompletedMessage;
exports.createDisposeMessage = createDisposeMessage;
exports.createErrorMessage = createErrorMessage;

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _config2;

function _config() {
  return _config2 = require('./config');
}

// Encodes the structure of messages that can be sent from the client to the server.

// Encodes the structure of messages that can be sent from the server to the client.

// TODO: This should be a custom marshaller registered in the TypeRegistry

function decodeError(message, encodedError) {
  if (encodedError != null && typeof encodedError === 'object') {
    var resultError = new Error();
    resultError.message = 'Remote Error: ' + encodedError.message + ' processing message ' + JSON.stringify(message) + '\n' + JSON.stringify(encodedError.stack);
    // $FlowIssue - some Errors (notably file operations) have a code.
    resultError.code = encodedError.code;
    resultError.stack = encodedError.stack;
    return resultError;
  } else {
    return encodedError;
  }
}

function createCallFunctionMessage(functionName, requestId, args) {
  return {
    protocol: (_config2 || _config()).SERVICE_FRAMEWORK3_PROTOCOL,
    type: 'FunctionCall',
    'function': functionName,
    requestId: requestId,
    args: args
  };
}

function createCallMethodMessage(methodName, objectId, requestId, args) {
  return {
    protocol: (_config2 || _config()).SERVICE_FRAMEWORK3_PROTOCOL,
    type: 'MethodCall',
    method: methodName,
    objectId: objectId,
    requestId: requestId,
    args: args
  };
}

function createNewObjectMessage(interfaceName, requestId, args) {
  return {
    protocol: (_config2 || _config()).SERVICE_FRAMEWORK3_PROTOCOL,
    type: 'NewObject',
    'interface': interfaceName,
    requestId: requestId,
    args: args
  };
}

function createPromiseMessage(requestId, result) {
  return {
    protocol: (_config2 || _config()).SERVICE_FRAMEWORK3_PROTOCOL,
    type: 'PromiseMessage',
    requestId: requestId,
    result: result
  };
}

function createNextMessage(requestId, data) {
  return {
    protocol: (_config2 || _config()).SERVICE_FRAMEWORK3_PROTOCOL,
    type: 'ObservableMessage',
    requestId: requestId,
    result: {
      type: 'next',
      data: data
    }
  };
}

function createCompletedMessage(requestId) {
  return {
    protocol: (_config2 || _config()).SERVICE_FRAMEWORK3_PROTOCOL,
    type: 'ObservableMessage',
    requestId: requestId,
    result: { type: 'completed' }
  };
}

function createDisposeMessage(requestId) {
  return {
    protocol: (_config2 || _config()).SERVICE_FRAMEWORK3_PROTOCOL,
    type: 'DisposeObservable',
    requestId: requestId
  };
}

function createErrorMessage(requestId, error) {
  return {
    protocol: (_config2 || _config()).SERVICE_FRAMEWORK3_PROTOCOL,
    type: 'ErrorMessage',
    requestId: requestId,
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
      return 'Unknown Error: ' + JSON.stringify(error, null, 2);
    } catch (jsonError) {
      return 'Unknown Error: ' + error.toString();
    }
  }
}