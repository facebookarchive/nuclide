'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var url = require('url');
var request = require('request');
const MAX_REQUEST_LENGTH = 1e6;

type ResponseBody = {body: string; response: HttpResponse};
type QueryParams = {[key:string]: any};
type SerializedArguments = {args: Array<string>; argTypes: Array<string>};

/**
 * Promisified version of the request function:
 * https://www.npmjs.com/package/request#requestoptions-callback
 * Defaults to using the node's querystring module to encode the url query parameters.
 * If you want to use the npm's qs module to encode the query parameters, explicitly provide the option:
 * {useQuerystring: false}
 */
function asyncRequest(options: any): Promise<ResponseBody> {
  return new Promise((resolve, reject) => {
    if (options.useQuerystring === undefined) {
      options.useQuerystring = true;
    }
    request(options, (error, response, body) => {
      if (error) {
        reject(error);
      } else if (response.statusCode < 200 || response.statusCode >= 300) {
        var errorJson = body;
        if (typeof body !== 'object') {
          try {
            errorJson = JSON.parse(body);
          } catch (err) {
            // 404 responses aren't currently JSON.
            errorJson = {message: body};
          }
        }
        var err = new Error(errorJson.message);
        // Success http status codes range from 200 to 299.
        err.code = errorJson.code || response.statusCode;
        reject(err);
      } else {
        resolve({body, response});
      }
    });
  });
}

/**
 * Write a text or convert to text response with an optional status code.
 */
function sendTextResponse(response: http.ServerResponse, text: any, statusCode: ?number): void {
  if (typeof statusCode === 'number') {
    response.statusCode = statusCode;
  }
  response.write(text || '');
  response.end();
}

/**
 * Write a json response text with an optional status code.
 */
function sendJsonResponse(response: http.ServerResponse, json: any, statusCode: ?number): void {
  response.setHeader('Content-Type', 'application/json');
  sendTextResponse(response, JSON.stringify(json), statusCode);
}

/**
  * Parses the request body in an anyc/promise way
  */
function parseRequestBody(httpRequest: http.IncomingMessage, isJson: ?boolean): Promise<string> {
  return new Promise((resolve, reject) => {
    var body = '';
    httpRequest.on('data', (data) => {
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
function getQueryParameters(requestUrl): QueryParams {
  var {query} = url.parse(requestUrl, true);
  return query;
}

/**
 * Serializes the method arguments to args and argTypes arrays
 * to send the metadata about the argument types with the data
 * to help the server understand and parse it.
 */
function serializeArgs(args: Array<any>): SerializedArguments {
  var argsOnHttp = [];
  var argTypes = [];
  args.forEach(function(arg) {
    // I do this because nulls are normally sent as empty strings
    if (arg === undefined) {
      argsOnHttp.push('');
      argTypes.push('undefined');
    } else if (typeof arg === 'string') {
      argsOnHttp.push(arg);
      argTypes.push('string');
    } else { // object, number, boolean null
      argsOnHttp.push(JSON.stringify(arg));
      argTypes.push('object');
    }
  });
  return {
    args: argsOnHttp,
    argTypes,
  };
}

/**
 * Deserializes a url with query parameters: args, argTypes to an array
 * of the original arguments of the same types the client called the function with.
 */
function deserializeArgs(requestUrl: string): Array<any> {
  var {args, argTypes} = getQueryParameters(requestUrl);
  args = args || [];
  argTypes = argTypes || [];
  var argsArray = Array.isArray(args) ? args : [args];
  var argTypesArray = Array.isArray(argTypes) ? argTypes : [argTypes];
  return argsArray.map(function(arg, i) {
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
  asyncRequest,
  deserializeArgs,
  getQueryParameters,
  parseRequestBody,
  sendJsonResponse,
  sendTextResponse,
  serializeArgs,
};
