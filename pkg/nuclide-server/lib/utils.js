'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.asyncRequest = asyncRequest;
exports.sendTextResponse = sendTextResponse;
exports.sendJsonResponse = sendJsonResponse;
exports.parseRequestBody = parseRequestBody;
exports.getQueryParameters = getQueryParameters;
exports.serializeArgs = serializeArgs;
exports.deserializeArgs = deserializeArgs;

var _url = _interopRequireDefault(require('url'));

var _request;

function _load_request() {
  return _request = _interopRequireDefault(require('request'));
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

/**
 * Promisified version of the request function:
 * https://www.npmjs.com/package/request#requestoptions-callback
 * Defaults to using the node's querystring module to encode the url query parameters.
 * If you want to use the npm's qs module to encode the query parameters, explicitly provide
 * the option:
 * {useQuerystring: false}
 */
function asyncRequest(options) {
  return new Promise((resolve, reject) => {
    if (options.useQuerystring === undefined) {
      options.useQuerystring = true;
    }
    // TODO(t8118670): This can cause an uncaught exception.
    // Likely requires a fix to 'request'.
    (0, (_request || _load_request()).default)(options, (error, response, body) => {
      if (error) {
        reject(error);
      } else if (response.statusCode < 200 || response.statusCode >= 300) {
        let errorJson = body;
        if (typeof body !== 'object') {
          try {
            errorJson = JSON.parse(body);
          } catch (e) {
            // 404 responses aren't currently JSON.
            errorJson = { message: body };
          }
        }
        // Cast to Object for use of code field below...
        const err = new Error(errorJson.message);
        // Success http status codes range from 200 to 299.
        err.code = errorJson.code || response.statusCode;
        reject(err);
      } else {
        resolve({ body, response });
      }
    });
  });
}

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
      body += data;
      // too much POST data, kill the connection!
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
    throw new Error('Invariant violation: "components != null"');
  }

  const { query } = components;
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
  let { args, argTypes } = getQueryParameters(requestUrl);
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