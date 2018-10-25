"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.sendTextResponse = sendTextResponse;
exports.sendJsonResponse = sendJsonResponse;
exports.parseRequestBody = parseRequestBody;
exports.getQueryParameters = getQueryParameters;
exports.serializeArgs = serializeArgs;
exports.deserializeArgs = deserializeArgs;
exports.protocolLogger = void 0;

var _url = _interopRequireDefault(require("url"));

function _memoryLogger() {
  const data = require("../../commons-node/memoryLogger");

  _memoryLogger = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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
const MAX_REQUEST_LENGTH = 1e6;
const protocolLogger = new (_memoryLogger().MemoryLogger)(null);
exports.protocolLogger = protocolLogger;

/**
 * Write a text or convert to text response with an optional status code.
 */
function sendTextResponse(response, text, statusCode) {
  if (typeof statusCode === 'number') {
    response.statusCode = statusCode;
  }

  response.write(text || '');
  response.end();
}
/**
 * Write a json response text with an optional status code.
 */


function sendJsonResponse(response, json, statusCode) {
  response.setHeader('Content-Type', 'application/json');
  sendTextResponse(response, JSON.stringify(json), statusCode);
}
/**
 * Parses the request body in an anyc/promise way
 */


function parseRequestBody(httpRequest, isJson) {
  return new Promise((resolve, reject) => {
    let body = '';
    httpRequest.on('data', data => {
      body += data; // too much POST data, kill the connection!

      if (body.length > MAX_REQUEST_LENGTH) {
        reject(new Error('body is too big'));
        httpRequest.connection.destroy();
      }
    });
    httpRequest.on('end', () => resolve(isJson ? JSON.parse(body) : body));
  });
}
/**
 * Parses the url parameters ?abc=erf&lol=432c
 */


function getQueryParameters(requestUrl) {
  const components = _url.default.parse(requestUrl, true);

  if (!(components != null)) {
    throw new Error("Invariant violation: \"components != null\"");
  }

  const {
    query
  } = components;
  return query;
}
/**
 * Serializes the method arguments to args and argTypes arrays
 * to send the metadata about the argument types with the data
 * to help the server understand and parse it.
 */


function serializeArgs(args) {
  const argsOnHttp = [];
  const argTypes = [];
  args.forEach(arg => {
    // I do this because nulls are normally sent as empty strings
    if (arg === undefined) {
      argsOnHttp.push('');
      argTypes.push('undefined');
    } else if (typeof arg === 'string') {
      argsOnHttp.push(arg);
      argTypes.push('string');
    } else {
      // object, number, boolean null
      argsOnHttp.push(JSON.stringify(arg));
      argTypes.push('object');
    }
  });
  return {
    args: argsOnHttp,
    argTypes
  };
}
/**
 * Deserializes a url with query parameters: args, argTypes to an array
 * of the original arguments of the same types the client called the function with.
 */


function deserializeArgs(requestUrl) {
  let {
    args,
    argTypes
  } = getQueryParameters(requestUrl);
  args = args || [];
  argTypes = argTypes || [];
  const argsArray = Array.isArray(args) ? args : [args];
  const argTypesArray = Array.isArray(argTypes) ? argTypes : [argTypes];
  return argsArray.map((arg, i) => {
    // I do this because nulls are normally sent as empty strings.
    if (argTypesArray[i] === 'undefined') {
      return undefined;
    } else if (argTypesArray[i] === 'string') {
      return arg;
    } else {
      // some methods have options object arguments.
      return JSON.parse(arg);
    }
  });
}