Object.defineProperty(exports, '__esModule', {
  value: true
});

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

var _url2;

function _url() {
  return _url2 = _interopRequireDefault(require('url'));
}

var _request2;

function _request() {
  return _request2 = _interopRequireDefault(require('request'));
}

var MAX_REQUEST_LENGTH = 1e6;

/**
 * Promisified version of the request function:
 * https://www.npmjs.com/package/request#requestoptions-callback
 * Defaults to using the node's querystring module to encode the url query parameters.
 * If you want to use the npm's qs module to encode the query parameters, explicitly provide
 * the option:
 * {useQuerystring: false}
 */
function asyncRequest(options) {
  return new Promise(function (resolve, reject) {
    if (options.useQuerystring === undefined) {
      options.useQuerystring = true;
    }
    // TODO(t8118670): This can cause an uncaught exception.
    // Likely requires a fix to 'request'.
    (0, (_request2 || _request()).default)(options, function (error, response, body) {
      if (error) {
        reject(error);
      } else if (response.statusCode < 200 || response.statusCode >= 300) {
        var errorJson = body;
        if (typeof body !== 'object') {
          try {
            errorJson = JSON.parse(body);
          } catch (e) {
            // 404 responses aren't currently JSON.
            errorJson = { message: body };
          }
        }
        // Cast to Object for use of code field below...
        var err = new Error(errorJson.message);
        // Success http status codes range from 200 to 299.
        err.code = errorJson.code || response.statusCode;
        reject(err);
      } else {
        resolve({ body: body, response: response });
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
  return new Promise(function (resolve, reject) {
    var body = '';
    httpRequest.on('data', function (data) {
      body += data;
      // too much POST data, kill the connection!
      if (body.length > MAX_REQUEST_LENGTH) {
        reject(new Error('body is too big'));
        httpRequest.connection.destroy();
      }
    });
    httpRequest.on('end', function () {
      return resolve(isJson ? JSON.parse(body) : body);
    });
  });
}

/**
 * Parses the url parameters ?abc=erf&lol=432c
 */
function getQueryParameters(requestUrl) {
  var components = (_url2 || _url()).default.parse(requestUrl, true);
  (0, (_assert2 || _assert()).default)(components != null);
  var query = components.query;

  return query;
}

/**
 * Serializes the method arguments to args and argTypes arrays
 * to send the metadata about the argument types with the data
 * to help the server understand and parse it.
 */
function serializeArgs(args) {
  var argsOnHttp = [];
  var argTypes = [];
  args.forEach(function (arg) {
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
    argTypes: argTypes
  };
}

/**
 * Deserializes a url with query parameters: args, argTypes to an array
 * of the original arguments of the same types the client called the function with.
 */
function deserializeArgs(requestUrl) {
  var _getQueryParameters = getQueryParameters(requestUrl);

  var args = _getQueryParameters.args;
  var argTypes = _getQueryParameters.argTypes;

  args = args || [];
  argTypes = argTypes || [];
  var argsArray = Array.isArray(args) ? args : [args];
  var argTypesArray = Array.isArray(argTypes) ? argTypes : [argTypes];
  return argsArray.map(function (arg, i) {
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

module.exports = {
  asyncRequest: asyncRequest,
  deserializeArgs: deserializeArgs,
  getQueryParameters: getQueryParameters,
  parseRequestBody: parseRequestBody,
  sendJsonResponse: sendJsonResponse,
  sendTextResponse: sendTextResponse,
  serializeArgs: serializeArgs
};